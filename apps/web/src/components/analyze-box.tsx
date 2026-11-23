"use client";

import { Check, Loader2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { analyzeStream } from "@/lib/client";
import { cx } from "./ui";

const STEPS = [
  { stage: "fetching", label: "Opening the page" },
  { stage: "finding", label: "Finding the policies" },
  { stage: "reading", label: "Reading the fine print" },
  { stage: "analyzing", label: "Analyzing with AI" },
  { stage: "saving", label: "Checking your rules" },
] as const;

const EXAMPLES = [
  { label: "tiktok.com", url: "tiktok.com" },
  { label: "WhatsApp on Android", url: "https://play.google.com/store/apps/details?id=com.whatsapp" },
  { label: "duckduckgo.com", url: "duckduckgo.com" },
  { label: "Instagram on iPhone", url: "https://apps.apple.com/us/app/instagram/id389801252" },
];

type State = { status: "idle" } | { status: "running"; stage: string; message: string } | { status: "error"; error: string };

export function AnalyzeBox({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const running = state.status === "running";

  async function run(target: string) {
    if (running) return;
    if (!target.trim()) return document.getElementById("analyze-url")?.focus();
    setUrl(target);
    setState({ status: "running", stage: "fetching", message: "Starting…" });
    try {
      for await (const ev of analyzeStream(target)) {
        if (ev.type === "progress") setState({ status: "running", stage: ev.stage, message: ev.message });
        if (ev.type === "error") return setState({ status: "error", error: ev.error });
        if (ev.type === "done") {
          setState({ status: "running", stage: "done", message: "Opening the report…" });
          return router.push(`/s/${ev.slug}`);
        }
      }
    } catch {
      setState({ status: "error", error: "The connection dropped. Check your internet and try again." });
    }
  }

  const currentIdx = running ? STEPS.findIndex((s) => s.stage === state.stage) : -1;
  const doneAll = running && state.stage === "done";

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(url);
        }}
        className="flex gap-2 rounded-xl border bg-[var(--surface)] p-1.5 transition-shadow focus-within:border-[var(--text)] focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--text)_12%,transparent)]"
      >
        <label htmlFor="analyze-url" className="sr-only">Website, app store or policy link</label>
        <input
          id="analyze-url"
          name="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="spotify.com or an app store link…"
          className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-[var(--muted)]"
          autoComplete="off"
          spellCheck={false}
          inputMode="url"
          disabled={running}
        />
        <button type="submit" className="btn btn-primary shrink-0 px-5" disabled={running}>
          {running && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {running ? "Checking…" : "Check it"}
        </button>
      </form>

      {state.status === "idle" && !compact && (
        <p className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2 text-[15px]">
          <span className="mr-1 muted">Try</span>
          {EXAMPLES.map((ex) => (
            <button key={ex.url} type="button" onClick={() => run(ex.url)} className="chip transition-colors hover:bg-[var(--border)]">
              {ex.label}
            </button>
          ))}
        </p>
      )}

      {running && (
        <div className="panel mt-3 !py-4" role="status" aria-live="polite">
          <ol className="space-y-2">
            {STEPS.map((step, i) => {
              const done = doneAll || i < currentIdx;
              const active = !doneAll && i === currentIdx;
              return (
                <li key={step.stage} className={cx("flex items-center gap-3 text-[15px] transition-opacity duration-300", !done && !active && "opacity-40")}>
                  <span className="grid size-5 place-items-center">
                    {done && <Check className="size-4 text-pass" strokeWidth={3} aria-hidden />}
                    {active && <Loader2 className="size-4 animate-spin" aria-hidden />}
                    {!done && !active && <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={cx(active && "font-semibold")}>
                    {active ? <span className="font-medium">{state.message}</span> : step.label}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-sm muted">The first check of a service takes 10 to 40 seconds. After that it's instant for everyone.</p>
        </div>
      )}

      {state.status === "error" && (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-fail/40 bg-fail/5 p-4 text-[15px]" role="alert">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-fail" aria-hidden />
          <div className="flex-1">
            <p className="font-medium">{state.error}</p>
            <button type="button" className="link mt-1" onClick={() => run(url)}>Try again</button>
          </div>
        </div>
      )}
    </div>
  );
}
