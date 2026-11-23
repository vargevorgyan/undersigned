import { ArrowUpRight, CircleAlert, Info } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DEFAULT_RULE_IDS, getServiceView, getUserRules, type ServiceView } from "@privacy-radar/core";
import { getDb } from "@privacy-radar/core/db";
import { VerdictPanel } from "@/components/verdict-panel";
import { FACT_KEYS, FACT_LABELS } from "@privacy-radar/core/schema";
import { ReportFindings } from "@/components/report-findings";
import { ShareButton, WatchButton } from "@/components/service-actions";
import { GradeBadge, Quote, SectionTitle, ServiceIcon, cx } from "@/components/ui";
import { appUrl } from "@/lib/api";
import { currentUser } from "@/lib/auth";
import { DOC_LABELS, gradeLabel, GRADE_COLORS, KIND_LABELS, timeAgo } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const view = await getServiceView((await params).slug);
  if (!view) return { title: "Not found" };
  const { service } = view;
  const summary = view.documents.find((d) => d.version)?.version?.analysis.summary ?? "";
  return {
    title: `Is ${service.name} safe? Privacy policy and terms, explained`,
    description: `${service.name} gets grade ${service.grade ?? "?"} (${gradeLabel(service.grade)}). ${summary}`.slice(0, 300),
    alternates: { canonical: `/s/${service.slug}` },
  };
}

