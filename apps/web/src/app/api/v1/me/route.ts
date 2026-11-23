import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, users } from "@privacy-radar/core/db";
import { body, handler, json, requireUser } from "@/lib/api";
import { destroySession, publicUser } from "@/lib/auth";
import { billingEnabled } from "@/lib/billing";
import { limitsFor } from "@/lib/data";

export const GET = handler(async () => {
  const user = await requireUser();
  return json({ user: publicUser(user), limits: limitsFor(user), billingEnabled: billingEnabled() });
});

const Patch = z.object({ name: z.string().max(80).nullable().optional(), emailAlerts: z.boolean().optional() });

export const PATCH = handler(async (req) => {
  const user = await requireUser();
  const input = await body(req, Patch);
  const db = await getDb();
  const [updated] = await db.update(users).set(input).where(eq(users.id, user.id)).returning();
  return json({ user: publicUser(updated!) });
});

/** Account deletion: removes the user and everything tied to them (cascade). */
export const DELETE = handler(async () => {
  const user = await requireUser();
  const db = await getDb();
  await destroySession();
  await db.delete(users).where(eq(users.id, user.id));
  return json({ ok: true });
});
