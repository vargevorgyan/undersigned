import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { getDb, sessions, users } from "@privacy-radar/core/db";

export const SESSION_COOKIE = "pr_session";
type Client = "web" | "extension" | "mobile";
const TTL_DAYS: Record<Client, number> = { web: 30, extension: 180, mobile: 180 };

const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

export type User = typeof users.$inferSelect;
export type PublicUser = Pick<User, "id" | "email" | "name" | "plan" | "emailAlerts" | "createdAt">;

export function publicUser(u: User): PublicUser {
  return { id: u.id, email: u.email, name: u.name, plan: u.plan, emailAlerts: u.emailAlerts, createdAt: u.createdAt };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 11);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, client: Client) {
  const token = randomBytes(32).toString("base64url");
  const db = await getDb();
  const expiresAt = new Date(Date.now() + TTL_DAYS[client] * 86400_000);
  await db.insert(sessions).values({ tokenHash: hashToken(token), userId, client, expiresAt });
  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}

async function tokenFromRequest() {
  const auth = (await headers()).get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/** Resolves the current user from a bearer token (extension/mobile) or the session cookie (web). */
export async function currentUser(): Promise<User | null> {
  const token = await tokenFromRequest();
  if (!token) return null;
  const db = await getDb();
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())));
  return row?.user ?? null;
}

export async function destroySession() {
  const token = await tokenFromRequest();
  if (token) {
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  (await cookies()).delete(SESSION_COOKIE);
}