function KeyFacts({ view }: { view: ServiceView }) {
  const analyses = view.documents.flatMap((d) => (d.version ? [d.version.analysis] : []));
  if (analyses.length === 0) return null;
  // The most decisive answer across documents wins for each fact.
  const rows = FACT_KEYS.map((k) => {
    const all = analyses.map((a) => a.facts[k]);
    const decided = all.find((f) => f.value !== "unclear") ?? all.find((f) => f.quote);
    return { key: k, label: FACT_LABELS[k], fact: decided ?? { value: "unclear" as const, quote: "" } };
  });
  const valueText = { yes: "Yes", no: "No", unclear: "Not stated" };
  // A quoted "unclear" means the document is ambiguous, not silent.
  const label = (f: { value: "yes" | "no" | "unclear"; quote: string }) => (f.value === "unclear" && f.quote ? "Unclear" : valueText[f.value]);
  return (
    <section id="facts" aria-labelledby="facts-heading" className="scroll-mt-24">
      <SectionTitle hint="Across all documents">
        <span id="facts-heading">All key facts</span>
      </SectionTitle>
      <dl className="grid border-t sm:grid-cols-2 sm:gap-x-10">
        {rows.map((r) => (
          <div key={r.key} className="border-b py-3">
            <div className="flex items-baseline justify-between gap-4">
              <dt>{r.label}</dt>
              <dd className={cx("shrink-0 font-semibold", r.fact.value === "unclear" && "muted font-normal")}>{label(r.fact)}</dd>
            </div>
            {r.fact.quote && (
              <details className="mt-1">
                <summary className="cursor-pointer text-sm muted hover:text-[var(--text)]">Show the sentence</summary>
                <Quote text={r.fact.quote} />
              </details>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}

function History({ view }: { view: ServiceView }) {
  const impactColor = { worse: "var(--color-fail)", better: "var(--color-pass)", neutral: "var(--muted)" };
  return (
    <section id="history" aria-labelledby="history-heading" className="scroll-mt-24">
      <SectionTitle>
        <span id="history-heading">Change history</span>
      </SectionTitle>
      {view.history.length === 0 ? (
        <p className="muted">No changes since we started tracking. Watch this service to hear about the next one.</p>
      ) : (
        <ol className="space-y-6 border-l-2 pl-6">
          {view.history.map((h) => {
            const doc = view.documents.find((d) => d.id === h.documentId);
            return (
              <li key={h.id} className="relative">
                <span className="absolute -left-[31px] top-1.5 size-3 rounded-full ring-4 ring-[var(--bg)]" style={{ background: impactColor[h.change!.impact] }} />
                <p className="text-sm muted">
                  <time dateTime={new Date(h.fetchedAt).toISOString()}>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(h.fetchedAt))}</time>, {DOC_LABELS[doc?.type ?? "other"]?.toLowerCase()}
                </p>
                <p className="mt-1 font-semibold">{h.change!.headline}</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 muted">
                  {h.change!.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const user = await currentUser();
  const anonRules = (await cookies()).get("pr_rules")?.value;
  const anonPresetIds = anonRules ? decodeURIComponent(anonRules).split(",").filter(Boolean) : undefined;
  const view = await getServiceView(slug, { userId: user?.id, presetIds: anonPresetIds });
  if (!view) notFound();
  const userRules = user ? await getUserRules(await getDb(), user.id) : { presetIds: anonPresetIds ?? DEFAULT_RULE_IDS, customRules: [] };
  const { service } = view;
  const docs = view.documents.filter((d) => d.version);
  const failing = view.documents.filter((d) => !d.version && d.lastError);
  const basic = docs.some((d) => d.version!.engine === "basic");
  const lastChecked = view.documents.map((d) => d.lastCheckedAt).filter(Boolean).sort().at(-1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@type": service.kind === "website" ? "WebSite" : "SoftwareApplication", name: service.name, url: service.domain ? `https://${service.domain}` : undefined },
    reviewRating: { "@type": "Rating", ratingValue: service.grade ? 5 - "ABCDE".indexOf(service.grade) : undefined, bestRating: 5, worstRating: 1 },
    author: { "@type": "Organization", name: "Undersigned" },
    reviewBody: docs[0]?.version?.analysis.summary,
  };

  const glance = [
    ["How long they keep your data", docs.map((d) => d.version!.analysis.dataRetention).find((v) => v && v !== "Not stated") ?? "Not stated"],
    ["Governing law", docs.map((d) => d.version!.analysis.jurisdiction).find((v) => v && v !== "Not stated") ?? "Not stated"],
  ];
  const sections = [
    ["verdict", "Your verdict"],
    ["findings", "What the documents say"],
    ["facts", "All key facts"],
    ["history", "Change history"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="flex flex-wrap items-start gap-x-5 gap-y-6 border-b pb-8">
        <ServiceIcon src={service.iconUrl} name={service.name} className="size-14 sm:size-16" />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl sm:text-5xl">{service.name}</h1>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 muted">
            <span>{KIND_LABELS[service.kind]}</span>
            {service.domain && <span translate="no">{service.domain}</span>}
            <span>Checked {timeAgo(lastChecked)}</span>
            {view.watchers > 0 && <span className="tabular">{view.watchers} watching</span>}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <WatchButton slug={service.slug} watching={view.isWatching} signedIn={Boolean(user)} />
            <ShareButton url={`${appUrl()}/s/${service.slug}`} title={`${service.name} privacy report`} />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1.5">
          <GradeBadge grade={service.grade} className="size-16 text-4xl sm:size-20 sm:text-5xl" />
          <div className="sm:text-center">
            <p className="text-sm font-semibold" style={{ color: service.grade ? GRADE_COLORS[service.grade] : undefined }}>{gradeLabel(service.grade)}</p>
            {docs.length > 1 && <p className="text-[13px] muted">Its worst document</p>}
          </div>
        </div>
      </header>

      {basic && (
        <p className="mt-6 flex items-start gap-3 rounded-lg bg-[var(--surface-2)] px-4 py-3 text-[14.5px]">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          Basic keyword scan: AI analysis isn't switched on for this server, so there are no plain-language summaries and more facts show as not stated.
        </p>
      )}
      {failing.map((d) => (
        <p key={d.id} className="mt-3 flex items-start gap-3 rounded-lg border border-fail/40 p-4 text-[15px]">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-fail" aria-hidden />
          <span>
            We couldn't read the {DOC_LABELS[d.type]?.toLowerCase()}: {d.lastError}{" "}
            <a href={d.url} target="_blank" rel="noreferrer" className="link">Open the original</a>
          </span>
        </p>
      ))}

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
        <div className="min-w-0 space-y-16">
          <div id="verdict" className="scroll-mt-24">
            <VerdictPanel
              analyses={docs.map((d) => d.version!.analysis)}
              initialPresetIds={userRules.presetIds}
              customResults={view.verdict.results.filter((r) => r.custom)}
              customRules={userRules.customRules}
              signedIn={Boolean(user)}
            />
          </div>
          {docs.length > 0 && <ReportFindings documents={docs.map((d) => ({ type: d.type, analysis: d.version!.analysis }))} showSummaries={!basic} />}
          <KeyFacts view={view} />
          <History view={view} />
          <p className="border-t pt-5 text-sm muted">AI-generated summary, not legal advice. Every finding quotes the original; check it before you rely on it.</p>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start" aria-label="Report details">
          <nav aria-label="On this page" className="hidden lg:block">
            <p className="label">On this page</p>
            <ul className="mt-2 space-y-1 border-l">
              {sections.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-[14.5px] muted transition-colors hover:border-[var(--text)] hover:text-[var(--text)]">{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="label">Documents</p>
            <ul className="mt-2 divide-y border-y">
              {view.documents.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <GradeBadge grade={d.version?.analysis.grade} className="size-7 text-sm" />
                  <div className="min-w-0 flex-1">
                    <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium hover:underline">
                      {DOC_LABELS[d.type]} <ArrowUpRight className="size-3.5 muted" aria-hidden />
                    </a>
                    <p className="text-[13px] muted">
                      {d.version ? `${Math.max(1, Math.round(d.version.wordCount / 230))} min read, ${d.version.wordCount.toLocaleString()} words` : "Couldn't be read"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {docs.length > 0 && (
            <dl className="space-y-4">
              {glance.map(([label, value]) => (
                <div key={label}>
                  <dt className="label">{label}</dt>
                  <dd className={cx("mt-1 text-[14.5px] leading-snug", value === "Not stated" && "muted")}>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </aside>
      </div>
    </div>
  );
}
