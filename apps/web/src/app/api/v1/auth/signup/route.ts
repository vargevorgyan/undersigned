import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, userRules, users } from "@privacy-radar/core/db";
import { body, clientIp, handler, HttpError, json, rateLimit } from "@/lib/api";
import { createSession, hashPassword, publicUser, setSessionCookie } from "@/lib/auth";

const Schema = z.object({
  email: z.email("Enter a valid email address.").transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, "Use at least 8 characters for your password."),
  name: z.string().max(80).optional(),
  client: z.enum(["web", "extension", "mobile"]).default("web"),
  /** Rules picked before signing up (onboarding), so nothing is lost. */
  presetIds: z.array(z.string()).optional(),
});

export const POST = handler(async (req) => {
  rateLimit(`signup:${clientIp(req)}`, 10, 3600_000);
  const input = await body(req, Schema);
  const db = await getDb();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email));
  if (existing) throw new HttpError(409, "An account with this email already exists. Try signing in.");
  const [user] = await db.insert(users).values({ email: input.email, passwordHash: await hashPassword(input.password), name: input.name ?? null }).returning();
  if (input.presetIds?.length) await db.insert(userRules).values({ userId: user!.id, presetIds: input.presetIds, customRules: [] });
  const session = await createSession(user!.id, input.client);
  if (input.client === "web") await setSessionCookie(session.token, session.expiresAt);
  return json({ token: session.token, user: publicUser(user!) }, { status: 201 });
});
