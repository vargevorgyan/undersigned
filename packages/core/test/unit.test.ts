import { describe, expect, it } from "vitest";
import { verifyQuotes } from "../src/analyze";
import { analyzeBasic } from "../src/analyze/basic";
import { findPolicyLinks, guessDocType } from "../src/ingest/discover";
import { contentHash, normalizeInputUrl } from "../src/ingest/fetch";
import { parseStoreUrl } from "../src/ingest/stores";
import { evaluatePresetRules, mergeResults, toVerdict } from "../src/rules";
import { slugify } from "../src/service";

const POLICY = `Privacy Policy. Last updated January 5, 2026.
We do not sell your personal information to anyone.
We share information with advertising partners to show you relevant ads.
You can delete your account at any time from settings.
Any dispute will be resolved by binding individual arbitration.
We may change this policy at any time without notice.`;

describe("basic analyzer", () => {
  const a = analyzeBasic({ text: POLICY, url: "https://x.com/privacy", title: "Privacy Policy", serviceName: "X" });

  it("detects explicit negations and positives", () => {
    expect(a.facts.sellsData.value).toBe("no");
    expect(a.facts.sharesWithAdvertisers.value).toBe("yes");
    expect(a.facts.canDeleteAccount.value).toBe("yes");
    expect(a.facts.forcedArbitration.value).toBe("yes");
    expect(a.facts.changesWithoutNotice.value).toBe("yes");
    expect(a.facts.collectsBiometrics.value).toBe("unclear");
  });

  it("doesn't read selling a product as selling data", () => {
    const b = analyzeBasic({ text: "We sell premium Services that provide our customers with tools.", url: "u", title: "Privacy", serviceName: "L" });
    expect(b.facts.sellsData.value).toBe("unclear");
  });

  it("ignores look-alike sentences about other topics", () => {
    const b = analyzeBasic({
      text: `Short version: Beta Previews may not be supported or may change at any time.
Essential Cookies and Similar Tracking Technologies: we use cookies to store your settings.
An individual has the possibility to invoke binding arbitration for complaints regarding DPF compliance.`,
      url: "u",
      title: "Terms",
      serviceName: "G",
    });
    expect(b.facts.changesWithoutNotice.value).toBe("unclear");
    expect(b.facts.tracksAcrossSites.value).toBe("unclear");
    expect(b.facts.forcedArbitration.value).toBe("unclear");
    const g = analyzeBasic({ text: "So while we may modify this agreement at any time, we will notify users of any material changes.", url: "u", title: "Terms", serviceName: "G" });
    expect(g.facts.changesWithoutNotice.value).toBe("no");
  });

  it("evaluates preset rules from facts", () => {
    const r = evaluatePresetRules(a, ["no-selling", "no-arbitration", "no-biometrics"]);
    expect(r.map((x) => x.status)).toEqual(["pass", "fail", "unclear"]);
    const v = toVerdict(r);
    expect(v.status).toBe("violation");
    expect(v.results[0]!.status).toBe("fail");
  });
});

describe("rules", () => {
  it("merges worst status across documents", () => {
    const base = { label: "", reason: "", quote: "", custom: false };
    const merged = mergeResults([
      [{ ...base, ruleId: "a", status: "pass" }, { ...base, ruleId: "b", status: "unclear" }],
      [{ ...base, ruleId: "a", status: "fail" }, { ...base, ruleId: "b", status: "pass" }],
    ]);
    expect(merged.find((r) => r.ruleId === "a")!.status).toBe("fail");
    expect(merged.find((r) => r.ruleId === "b")!.status).toBe("pass");
  });

  it("returns none for no rules", () => expect(toVerdict([]).status).toBe("none"));
});

