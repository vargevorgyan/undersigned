"use client";

import { Download, Loader2, LogOut, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";

type Props = {
  user: { email: string; name: string | null; plan: "free" | "pro"; emailAlerts: boolean; createdAt: string };
  limits: { watchlist: number; customRules: number; checkIntervalHours: number };
};

export function SettingsPanel({ user, limits }: Props) {
  const router = useRouter();
  const [emailAlerts, setEmailAlerts] = useState(user.emailAlerts);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState("");

  async function billing(action: "checkout" | "portal") {
    setBusy(action);
    const { url } = await api<{ url: string }>(`/billing/${action}`, { body: {} });
    window.location.href = url;
  }

  async function toggleAlerts() {
    const next = !emailAlerts;
    setEmailAlerts(next);
    await api("/me", { method: "PATCH", body: { emailAlerts: next } });
  }

  async function signOut() {
    setBusy("logout");
    await api("/auth/logout", { body: {} });
    router.push("/");
    router.refresh();
  }

  async function deleteAccount() {
    setBusy("delete");
    await api("/me", { method: "DELETE" });
    router.push("/?deleted=1");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="panel">
        <h2 className="">Account</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="muted">Email</dt><dd>{user.email}</dd></div>
          {user.name && <div className="flex justify-between"><dt className="muted">Name</dt><dd>{user.name}</dd></div>}
          <div className="flex justify-between"><dt className="muted">Member since</dt><dd>{new Date(user.createdAt).toLocaleDateString()}</dd></div>
        </dl>
      </section>

      <section className="panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="">Plan: <span className="">{user.plan}</span></h2>
            <p className="mt-1 text-sm muted">
              {limits.watchlist >= 500 ? "Unlimited" : limits.watchlist} watched services, {limits.customRules} custom rules, checks every {limits.checkIntervalHours >= 168 ? "week" : "day"}
            </p>
          </div>
          {user.plan === "free" ? (
            <button onClick={() => billing("checkout")} className="btn btn-primary shrink-0" disabled={busy !== null}>
              {busy === "checkout" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Upgrade
            </button>
          ) : (
            <button onClick={() => billing("portal")} className="btn btn-quiet shrink-0" disabled={busy !== null}>
              {busy === "portal" && <Loader2 className="size-4 animate-spin" />} Manage billing
            </button>
          )}
        </div>
      </section>

      <section className="panel">
        <h2 className="">Notifications</h2>
        <label className="mt-4 flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block font-medium">Email me when a watched policy changes</span>
            <span className="block text-sm muted">Only meaningful changes. Cosmetic edits are skipped.</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={emailAlerts}
            onClick={toggleAlerts}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${emailAlerts ? "bg-[var(--text)]" : "bg-[var(--border)]"}`}
          >
            <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${emailAlerts ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </label>
        <p className="mt-4 text-sm muted">
          Get push alerts on your phone with the <Link href="/download#mobile" className="link">mobile app</Link>, and badge alerts with the <Link href="/download" className="link">extension</Link>.
        </p>
      </section>

      <section className="panel">
        <h2 className="">Your data</h2>
        <p className="mt-1 text-sm muted">We practice what we preach: download everything we store about you, or delete it all.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/api/v1/me/export" className="btn btn-quiet"><Download className="size-4" /> Download my data</a>
          <button onClick={signOut} className="btn btn-quiet" disabled={busy !== null}><LogOut className="size-4" /> Sign out</button>
        </div>
        <details className="mt-6 rounded-xl border border-fail/30 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-fail">Delete account</summary>
          <p className="mt-2 text-sm muted">This permanently deletes your account, rules, watchlist and alerts. Type <strong>delete</strong> to confirm.</p>
          <div className="mt-3 flex gap-2">
            <input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} className="input py-2" aria-label="Type delete to confirm" />
            <button onClick={deleteAccount} className="btn btn-danger shrink-0" disabled={confirmDelete !== "delete" || busy !== null}>
              <Trash2 className="size-4" /> Delete forever
            </button>
          </div>
        </details>
      </section>
    </div>
  );
}
