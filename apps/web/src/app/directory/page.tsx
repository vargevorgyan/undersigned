import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { listServices } from "@privacy-radar/core";
import { GradeBadge, ServiceIcon, cx } from "@/components/ui";
import { gradeLabel, KIND_LABELS } from "@/lib/format";

export const metadata: Metadata = {
  title: "Privacy grades for apps and websites",
  description: "Plain-language privacy and terms reports for popular websites, Android and iPhone apps.",
};

export default async function Directory({ searchParams }: { searchParams: Promise<{ q?: string; grade?: string }> }) {
  const { q, grade } = await searchParams;
  const all = await listServices({ query: q, limit: 500 });
  const services = grade ? all.filter((s) => s.grade === grade) : all;
  const filterHref = (g?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (g) params.set("grade", g);
    const qs = params.toString();
    return `/directory${qs ? `?${qs}` : ""}`;
  };
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-4xl">Directory</h1>
      <p className="mt-2 text-[17px] muted">Every service anyone has checked. Missing one? Paste its link on the home page.</p>

      <form className="mt-8 flex flex-wrap items-center gap-3" action="/directory">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Search services</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 muted" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Search by name or domain…" className="input pl-10" autoComplete="off" spellCheck={false} />
          {grade && <input type="hidden" name="grade" value={grade} />}
        </label>
        <nav className="flex gap-1" aria-label="Filter by grade">
          <Link href={filterHref()} aria-current={!grade ? "page" : undefined} className={cx("btn px-3 py-2", !grade ? "btn-ink" : "btn-quiet")}>All</Link>
          {["A", "B", "C", "D", "E"].map((g) => (
            <Link key={g} href={filterHref(g)} aria-current={grade === g ? "page" : undefined} className={cx("btn w-10 px-0 py-2", grade === g ? "btn-ink" : "btn-quiet")} aria-label={`Grade ${g}`}>
              {g}
            </Link>
          ))}
        </nav>
      </form>

      {services.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-8 text-center">
          <p className="font-semibold">No services match</p>
          <p className="mt-1 muted"><Link href="/" className="link">Check a new service</Link> and it will appear here for everyone.</p>
        </div>
      ) : (
        <>
          <p className="tabular mt-8 text-sm muted">{services.length} services</p>
          <ul className="mt-2 border-t">
            {services.map((s) => (
              <li key={s.slug} className="border-b">
                <Link href={`/s/${s.slug}`} className="-mx-2 flex items-center gap-4 rounded-lg px-2 py-3.5 transition-colors hover:bg-[var(--surface-2)]">
                  <ServiceIcon src={s.iconUrl} name={s.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{s.name}</span>
                    <span className="block truncate text-[15px] muted">
                      {KIND_LABELS[s.kind]}
                      {s.domain && <span translate="no">, {s.domain}</span>}
                    </span>
                  </span>
                  <span className="hidden text-[15px] font-medium sm:block">{gradeLabel(s.grade)}</span>
                  <GradeBadge grade={s.grade} className="size-9 text-lg" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