describe("quote verification", () => {
  it("drops invented quotes and keeps real ones", () => {
    const a = analyzeBasic({ text: POLICY, url: "u", title: "t", serviceName: "X" });
    a.highlights = [
      { title: "real", explanation: "", severity: "bad", quote: "We share information with advertising partners" },
      { title: "fake", explanation: "", severity: "bad", quote: "We sell your soul" },
    ];
    const v = verifyQuotes(a, POLICY);
    expect(v.highlights[0]!.quote).not.toBe("");
    expect(v.highlights[1]!.quote).toBe("");
  });
});

describe("ingest helpers", () => {
  it("normalizes input and blocks private hosts", () => {
    expect(normalizeInputUrl("example.com/privacy")).toBe("https://example.com/privacy");
    expect(() => normalizeInputUrl("http://192.168.1.1")).toThrow();
    expect(() => normalizeInputUrl("not a url")).toThrow();
  });

  it("ignores 'last updated' dates in content hash", () => {
    expect(contentHash("Policy. Last updated January 5, 2026. Text")).toBe(contentHash("Policy. Last updated March 9, 2027. Text"));
    expect(contentHash("We sell data")).not.toBe(contentHash("We never sell data"));
  });

  it("parses store urls", () => {
    expect(parseStoreUrl("https://play.google.com/store/apps/details?id=com.whatsapp&hl=en")).toEqual({ kind: "android", storeId: "com.whatsapp", country: "us" });
    expect(parseStoreUrl("https://apps.apple.com/gb/app/whatsapp-messenger/id310633997")).toEqual({ kind: "ios", storeId: "310633997", country: "gb" });
    expect(parseStoreUrl("https://example.com")).toBeNull();
  });

  it("finds policy links, preferring same-site", () => {
    const links = findPolicyLinks(
      [
        { href: "https://example.com/legal/privacy", text: "Privacy" },
        { href: "https://example.com/terms-of-service", text: "Terms of Service" },
        { href: "https://other.com/privacy", text: "Privacy" },
        { href: "https://example.com/blog", text: "Blog" },
      ],
      "https://www.example.com/",
    );
    expect(links).toContainEqual({ type: "privacy", url: "https://example.com/legal/privacy" });
    expect(links).toContainEqual({ type: "terms", url: "https://example.com/terms-of-service" });
  });

  it("guesses document type", () => {
    expect(guessDocType("https://x.com/privacy-policy")).toBe("privacy");
    expect(guessDocType("https://x.com/legal", "Terms of Use")).toBe("terms");
    expect(guessDocType("https://x.com/about")).toBeNull();
  });

  it("slugifies", () => expect(slugify("WhatsApp Messenger-android")).toBe("whatsapp-messenger-android"));
});

describe("risk assessment", async () => {
  const { assessRisks } = await import("../src/risks");
  const text = `We may use your content to train machine learning models and artificial intelligence.
By posting, you grant us a perpetual, irrevocable license to use your content that you upload.
Our total liability shall not exceed one hundred dollars ($100).
You can delete your account at any time.`;
  const analysis = analyzeBasic({ text, url: "u", title: "Terms", serviceName: "V" });

  it("flags present risks with quotes and sorts high first", () => {
    const r = assessRisks([{ type: "terms", analysis }]);
    const ids = r.risks.map((x) => x.id);
    expect(ids).toContain("ai-training");
    expect(ids).toContain("perpetual-license");
    expect(ids).toContain("liability-cap");
    expect(ids).not.toContain("no-deletion");
    expect(r.risks[0]!.severity).toBe("high");
    expect(r.risks.find((x) => x.id === "liability-cap")!.quote).toContain("$100");
  });

  it("turns missing protections into unverified risks and vendor questions", () => {
    const r = assessRisks([{ type: "terms", analysis }]);
    expect(r.risks.find((x) => x.id === "breach-notice")!.status).toBe("unverified");
    expect(r.questions.some((q) => q.includes("security incident"))).toBe(true);
    expect(r.score).toBeGreaterThan(0);
  });

  it("tolerates analyses saved before business facts existed", () => {
    const { business: _drop, ...old } = analysis;
    expect(() => assessRisks([{ type: "privacy", analysis: old as typeof analysis }])).not.toThrow();
  });
});
