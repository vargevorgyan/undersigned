import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { gradeLabel } from "@/lib/format";
import { GradeBadge, ServiceIcon } from "./ui";

type Item = { slug: string; name: string; grade: string | null; iconUrl: string | null };

/** Real graded services as a still, scannable index; each opens its report. */
export function RecentReports({ items }: { items: Item[] }) {
  if (items.length < 4) return null;
  return (
    <section aria-labelledby="recent-heading" className="border-y bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="recent-heading" className="font-sans text-[15px] font-semibold tracking-normal">Recently graded</h2>
          <Link href="/directory" className="inline-flex items-center gap-1 text-[15px] font-medium muted hover:text-[var(--text)]">
            Browse all <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg border bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 8).map((s) => (
            <li key={s.slug} className="bg-[var(--surface)]">
              <Link href={`/s/${s.slug}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)]">
                <ServiceIcon src={s.iconUrl} name={s.name} className="size-8 rounded-md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{s.name}</span>
                  <span className="block text-[13px] muted">{gradeLabel(s.grade)}</span>
                </span>
                <GradeBadge grade={s.grade} className="size-7 text-sm" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
