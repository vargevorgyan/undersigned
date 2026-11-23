import type { CustomRule } from "../rules";
import { BUSINESS_FACT_KEYS, FACT_KEYS, FACT_LABELS, type BusinessFactKey, type CustomRuleCheck, type Fact, type FactKey, type Highlight, type PolicyAnalysis, type TriState } from "./schema";

// Keyword fallback used when no AI key is configured. Deliberately conservative: prefers "unclear".
// `skip`: sentences that match a pattern but are about something else.
type Pattern = { yes?: RegExp[]; no?: RegExp[]; skip?: RegExp };

const PATTERNS: Record<FactKey, Pattern> = {
  sellsData: {
    no: [/(we|do) not sell (your )?(personal )?(information|data)/i, /never sell/i, /don['’]t sell/i],
    // "We sell premium services" is not selling data: require the object.
    yes: [/\bwe (may )?sell (your |the )?(personal )?(data|information)/i, /sale of (your )?personal (information|data)/i],
  },
  sharesWithAdvertisers: {
    no: [/(do not|don['’]t|never) share[^.]{0,60}advertis/i],
    yes: [/(share|disclose|provide)[^.]{0,80}advertis(ers|ing partners)/i, /advertising partners/i],
  },
  usesDataForAITraining: {
    no: [/(do not|don['’]t|never) (use|train)[^.]{0,60}(train|machine learning|artificial intelligence|ai models)/i],
    yes: [/(train|improve|develop)[^.]{0,60}(machine learning|artificial intelligence|\bai\b|models)/i],
  },
  tracksAcrossSites: {
    yes: [/across (other )?(websites|sites|apps|devices|services)/i, /third[- ]party (advertising )?(cookies|trackers|pixels)/i, /cross-context behavioral/i],
    skip: /essential cookies|strictly necessary/i,
  },
  collectsPreciseLocation: {
    yes: [/precise (geo)?location/i, /gps/i],
    no: [/(do not|don['’]t) collect[^.]{0,40}precise location/i],
  },
  collectsBiometrics: {
    yes: [/biometric/i, /face ?print|facial (recognition|geometry)|voiceprint|fingerprint/i],
  },
  canDeleteAccount: {
    yes: [/(delete|deletion of|erase) (your )?(account|personal (data|information))/i, /right to (delete|erasure)/i],
  },
  canExportData: {
    yes: [/(download|export|copy) (of )?(your )?(data|information)/i, /data portability/i, /right to access/i],
  },
  forcedArbitration: {
    yes: [/binding (individual )?arbitration/i, /arbitration agreement/i],
    // EU-US Data Privacy Framework arbitration is a regulator mechanism, not a consumer arbitration clause.
    skip: /data privacy framework|\bDPF\b|privacy shield/i,
  },
  classActionWaiver: {
    yes: [/class action waiver/i, /waive[^.]{0,60}class action/i, /not (participate|bring)[^.]{0,40}class action/i],
  },
  changesWithoutNotice: {
    // Must be about the terms themselves, not a product feature changing.
    yes: [/(change|modify|update|amend|revise)[^.]{0,40}(these terms|this agreement|the terms|this (privacy )?policy|the (privacy )?policy)[^.]{0,80}(at any time|without (prior )?notice)/i, /(these terms|this agreement|this (privacy )?policy)[^.]{0,80}(change|modify|update|amend)[^.]{0,40}(at any time|without (prior )?notice)/i],
    skip: /beta|preview/i,
    no: [/(notify|notice to) (you|users|members|customers)[^.]{0,60}(change|update|modif)/i, /we will (notify|inform) (you|users|our users|members|customers)/i],
  },
  sharesWithGovernmentWithoutWarrant: {
    no: [/(subpoena|warrant|court order|valid legal process)/i],
  },
};

const BUSINESS_PATTERNS: Record<BusinessFactKey, Pattern> = {
  perpetualContentLicense: {
    yes: [/(perpetual|irrevocable)[^.]{0,200}licen[cs]e[^.]{0,250}(your content|user content|content you|content that you)/i, /licen[cs]e[^.]{0,40}(perpetual|irrevocable)[^.]{0,250}content/i],
  },
  liabilityCapLow: {
    yes: [/(liabilit|liable)[^.]{0,400}(\$\s?(50|100|200)\b|one hundred (us )?dollars|fifty dollars|€\s?100)/i],
  },
  shortClaimDeadline: {
    yes: [/claim[^.]{0,250}within one (\(1\) )?year/i, /within one (\(1\) )?year[^.]{0,150}claim/i],
  },
  internationalTransfers: {
    yes: [/(transfer|process|store)[^.]{0,100}(outside (of )?(your|the) (country|region|eea|united states)|other countries|internationally|countries other than)/i, /standard contractual clauses|data privacy framework/i],
  },
  breachNotification: {
    yes: [/(notify|notification|inform)[^.]{0,100}(data breach|security breach|security incident|unauthori[sz]ed access)/i],
  },
  namesSubprocessors: {
    yes: [/(list|names?) of (our )?sub-?processors/i, /sub-?processors?[^.]{0,60}(list|available at|here)/i],
  },
};

function sentences(text: string) {
  return text.split(/(?<=[.!?])\s+|\n/).filter((s) => s.length > 20 && s.length < 600);
}

function findQuote(all: string[], res: RegExp[] | undefined, skip?: RegExp) {
  if (!res) return null;
  for (const s of all) if (res.some((r) => r.test(s)) && !skip?.test(s)) return s.trim();
  return null;
}

function trim(s: string, max = 280) {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

export function analyzeBasic(input: { text: string; url: string; title: string; serviceName: string; hintType?: PolicyAnalysis["documentType"] }): PolicyAnalysis {
  const all = sentences(input.text);
  const facts = {} as Record<FactKey, Fact>;
  for (const key of FACT_KEYS) {
    const p = PATTERNS[key];
    const no = findQuote(all, p.no);
    const yes = findQuote(all, p.yes, p.skip);
    let value: TriState = "unclear";
    let quote = "";
    // Explicit negations beat broad positive matches.
    if (no) [value, quote] = ["no", no];
    else if (yes) [value, quote] = ["yes", yes];
    facts[key] = { value, quote: trim(quote) };
  }

  const business = {} as Record<BusinessFactKey, Fact>;
  for (const key of BUSINESS_FACT_KEYS) {
    const quote = findQuote(all, BUSINESS_PATTERNS[key].yes);
    business[key] = quote ? { value: "yes", quote: trim(quote) } : { value: "unclear", quote: "" };
  }

  const bad = (k: FactKey) => (k === "canDeleteAccount" || k === "canExportData" ? facts[k].value === "no" : facts[k].value === "yes");
  const good = (k: FactKey) => (k === "canDeleteAccount" || k === "canExportData" ? facts[k].value === "yes" : facts[k].value === "no");
  const highlights: Highlight[] = [
    ...FACT_KEYS.filter(bad).map((k) => ({ title: FACT_LABELS[k], explanation: WHY_BAD[k], severity: "bad" as const, quote: facts[k].quote })),
    ...FACT_KEYS.filter(good).map((k) => ({ title: positiveLabel(k), explanation: WHY_GOOD[k], severity: "good" as const, quote: facts[k].quote })),
  ].slice(0, 10);

  const badCount = FACT_KEYS.filter(bad).length;
  const decided = FACT_KEYS.filter((k) => facts[k].value !== "unclear").length;
  const grades = ["A", "B", "C", "D", "E"] as const;
  // Too little evidence is "mixed", never a good grade.
  const grade = decided < 5 ? grades[Math.max(2, Math.min(4, 2 + badCount))]! : grades[Math.min(4, Math.floor(badCount / 1.5))]!;
  const docType = input.hintType ?? (/terms|conditions/i.test(input.title) ? "terms" : "privacy");

  return {
    serviceName: input.serviceName,
    documentType: docType,
    summary: `Basic keyword scan of ${input.serviceName}'s ${docType === "terms" ? "terms" : "privacy policy"}: ${badCount} concern${badCount === 1 ? "" : "s"} found. Turn on AI analysis for a full plain-language summary.`,
    grade,
    highlights,
    facts,
    business,
    // Only a sentence that names a period is useful; "we keep data as described below" is not.
    dataRetention: trim(findQuote(all, [/\b(retain|keep|store|delete)\w*\b[^.]{0,140}\b(\d+\s*(days?|weeks?|months?|years?)|as long as)/i]) ?? "Not stated", 220),
    jurisdiction: trim(findQuote(all, [/governed by the laws? of/i]) ?? "Not stated", 200),
  };
}

// What each finding means for the reader, in one line.
const WHY_BAD: Record<FactKey, string> = {
  sellsData: "Your personal data can be sold to other companies.",
  sharesWithAdvertisers: "Advertisers can receive data about you.",
  usesDataForAITraining: "What you share can be used to build AI models.",
  tracksAcrossSites: "Your activity on other sites and apps can be followed.",
  collectsPreciseLocation: "Your exact location can be collected.",
  collectsBiometrics: "Face, voice or fingerprint data can be collected.",
  canDeleteAccount: "The document doesn't give you a way to delete your account and data.",
  canExportData: "The document doesn't give you a way to get a copy of your data.",
  forcedArbitration: "Disputes go to a private arbitrator instead of a court.",
  classActionWaiver: "You can't join other users in a class action.",
  changesWithoutNotice: "The terms can change without anyone telling you.",
  sharesWithGovernmentWithoutWarrant: "Data can go to authorities without a court order.",
};
const WHY_GOOD: Record<FactKey, string> = {
  sellsData: "The document says your data is not sold.",
  sharesWithAdvertisers: "The document says advertisers don't get your data.",
  usesDataForAITraining: "The document says your content isn't used to train AI.",
  tracksAcrossSites: "The document says you're not tracked on other sites.",
  collectsPreciseLocation: "The document says exact location isn't collected.",
  collectsBiometrics: "The document says no biometric data is collected.",
  canDeleteAccount: "You have a stated way to delete your data.",
  canExportData: "You have a stated way to get a copy of your data.",
  forcedArbitration: "You keep the right to take disputes to court.",
  classActionWaiver: "You keep the right to join a class action.",
  changesWithoutNotice: "You'll be told before the terms change.",
  sharesWithGovernmentWithoutWarrant: "Authorities need a warrant, court order or subpoena.",
};

function positiveLabel(k: FactKey) {
  const map: Partial<Record<FactKey, string>> = {
    sellsData: "Does not sell your data",
    sharesWithAdvertisers: "Doesn't share with advertisers",
    usesDataForAITraining: "Doesn't train AI on your data",
    canDeleteAccount: "You can delete your data",
    canExportData: "You can download your data",
    changesWithoutNotice: "Notifies you about changes",
    sharesWithGovernmentWithoutWarrant: "Requires legal process for authorities",
    collectsPreciseLocation: "No precise location",
  };
  return map[k] ?? FACT_LABELS[k];
}

export function checkCustomRulesBasic(rules: CustomRule[]): CustomRuleCheck["results"] {
  return rules.map((r) => ({ ruleId: r.id, status: "unclear" as const, reason: "Custom rules need AI analysis to be checked.", quote: "" }));
}
