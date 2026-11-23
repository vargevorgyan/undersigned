import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser, type User } from "./auth";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export const json = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);

/** Wraps a route handler: converts thrown errors into `{ error }` JSON with the right status. */
export function handler<A extends unknown[]>(fn: (req: Request, ...args: A) => Promise<Response>) {
  return async (req: Request, ...args: A) => {
    try {
      return await fn(req, ...args);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message, code: err.code }, { status: err.status });
      if (err instanceof z.ZodError) return json({ error: err.issues[0]?.message ?? "Invalid request" }, { status: 400 });
      console.error(err);
      return json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Please sign in first.", "unauthorized");
  return user;
}

export async function body<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  return schema.parse(data);
}

const hits = new Map<string, { count: number; reset: number }>();

/** Tiny in-memory rate limiter; good enough for a single instance. */
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return;
  }
  if (++entry.count > max) throw new HttpError(429, "Too many requests. Please wait a minute and try again.", "rate_limited");
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";
