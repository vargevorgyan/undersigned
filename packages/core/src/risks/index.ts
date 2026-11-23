import type { BusinessFactKey, Fact, FactKey, PolicyAnalysis } from "../analyze/schema";

export type RiskCategory = "Confidentiality & IP" | "Privacy compliance" | "Legal recourse" | "Financial" | "Security" | "Operational";
export type RiskSeverity = "high" | "medium" | "low";
/** "present": the documents say it. "unverified": they don't say the protection exists. */
export type RiskStatus = "present" | "unverified";

type Trigger = { source: "facts"; key: FactKey } | { source: "business"; key: BusinessFactKey };

type RiskDef = {
  id: string;
  title: string;
  category: RiskCategory;
  severity: RiskSeverity;
  trigger: Trigger;
  /** Fact value that signals the risk; "unclear" also counts when the protection must be explicit. */
  riskyWhen: "yes" | "no";
  unclearIsRisk?: boolean;
  impact: string;
  regulations: string[];
  mitigations: string[];
  question: string;
};

const CATALOG: RiskDef[] = [
  {
    id: "ai-training",
    title: "Your data may train the vendor’s AI",
    category: "Confidentiality & IP",
    severity: "high",
    trigger: { source: "facts", key: "usesDataForAITraining" },
    riskyWhen: "yes",
    impact: "Confidential documents, code, customer data or trade secrets your team puts into the tool could be used to train models and resurface in outputs for others.",
    regulations: ["GDPR Art. 5(1)(b) purpose limitation", "GDPR Art. 28 processor instructions", "Trade secret protection"],
    mitigations: ["Turn off AI training in the admin console, if offered", "Use a business plan with a written no-training commitment", "Add a no-training clause to the data processing agreement", "Keep sensitive data out of the tool until resolved"],
    question: "Is any customer content or usage data used to train or improve AI models, and can it be contractually excluded?",
  },
  {
    id: "perpetual-license",
    title: "The vendor keeps rights to what you upload, forever",
    category: "Confidentiality & IP",
    severity: "high",
    trigger: { source: "business", key: "perpetualContentLicense" },
    riskyWhen: "yes",
    impact: "A perpetual or irrevocable license can survive account deletion and the end of your contract, limiting control over your own material.",
    regulations: ["Copyright and licensing", "Client confidentiality and NDA obligations"],
    mitigations: ["Negotiate a license limited to providing the service and ending at termination", "Avoid uploading client or NDA-covered material", "Confirm deletion ends the license in writing"],
    question: "Does the content license end when we delete content or terminate the contract?",
  },
  {
    id: "sells-data",
    title: "The vendor may sell personal data",
    category: "Privacy compliance",
    severity: "high",
    trigger: { source: "facts", key: "sellsData" },
    riskyWhen: "yes",
    impact: "If personal data you put into the service is sold, you may be part of a sale under US state laws and the vendor is acting beyond a processor role under GDPR.",
    regulations: ["CCPA/CPRA “sale” and service provider rules", "GDPR Art. 28 processor obligations"],
    mitigations: ["Sign a DPA naming the vendor as processor or service provider", "Exercise the vendor’s opt-out of sale", "Don’t share personal data with the service"],
    question: "Do you sell or license personal data you process on our behalf, in any form?",
  },
  {
    id: "ad-sharing",
    title: "Data shared with advertisers",
    category: "Privacy compliance",
    severity: "medium",
    trigger: { source: "facts", key: "sharesWithAdvertisers" },
    riskyWhen: "yes",
    impact: "Sharing for targeted advertising can count as “sharing” or a “sale” under US state laws, which you may have to disclose and let people opt out of.",
    regulations: ["CCPA/CPRA cross-context behavioral advertising", "ePrivacy and cookie consent rules"],
    mitigations: ["Confirm whether ad sharing applies to business customer data", "Update your own privacy notice and opt-out flows if it does"],
    question: "Is any data from our account shared with advertising partners or ad networks?",
  },
  {
    id: "tracking",
    title: "Tracks people across other sites and apps",
    category: "Privacy compliance",
    severity: "medium",
    trigger: { source: "facts", key: "tracksAcrossSites" },
    riskyWhen: "yes",
    impact: "If the vendor’s code runs on your website or app, its tracking may require consent from your visitors, and the liability can land on you.",
    regulations: ["ePrivacy Directive / cookie consent", "CCPA/CPRA", "Wiretap and pixel-tracking lawsuits in the US"],
    mitigations: ["List the vendor in your consent banner and block it until consent", "Check which trackers its embed loads"],
    question: "Which cookies, pixels or SDKs does your product place on our users’ devices, and for what purposes?",
  },
  {
    id: "biometrics",
    title: "Collects biometric data",
    category: "Privacy compliance",
    severity: "high",
    trigger: { source: "facts", key: "collectsBiometrics" },
    riskyWhen: "yes",
    impact: "Using a tool that processes employees’ or customers’ face, voice or fingerprints can create direct liability; Illinois allows statutory damages per violation.",
    regulations: ["Illinois BIPA ($1,000–$5,000 per violation)", "GDPR Art. 9 special category data", "Texas and Washington biometric laws"],
    mitigations: ["Turn off biometric features", "Collect written consent where required", "Confirm retention and destruction schedule in writing"],
    question: "Which biometric identifiers do you collect, how long do you keep them, and can the features be disabled?",
  },
  {
    id: "government-access",
    title: "May hand data to authorities without a court order",
    category: "Security",
    severity: "high",
    trigger: { source: "facts", key: "sharesWithGovernmentWithoutWarrant" },
    riskyWhen: "yes",
    impact: "Disclosure without legal process undermines confidentiality commitments to your customers and complicates international transfer assessments.",
    regulations: ["GDPR Chapter V transfers (Schrems II)", "Client confidentiality obligations"],
    mitigations: ["Require notice and legal-process commitments in the contract", "Request the vendor’s transparency report"],
    question: "Do you require a subpoena or court order before disclosing customer data to authorities, and will you notify us?",
  },
  {
    id: "no-deletion",
    title: "No clear way to delete your data",
    category: "Privacy compliance",
    severity: "medium",
    trigger: { source: "facts", key: "canDeleteAccount" },
    riskyWhen: "no",
    unclearIsRisk: true,
    impact: "If the vendor can’t delete data on request, you may be unable to honor erasure requests or your own retention policy.",
    regulations: ["GDPR Art. 17 right to erasure", "GDPR Art. 28(3)(g) deletion at end of service", "CCPA deletion requests"],
    mitigations: ["Get a written deletion commitment with a timeline", "Test deletion before rollout"],
    question: "How do we delete specific records and all our data at contract end, and within what timeframe, including backups?",
  },
  {
    id: "no-export",
    title: "No clear way to export your data",
    category: "Operational",
    severity: "low",
    trigger: { source: "facts", key: "canExportData" },
    riskyWhen: "no",
    unclearIsRisk: true,
    impact: "Without an export path you risk lock-in and a painful exit if the vendor raises prices, changes terms or shuts down.",
    regulations: ["GDPR Art. 20 data portability"],
    mitigations: ["Confirm export formats before committing", "Schedule regular exports"],
    question: "In what formats can we export all our data, and is export available after termination?",
  },
  {
    id: "silent-changes",
    title: "Terms can change without notice",
    category: "Operational",
    severity: "medium",
    trigger: { source: "facts", key: "changesWithoutNotice" },
    riskyWhen: "yes",
    impact: "Your compliance review can go stale overnight: new data uses or AI rights can arrive without anyone on your team noticing.",
    regulations: ["Vendor risk management (ISO 27001 A.5.19–5.22, SOC 2 CC9.2)"],
    mitigations: ["Negotiate an order form that overrides online terms", "Require 30 days’ notice of material changes", "Monitor the vendor’s documents for changes"],
    question: "How much notice do you give before changing your terms, privacy policy or data processing agreement?",
  },
  {
    id: "arbitration",
    title: "Disputes forced into private arbitration",
    category: "Legal recourse",
    severity: "medium",
    trigger: { source: "facts", key: "forcedArbitration" },
    riskyWhen: "yes",
    impact: "You may lose access to court, public precedent and joint claims with other affected customers.",
    regulations: ["Federal Arbitration Act (US)"],
    mitigations: ["Use the arbitration opt-out window if offered", "Negotiate court jurisdiction in an enterprise agreement"],
    question: "Can business customers opt out of arbitration or agree on a court venue?",
  },
  {
    id: "liability-cap",
    title: "Liability capped at a token amount",
    category: "Financial",
    severity: "medium",
    trigger: { source: "business", key: "liabilityCapLow" },
    riskyWhen: "yes",
    impact: "If the vendor causes a breach or outage, your losses above the cap (often $100 or fees paid) are yours to absorb.",
    regulations: ["Contract law: limitation of liability"],
    mitigations: ["Negotiate a higher cap or carve-outs for data breaches", "Check your cyber insurance covers vendor incidents"],
    question: "What is your liability cap for data breaches and confidentiality violations, and are there carve-outs?",
  },
  {
    id: "claim-deadline",
    title: "One year or less to bring a claim",
    category: "Legal recourse",
    severity: "low",
    trigger: { source: "business", key: "shortClaimDeadline" },
    riskyWhen: "yes",
    impact: "Problems discovered late, like a breach found after an audit, may already be out of time.",
    regulations: ["Contractual limitation periods"],
    mitigations: ["Negotiate the statutory limitation period", "Review vendor incidents promptly"],
    question: "Will you agree to the statutory limitation period for claims instead of one year?",
  },
  {
    id: "transfers",
    title: "Data transferred to other countries",
    category: "Privacy compliance",
    severity: "medium",
    trigger: { source: "business", key: "internationalTransfers" },
    riskyWhen: "yes",
    impact: "Transfers out of the EU/UK need a legal basis and possibly a transfer impact assessment; some customers and regulators require data residency.",
    regulations: ["GDPR Chapter V (Art. 44–49)", "UK GDPR international transfers"],
    mitigations: ["Confirm Standard Contractual Clauses or Data Privacy Framework coverage", "Ask for regional data residency"],
    question: "Where is our data stored and processed, and which transfer mechanisms cover it?",
  },
  {
    id: "breach-notice",
    title: "No breach notification commitment",
    category: "Security",
    severity: "medium",
    trigger: { source: "business", key: "breachNotification" },
    riskyWhen: "no",
    unclearIsRisk: true,
    impact: "You may need to notify regulators within 72 hours of learning of a breach; without a vendor commitment you might learn too late.",
    regulations: ["GDPR Art. 33 (processor must notify without undue delay)", "US state breach notification laws"],
    mitigations: ["Require breach notification within 24–72 hours in the DPA", "Name a security contact on both sides"],
    question: "Within how many hours will you notify us of a security incident affecting our data?",
  },
  {
    id: "subprocessors",
    title: "Third-party processors not disclosed",
    category: "Privacy compliance",
    severity: "low",
    trigger: { source: "business", key: "namesSubprocessors" },
    riskyWhen: "no",
    unclearIsRisk: true,
    impact: "You can’t assess fourth-party risk or object to new processors handling your data.",
    regulations: ["GDPR Art. 28(2) and 28(4) subprocessor authorization"],
    mitigations: ["Request the current subprocessor list", "Require advance notice of new subprocessors"],
    question: "Please share your current subprocessor list and how you notify customers of changes.",
  },
];

