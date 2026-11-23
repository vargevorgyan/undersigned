// Mirrors docs/API.md (mobile is standalone, so types are copied rather than imported).

export type Grade = 'A' | 'B' | 'C' | 'D' | 'E';
export type Plan = 'free' | 'pro';
export type TriState = 'yes' | 'no' | 'unclear';
export type Impact = 'better' | 'worse' | 'neutral';
export type RuleStatus = 'pass' | 'fail' | 'unclear';
export type DocType = 'privacy' | 'terms' | 'cookies' | 'app_privacy_label' | 'other';
export type Severity = 'good' | 'neutral' | 'caution' | 'bad';

export type User = { id: string; email: string; name: string | null; plan: Plan; emailAlerts: boolean; createdAt: string };
export type Limits = { customRules: number; watchlist: number; checkIntervalHours: number };
export type Me = { user: User; limits: Limits; billingEnabled: boolean };
export type AuthResponse = { token: string; user: User };

export const FACT_KEYS = [
  'sellsData',
  'sharesWithAdvertisers',
  'usesDataForAITraining',
  'tracksAcrossSites',
  'collectsPreciseLocation',
  'collectsBiometrics',
  'canDeleteAccount',
  'canExportData',
  'forcedArbitration',
  'classActionWaiver',
  'changesWithoutNotice',
  'sharesWithGovernmentWithoutWarrant',
] as const;
export type FactKey = (typeof FACT_KEYS)[number];

export const FACT_LABELS: Record<FactKey, string> = {
  sellsData: 'Sells your personal data',
  sharesWithAdvertisers: 'Shares data with advertisers',
  usesDataForAITraining: 'Uses your content to train AI',
  tracksAcrossSites: 'Tracks you across other sites and apps',
  collectsPreciseLocation: 'Collects precise location',
  collectsBiometrics: 'Collects biometric data',
  canDeleteAccount: 'You can delete your account and data',
  canExportData: 'You can download a copy of your data',
  forcedArbitration: 'Disputes go to forced arbitration',
  classActionWaiver: 'You give up class action rights',
  changesWithoutNotice: 'Terms can change without notice',
  sharesWithGovernmentWithoutWarrant: 'Shares with authorities without a court order',
};

/** Facts where "yes" is good for the user. */
export const USER_FRIENDLY_YES: FactKey[] = ['canDeleteAccount', 'canExportData'];

export type Highlight = { title: string; explanation: string; severity: Severity; quote: string };

export type PolicyAnalysis = {
  serviceName: string;
  documentType: DocType;
  summary: string;
  grade: Grade;
  highlights: Highlight[];
  facts: Record<FactKey, { value: TriState; quote: string }>;
  dataRetention: string;
  jurisdiction: string;
};

export type RuleResult = { ruleId: string; label: string; status: RuleStatus; reason: string; quote: string; custom: boolean };

export type Verdict = {
  status: 'ok' | 'warning' | 'violation' | 'none';
  passed: number;
  failed: number;
  unclear: number;
  results: RuleResult[];
};

export type ServiceDocument = {
  id: string;
  url: string;
  type: DocType;
  title: string | null;
  lastCheckedAt: string | null;
  lastError: string | null;
  version: null | { id: string; fetchedAt: string; engine: 'ai' | 'basic'; wordCount: number; analysis: PolicyAnalysis };
};

export type ServiceKind = 'website' | 'android' | 'ios';

export type ServiceView = {
  service: {
    id: string;
    slug: string;
    name: string;
    domain: string | null;
    kind: ServiceKind;
    storeId: string | null;
    iconUrl: string | null;
    grade: Grade | null;
    updatedAt: string;
  };
  isWatching: boolean;
  watchers: number;
  verdict: Verdict;
  documents: ServiceDocument[];
  history: { id: string; documentId: string; fetchedAt: string; grade: Grade; change: { headline: string; impact: Impact; points: string[] } }[];
};

export type ServiceListItem = { slug: string; name: string; domain: string | null; kind: ServiceKind; grade: Grade | null; iconUrl: string | null; updatedAt: string };

export type PresetRule = { id: string; label: string; description: string; fact: FactKey; want: 'yes' | 'no' };
export type CustomRule = { id: string; text: string };
export type RulesPayload = { presets: PresetRule[]; presetIds: string[]; customRules: CustomRule[]; limits: Limits };

export type WatchItem = {
  slug: string;
  name: string;
  domain: string | null;
  kind: ServiceKind;
  grade: Grade | null;
  iconUrl: string | null;
  addedAt: string;
  lastCheckedAt: string | null;
  nextCheckAt: string | null;
  hasError: boolean;
  lastChange: null | { at: string; headline: string; impact: Impact };
};

export type AlertItem = {
  id: string;
  slug: string;
  serviceName: string;
  iconUrl: string | null;
  title: string;
  body: string;
  impact: Impact;
  brokenRules: string[];
  read: boolean;
  createdAt: string;
};

export const DOC_LABELS: Record<DocType, string> = {
  privacy: 'Privacy',
  terms: 'Terms',
  cookies: 'Cookies',
  app_privacy_label: 'Store label',
  other: 'Other',
};

export const KIND_LABELS: Record<ServiceKind, string> = { website: 'Website', android: 'Android app', ios: 'iOS app' };
