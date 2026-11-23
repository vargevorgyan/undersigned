"use client";

import { BellRing, CheckCheck, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { timeAgo } from "@/lib/format";
import { cx, SectionTitle } from "./ui";

type Alert = { id: string; slug: string; serviceName: string; title: string; body: string; impact: "better" | "worse" | "neutral"; brokenRules: string[]; read: boolean; createdAt: string };

const IMPACT = { worse: "var(--color-fail)", better: "var(--color-pass)", neutral: "var(--muted)" };

export function AlertsFeed({ initial }: { initial: Alert[] }) {
  const router = useRouter();
  const [alerts, setAlerts] = useState(initial);
  const unread = alerts.filter((a) => !a.read).length;

  async function markAll() {
    setAlerts((list) => list.map((a) => ({ ...a, read: true })));
    await api("/alerts/read", { body: {} });
    router.refresh();
  }

  return (
    <>
      <SectionTitle
        hint={
          unread > 0 && (
            <button onClick={markAll} className="inline-flex items-center gap-1.5 font-medium hover:text-[var(--text)]">
              <CheckCheck className="size-4" aria-hidden /> Mark all as read
            </button>
          )
        }
      >
        Alerts
      </SectionTitle>
      {alerts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <BellRing className="mx-auto size-7 muted" aria-hidden />
          <p className="mt-3 font-semibold">No alerts</p>
          <p className="mt-1 muted">When a watched policy changes in a way that matters, it shows up here and in your inbox.</p>
        </div>
      ) : (
        <ul className="border-t">
          {alerts.map((a) => (
            <li key={a.id} className="border-b">
              <Link
                href={`/s/${a.slug}`}
                onClick={() => !a.read && api("/alerts/read", { body: { ids: [a.id] } })}
                className={cx("-mx-2 flex gap-3 rounded-lg px-2 py-4 transition-colors hover:bg-[var(--surface-2)]", a.read && "opacity-65")}
              >
                <span className="mt-2 size-2.5 shrink-0 rounded-full" style={{ background: a.read ? "transparent" : IMPACT[a.impact], border: `2px solid ${IMPACT[a.impact]}` }} aria-label={a.read ? undefined : "Unread"} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{a.title}</span>
                  <span className="mt-0.5 block muted">{a.body}</span>
                  {a.brokenRules.length > 0 && (
                    <span className="mt-2 flex flex-col gap-1">
                      {a.brokenRules.map((r) => (
                        <span key={r} className="flex items-center gap-1.5 text-sm font-semibold text-fail">
                          <X className="size-3.5" strokeWidth={3} aria-hidden /> Now breaks: {r}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="mt-2 block text-sm muted">{timeAgo(a.createdAt)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
