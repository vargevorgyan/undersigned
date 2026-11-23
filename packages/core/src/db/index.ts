import fs from "node:fs";
import path from "node:path";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export * from "./schema";
export { schema };

export type DB = ReturnType<typeof drizzlePg<typeof schema>>;

type Cache = { db?: Promise<DB> };
const cache = globalThis as typeof globalThis & { __privacyRadarDb?: Cache };
cache.__privacyRadarDb ??= {};

/** Walks up from cwd to find the monorepo root (works from apps/web, scripts and tests). */
export function repoRoot() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "packages/core/drizzle"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate repo root (packages/core/drizzle)");
}

async function connect(): Promise<DB> {
  const migrationsFolder = path.join(repoRoot(), "packages/core/drizzle");
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const db = drizzlePg(new Pool({ connectionString: process.env.DATABASE_URL, max: 10 }), { schema });
    await migrate(db, { migrationsFolder });
    return db;
  }
  // Zero-setup local dev: embedded Postgres on disk.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dataDir = process.env.PGLITE_DIR ?? path.join(repoRoot(), ".data/pglite");
  if (dataDir !== "memory") fs.mkdirSync(dataDir, { recursive: true });
  const client = dataDir === "memory" ? new PGlite() : new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder });
  return db as unknown as DB;
}

export function getDb(): Promise<DB> {
  cache.__privacyRadarDb!.db ??= connect().catch((err) => {
    cache.__privacyRadarDb!.db = undefined;
    throw err;
  });
  return cache.__privacyRadarDb!.db;
}
