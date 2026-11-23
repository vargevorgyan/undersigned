import http from "node:http";
import type { AddressInfo } from "node:net";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

process.env.PGLITE_DIR = "memory";
process.env.ALLOW_PRIVATE_HOSTS = "1";
delete process.env.ANTHROPIC_API_KEY;
delete process.env.ANTHROPIC_AUTH_TOKEN;

const { alerts, documents, getDb, userRules, users, watchlist } = await import("../src/db");
const { analyzeInput, checkDueDocuments, getServiceView } = await import("../src/service");

const pad = "We describe how we handle your information in detail. ".repeat(12);
let privacy = `<h1>Privacy Policy</h1><p>${pad}</p><p>We do not sell your personal information.</p><p>You can delete your account in settings.</p>`;
const terms = `<h1>Terms of Service</h1><p>${pad}</p><p>Disputes are resolved by binding individual arbitration.</p>`;

let server: http.Server;
let base = "";

beforeAll(async () => {
  server = http.createServer((req, res) => {
    res.setHeader("content-type", "text/html");
    const body: Record<string, string> = {
      "/": `<html><head><title>Acme</title></head><body><main>Welcome</main><footer><a href="/privacy">Privacy Policy</a> <a href="/terms">Terms of Service</a></footer></body></html>`,
      "/privacy": `<html><head><title>Privacy Policy</title></head><body><article>${privacy}</article></body></html>`,
      "/terms": `<html><head><title>Terms of Service</title></head><body><article>${terms}</article></body></html>`,
    };
    const html = body[req.url ?? ""];
    res.statusCode = html ? 200 : 404;
    res.end(html ?? "not found");
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => server.close());

describe("pipeline", () => {
  let slug = "";

  it("discovers and analyzes policies from a homepage", async () => {
    const stages: string[] = [];
    ({ slug } = await analyzeInput(`${base}/`, (s) => stages.push(s)));
    expect(stages).toContain("finding");
    expect(stages.at(-1)).toBe("done");

    const view = await getServiceView(slug, { presetIds: ["no-selling", "no-arbitration"] });
    expect(view!.documents.map((d) => d.type).sort()).toEqual(["privacy", "terms"]);
    expect(view!.verdict.status).toBe("violation");
    expect(view!.verdict.results.find((r) => r.ruleId === "no-arbitration")!.status).toBe("fail");
    expect(view!.verdict.results.find((r) => r.ruleId === "no-selling")!.status).toBe("pass");
  });

  it("alerts watchers when a policy starts breaking their rules", async () => {
    const db = await getDb();
    const [user] = await db.insert(users).values({ email: "t@example.com", passwordHash: "x" }).returning();
    await db.insert(userRules).values({ userId: user!.id, presetIds: ["no-selling"], customRules: [] });
    const view = await getServiceView(slug);
    await db.insert(watchlist).values({ userId: user!.id, serviceId: view!.service.id });

    privacy = privacy.replace("We do not sell your personal information.", "We may sell your personal information to partners.");
    await db.update(documents).set({ nextCheckAt: new Date(0) });

    const notified: string[] = [];
    const summary = await checkDueDocuments({ notify: async (a) => void notified.push(a.title) });
    expect(summary.changed).toBe(1);

    const rows = await db.select().from(alerts).where(eq(alerts.userId, user!.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.brokenRules).toEqual(["Never sell my data"]);
    expect(rows[0]!.impact).toBe("worse");
    expect(notified[0]).toContain("breaks 1 of your rules");

    const after = await getServiceView(slug, { userId: user!.id });
    expect(after!.isWatching).toBe(true);
    expect(after!.history.length).toBe(1);
  });

  it("skips unchanged documents without creating versions", async () => {
    const db = await getDb();
    await db.update(documents).set({ nextCheckAt: new Date(0) });
    const summary = await checkDueDocuments();
    expect(summary.changed).toBe(0);
    expect(summary.failed).toBe(0);
  });
});
