import { listServices } from "@privacy-radar/core";
import { handler, json } from "@/lib/api";

export const GET = handler(async (req) => {
  const q = new URL(req.url).searchParams.get("q") ?? undefined;
  return json({ services: await listServices({ query: q, limit: 100 }) });
});
