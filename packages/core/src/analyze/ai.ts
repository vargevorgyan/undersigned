import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import type { CustomRule } from "../rules";
import { ChangeSummary, CustomRuleCheck, PolicyAnalysis } from "./schema";

export const MODEL = process.env.ANALYSIS_MODEL ?? "claude-opus-5-5";
const MAX_DOC_CHARS = 600_000;

export function aiEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client: Anthropic | undefined;
function getClient() {
  client ??= new Anthropic();
  return client;
}

export class AnalysisError extends Error {}

// Server-side refusal fallback is only offered on these models.
const SUPPORTS_FALLBACK = /^claude-(opus-5|sonnet-5-5|fable-5)/.test(MODEL);

async function structured<T extends z.ZodType>(schema: T, system: string, content: string): Promise<z.infer<T>> {
  const response = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system,
    output_config: { format: betaZodOutputFormat(schema), effort: "medium" },
    messages: [{ role: "user", content }],
    ...(SUPPORTS_FALLBACK ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
  });
  if (response.stop_reason === "refusal") throw new AnalysisError("The AI declined to analyze this document.");
  if (response.stop_reason === "max_tokens") throw new AnalysisError("The analysis was cut off. Please try again.");
  if (!response.parsed_output) throw new AnalysisError("The AI returned an unreadable result.");
  return response.parsed_output as z.infer<T>;
}

const ANALYZE_SYSTEM = `You analyze privacy policies, terms of service and app-store privacy labels for ordinary people.

Rules:
- Every quote must be copied verbatim from the document (exact words, no paraphrase). Use an empty string when there is no supporting text.
- A fact is "unclear" when the document doesn't address it. Never guess.
- "canDeleteAccount" and "canExportData" are "yes" only if the document says users can do it.
- Write for a 14-year-old: short sentences, no legal jargon.
- Highlights: the 5-10 points a careful friend would warn about or praise, worst first. Include good points too.
- Grade: A = minimal collection, no selling, clear rights. B = fair with minor issues. C = mixed. D = invasive (ads profiling, broad sharing, arbitration). E = very invasive or unfair (selling data, sweeping rights over content, no deletion).

Business facts (the "business" object), same yes/no/unclear rules:
- perpetualContentLicense: "yes" if users grant a perpetual or irrevocable license to content they upload or submit (feedback-only licenses don't count).
- liabilityCapLow: "yes" if total liability is capped at a token amount (such as $100 or €100) or at fees paid; "no" if a meaningful cap or no cap is stated.
- shortClaimDeadline: "yes" if claims must be brought within one year or less.
- internationalTransfers: "yes" if data may be transferred, stored or processed in other countries.
- breachNotification: "yes" if the document commits to notify users or customers of security breaches or incidents.
- namesSubprocessors: "yes" if it names, links or lists the third-party processors or subprocessors it uses; "no" if it only describes categories.`;

export async function analyzeWithAI(input: { text: string; url: string; title: string; hintType?: string }): Promise<PolicyAnalysis> {
  if (input.text.length > MAX_DOC_CHARS) throw new AnalysisError("This document is too long to analyze.");
  const content = `URL: ${input.url}\nTitle: ${input.title}\n${input.hintType ? `Likely type: ${input.hintType}\n` : ""}\n<document>\n${input.text}\n</document>`;
  return structured(PolicyAnalysis, ANALYZE_SYSTEM, content);
}

const CHANGE_SYSTEM = `You explain changes between two versions of a privacy policy or terms document to ordinary people.
Focus on what matters to users: data collection, sharing, selling, AI training, rights, disputes. Ignore formatting and wording-only edits.
If changes are only cosmetic, set impact "neutral" and say so.`;

export async function summarizeChangeWithAI(input: {
  serviceName: string;
  added: string;
  removed: string;
  factChanges: string[];
}): Promise<ChangeSummary> {
  const content = `Service: ${input.serviceName}
Detected fact changes:
${input.factChanges.join("\n") || "(none)"}

<removed_text>
${input.removed || "(none)"}
</removed_text>

<added_text>
${input.added || "(none)"}
</added_text>`;
  return structured(ChangeSummary, CHANGE_SYSTEM, content);
}

const RULES_SYSTEM = `You check a policy document against a user's personal rules.
For each rule return pass (document clearly satisfies it), fail (document clearly breaks it) or unclear (not addressed).
Quotes must be verbatim from the document or empty. One-sentence reasons in plain language.`;

export async function checkCustomRulesWithAI(text: string, rules: CustomRule[]): Promise<CustomRuleCheck["results"]> {
  const list = rules.map((r) => `- id "${r.id}": ${r.text}`).join("\n");
  const out = await structured(CustomRuleCheck, RULES_SYSTEM, `<rules>\n${list}\n</rules>\n\n<document>\n${text.slice(0, MAX_DOC_CHARS)}\n</document>`);
  return out.results;
}
