import "server-only";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { PLAN_LIMITS, PRESET_RULES, getUserRules } from "@privacy-radar/core";
import { alerts, documents, documentVersions, getDb, services, userRules, watchlist } from "@privacy-radar/core/db";
import { HttpError } from "./api";
import type { User } from "./auth";

export const limitsFor = (user: Pick<User, "plan">) => PLAN_LIMITS[user.plan];

export async function getWatchlist(userId: string) {
  const db = await getDb();
  const rows = await db
    .select({ service: services, addedAt: watchlist.createdAt })
    .from(watchlist)
    .innerJoin(services, eq(services.id, watchlist.serviceId))
    .where(eq(watchlist.userId, userId))
    .orderBy(desc(watchlist.createdAt));
  if (rows.length === 0) return [];
  const serviceIds = rows.map((r) => r.service.id);
  const docs = await db
    .select({ serviceId: documents.serviceId, lastCheckedAt: documents.lastCheckedAt, nextCheckAt: documents.nextCheckAt, lastError: documents.lastError })
    .from(documents)
    .where(inArray(documents.serviceId, serviceIds));
  const changes = await db
    .select({ serviceId: documents.serviceId, fetchedAt: documentVersions.fetchedAt, change: documentVersions.change })
    .from(documentVersions)
    .innerJoin(documents, eq(documents.id, documentVersions.documentId))
    .where(and(inArray(documents.serviceId, serviceIds), sql`${documentVersions.change} is not null`))
    .orderBy(desc(documentVersions.fetchedAt));
  return rows.map(({ service, addedAt }) => {
    const mine = docs.filter((d) => d.serviceId === service.id);
    const lastChange = changes.find((c) => c.serviceId === service.id) ?? null;
    const checked = mine.map((d) => d.lastCheckedAt?.getTime() ?? 0);
    const next = mine.map((d) => d.nextCheckAt.getTime());
    return {
      slug: service.slug,
      name: service.name,
      domain: service.domain,
      kind: service.kind,
      grade: service.grade,
      iconUrl: service.iconUrl,
      addedAt,
      lastCheckedAt: checked.length ? new Date(Math.max(...checked)) : null,
      nextCheckAt: next.length ? new Date(Math.min(...next)) : null,
      hasError: mine.some((d) => d.lastError),
      lastChange: lastChange && { at: lastChange.fetchedAt, headline: lastChange.change!.headline, impact: lastChange.change!.impact },
    };
  });
}

export async function addToWatchlist(user: User, slug: string) {
  const db = await getDb();
  const [service] = await db.select().from(services).where(eq(services.slug, slug));
  if (!service) throw new HttpError(404, "Analyze this service first, then watch it.");
  const [{ count } = { count: 0 }] = await db.select({ count: sql<number>`count(*)::int` }).from(watchlist).where(eq(watchlist.userId, user.id));
  const limit = limitsFor(user).watchlist;
  if (count >= limit) throw new HttpError(402, `Free accounts can watch ${limit} services. Upgrade to Pro for unlimited.`, "limit_watchlist");
  await db.insert(watchlist).values({ userId: user.id, serviceId: service.id }).onConflictDoNothing();
  // Bring the next check forward to match the watcher's plan.
  const hours = limitsFor(user).checkIntervalHours;
  await db
    .update(documents)
    .set({ nextCheckAt: sql`least(${documents.nextCheckAt}, now() + make_interval(hours => ${hours}))` })
    .where(eq(documents.serviceId, service.id));
  return service;
}

export async function removeFromWatchlist(userId: string, slug: string) {
  const db = await getDb();
  const [service] = await db.select().from(services).where(eq(services.slug, slug));
  if (service) await db.delete(watchlist).where(and(eq(watchlist.userId, userId), eq(watchlist.serviceId, service.id)));
}

export async function getAlerts(userId: string, limit = 50) {
  const db = await getDb();
  const rows = await db
    .select({ alert: alerts, slug: services.slug, name: services.name, iconUrl: services.iconUrl })
    .from(alerts)
    .innerJoin(services, eq(services.id, alerts.serviceId))
    .where(eq(alerts.userId, userId))
    .orderBy(desc(alerts.createdAt))
    .limit(limit);
  const [{ unread } = { unread: 0 }] = await db
    .select({ unread: sql<number>`count(*)::int` })
    .from(alerts)
    .where(and(eq(alerts.userId, userId), isNull(alerts.readAt)));
  return {
    unread,
    alerts: rows.map((r) => ({
      id: r.alert.id,
      slug: r.slug,
      serviceName: r.name,
      iconUrl: r.iconUrl,
      title: r.alert.title,
      body: r.alert.body,
      impact: r.alert.impact,
      brokenRules: r.alert.brokenRules,
      read: Boolean(r.alert.readAt),
      createdAt: r.alert.createdAt,
    })),
  };
}

export async function markAlertsRead(userId: string, ids?: string[]) {
  const db = await getDb();
  const where = ids?.length ? and(eq(alerts.userId, userId), inArray(alerts.id, ids)) : eq(alerts.userId, userId);
  await db.update(alerts).set({ readAt: new Date() }).where(and(where, isNull(alerts.readAt)));
}

export async function rulesPayload(user: User | null) {
  const db = await getDb();
  const rules = user ? await getUserRules(db, user.id) : { presetIds: PRESET_RULES.slice(0, 4).map((r) => r.id), customRules: [] };
  return { presets: PRESET_RULES, ...rules, limits: user ? limitsFor(user) : PLAN_LIMITS.free };
}

export async function saveRules(user: User, presetIds: string[], custom: { id?: string; text: string }[]) {
  const limit = limitsFor(user).customRules;
  if (custom.length > limit) throw new HttpError(402, `Free accounts can add ${limit} custom rules. Upgrade to Pro for more.`, "limit_rules");
  const valid = new Set(PRESET_RULES.map((r) => r.id));
  const customRules = custom
    .map((r) => ({ id: r.id ?? crypto.randomUUID().slice(0, 8), text: r.text.trim().slice(0, 200) }))
    .filter((r) => r.text.length > 2);
  const db = await getDb();
  const values = { userId: user.id, presetIds: presetIds.filter((id) => valid.has(id)), customRules, updatedAt: new Date() };
  await db.insert(userRules).values(values).onConflictDoUpdate({ target: userRules.userId, set: values });
  return values;
}
