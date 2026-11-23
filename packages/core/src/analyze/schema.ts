import { z } from "zod";

export const TriState = z.enum(["yes", "no", "unclear"]);
export type TriState = z.infer<typeof TriState>;

export const FACT_KEYS = [
  "sellsData",
  "sharesWithAdvertisers",
  "usesDataForAITraining",
  "tracksAcrossSites",
  "collectsPreciseLocation",
  "collectsBiometrics",
  "canDeleteAccount",
  "canExportData",
  "forcedArbitration",
  "classActionWaiver",
  "changesWithoutNotice",
  "sharesWithGovernmentWithoutWarrant",
] as const;
export type FactKey = (typeof FACT_KEYS)[number];

export const FACT_LABELS: Record<FactKey, string> = {
  sellsData: "Sells your personal data",
  sharesWithAdvertisers: "Shares data with advertisers",
  usesDataForAITraining: "Uses your content to train AI",
  tracksAcrossSites: "Tracks you across other sites and apps",
  collectsPreciseLocation: "Collects precise location",
  collectsBiometrics: "Collects biometric data (face, voice, fingerprint)",
  canDeleteAccount: "You can delete your account and data",
  canExportData: "You can download a copy of your data",
  forcedArbitration: "Disputes go to forced arbitration",
  classActionWaiver: "You give up the right to class actions",
  changesWithoutNotice: "Terms can change without notifying you",
  sharesWithGovernmentWithoutWarrant: "Shares data with authorities without a court order",
};

export const Fact = z.object({
  value: TriState,
  quote: z.string().describe("Short verbatim quote from the document supporting the value, or empty string if unclear"),
});
export type Fact = z.infer<typeof Fact>;

export const Severity = z.enum(["good", "neutral", "caution", "bad"]);
export type Severity = z.infer<typeof Severity>;

export const Highlight = z.object({
  title: z.string().describe("Plain-language headline, max 8 words"),
  explanation: z.string().describe("One or two sentences explaining what this means for the user"),
  severity: Severity,
  quote: z.string().describe("Verbatim supporting quote from the document, max 40 words"),
});
export type Highlight = z.infer<typeof Highlight>;

/** Contract terms that matter to a business customer rather than an individual user. */
export const BUSINESS_FACT_KEYS = [
  "perpetualContentLicense",
  "liabilityCapLow",
  "shortClaimDeadline",
  "internationalTransfers",
  "breachNotification",
  "namesSubprocessors",
] as const;
export type BusinessFactKey = (typeof BUSINESS_FACT_KEYS)[number];

export const BUSINESS_FACT_LABELS: Record<BusinessFactKey, string> = {
  perpetualContentLicense: "Takes a perpetual or irrevocable license to content you upload",
  liabilityCapLow: "Caps its liability at a token amount (around $100)",
  shortClaimDeadline: "Gives you one year or less to bring a claim",
  internationalTransfers: "Transfers data to other countries",
  breachNotification: "Commits to notify you of security breaches",
  namesSubprocessors: "Publishes the third parties that process your data",
};

export const PolicyAnalysis = z.object({
  serviceName: z.string(),
  documentType: z.enum(["privacy", "terms", "cookies", "app_privacy_label", "other"]),
  summary: z.string().describe("2-3 sentence plain-language summary a 14-year-old understands"),
  grade: z.enum(["A", "B", "C", "D", "E"]).describe("A = respects users, E = very invasive or unfair"),
  highlights: z.array(Highlight).describe("5 to 10 most important points, worst first"),
  facts: z.object(Object.fromEntries(FACT_KEYS.map((k) => [k, Fact])) as Record<FactKey, typeof Fact>),
  business: z
    .object(Object.fromEntries(BUSINESS_FACT_KEYS.map((k) => [k, Fact])) as Record<BusinessFactKey, typeof Fact>)
    .describe("Contract terms relevant to a business customer"),
  dataRetention: z.string().describe("How long data is kept, in plain words, or 'Not stated'"),
  jurisdiction: z.string().describe("Governing law / country, or 'Not stated'"),
});
export type PolicyAnalysis = z.infer<typeof PolicyAnalysis>;

export const ChangeSummary = z.object({
  headline: z.string().describe("One sentence: what changed, max 15 words"),
  impact: z.enum(["better", "worse", "neutral"]),
  points: z.array(z.string()).describe("Up to 5 bullet points describing concrete changes"),
});
export type ChangeSummary = z.infer<typeof ChangeSummary>;

export const CustomRuleCheck = z.object({
  results: z.array(
    z.object({
      ruleId: z.string(),
      status: z.enum(["pass", "fail", "unclear"]),
      reason: z.string().describe("One sentence"),
      quote: z.string(),
    }),
  ),
});
export type CustomRuleCheck = z.infer<typeof CustomRuleCheck>;

export type AnalysisEngine = "ai" | "basic" | "curated";
