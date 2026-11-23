import { createHash } from "node:crypto";
import { and, asc, desc, eq, inArray, isNotNull, lte, sql } from "drizzle-orm";
import { analyzeDocument, checkCustomRules, summarizeChange } from "./analyze";
import type { PolicyAnalysis } from "./analyze/schema";
import { alerts, customRuleChecks, documents, documentVersions, getDb, services, userRules, users, watchlist, type DB } from "./db";
import { discoverPolicies, findPolicyLinks, guessDocType, knownName, knownPolicies, type PolicyLink } from "./ingest/discover";
import { contentHash, extractPage, fetchHtml, hostnameOf, IngestError, normalizeInputUrl } from "./ingest/fetch";
import { fetchStoreApp, parseStoreUrl } from "./ingest/stores";
import {
  DEFAULT_RULE_IDS,
  evaluatePresetRules,
  mergeResults,
  PLAN_LIMITS,
  toVerdict,
  type CustomRule,
  type RuleResult,
  type Verdict,
} from "./rules";

export type Stage = "fetching" | "finding" | "reading" | "analyzing" | "saving" | "done";
export type Progress = (stage: Stage, message: string) => void;

const FRESH_MS = 24 * 3600_000;
const MIN_TEXT = 400;
const GRADE_ORDER = ["A", "B", "C", "D", "E"] as const;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .replace(/[\s._]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function prettyName(host: string, siteName?: string | null) {
  const known = knownName(host);
  if (known) return known;
  // og:site_name is usually the proper brand spelling ("DuckDuckGo"); skip long marketing titles.
  if (siteName && siteName.length <= 30) return siteName;
  const base = host.split(".").slice(-2, -1)[0] ?? host;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

type ServiceSeed = { slug: string; name: string; domain: string | null; kind: "website" | "android" | "ios"; storeId?: string; iconUrl?: string | null };

async function upsertService(db: DB, seed: ServiceSeed) {
  const [existing] = await db.select().from(services).where(eq(services.slug, seed.slug));
  if (existing) return existing;
  const [created] = await db
    .insert(services)
    .values({ ...seed, storeId: seed.storeId ?? null, iconUrl: seed.iconUrl ?? null })
    .onConflictDoNothing()
    .returning();
  return created ?? (await db.select().from(services).where(eq(services.slug, seed.slug)))[0]!;
}

async function upsertDocument(db: DB, serviceId: string, link: PolicyLink) {
  const [existing] = await db.select().from(documents).where(eq(documents.url, link.url));
  if (existing) return existing;
  const [created] = await db.insert(documents).values({ serviceId, url: link.url, type: link.type }).onConflictDoNothing().returning();
  return created ?? (await db.select().from(documents).where(eq(documents.url, link.url)))[0]!;
}

/** Turns any user input (site, policy, store link) into a service with documents to analyze. */
async function resolve(db: DB, input: string, progress: Progress): Promise<{ serviceId: string; docs: { link: PolicyLink; prefetched?: { text: string; title: string } }[] }> {
  const url = normalizeInputUrl(input);

  if (parseStoreUrl(url)) {
    progress("finding", "Reading the store listing…");
    const app = await fetchStoreApp(url);
    const service = await upsertService(db, {
      slug: slugify(`${app.name}-${app.kind}`),
      name: app.name,
      domain: app.policyUrl ? hostnameOf(app.policyUrl) : null,
      kind: app.kind,
      storeId: app.storeId,
      iconUrl: app.iconUrl,
    });
    const docs: { link: PolicyLink; prefetched?: { text: string; title: string } }[] = [];
    if (app.label) docs.push({ link: { url: app.label.url, type: "app_privacy_label" }, prefetched: { text: app.label.text, title: `${app.name} store privacy label` } });
    if (app.policyUrl) docs.push({ link: { url: app.policyUrl, type: "privacy" } });
    return { serviceId: service.id, docs };
  }

  const websiteService = (host: string, siteName?: string | null) =>
    upsertService(db, { slug: slugify(host), name: prettyName(host, siteName), domain: host, kind: "website", iconUrl: `https://icons.duckduckgo.com/ip3/${host}.ico` });
  const isHomepage = new URL(url).pathname === "/";
  const known = isHomepage ? knownPolicies(hostnameOf(url)) : null;
  if (known) {
    progress("finding", "Finding the privacy policy and terms…");
    return { serviceId: (await websiteService(hostnameOf(url))).id, docs: known.map((link) => ({ link })) };
  }

  progress("fetching", `Opening ${hostnameOf(url)}…`);
  let fetched: Awaited<ReturnType<typeof fetchHtml>>;
  try {
    fetched = await fetchHtml(url);
  } catch (err) {
    // Bot-blocked homepages: try conventional policy paths instead.
    if (!isHomepage) throw err;
    progress("finding", "Finding the privacy policy and terms…");
    const links = await discoverPolicies(url);
    return { serviceId: (await websiteService(hostnameOf(url))).id, docs: links.map((link) => ({ link })) };
  }
  const { html, finalUrl } = fetched;
  const page = extractPage(html, finalUrl);
  const host = hostnameOf(finalUrl);
  // Only a homepage's site name reliably names the service.
  const service = await websiteService(host, new URL(finalUrl).pathname === "/" ? page.siteName : null);

  const type = guessDocType(finalUrl, page.title);
  if (type && page.text.length >= MIN_TEXT) {
    const docs: { link: PolicyLink; prefetched?: { text: string; title: string } }[] = [{ link: { url: finalUrl, type }, prefetched: page }];
    // Best effort: also pick up the sibling document (terms for a privacy page and vice versa).
    try {
      progress("finding", "Looking for related documents…");
      const siblings = await discoverPolicies(new URL("/", finalUrl).toString());
      for (const s of siblings) if (s.type !== type && s.url !== finalUrl) docs.push({ link: s });
    } catch {}
    return { serviceId: service.id, docs };
  }

  progress("finding", "Finding the privacy policy and terms…");
  let links = findPolicyLinks(page.links, finalUrl);
  if (links.length === 0) links = await discoverPolicies(new URL("/", finalUrl).toString()).catch(() => []);
  if (links.length === 0) {
    throw new IngestError(`no policies for ${url}`, "We couldn't find a privacy policy or terms on that site. Try pasting the policy link directly.");
  }
  return { serviceId: service.id, docs: links.map((link) => ({ link })) };
}

/** Fetches + analyzes a document if its content changed. Returns the new version id when it did. */
export async function refreshDocument(
  db: DB,
  documentId: string,
  opts: { prefetched?: { text: string; title: string }; force?: boolean; progress?: Progress } = {},
): Promise<{ changed: boolean; versionId: string | null; previousVersionId: string | null }> {
  const progress = opts.progress ?? (() => {});
  const [doc] = await db.select().from(documents).where(eq(documents.id, documentId));
  if (!doc) throw new Error(`document ${documentId} not found`);
  const [service] = await db.select().from(services).where(eq(services.id, doc.serviceId));

  if (!opts.force && doc.currentVersionId && doc.lastCheckedAt && Date.now() - doc.lastCheckedAt.getTime() < FRESH_MS) {
    return { changed: false, versionId: doc.currentVersionId, previousVersionId: null };
  }

  try {
    let page = opts.prefetched;
    if (!page) {
      progress("reading", `Reading ${labelFor(doc.type)}…`);
      const { html, finalUrl } = await fetchHtml(doc.url);
      page = extractPage(html, finalUrl);
    }
    if (page.text.length < MIN_TEXT && doc.type !== "app_privacy_label") {
      throw new IngestError("too little text", "This page has almost no readable text (it may need JavaScript).");
    }
    const hash = contentHash(page.text);
    const [current] = doc.currentVersionId ? await db.select().from(documentVersions).where(eq(documentVersions.id, doc.currentVersionId)) : [];
    if (current && current.contentHash === hash) {
      await db.update(documents).set({ lastCheckedAt: new Date(), lastError: null, failures: 0 }).where(eq(documents.id, doc.id));
      return { changed: false, versionId: current.id, previousVersionId: null };
    }

    progress("analyzing", `Analyzing ${labelFor(doc.type)} with AI…`);
    const { analysis, engine } = await analyzeDocument({ text: page.text, url: doc.url, title: page.title, serviceName: service!.name, hintType: doc.type });
    const change = current
      ? await summarizeChange({ serviceName: service!.name, prevText: current.text, nextText: page.text, prev: current.analysis, next: analysis })
      : null;

    progress("saving", "Saving results…");
    const [version] = await db
      .insert(documentVersions)
      .values({ documentId: doc.id, previousVersionId: current?.id ?? null, contentHash: hash, text: page.text, analysis, engine, change })
      .returning();
    await db
      .update(documents)
      .set({ currentVersionId: version!.id, title: page.title || doc.title, lastCheckedAt: new Date(), lastError: null, failures: 0 })
      .where(eq(documents.id, doc.id));
    await updateServiceGrade(db, doc.serviceId);
    return { changed: Boolean(current), versionId: version!.id, previousVersionId: current?.id ?? null };
  } catch (err) {
    const message = err instanceof IngestError ? err.userMessage : String((err as Error).message ?? err);
    await db
      .update(documents)
      .set({ lastError: message, lastCheckedAt: new Date(), failures: sql`${documents.failures} + 1` })
      .where(eq(documents.id, doc.id));
    throw err;
  }
}

function labelFor(type: string) {
  const map: Record<string, string> = { privacy: "the privacy policy", terms: "the terms of service", cookies: "the cookie policy", app_privacy_label: "the store privacy label" };
  return map[type] ?? "the document";
}

/** Re-runs analysis on stored text after the analyzer improves; no refetch, no change alerts. */
export async function reanalyzeStored(opts: { onlyEngine?: "basic" | "ai" } = {}) {
  const db = await getDb();
  const rows = await db
    .select({ doc: documents, version: documentVersions, serviceName: services.name })
    .from(documents)
    .innerJoin(documentVersions, eq(documentVersions.id, documents.currentVersionId))
    .innerJoin(services, eq(services.id, documents.serviceId));
  let count = 0;
  for (const { doc, version, serviceName } of rows) {
    if (opts.onlyEngine && version.engine !== opts.onlyEngine) continue;
    const { analysis, engine } = await analyzeDocument({ text: version.text, url: doc.url, title: doc.title ?? "", serviceName, hintType: doc.type });
    await db.update(documentVersions).set({ analysis, engine }).where(eq(documentVersions.id, version.id));
    await updateServiceGrade(db, doc.serviceId);
    count++;
  }
  return count;
}

async function updateServiceGrade(db: DB, serviceId: string) {
  const rows = await db
    .select({ analysis: documentVersions.analysis })
    .from(documents)
    .innerJoin(documentVersions, eq(documents.currentVersionId, documentVersions.id))
    .where(eq(documents.serviceId, serviceId));
  if (rows.length === 0) return;
  // Worst grade wins: a great privacy policy doesn't excuse abusive terms.
  const worst = rows.map((r) => r.analysis.grade).sort((a, b) => GRADE_ORDER.indexOf(b) - GRADE_ORDER.indexOf(a))[0]!;
  await db.update(services).set({ grade: worst, updatedAt: new Date() }).where(eq(services.id, serviceId));
}

/** Full user-facing flow: resolve input, analyze each document, return the service slug. */
export async function analyzeInput(input: string, progress: Progress = () => {}): Promise<{ slug: string }> {
  const db = await getDb();
  const { serviceId, docs } = await resolve(db, input, progress);
  const errors: string[] = [];
  let analyzed = 0;
  for (const { link, prefetched } of docs) {
    const doc = await upsertDocument(db, serviceId, link);
    try {
      await refreshDocument(db, doc.id, { prefetched, progress });
      analyzed++;
    } catch (err) {
      errors.push(err instanceof IngestError ? err.userMessage : (err as Error).message);
      // A previously analyzed version is still useful.
      if (doc.currentVersionId) analyzed++;
    }
  }
  if (analyzed === 0) throw new IngestError(`all documents failed: ${errors.join("; ")}`, errors[0] ?? "We couldn't analyze that link.");
  const [service] = await db.select().from(services).where(eq(services.id, serviceId));
  progress("done", "Done");
  return { slug: service!.slug };
}

// ---------- Rules ----------

export async function getUserRules(db: DB, userId: string): Promise<{ presetIds: string[]; customRules: CustomRule[] }> {
  const [row] = await db.select().from(userRules).where(eq(userRules.userId, userId));
  return row ? { presetIds: row.presetIds, customRules: row.customRules } : { presetIds: DEFAULT_RULE_IDS, customRules: [] };
}

const rulesHash = (rules: CustomRule[]) => createHash("sha256").update(JSON.stringify(rules.map((r) => [r.id, r.text]))).digest("hex").slice(0, 32);

async function customResults(db: DB, version: { id: string; text: string }, rules: CustomRule[]): Promise<RuleResult[]> {
  if (rules.length === 0) return [];
  const hash = rulesHash(rules);
  const [cached] = await db.select().from(customRuleChecks).where(and(eq(customRuleChecks.versionId, version.id), eq(customRuleChecks.rulesHash, hash)));
  let results = cached?.results;
  if (!results) {
    results = await checkCustomRules(version.text, rules);
    await db.insert(customRuleChecks).values({ versionId: version.id, rulesHash: hash, results }).onConflictDoNothing();
  }
  return results.flatMap((r) => {
    const rule = rules.find((x) => x.id === r.ruleId);
    return rule ? [{ ruleId: r.ruleId, label: rule.text, status: r.status, reason: r.reason, quote: r.quote, custom: true }] : [];
  });
}

export async function verdictFor(
  db: DB,
  versions: { id: string; text: string; analysis: PolicyAnalysis }[],
  rules: { presetIds: string[]; customRules: CustomRule[] },
): Promise<Verdict> {
  const lists: RuleResult[][] = [];
  for (const v of versions) {
    lists.push(evaluatePresetRules(v.analysis, rules.presetIds));
    lists.push(await customResults(db, v, rules.customRules).catch(() => []));
  }
  return toVerdict(mergeResults(lists));
}

// ---------- Views ----------

export type ServiceView = NonNullable<Awaited<ReturnType<typeof getServiceView>>>;

export async function getServiceView(slug: string, opts: { userId?: string; presetIds?: string[] } = {}) {
  const db = await getDb();
  const [service] = await db.select().from(services).where(eq(services.slug, slug));
  if (!service) return null;
  const docs = await db.select().from(documents).where(eq(documents.serviceId, service.id)).orderBy(asc(documents.createdAt));
  const versionIds = docs.map((d) => d.currentVersionId).filter((x): x is string => Boolean(x));
  const current = versionIds.length ? await db.select().from(documentVersions).where(inArray(documentVersions.id, versionIds)) : [];
  const history = docs.length
    ? await db
        .select({ id: documentVersions.id, documentId: documentVersions.documentId, fetchedAt: documentVersions.fetchedAt, change: documentVersions.change, grade: sql<string>`${documentVersions.analysis}->>'grade'` })
        .from(documentVersions)
        .where(inArray(documentVersions.documentId, docs.map((d) => d.id)))
        .orderBy(desc(documentVersions.fetchedAt))
        .limit(50)
    : [];

  let rules = { presetIds: opts.presetIds ?? DEFAULT_RULE_IDS, customRules: [] as CustomRule[] };
  let isWatching = false;
  if (opts.userId) {
    rules = await getUserRules(db, opts.userId);
    const [w] = await db.select().from(watchlist).where(and(eq(watchlist.userId, opts.userId), eq(watchlist.serviceId, service.id)));
    isWatching = Boolean(w);
  }
  const [{ count: watchers } = { count: 0 }] = await db.select({ count: sql<number>`count(*)::int` }).from(watchlist).where(eq(watchlist.serviceId, service.id));
  const verdict = await verdictFor(db, current, rules);

  return {
    service,
    isWatching,
    watchers,
    verdict,
    documents: docs.map((d) => {
      const v = current.find((c) => c.id === d.currentVersionId);
      return {
        id: d.id,
        url: d.url,
        type: d.type,
        title: d.title,
        lastCheckedAt: d.lastCheckedAt,
        lastError: d.lastError,
        version: v ? { id: v.id, fetchedAt: v.fetchedAt, engine: v.engine, analysis: v.analysis, wordCount: v.text.split(/\s+/).length } : null,
      };
    }),
    history: history.filter((h) => h.change),
  };
}

export async function listServices(opts: { limit?: number; query?: string } = {}) {
  const db = await getDb();
  // Services whose documents all failed to load have no grade; keep them out of listings.
  const search = opts.query ? sql`(${services.name} ilike ${"%" + opts.query + "%"} or ${services.domain} ilike ${"%" + opts.query + "%"})` : undefined;
  const where = and(isNotNull(services.grade), search);
  return db
    .select({ slug: services.slug, name: services.name, domain: services.domain, kind: services.kind, grade: services.grade, iconUrl: services.iconUrl, updatedAt: services.updatedAt })
    .from(services)
    .where(where)
    .orderBy(desc(services.updatedAt))
    .limit(opts.limit ?? 100);
}

/** Compact domain → grade map for the extension's on-device lookup (no browsing data leaves the device). */
export async function catalog() {
  const db = await getDb();
  const rows = await db.select({ slug: services.slug, domain: services.domain, grade: services.grade, name: services.name }).from(services).where(eq(services.kind, "website"));
  return rows.filter((r) => r.domain && r.grade);
}

// ---------- Change tracking ----------

export type Notifier = (alert: { userId: string; email: string; emailAlerts: boolean; alertId: string; title: string; body: string; slug: string; impact: string }) => Promise<void>;

/** Checks documents whose nextCheckAt has passed; creates alerts for watchers when content changed. */
export async function checkDueDocuments(opts: { limit?: number; notify?: Notifier } = {}) {
  const db = await getDb();
  const due = await db.select().from(documents).where(lte(documents.nextCheckAt, new Date())).orderBy(asc(documents.nextCheckAt)).limit(opts.limit ?? 20);
  const summary = { checked: 0, changed: 0, failed: 0, alerts: 0 };

  for (const doc of due) {
    summary.checked++;
    try {
      const res = await refreshDocument(db, doc.id, { force: true });
      if (res.changed && res.versionId && res.previousVersionId) {
        summary.changed++;
        summary.alerts += await createChangeAlerts(db, doc.serviceId, res.previousVersionId, res.versionId, opts.notify);
      }
    } catch {
      summary.failed++;
    }
    await db.update(documents).set({ nextCheckAt: await nextCheckFor(db, doc.serviceId, doc.failures) }).where(eq(documents.id, doc.id));
  }
  return summary;
}

async function nextCheckFor(db: DB, serviceId: string, failures: number) {
  const plans = await db.select({ plan: users.plan }).from(watchlist).innerJoin(users, eq(users.id, watchlist.userId)).where(eq(watchlist.serviceId, serviceId));
  let hours = 24 * 30;
  if (plans.some((p) => p.plan === "pro")) hours = PLAN_LIMITS.pro.checkIntervalHours;
  else if (plans.length) hours = PLAN_LIMITS.free.checkIntervalHours;
  // Back off on repeated failures.
  hours *= Math.min(8, 2 ** Math.min(failures, 3));
  return new Date(Date.now() + hours * 3600_000);
}

async function createChangeAlerts(db: DB, serviceId: string, prevId: string, nextId: string, notify?: Notifier) {
  const [service] = await db.select().from(services).where(eq(services.id, serviceId));
  const [prev] = await db.select().from(documentVersions).where(eq(documentVersions.id, prevId));
  const [next] = await db.select().from(documentVersions).where(eq(documentVersions.id, nextId));
  if (!service || !prev || !next?.change) return 0;
  const [doc] = await db.select().from(documents).where(eq(documents.id, next.documentId));
  const watchers = await db.select({ user: users }).from(watchlist).innerJoin(users, eq(users.id, watchlist.userId)).where(eq(watchlist.serviceId, serviceId));

  let created = 0;
  for (const { user } of watchers) {
    const rules = await getUserRules(db, user.id);
    const before = evaluatePresetRules(prev.analysis, rules.presetIds);
    const after = evaluatePresetRules(next.analysis, rules.presetIds);
    const broken = after.filter((r) => r.status === "fail" && before.find((b) => b.ruleId === r.ruleId)?.status !== "fail").map((r) => r.label);
    // Cosmetic edits are recorded in history but don't ping the user.
    if (next.change.impact === "neutral" && broken.length === 0) continue;
    const title = broken.length ? `${service.name} now breaks ${broken.length} of your rules` : `${service.name} updated its ${labelFor(doc?.type ?? "").replace("the ", "")}`;
    const [alert] = await db
      .insert(alerts)
      .values({ userId: user.id, serviceId, versionId: nextId, title, body: next.change.headline, impact: next.change.impact, brokenRules: broken })
      .returning();
    created++;
    await notify?.({ userId: user.id, email: user.email, emailAlerts: user.emailAlerts, alertId: alert!.id, title, body: next.change.headline, slug: service.slug, impact: next.change.impact }).catch(() => {});
  }
  return created;
}
