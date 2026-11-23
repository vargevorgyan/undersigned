import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, users } from "@privacy-radar/core/db";
import { body, clientIp, handler, HttpError, json, rateLimit } from "@/lib/api";
import { createSession, publicUser, setSessionCookie, verifyPassword } from "@/lib/auth";

const Schema = z.object({
  email: z.string().transform((e) => e.toLowerCase().trim()),
  password: z.string(),
  client: z.enum(["web", "extension", "mobile"]).default("web"),
});

export const POST = handler(async (req) => {
  rateLimit(`login:${clientIp(req)}`, 20, 600_000);
  const input = await body(req, Schema);
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.email, input.email));
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) throw new HttpError(401, "Wrong email or password.");
  const session = await createSession(user.id, input.client);
  if (input.client === "web") await setSessionCookie(session.token, session.expiresAt);
  return json({ token: session.token, user: publicUser(user) });
});