export type Risk = {
  id: string;
  title: string;
  category: RiskCategory;
  severity: RiskSeverity;
  status: RiskStatus;
  impact: string;
  regulations: string[];
  mitigations: string[];
  quote: string;
  documentType: string | null;
};

export type RiskReport = {
  score: number;
  level: "High" | "Elevated" | "Moderate" | "Low";
  risks: Risk[];
  questions: string[];
};

type Doc = { type: string; analysis: PolicyAnalysis };

const UNCLEAR: Fact = { value: "unclear", quote: "" };

function factFrom(doc: Doc, t: Trigger): Fact {
  // Analyses saved before business facts existed have no business object.
  if (t.source === "business") return doc.analysis.business?.[t.key] ?? UNCLEAR;
  return doc.analysis.facts[t.key] ?? UNCLEAR;
}

const WEIGHT: Record<RiskSeverity, number> = { high: 30, medium: 10, low: 4 };
const ORDER: Record<RiskSeverity, number> = { high: 0, medium: 1, low: 2 };

export function assessRisks(docs: Doc[]): RiskReport {
  const risks: Risk[] = [];
  const questions: string[] = [];
  for (const def of CATALOG) {
    const facts = docs.map((d) => ({ doc: d, fact: factFrom(d, def.trigger) }));
    const risky = facts.find((f) => f.fact.value === def.riskyWhen);
    const safe = facts.find((f) => f.fact.value !== "unclear" && f.fact.value !== def.riskyWhen);
    const base = { id: def.id, title: def.title, category: def.category, severity: def.severity, impact: def.impact, regulations: def.regulations, mitigations: def.mitigations };
    if (risky) {
      risks.push({ ...base, status: "present", quote: risky.fact.quote, documentType: risky.doc.type });
      continue;
    }
    if (safe) continue;
    // Nothing decisive in any document: either a gap worth flagging, or a question for the vendor.
    if (def.unclearIsRisk) risks.push({ ...base, status: "unverified", quote: "", documentType: null });
    questions.push(def.question);
  }
  risks.sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || Number(a.status === "unverified") - Number(b.status === "unverified"));
  const raw = risks.reduce((n, r) => n + WEIGHT[r.severity] * (r.status === "present" ? 1 : 0.4), 0);
  // Diminishing returns: many medium issues shouldn't outweigh a few severe ones.
  const score = Math.round(100 * (1 - Math.exp(-raw / 80)));
  const present = risks.filter((r) => r.status === "present");
  const highs = present.filter((r) => r.severity === "high").length;
  const mediums = present.filter((r) => r.severity === "medium").length;
  let level: RiskReport["level"] = "Low";
  if (highs >= 2) level = "High";
  else if (highs === 1 || mediums >= 4) level = "Elevated";
  else if (mediums >= 1) level = "Moderate";
  return { score, level, risks, questions };
}

export const RISK_CATEGORIES: RiskCategory[] = ["Confidentiality & IP", "Privacy compliance", "Security", "Legal recourse", "Financial", "Operational"];
