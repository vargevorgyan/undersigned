import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceView } from "@privacy-radar/core";
import { assessRisks, RISK_CATEGORIES, type Risk } from "@privacy-radar/core/risks";
import { RiskActions } from "@/components/risk-actions";
import { Quote, ServiceIcon, cx } from "@/components/ui";
import { DOC_LABELS, timeAgo } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const view = await getServiceView((await params).slug);
  return { title: view ? `${view.service.name} vendor risk report` : "Not found" };
}

const LEVEL_COLOR = { High: "var(--color-fail)", Elevated: "var(--color-fail)", Moderate: "var(--color-unclear)", Low: "var(--color-pass)" };
const SEVERITY = {
  high: { label: "High risk", className: "bg-fail text-white" },
  medium: { label: "Medium risk", className: "bg-[color-mix(in_oklab,var(--color-unclear)_22%,transparent)] text-unclear" },
  low: { label: "Low risk", className: "bg-[var(--surface-2)]" },
};

function RiskCard({ risk }: { risk: Risk }) {
  const sev = SEVERITY[risk.severity];
  const where = risk.documentType ? `Found in the ${DOC_LABELS[risk.documentType]?.toLowerCase() ?? "documents"}` : "";
  return (
    <article className="panel break-inside-avoid">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cx("rounded-md px-2 py-0.5 text-xs font-bold", sev.className)}>{sev.label}</span>
        <span className="chip !py-0.5 text-xs">{risk.category}</span>
        <span className="text-xs muted">{risk.status === "present" ? where : "Not addressed in the documents: verify with the vendor"}</span>
      </div>
      <h3 className="mt-3 text-xl font-bold">{risk.title}</h3>
      <p className="mt-1.5 max-w-[70ch] leading-relaxed">{risk.impact}</p>
      <Quote text={risk.quote} tone="bad" />
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="label">How to reduce it</p>
          <ul className="mt-2 space-y-1.5 text-[15px]">
            {risk.mitigations.map((m) => (
              <li key={m} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-pass" strokeWidth={3} aria-hidden /> {m}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label">Relevant rules and laws</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {risk.regulations.map((r) => (
              <li key={r} className="chip">{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export default async function VendorRiskPage({ params }: Props) {
  const view = await getServiceView((await params).slug);
  if (!view) notFound();
  const docs = view.documents.filter((d) => d.version);
  const report = assessRisks(docs.map((d) => ({ type: d.type, analysis: d.version!.analysis })));
  const present = report.risks.filter((r) => r.status === "present");
  const unverified = report.risks.filter((r) => r.status === "unverified");
  const count = (sev: Risk["severity"]) => present.filter((r) => r.severity === sev).length;
  const basic = docs.some((d) => d.version!.engine === "basic");
  const checked = view.documents.map((d) => d.lastCheckedAt).filter(Boolean).sort().at(-1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/teams" className="text-sm font-medium muted hover:text-[var(--text)] print:hidden">All vendors</Link>

      <header className="mt-4 flex flex-wrap items-start gap-5">
        <ServiceIcon src={view.service.iconUrl} name={view.service.name} className="size-14" />
        <div className="min-w-0 flex-1">
          <p className="label">Vendor risk report</p>
          <h1 className="text-4xl">{view.service.name}</h1>
          <p className="tabular mt-2 muted">
            {docs.length} {docs.length === 1 ? "document" : "documents"} checked {timeAgo(checked)}
          </p>
        </div>
        <div className="text-center">
          <p className="tabular text-6xl font-semibold leading-none" style={{ color: LEVEL_COLOR[report.level] }}>{report.score}</p>
          <p className="mt-1 font-bold" style={{ color: LEVEL_COLOR[report.level] }}>{report.level} risk</p>
        </div>
      </header>

      <p className="tabular mt-6 text-lg">
        <b className="text-fail">{count("high")} high</b>, <b className="text-unclear">{count("medium")} medium</b> and <b>{count("low")} low</b> risks found in the documents, plus{" "}
        <b>{unverified.length}</b> protections the documents don’t confirm.
      </p>

      <div className="mt-6 print:hidden">
        <RiskActions questions={report.questions} vendor={view.service.name} />
      </div>

      {basic && (
        <p className="mt-6 rounded-lg bg-[var(--surface-2)] p-4 text-[15px]">
          Based on a basic keyword scan because AI analysis isn’t switched on for this server. Some risks may be missed or misread; check each quote.
        </p>
      )}

      <section className="mt-10" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="text-xl">By area</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {RISK_CATEGORIES.map((cat) => {
            const inCat = report.risks.filter((r) => r.category === cat);
            const worst = inCat.find((r) => r.status === "present" && r.severity === "high") ?? inCat.find((r) => r.status === "present");
            let tone = "border-[color-mix(in_oklab,var(--color-pass)_40%,var(--border))]";
            if (worst?.severity === "high") tone = "border-fail";
            else if (worst) tone = "border-[color-mix(in_oklab,var(--color-unclear)_60%,var(--border))]";
            return (
              <li key={cat} className={cx("rounded-lg border-2 bg-[var(--surface)] p-3", tone)}>
                <p className="font-semibold">{cat}</p>
                <p className="tabular text-sm muted">{inCat.length ? `${inCat.length} ${inCat.length === 1 ? "issue" : "issues"}` : "Nothing flagged"}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12 space-y-4" aria-labelledby="found-heading">
        <h2 id="found-heading" className="text-2xl">Risks found in the documents</h2>
        {present.length === 0 && <p className="muted">No risks found in the text. Check the unconfirmed protections below.</p>}
        {present.map((r) => (
          <RiskCard key={r.id} risk={r} />
        ))}
      </section>

      {unverified.length > 0 && (
        <section className="mt-12 space-y-4" aria-labelledby="unverified-heading">
          <h2 id="unverified-heading" className="text-2xl">Protections the documents don’t confirm</h2>
          <p className="max-w-[65ch] muted">Silence isn’t proof of a problem, but for these items your team needs a written answer before relying on the vendor.</p>
          {unverified.map((r) => (
            <RiskCard key={r.id} risk={r} />
          ))}
        </section>
      )}

      {report.questions.length > 0 && (
        <section className="mt-12" aria-labelledby="questions-heading">
          <h2 id="questions-heading" className="text-2xl">Questions to ask {view.service.name}</h2>
          <p className="mt-1 muted">Generated from everything the documents leave unclear. Paste them into your security review.</p>
          <ol className="mt-5 list-decimal space-y-2.5 pl-6 text-[17px]">
            {report.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-14 border-t pt-5 text-sm muted">
        Automated analysis of public documents, not legal advice. Negotiated agreements, order forms and DPAs may override these terms.{" "}
        <Link href={`/s/${view.service.slug}`} className="underline underline-offset-2">See the full document report</Link>.
      </p>
    </div>
  );
}
