import { Eye, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserRules } from "@privacy-radar/core";
import { getDb } from "@privacy-radar/core/db";
import { AlertsFeed } from "@/components/alerts-feed";
import { AnalyzeBox } from "@/components/analyze-box";
import { GradeBadge, SectionTitle, ServiceIcon } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { getAlerts, getWatchlist, limitsFor } from "@/lib/data";
import { KIND_LABELS, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

const IMPACT_COLOR = { worse: "var(--color-fail)", better: "var(--color-pass)", neutral: "var(--muted)" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ upgraded?: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard");
  const [watch, alertData, rules] = await Promise.all([getWatchlist(user.id), getAlerts(user.id), getDb().then((db) => getUserRules(db, user.id))]);
  const limits = limitsFor(user);
  const { upgraded } = await searchParams;
  const ruleCount = rules.presetIds.length + rules.customRules.length;
  const watchingLine = user.plan === "free" ? `${watch.length} of ${limits.watchlist} services watched` : `${watch.length} services watched`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {upgraded && (
        <p className="mb-8 flex items-center gap-3 rounded-lg border bg-[var(--surface)] p-4 font-medium">
          <PartyPopper className="size-5" aria-hidden /> You're on Pro. Unlimited watching, unlimited rules and daily checks are on.
        </p>
      )}

      <h1 className="text-4xl">Hi{user.name ? `, ${user.name}` : ""}</h1>
      <p className="tabular mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[17px] muted">
        <a href="#watchlist" className="hover:text-[var(--text)]">{watchingLine}</a>
        <a href="#alerts" className="hover:text-[var(--text)]">{alertData.unread} unread {alertData.unread === 1 ? "alert" : "alerts"}</a>
        <Link href="/rules" className="hover:text-[var(--text)]">{ruleCount} rules</Link>
        <span>{user.plan === "pro" ? "Pro plan" : "Free plan"}</span>
      </p>

      <div className="mt-8 max-w-2xl">
        <AnalyzeBox compact />
      </div>

      <div className="mt-14 grid gap-14 lg:grid-cols-[3fr_2fr]">
        <section id="watchlist" aria-labelledby="watch-heading">
          <SectionTitle hint={user.plan === "free" ? "Checked weekly" : "Checked daily"}>
            <span id="watch-heading">Watchlist</span>
          </SectionTitle>
          {watch.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <Eye className="mx-auto size-7 muted" aria-hidden />
              <p className="mt-3 font-semibold">Nothing watched yet</p>
              <p className="mt-1 muted">Check a service above, then choose “Watch for changes” on its report.</p>
            </div>
          ) : (
            <ul className="border-t">
              {watch.map((w) => (
                <li key={w.slug} className="border-b">
                  <Link href={`/s/${w.slug}`} className="-mx-2 flex items-center gap-4 rounded-lg px-2 py-4 transition-colors hover:bg-[var(--surface-2)]">
                    <ServiceIcon src={w.iconUrl} name={w.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{w.name}</span>
                      {w.lastChange ? (
                        <span className="block truncate text-[15px]" style={{ color: IMPACT_COLOR[w.lastChange.impact] }}>
                          {w.lastChange.headline}, {timeAgo(w.lastChange.at)}
                        </span>
                      ) : (
                        <span className="block truncate text-[15px] muted">
                          {KIND_LABELS[w.kind]}, no changes, checked {timeAgo(w.lastCheckedAt)}
                        </span>
                      )}
                    </span>
                    <GradeBadge grade={w.grade} className="size-9 text-lg" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {user.plan === "free" && (
            <p className="mt-5 muted">
              Want to watch more? <Link href="/pricing" className="link">Pro is $4 a month</Link> for unlimited services, unlimited rules and daily checks.
            </p>
          )}
        </section>

        <section id="alerts" aria-label="Alerts">
          <AlertsFeed initial={alertData.alerts.map((a) => ({ ...a, createdAt: String(a.createdAt) }))} />
        </section>
      </div>
    </div>
  );
}
