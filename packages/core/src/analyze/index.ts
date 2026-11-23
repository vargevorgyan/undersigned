import { diffLines } from "diff";
import type { CustomRule } from "../rules";
import { aiEnabled, analyzeWithAI, checkCustomRulesWithAI, summarizeChangeWithAI } from "./ai";
import { analyzeBasic, checkCustomRulesBasic } from "./basic";
import { CURATED } from "./curated";
import { BUSINESS_FACT_KEYS, FACT_KEYS, FACT_LABELS, type AnalysisEngine, type ChangeSummary, type PolicyAnalysis } from "./schema";

export { aiEnabled, AnalysisError, MODEL } from "./ai";

const squash = (s: string) => s.toLowerCase().replace(/[“”"'’‘]/g, "").replace(/\s+/g, " ").trim();

/** Drops quotes that don't appear in the source so we never show invented citations. */
export function verifyQuotes(analysis: PolicyAnalysis, text: string): PolicyAnalysis {
  const hay = squash(text);
  const ok = (q: string) => q.length > 0 && hay.includes(squash(q).replace(/…$/, ""));
  const facts = { ...analysis.facts };
  for (const k of FACT_KEYS) if (!ok(facts[k].quote)) facts[k] = { ...facts[k], quote: "" };
  const business = { ...analysis.business };
  for (const k of BUSINESS_FACT_KEYS) if (business[k] && !ok(business[k].quote)) business[k] = { ...business[k], quote: "" };
  return { ...analysis, facts, business, highlights: analysis.highlights.map((h) => (ok(h.quote) ? h : { ...h, quote: "" })) };
}

export async function analyzeDocument(input: {
  text: string;
  url: string;
  title: string;
  serviceName: string;
  hintType?: PolicyAnalysis["documentType"];
}): Promise<{ analysis: PolicyAnalysis; engine: AnalysisEngine }> {
  if (!aiEnabled()) {
    // Hand-reviewed analyses stand in for AI when no key is set; quotes are still checked against the live text.
    const curated = CURATED[input.url];
    if (curated) return { analysis: verifyQuotes({ ...curated, serviceName: input.serviceName }, input.text), engine: "curated" };
    return { analysis: analyzeBasic(input), engine: "basic" };
  }
  const analysis = await analyzeWithAI(input);
  // The service name from our records is more reliable than the model's guess.
  return { analysis: verifyQuotes({ ...analysis, serviceName: input.serviceName }, input.text), engine: "ai" };
}

export function factChanges(prev: PolicyAnalysis, next: PolicyAnalysis): string[] {
  return FACT_KEYS.filter((k) => prev.facts[k].value !== next.facts[k].value).map(
    (k) => `${FACT_LABELS[k]}: ${prev.facts[k].value} → ${next.facts[k].value}`,
  );
}

export function textDiff(prev: string, next: string, maxChars = 30_000) {
  const parts = diffLines(prev, next);
  const added = parts.filter((p) => p.added).map((p) => p.value).join("\n");
  const removed = parts.filter((p) => p.removed).map((p) => p.value).join("\n");
  return { added: added.slice(0, maxChars), removed: removed.slice(0, maxChars) };
}

export async function summarizeChange(input: {
  serviceName: string;
  prevText: string;
  nextText: string;
  prev: PolicyAnalysis;
  next: PolicyAnalysis;
}): Promise<ChangeSummary> {
  const changes = factChanges(input.prev, input.next);
  const { added, removed } = textDiff(input.prevText, input.nextText);
  if (aiEnabled()) return summarizeChangeWithAI({ serviceName: input.serviceName, added, removed, factChanges: changes });
  const worse = FACT_KEYS.some((k) => {
    const before = input.prev.facts[k].value;
    const after = input.next.facts[k].value;
    const userFriendlyIsYes = k === "canDeleteAccount" || k === "canExportData";
    return userFriendlyIsYes ? before === "yes" && after !== "yes" : before !== "yes" && after === "yes";
  });
  let impact: ChangeSummary["impact"] = "neutral";
  if (worse) impact = "worse";
  else if (changes.length) impact = "better";
  return {
    headline: changes.length ? `${changes.length} privacy-relevant change${changes.length > 1 ? "s" : ""} detected` : "The text changed, but nothing we track changed",
    impact,
    points: changes.slice(0, 5),
  };
}

export async function checkCustomRules(text: string, rules: CustomRule[]) {
  if (rules.length === 0) return [];
  return aiEnabled() ? checkCustomRulesWithAI(text, rules) : checkCustomRulesBasic(rules);
}
