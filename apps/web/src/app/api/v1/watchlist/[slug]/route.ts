import { handler, json, requireUser } from "@/lib/api";
import { removeFromWatchlist } from "@/lib/data";

export const DELETE = handler(async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const user = await requireUser();
  await removeFromWatchlist(user.id, (await ctx.params).slug);
  return json({ ok: true });
});
