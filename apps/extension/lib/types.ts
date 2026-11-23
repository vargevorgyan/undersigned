// Mirrors docs/API.md.
export type Grade = "A" | "B" | "C" | "D" | "E";
export type RuleStatus = "pass" | "fail" | "unclear";
export type Severity = "good" | "neutral" | "caution" | "bad";

export type User = { id: string; email: string; name: string | null; plan: "free" | "pro"; emailAlerts: boolean; createdAt: string };
export type Limits = { customRules: number; watchlist: number; checkIntervalHours: number };

export type RuleResult = { ruleId: string; label: string; status: RuleStatus; reason: string; quote: string; custom: boolean };
export type Verdict = { status: "ok" | "warning" | "violation" | "none"; passed: number; failed: number; unclear: number; results: RuleResult[] };

export type Highlight = { title: string; explanation: string; severity: Severity; quote: string };
export type PolicyAnalysis = {
  serviceName: string;
  documentType: string;
  summary: string;
  grade: Grade;
  dataRetention: string;
  jurisdiction: string;
  highlights: Highlight[];
  facts: Record<string, { value: "yes" | "no" | "unclear"; quote: string }>;
};

export type ServiceView = {
  service: { id: string; slug: string; name: string; domain: string | null; kind: "website" | "android" | "ios"; iconUrl: string | null; grade: Grade | null; updatedAt: string };
  isWatching: boolean;
  watchers: number;
  verdict: Verdict;
  documents: {
    id: string;
    url: string;
    type: "privacy" | "terms" | "cookies" | "app_privacy_label" | "other";
    title: string | null;
    lastCheckedAt: string | null;
    lastError: string | null;
    version: null | { id: string; fetchedAt: string; engine: "ai" | "basic"; wordCount: number; analysis: PolicyAnalysis };
  }[];
  history: { id: string; fetchedAt: string; grade: string; change: { headline: string; impact: "better" | "worse" | "neutral"; points: string[] } }[];
};

export type CatalogEntry = { slug: string; domain: string; grade: Grade; name: string };

export type PresetRule = { id: string; label: string; description: string };
export type CustomRule = { id: string; text: string };
export type RulesPayload = { presets: PresetRule[]; presetIds: string[]; customRules: CustomRule[]; limits: Limits };

export type Alert = {
  id: string;
  slug: string;
  serviceName: string;
  iconUrl: string | null;
  title: string;
  body: string;
  impact: "better" | "worse" | "neutral";
  brokenRules: string[];
  read: boolean;
  createdAt: string;
};

export type Stage = "fetching" | "finding" | "reading" | "analyzing" | "saving" | "done";
