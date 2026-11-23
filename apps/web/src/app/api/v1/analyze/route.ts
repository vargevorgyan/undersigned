import { z } from "zod";
import { analyzeInput, IngestError, AnalysisError } from "@privacy-radar/core";
import { body, clientIp, handler, json, rateLimit } from "@/lib/api";
import { currentUser } from "@/lib/auth";

export const maxDuration = 300;

const Schema = z.object({ url: z.string().min(1, "Paste a link first.").max(2000) });

function userMessage(err: unknown) {
  if (err instanceof IngestError) return err.userMessage;
  if (err instanceof AnalysisError) return err.message;
  console.error(err);
  return "Something went wrong while analyzing. Please try again.";
}

/** Analyzes a site, policy or store link. Streams progress as SSE when the client asks for text/event-stream. */
export const POST = handler(async (req) => {
  const user = await currentUser();
  rateLimit(`analyze:${user?.id ?? clientIp(req)}`, user ? 60 : 15, 3600_000);
  const { url } = await body(req, Schema);

  if (!req.headers.get("accept")?.includes("text/event-stream")) {
    try {
      return json(await analyzeInput(url));
    } catch (err) {
      return json({ error: userMessage(err) }, { status: 422 });
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      try {
        const result = await analyzeInput(url, (stage, message) => send("progress", { stage, message }));
        send("done", result);
      } catch (err) {
        send("error", { error: userMessage(err) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-cache, no-transform", connection: "keep-alive" } });
});
