"use client";

import { BellOff, BellRing, Check, Loader2, Share2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/client";

export function WatchButton({ slug, watching: initial, signedIn }: { slug: string; watching: boolean; signedIn: boolean }) {
  const router = useRouter();
  const [watching, setWatching] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [upgrade, setUpgrade] = useState<string | null>(null);

  async function toggle() {
    if (!signedIn) return router.push(`/signup?next=/s/${slug}&watch=${slug}`);
    setBusy(true);
    try {
      if (watching) await api(`/watchlist/${slug}`, { method: "DELETE" });
      else await api("/watchlist", { body: { slug } });
      setWatching(!watching);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) setUpgrade(err.message);
    } finally {
      setBusy(false);
    }
  }

  const Icon = watching ? BellOff : BellRing;
  return (
    <>
      <button onClick={toggle} disabled={busy} className={watching ? "btn btn-quiet" : "btn btn-primary"}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
        {watching ? "Stop watching" : "Watch for changes"}
      </button>
      {upgrade && <UpgradeDialog message={upgrade} onClose={() => setUpgrade(null)} />}
    </>
  );
}

export function UpgradeDialog({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal onClick={onClose}>
      <div className="panel w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <span className="grid size-10 place-items-center rounded-xl surface-2">
            <Sparkles className="size-5" />
          </span>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 muted hover:bg-[var(--surface-2)]">
            <X className="size-4" />
          </button>
        </div>
        <h2 className="mt-4 text-lg">You've hit the free limit</h2>
        <p className="mt-1 text-sm muted">{message}</p>
        <Link href="/pricing" className="btn btn-primary mt-5 w-full">
          See Pro, $4/month
        </Link>
      </div>
    </div>
  );
}

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    if (navigator.share) {
      await navigator.share({ url, title }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button onClick={share} className="btn btn-quiet">
      {copied ? <Check className="size-4 text-pass" /> : <Share2 className="size-4" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
