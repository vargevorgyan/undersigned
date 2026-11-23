"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { PolicyAnalysis } from "@privacy-radar/core/schema";
import { evaluatePresetRules, mergeResults, PRESET_RULES, toVerdict, type CustomRule, type RuleResult } from "@privacy-radar/core/rules";
import { api, saveAnonRules } from "@/lib/client";
import { verdictHeadline } from "@/lib/format";
import { cx, Quote, StatusIcon } from "./ui";

type Props = {
  analyses: PolicyAnalysis[];
  initialPresetIds: string[];
  customResults: RuleResult[];
  customRules: CustomRule[];
  signedIn: boolean;
};

const COLOR = { violation: "var(--color-fail)", warning: "var(--color-unclear)", ok: "var(--color-pass)", none: "var(--text)" };

/** Verdict recomputed in the browser as rules are toggled; preset rules are pure functions of the analysis. */
export function VerdictPanel({ analyses, initialPresetIds, customResults, customRules, signedIn }: Props) {
  const [presetIds, setPresetIds] = useState(initialPresetIds);
  const [editing, setEditing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verdict = useMemo(
    () => toVerdict(mergeResults([...analyses.map((a) => evaluatePresetRules(a, presetIds)), customResults])),
    [analyses, presetIds, customResults],
  );

  function toggle(id: string) {
    const next = presetIds.includes(id) ? presetIds.filter((x) => x !== id) : [...presetIds, id];
    setPresetIds(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    // Debounced so rapid toggling saves once.
    saveTimer.current = setTimeout(() => {
      if (signedIn) api("/rules", { method: "PUT", body: { presetIds: next, customRules } }).catch(() => {});
      else saveAnonRules(next);
    }, 600);
  }

  return (
    <section aria-labelledby="verdict-heading">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h2 id="verdict-heading" className="text-3xl transition-colors duration-300 sm:text-4xl" style={{ color: COLOR[verdict.status] }} aria-live="polite">
          {verdictHeadline(verdict)}
        </h2>
        <button type="button" onClick={() => setEditing(!editing)} aria-expanded={editing} className="link text-[15px]">
          {editing ? "Done" : "Change my rules"}
        </button>
      </div>

      <div className="reveal" data-on={editing} inert={!editing}>
        <div>
          <div className="flex flex-wrap gap-2 pt-5" role="group" aria-label="Your rules">
            {PRESET_RULES.map((r) => {
              const pressed = presetIds.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => toggle(r.id)}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-95",
                    pressed ? "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--surface)] hover:border-[var(--text)]",
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm muted">
            Saved automatically.{" "}
            {signedIn ? (
              <Link href="/rules" className="underline underline-offset-2">Add rules in your own words</Link>
            ) : (
              <Link href="/signup" className="underline underline-offset-2">Sign up to add rules in your own words</Link>
            )}
          </p>
        </div>
      </div>

      <ul className="mt-5 border-t">
        {verdict.results.map((r) => (
          <li key={r.ruleId} className="pop-in border-b">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5">
                <StatusIcon status={r.status} />
                <span className="flex-1 text-[17px] font-medium">{r.label}</span>
                {r.custom && <span className="chip">Your words</span>}
                <span className="text-sm muted group-open:hidden">Why</span>
              </summary>
              <div className="pb-4 pl-8">
                <p className="muted">{r.reason}</p>
                <Quote text={r.quote} tone={r.status} />
              </div>
            </details>
          </li>
        ))}
      </ul>
      {verdict.results.length === 0 && <p className="py-4 muted">Turn on a few rules above to get your personal verdict.</p>}
      {!signedIn && (
        <p className="mt-4 muted">
          <Link href="/signup" className="link">Create a free account</Link> to keep your rules everywhere and hear when this policy changes.
        </p>
      )}
    </section>
  );
}
