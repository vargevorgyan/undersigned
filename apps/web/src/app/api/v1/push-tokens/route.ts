import { z } from "zod";
import { getDb, pushTokens } from "@privacy-radar/core/db";
import { body, handler, json, requireUser } from "@/lib/api";

export const POST = handler(async (req) => {
  const user = await requireUser();
  const input = await body(req, z.object({ token: z.string().min(10).max(300), platform: z.string().max(20) }));
  const db = await getDb();
  await db
    .insert(pushTokens)
    .values({ ...input, userId: user.id })
    .onConflictDoUpdate({ target: pushTokens.token, set: { userId: user.id, platform: input.platform } });
  return json({ ok: true });
});
