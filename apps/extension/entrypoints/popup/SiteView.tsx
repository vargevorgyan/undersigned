import { useCallback, useEffect, useRef, useState } from "react";
import { browser } from "wxt/browser";
import { Card, ErrorBox, GhostButton, GradeBadge, HighlightRow, PrimaryButton, RuleRow, SearchIcon, SecondaryButton, Spinner, VerdictLine } from "@/components/ui";
import { analyzeStream, api, ApiError } from "@/lib/api";
import { GRADES, hostOf, isStorePage, lookupHost, slugForHost } from "@/lib/grades";
import { catalogItem, openWeb } from "@/lib/store";
import type { Highlight, ServiceView, Stage } from "@/lib/types";

type State =
  | { kind: "loading" }
  | { kind: "no-site" }
  | { kind: "unknown"; host: string; store: boolean }
  | { kind: "analyzing"; host: string; stage: Stage; message: string }
  | { kind: "known"; view: ServiceView }
  | { kind: "error"; message: string; host: string | null };

const STEPS: { stage: Exclude<Stage, "done">; label: string }[] = [
  { stage: "fetching", label: "Opening site" },
  { stage: "finding", label: "Finding policies" },
  { stage: "reading", label: "Reading" },
  { stage: "analyzing", label: "Analyzing with AI" },
  { stage: "saving", label: "Saving" },
];

const SEVERITY_ORDER: Record<Highlight["severity"], number> = { bad: 0, caution: 1, good: 2, neutral: 3 };

