"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api, RULES_COOKIE } from "@/lib/client";

function anonRules() {
  const raw = document.cookie.split("; ").find((c) => c.startsWith(`${RULES_COOKIE}=`));
  return raw ? decodeURIComponent(raw.split("=")[1] ?? "").split(",").filter(Boolean) : undefined;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const watch = params.get("watch");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(form: FormData) {
    setBusy(true);
    setError("");
    try {
      const payload = { email: String(form.get("email")), password: String(form.get("password")), client: "web" };
      if (mode === "signup") await api("/auth/signup", { body: { ...payload, name: String(form.get("name") || "") || undefined, presetIds: anonRules() } });
      else await api("/auth/login", { body: payload });
      // Finish the action that sent the user here.
      if (watch) await api("/watchlist", { body: { slug: watch } }).catch(() => {});
      router.push(next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const otherHref = `${mode === "login" ? "/signup" : "/login"}?${params.toString()}`;
  return (
    <form action={submit} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name <span className="muted">(optional)</span></label>
          <input id="name" name="name" className="input" autoComplete="name" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" autoFocus />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required minLength={mode === "signup" ? 8 : undefined} className="input" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
        {mode === "signup" && <p className="mt-1.5 text-xs muted">At least 8 characters.</p>}
      </div>
      {error && <p className="rounded-lg bg-fail/10 p-3 text-sm text-fail" role="alert">{error}</p>}
      <button className="btn btn-primary w-full py-3" disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {mode === "signup" ? "Create free account" : "Sign in"}
      </button>
      <p className="text-center text-sm muted">
        {mode === "signup" ? "Already have an account? " : "New here? "}
        <Link href={otherHref} className="link">{mode === "signup" ? "Sign in" : "Create an account"}</Link>
      </p>
    </form>
  );
}
