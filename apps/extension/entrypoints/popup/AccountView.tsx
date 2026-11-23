import { useState, type FormEvent } from "react";
import { browser } from "wxt/browser";
import { Card, ErrorBox, GhostButton, PrimaryButton, SecondaryButton } from "@/components/ui";
import { api } from "@/lib/api";
import { useItem } from "@/lib/hooks";
import { openWeb, userItem } from "@/lib/store";

export function AccountView({ reason, onDone }: { reason?: string; onDone: () => void }) {
  const user = useItem(userItem);
  if (user === undefined) return null;
  if (!user) return <AuthForm reason={reason} onDone={onDone} />;

  return (
    <div className="content">
      <Card>
        <div className="stack">
          <div className="section-title">Signed in as</div>
          <div className="title truncate">{user.email}</div>
          <div>
            <span className={user.plan === "pro" ? "pill pill-good" : "pill"}>{user.plan === "pro" ? "Pro" : "Free plan"}</span>
          </div>
        </div>
      </Card>
      {user.plan === "free" && (
        <Card>
          <div className="stack">
            <div style={{ fontWeight: 650 }}>Go Pro</div>
            <p className="small muted">Unlimited watched services and custom rules, daily checks and instant alerts.</p>
            <PrimaryButton onClick={() => openWeb("/pricing")}>Upgrade</PrimaryButton>
          </div>
        </Card>
      )}
      <SecondaryButton block onClick={() => browser.runtime.openOptionsPage()}>
        Manage rules & settings
      </SecondaryButton>
      <SecondaryButton block onClick={() => openWeb("/dashboard")}>
        Open dashboard
      </SecondaryButton>
      <GhostButton
        block
        onClick={async () => {
          await api.logout();
          onDone();
        }}
      >
        Sign out
      </GhostButton>
    </div>
  );
}

function AuthForm({ reason, onDone }: { reason?: string; onDone: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.auth(mode, email, password);
      void browser.runtime.sendMessage({ type: "refresh" }).catch(() => {});
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="content" onSubmit={submit}>
      {reason && <div className="notice">{reason}</div>}
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "tab tab-on" : "tab"} onClick={() => setMode("signup")}>
          Create account
        </button>
        <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "tab tab-on" : "tab"} onClick={() => setMode("login")}>
          Sign in
        </button>
      </div>
      <label className="label">
        Email
        <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
      </label>
      <label className="label">
        Password
        <input
          className="input"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={mode === "signup" ? 8 : undefined}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && <ErrorBox>{error}</ErrorBox>}
      <PrimaryButton block type="submit" disabled={busy}>
        {busy && "Please wait…"}
        {!busy && mode === "signup" && "Create free account"}
        {!busy && mode === "login" && "Sign in"}
      </PrimaryButton>
      <p className="small muted center">Free: watch 3 services and get alerts when their policies change.</p>
    </form>
  );
}
