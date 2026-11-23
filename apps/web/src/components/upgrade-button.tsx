"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";

export function UpgradeButton({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function go() {
    if (!signedIn) return router.push("/signup?next=/pricing");
    setBusy(true);
    try {
      const { url } = await api<{ url: string }>("/billing/checkout", { body: {} });
      window.location.href = url;
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      <button onClick={go} className="btn btn-primary w-full" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Upgrade to Pro
      </button>
      {error && <p className="mt-2 text-sm text-fail">{error}</p>}
    </>
  );
}
