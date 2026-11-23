import type { PolicyAnalysis, Severity } from "@privacy-radar/core/schema";
import { DOC_LABELS } from "@/lib/format";
import { Quote } from "./ui";

type Doc = { type: string; analysis: PolicyAnalysis };

const GROUPS: { severity: Severity; title: string; color: string }[] = [
  { severity: "bad", title: "Against you", color: "var(--color-fail)" },
  { severity: "caution", title: "Worth knowing", color: "var(--color-unclear)" },
  { severity: "neutral", title: "Also in there", color: "var(--muted)" },
  { severity: "good", title: "In your favor", color: "var(--color-pass)" },
];

/** All documents' findings in one list, grouped by who they favor; each names the document it came from. */
export function ReportFindings({ documents, showSummaries }: { documents: Doc[]; showSummaries: boolean }) {
  const seen = new Set<string>();
  const items = documents.flatMap((d) =>
    d.analysis.highlights.flatMap((h) => {
      if (seen.has(h.title)) return [];
      seen.add(h.title);
      return [{ ...h, source: DOC_LABELS[d.type] ?? "Document" }];
    }),
  );

  return (
    <section id="findings" aria-labelledby="findings-heading" className="scroll-mt-24">
      <h2 id="findings-heading" className="text-3xl">What the documents say</h2>

      {showSummaries && (
        <div className="mt-5 space-y-4">
          {documents.map((d) => (
            <div key={d.type}>
              <p className="data muted">{DOC_LABELS[d.type]}</p>
              <p className="mt-1 max-w-[65ch] text-[17px] leading-relaxed">{d.analysis.summary}</p>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && <p className="mt-4 muted">Nothing stood out in these documents.</p>}

      <div className="mt-8 space-y-10">
        {GROUPS.map((g) => {
          const group = items.filter((h) => h.severity === g.severity);
          if (group.length === 0) return null;
          return (
            <div key={g.severity}>
              <h3 className="flex items-baseline gap-2 text-[15px] font-semibold" style={{ color: g.color }}>
                {g.title} <span className="tabular font-normal muted">{group.length}</span>
              </h3>
              <ul className="mt-2 divide-y border-y">
                {group.map((h) => (
                  <li key={h.title} className="py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="text-[17px] font-semibold">{h.title}</p>
                      <p className="data muted">{h.source}</p>
                    </div>
                    {h.explanation && <p className="mt-0.5 max-w-[65ch] muted">{h.explanation}</p>}
                    <Quote text={h.quote} tone={h.severity} className="max-w-[70ch]" />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
