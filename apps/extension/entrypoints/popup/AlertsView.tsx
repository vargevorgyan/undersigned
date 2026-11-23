import { useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { ErrorBox, GhostButton, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { openWeb, unreadItem } from "@/lib/store";
import type { Alert } from "@/lib/types";

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

const IMPACT_PILL: Record<Alert["impact"], { cls: string; text: string }> = {
  worse: { cls: "pill pill-bad", text: "Worse" },
  better: { cls: "pill pill-good", text: "Better" },
  neutral: { cls: "pill", text: "Changed" },
};

export function AlertsView() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .alerts()
      .then((r) => {
        setAlerts(r.alerts);
        void unreadItem.setValue(r.unread);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  async function markAll() {
    setAlerts((a) => a?.map((x) => ({ ...x, read: true })) ?? null);
    await unreadItem.setValue(0);
    await api.markRead().catch(() => {});
    void browser.runtime.sendMessage({ type: "refresh" }).catch(() => {});
  }

  async function open(a: Alert) {
    if (!a.read) void api.markRead([a.id]).catch(() => {});
    await openWeb(`/s/${a.slug}?alert=${a.id}`);
  }

  if (error) {
    return (
      <div className="content">
        <ErrorBox>{error}</ErrorBox>
      </div>
    );
  }
  if (!alerts) {
    return (
      <div className="loading">
        <Spinner />
      </div>
    );
  }
  if (alerts.length === 0) {
    return (
      <div className="content">
        <div className="empty">
          <div className="title">No alerts yet</div>
          <p className="muted">Watch a site and we'll tell you the moment its privacy policy or terms change.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content" style={{ gap: 6 }}>
      {alerts.some((a) => !a.read) && (
        <div className="row">
          <div className="grow" />
          <GhostButton onClick={markAll}>Mark all as read</GhostButton>
        </div>
      )}
      {alerts.map((a) => (
        <button key={a.id} className={a.read ? "alert-item" : "alert-item alert-unread"} onClick={() => open(a)}>
          <div className="grow stack" style={{ gap: 3 }}>
            <div className="row" style={{ gap: 6 }}>
              <span className={IMPACT_PILL[a.impact].cls}>{IMPACT_PILL[a.impact].text}</span>
              <span className="small muted">{timeAgo(a.createdAt)}</span>
            </div>
            <div style={{ fontWeight: a.read ? 500 : 700 }}>{a.title}</div>
            <div className="small muted">{a.body}</div>
            {a.brokenRules.length > 0 && <div className="small" style={{ color: "var(--bad)" }}>Breaks: {a.brokenRules.join(", ")}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}