async function activeTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/** Runs in the page (activeTab): collects candidate policy links only, nothing else. */
function collectPolicyLinks() {
  return [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
    .map((a) => ({ href: a.href, text: (a.textContent ?? "").trim().slice(0, 80) }))
    .filter((l) => /^https?:/.test(l.href) && /privacy|terms|conditions|legal/i.test(`${l.href} ${l.text}`))
    .slice(0, 50);
}

async function pickTarget(tabId: number, pageUrl: string): Promise<string> {
  if (isStorePage(pageUrl)) return pageUrl;
  try {
    const [res] = await browser.scripting.executeScript({ target: { tabId }, func: collectPolicyLinks });
    const links = (res?.result ?? []) as { href: string; text: string }[];
    const host = hostOf(pageUrl) ?? "";
    const site = host.split(".").slice(-2).join(".");
    const scored = links
      .map((l) => {
        const sameSite = hostOf(l.href)?.endsWith(site) ? 2 : 0;
        const text = /privacy/i.test(l.text) ? 3 : 0;
        const href = /privacy/i.test(new URL(l.href).pathname) ? 1 : 0;
        return { href: l.href.split("#")[0]!, score: sameSite + text + href, privacy: text + href > 0 };
      })
      .filter((l) => l.privacy)
      .sort((a, b) => b.score - a.score);
    return scored[0]?.href ?? pageUrl;
  } catch {
    // Restricted pages (store, PDFs): let the server discover policies.
    return pageUrl;
  }
}

export function SiteView({ onNeedAccount }: { onNeedAccount: (reason: string) => void }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [progress, setProgress] = useState(0);
  const tabRef = useRef<{ id?: number; url?: string }>({});

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    const tab = await activeTab();
    tabRef.current = { id: tab?.id, url: tab?.url };
    const host = hostOf(tab?.url);
    if (!host) return setState({ kind: "no-site" });
    const store = isStorePage(tab?.url);
    if (store) return setState({ kind: "unknown", host, store });

    const catalog = await catalogItem.getValue();
    const slug = (catalog && lookupHost(host, catalog.services)?.slug) ?? slugForHost(host);
    try {
      setState({ kind: "known", view: await api.service(slug) });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return setState({ kind: "unknown", host, store });
      setState({ kind: "error", message: (err as Error).message, host });
    }
  }, []);

  useEffect(() => void load(), [load]);

  async function analyze(host: string) {
    const { id, url } = tabRef.current;
    if (id === undefined || !url) return;
    setProgress(0.04);
    setState({ kind: "analyzing", host, stage: "fetching", message: "Starting…" });
    try {
      const target = await pickTarget(id, url);
      const slug = await analyzeStream(target, (stage, message) => {
        const idx = STEPS.findIndex((s) => s.stage === stage);
        if (idx >= 0) setProgress((p) => Math.max(p, (idx + 0.4) / STEPS.length));
        setState((s) => (s.kind === "analyzing" ? { ...s, stage, message } : s));
      });
      setProgress(1);
      void browser.runtime.sendMessage({ type: "refresh" }).catch(() => {});
      setState({ kind: "known", view: await api.service(slug) });
    } catch (err) {
      setState({ kind: "error", message: (err as Error).message, host });
    }
  }

  // AI analysis can take a while: creep the bar so it never looks stuck.
  useEffect(() => {
    if (state.kind !== "analyzing") return;
    const t = setInterval(() => setProgress((p) => Math.min(0.92, p + 0.006)), 400);
    return () => clearInterval(t);
  }, [state.kind]);

  if (state.kind === "loading") {
    return (
      <div className="loading">
        <Spinner />
      </div>
    );
  }

  if (state.kind === "no-site") {
    return (
      <div className="content">
        <div className="empty">
          <div className="empty-icon">
            <SearchIcon />
          </div>
          <div className="title">Open a website</div>
          <p className="muted">Visit any site or app store page and open Undersigned to see how it treats your data.</p>
        </div>
      </div>
    );
  }

  if (state.kind === "unknown") {
    return (
      <div className="content">
        <div className="empty">
          <div className="empty-icon">
            <SearchIcon />
          </div>
          <div className="title">{state.store ? "Check this app" : "Not analyzed yet"}</div>
          <p className="muted">
            {state.store ? "We'll read this app's privacy policy and store privacy label." : `${state.host} hasn't been checked yet. We'll read its privacy policy and terms for you.`}
          </p>
          <PrimaryButton block onClick={() => analyze(state.host)}>
            {state.store ? "Analyze this app" : "Analyze this site"}
          </PrimaryButton>
          <p className="small muted">Takes about 30 seconds. Only the policy link is sent.</p>
        </div>
      </div>
    );
  }

  if (state.kind === "analyzing") {
    const current = STEPS.findIndex((s) => s.stage === state.stage);
    return (
      <div className="content">
        <Card>
          <div className="stack" style={{ gap: 14 }}>
            <div>
              <div className="title">Analyzing {state.host}</div>
              <div className="small muted truncate">{state.message}</div>
            </div>
            <div className="progress" aria-hidden>
              <div style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div className="steps">
              {STEPS.map((s, i) => {
                let cls = "step";
                if (i < current) cls += " step-done";
                if (i === current) cls += " step-active";
                return (
                  <div key={s.stage} className={cls}>
                    <span className="step-mark">{i < current ? "✓" : ""}</span>
                    {s.label}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
        <p className="small muted center">You can close this popup — the result will be saved.</p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="content">
        <ErrorBox>{state.message}</ErrorBox>
        <PrimaryButton block onClick={() => (state.host ? analyze(state.host) : load())}>
          Try again
        </PrimaryButton>
        <GhostButton block onClick={() => browser.runtime.openOptionsPage()}>
          Check settings
        </GhostButton>
      </div>
    );
  }

  return <KnownSite view={state.view} onNeedAccount={onNeedAccount} onChanged={(view) => setState({ kind: "known", view })} />;
}

function KnownSite({ view, onNeedAccount, onChanged }: { view: ServiceView; onNeedAccount: (reason: string) => void; onChanged: (v: ServiceView) => void }) {
  const [busy, setBusy] = useState(false);
  const [upgrade, setUpgrade] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { service, verdict } = view;
  const grade = service.grade;
  const versions = view.documents.flatMap((d) => (d.version ? [d.version] : []));
  const highlights = versions
    .flatMap((v) => v.analysis.highlights)
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, 3);
  const basic = versions.some((v) => v.engine === "basic");
  const summary = versions[0]?.analysis.summary;

  async function toggleWatch() {
    setBusy(true);
    setError(null);
    setUpgrade(null);
    try {
      if (view.isWatching) await api.unwatch(service.slug);
      else await api.watch(service.slug);
      onChanged({ ...view, isWatching: !view.isWatching });
    } catch (err) {
      const e = err as ApiError;
      if (e.status === 401) onNeedAccount("Sign in to get an alert when this policy changes.");
      else if (e.status === 402) setUpgrade(e.message);
      else setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="content">
      <Card>
        <div className="row">
          {grade && <GradeBadge grade={grade} />}
          <div className="grow">
            <div className="title truncate">{service.name}</div>
            {grade && <div style={{ fontWeight: 600, color: GRADES[grade].color }}>{GRADES[grade].label}</div>}
            <div className="small muted truncate">{service.domain ?? service.kind}</div>
          </div>
        </div>
        {summary && (
          <p className="small muted" style={{ marginTop: 10 }}>
            {summary}
          </p>
        )}
      </Card>

      <VerdictLine verdict={verdict} onClick={verdict.status === "none" ? () => browser.runtime.openOptionsPage() : undefined} />

      {verdict.results.length > 0 && (
        <Card>
          <div className="row" style={{ marginBottom: 6 }}>
            <div className="section-title grow">Your rules</div>
            <GhostButton onClick={() => browser.runtime.openOptionsPage()}>Edit</GhostButton>
          </div>
          {verdict.results.slice(0, 5).map((r) => (
            <RuleRow key={r.ruleId} r={r} />
          ))}
        </Card>
      )}

      {highlights.length > 0 && (
        <Card>
          <div className="section-title" style={{ marginBottom: 10 }}>
            Key points
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {highlights.map((h, i) => (
              <HighlightRow key={i} h={h} />
            ))}
          </div>
        </Card>
      )}

      {basic && <div className="notice">Basic keyword scan. Full AI analysis isn't enabled on this server.</div>}
      {error && <ErrorBox>{error}</ErrorBox>}
      {upgrade && (
        <div className="notice stack">
          <span>{upgrade}</span>
          <PrimaryButton onClick={() => openWeb("/pricing")}>Upgrade to Pro</PrimaryButton>
        </div>
      )}

      <div className="row">
        <SecondaryButton className="grow" onClick={() => openWeb(`/s/${service.slug}`)}>
          Full report
        </SecondaryButton>
        {view.isWatching ? (
          <SecondaryButton className="grow" onClick={toggleWatch} disabled={busy} title="Click to stop watching">
            ✓ Watching
          </SecondaryButton>
        ) : (
          <PrimaryButton className="grow" onClick={toggleWatch} disabled={busy}>
            Watch for changes
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
