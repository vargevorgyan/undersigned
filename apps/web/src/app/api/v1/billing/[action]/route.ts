import { handler, HttpError, json, requireUser } from "@/lib/api";
import { createCheckout, createPortal, handleWebhook } from "@/lib/billing";

export const POST = handler(async (req: Request, ctx: { params: Promise<{ action: string }> }) => {
  const { action } = await ctx.params;
  if (action === "webhook") {
    await handleWebhook(await req.text(), req.headers.get("stripe-signature"));
    return json({ received: true });
  }
  const user = await requireUser();
  if (action === "checkout") return json({ url: await createCheckout(user) });
  if (action === "portal") return json({ url: await createPortal(user) });
  throw new HttpError(404, "Not found");
});
