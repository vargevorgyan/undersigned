import { z } from "zod";
import { getDb, waitlist } from "@privacy-radar/core/db";
import { body, clientIp, handler, json, rateLimit } from "@/lib/api";

export const POST = handler(async (req) => {
  rateLimit(`waitlist:${clientIp(req)}`, 10, 3600_000);
  const input = await body(req, z.object({ email: z.email("Enter a valid email address."), source: z.string().max(40).optional() }));
  const db = await getDb();
  await db.insert(waitlist).values({ email: input.email.toLowerCase(), source: input.source ?? null }).onConflictDoNothing();
  return json({ ok: true });
});
