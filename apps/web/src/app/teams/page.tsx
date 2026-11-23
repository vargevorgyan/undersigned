import type { Metadata } from "next";
import { getServiceView } from "@privacy-radar/core";
import { evaluatePresetRules, mergeResults } from "@privacy-radar/core/rules";
import { assessRisks } from "@privacy-radar/core/risks";
import { TeamsMatrix, type VendorRow } from "@/components/teams-matrix";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "For teams: vendor terms monitoring",
  description: "Set company rules once. See which vendors break them, with the exact clause, and get told when their terms change.",
};
export const dynamic = "force-dynamic";

const VENDORS = ["zoom-com", "slack-com", "notion-com", "dropbox-com", "github-com", "linkedin-com", "discord-com", "shopify-com"];

/** Company-policy wording for the consumer preset rules (same facts underneath). */
const COMPANY_RULES = [
  { id: "no-ai-training", label: "No AI training on our data" },
  { id: "no-selling", label: "Never sells data" },
  { id: "no-ads-sharing", label: "No sharing with advertisers" },
  { id: "can-delete", label: "We can delete our data" },
  { id: "can-export", label: "We can export our data" },
  { id: "notify-changes", label: "Notice before terms change" },
  { id: "no-arbitration", label: "No forced arbitration" },
  { id: "warrant-only", label: "Court order for government requests" },
];

export default async function TeamsPage() {
  const ids = COMPANY_RULES.map((r) => r.id);
  const views = await Promise.all(VENDORS.map((slug) => getServiceView(slug).catch(() => null)));
  const rows: VendorRow[] = views.flatMap((view) => {
    if (!view) return [];
    const docs = view.documents.filter((d) => d.version);
    if (docs.length === 0) return [];
    const merged = mergeResults(docs.map((d) => evaluatePresetRules(d.version!.analysis, ids)));
    const cells = Object.fromEntries(merged.map((r) => [r.ruleId, { status: r.status, quote: r.quote }]));
    const report = assessRisks(docs.map((d) => ({ type: d.type, analysis: d.version!.analysis })));
    return [{ slug: view.service.slug, name: view.service.name, iconUrl: view.service.iconUrl, grade: view.service.grade, docs: docs.length, cells, risk: { score: report.score, level: report.level, high: report.risks.filter((r) => r.severity === "high" && r.status === "present").length } }];
  });
  const basic = views.some((v) => v?.documents.some((d) => d.version?.engine === "basic"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="chip">Team demo with live data</p>
      <h1 className="mt-4 max-w-3xl text-4xl sm:text-5xl">Every vendor’s fine print, checked against your company’s rules</h1>
      <p className="mt-4 max-w-2xl text-lg muted">
        Your team signs up for dozens of tools. Each one has terms that can change any day. Set your policy once, see who breaks it, with the exact clause, and hear about it when they change.
      </p>

      {basic && (
        <p className="mt-8 rounded-lg bg-[var(--surface-2)] p-4 text-[15px]">
          This demo server runs a basic keyword scan because AI analysis isn’t switched on, so some cells can be wrong. With AI analysis every verdict is read in context and backed by a verified quote.
        </p>
      )}
      <div className="mt-10">
        <TeamsMatrix rows={rows} rules={COMPANY_RULES} />
      </div>

      <section className="mt-20 grid gap-10 border-t pt-12 lg:grid-cols-2" aria-labelledby="pilot-heading">
        <div>
          <h2 id="pilot-heading" className="text-3xl">Join the team pilot</h2>
          <p className="mt-3 max-w-md text-lg muted">We’re onboarding a few privacy, legal and security teams. Bring your vendor list and we’ll set it up with you.</p>
          <ul className="mt-6 space-y-2 text-[17px]">
            <li>Finds privacy policies, terms, data processing agreements and subprocessor lists from a vendor’s domain</li>
            <li>Alerts in Slack or email with what changed and which rule it breaks</li>
            <li>Version history and an audit trail for security reviews</li>
          </ul>
        </div>
        <div className="self-center">
          <p className="mb-3 font-semibold">Work email</p>
          <WaitlistForm source="teams" />
        </div>
      </section>
    </div>
  );
}
