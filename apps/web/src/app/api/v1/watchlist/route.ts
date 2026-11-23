import { z } from "zod";
import { body, handler, json, requireUser } from "@/lib/api";
import { addToWatchlist, getWatchlist, limitsFor } from "@/lib/data";

export const GET = handler(async () => {
  const user = await requireUser();
  return json({ items: await getWatchlist(user.id), limit: limitsFor(user).watchlist });
});

export const POST = handler(async (req) => {
  const user = await requireUser();
  const { slug } = await body(req, z.object({ slug: z.string() }));
  await addToWatchlist(user, slug);
  return json({ ok: true }, { status: 201 });
});
