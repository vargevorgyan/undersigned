import type { FactKey, PolicyAnalysis, TriState } from "../analyze/schema";

export type RuleStatus = "pass" | "fail" | "unclear";

export type PresetRule = {
  id: string;
  label: string;
  description: string;
  fact: FactKey;
  /** Fact value that satisfies the rule. */
  want: Exclude<TriState, "unclear">;
};

export const PRESET_RULES: PresetRule[] = [
  { id: "no-selling", label: "Never sell my data", description: "The service must not sell personal data.", fact: "sellsData", want: "no" },
  { id: "no-ads-sharing", label: "No sharing with advertisers", description: "No handing data to ad networks.", fact: "sharesWithAdvertisers", want: "no" },
  { id: "no-ai-training", label: "Don't train AI on my content", description: "My posts, files and chats stay out of AI training.", fact: "usesDataForAITraining", want: "no" },
  { id: "no-cross-tracking", label: "No tracking across other sites", description: "No following me around the web or other apps.", fact: "tracksAcrossSites", want: "no" },
  { id: "no-location", label: "No precise location", description: "No GPS-level location collection.", fact: "collectsPreciseLocation", want: "no" },
  { id: "no-biometrics", label: "No biometric data", description: "No face, voice or fingerprint data.", fact: "collectsBiometrics", want: "no" },
  { id: "can-delete", label: "I can delete my account", description: "Deleting my account removes my data.", fact: "canDeleteAccount", want: "yes" },
  { id: "can-export", label: "I can download my data", description: "I can get a copy of what they store.", fact: "canExportData", want: "yes" },
  { id: "no-arbitration", label: "No forced arbitration", description: "I keep my right to go to court.", fact: "forcedArbitration", want: "no" },
  { id: "no-class-waiver", label: "Keep class action rights", description: "I can join a class action.", fact: "classActionWaiver", want: "no" },
  { id: "notify-changes", label: "Tell me before terms change", description: "Changes must be announced in advance.", fact: "changesWithoutNotice", want: "no" },
  { id: "warrant-only", label: "Authorities need a court order", description: "No handing data over without legal process.", fact: "sharesWithGovernmentWithoutWarrant", want: "no" },
];

export const DEFAULT_RULE_IDS = ["no-selling", "no-ai-training", "can-delete", "no-cross-tracking"];

export type CustomRule = { id: string; text: string };

export type RuleResult = {
  ruleId: string;
  label: string;
  status: RuleStatus;
  reason: string;
  quote: string;
  custom: boolean;
};

export type Verdict = {
  status: "ok" | "warning" | "violation" | "none";
  passed: number;
  failed: number;
  unclear: number;
  results: RuleResult[];
};

export function presetById(id: string) {
  return PRESET_RULES.find((r) => r.id === id);
}

export function evaluatePresetRules(analysis: PolicyAnalysis, ruleIds: string[]): RuleResult[] {
  return ruleIds.flatMap((id) => {
    const rule = presetById(id);
    if (!rule) return [];
    const fact = analysis.facts[rule.fact];
    let status: RuleStatus = "unclear";
    if (fact.value !== "unclear") status = fact.value === rule.want ? "pass" : "fail";
    return [{ ruleId: id, label: rule.label, status, reason: statusReason(status, rule), quote: fact.quote, custom: false }];
  });
}

function statusReason(status: RuleStatus, rule: PresetRule) {
  if (status === "pass") return "The policy meets this rule.";
  if (status === "fail") return "The policy breaks this rule.";
  return `The policy doesn't clearly say. ${rule.description}`;
}

/** Merges results across a service's documents: fail beats pass, and any clear answer beats unclear. */
export function mergeResults(lists: RuleResult[][]): RuleResult[] {
  const rank: Record<RuleStatus, number> = { unclear: 0, pass: 1, fail: 2 };
  const byId = new Map<string, RuleResult>();
  for (const r of lists.flat()) {
    const prev = byId.get(r.ruleId);
    if (!prev || rank[r.status] > rank[prev.status]) byId.set(r.ruleId, r);
  }
  return [...byId.values()];
}

export function toVerdict(results: RuleResult[]): Verdict {
  const failed = results.filter((r) => r.status === "fail").length;
  const unclear = results.filter((r) => r.status === "unclear").length;
  const passed = results.length - failed - unclear;
  let status: Verdict["status"] = "ok";
  if (results.length === 0) status = "none";
  else if (failed > 0) status = "violation";
  else if (unclear > 0) status = "warning";
  // Failed first so the most important information leads.
  const order: Record<RuleStatus, number> = { fail: 0, unclear: 1, pass: 2 };
  return { status, passed, failed, unclear, results: [...results].sort((a, b) => order[a.status] - order[b.status]) };
}

export const GRADE_INFO: Record<PolicyAnalysis["grade"], { label: string; tone: "good" | "ok" | "warn" | "bad" }> = {
  A: { label: "Respects you", tone: "good" },
  B: { label: "Mostly fair", tone: "good" },
  C: { label: "Mixed", tone: "ok" },
  D: { label: "Invasive", tone: "warn" },
  E: { label: "Very invasive", tone: "bad" },
};

export const PLAN_LIMITS = {
  free: { customRules: 3, watchlist: 3, checkIntervalHours: 24 * 7 },
  pro: { customRules: 50, watchlist: 500, checkIntervalHours: 24 },
} as const;
export type Plan = keyof typeof PLAN_LIMITS;
