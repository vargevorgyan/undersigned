"use client";

import { Check, CircleHelp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { saveAnonRules } from "@/lib/client";
import { cx } from "./ui";

type Status = "pass" | "fail" | "unclear";

/** Verbatim sentences from Spotify's privacy policy and terms, each tied to the rule it decides. */
const CLAUSES: { rule: string; label: string; status: Status; source: string; before: string; mark: string; after: string; note: string }[] = [
  {
    rule: "no-ads-sharing",
    label: "No sharing with advertisers",
    status: "fail",
    source: "Privacy Policy",
    before: "So Spotify and our ",
    mark: "advertising partners can deliver more relevant advertising to you",
    after: " on the Spotify Service and online…",
    note: "Breaks your rule",
  },
  {
    rule: "no-ai-training",
    label: "Don’t train AI on my content",
    status: "fail",
    source: "Privacy Policy",
    before: "This includes ",
    mark: "development and training of algorithmic and machine learning models",
    after: ", which help us to keep our service safe…",
    note: "Breaks your rule: usage and voice data are listed for model training",
  },
  {
    rule: "can-delete",
    label: "I can delete my data",
    status: "pass",
    source: "Privacy Policy",
    before: "There are several ways you can ",
    mark: "delete personal data from Spotify",
    after: ":",
    note: "Meets your rule",
  },
  {
    rule: "can-export",
    label: "I can download my data",
    status: "pass",
    source: "Privacy Policy",
    before: "use the ",
    mark: "‘Download your data’ tool",
    after: " on your Account Privacy page…",
    note: "Meets your rule",
  },
  {
    rule: "warrant-only",
    label: "Police need a court order",
    status: "pass",
    source: "Privacy Policy",
    before: "to respond to a ",
    mark: "valid legal process (such as a search warrant, court order, or subpoena)",
    after: "",
    note: "Meets your rule",
  },
  {
    rule: "no-arbitration",
    label: "Keep my right to go to court",
    status: "fail",
    source: "Terms of Use",
    before: "",
    mark: "Any arbitration between you and Spotify will be administered by National Arbitration and Mediation",
    after: "…",
    note: "Breaks your rule: disputes go to private arbitration",
  },
];

const DEFAULTS = ["no-ads-sharing", "no-ai-training", "can-delete"];
const MARK: Record<Status, string> = { fail: "var(--mark-bad)", unclear: "var(--mark-caution)", pass: "var(--mark-good)" };
const ICON = { fail: X, unclear: CircleHelp, pass: Check };
const TONE: Record<Status, string> = { fail: "text-fail", unclear: "text-unclear", pass: "text-pass" };

/** The hero's proof: a working report on Spotify's real documents, driven by the visitor's rules. */
export function PolicyReport() {
  const [on, setOn] = useState<string[]>([]);
  const touched = useRef(false);

  // One authored moment: the default rules switch on in turn, unless the visitor acts first.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setOn(DEFAULTS);
    const timers = DEFAULTS.map((id, i) => setTimeout(() => !touched.current && setOn((cur) => [...cur, id]), 900 + i * 700));
    return () => timers.forEach(clearTimeout);
  }, []);

  function toggle(id: string) {
    touched.current = true;
    setOn((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  const active = CLAUSES.filter((c) => on.includes(c.rule));
  const failed = active.filter((c) => c.status === "fail").length;
  const unclear = active.filter((c) => c.status === "unclear").length;
  let headline = "Choose the rules you care about";
  let color = "var(--text)";
  if (active.length && failed) [headline, color] = [`Spotify breaks ${failed} of your ${active.length} rules`, "var(--color-fail)"];
  else if (active.length && unclear) [headline, color] = [`No broken rules, ${unclear} unclear`, "var(--color-unclear)"];
  else if (active.length) [headline, color] = [`Spotify meets all ${active.length} of your rules`, "var(--color-pass)"];

  return (
    <div className="overflow-hidden rounded-xl border bg-[var(--surface)] [box-shadow:var(--shadow)]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-5 py-3">
        <p className="font-semibold">Spotify</p>
        <p className="text-sm muted">Privacy Policy and Terms of Use</p>
        <p className="data muted ml-auto hidden sm:block">spotify.com/legal</p>
      </div>

      <div className="grid md:grid-cols-[17rem_1fr]">
        <div className="border-b p-4 md:border-b-0 md:border-r">
          <p className="label px-1">Your rules</p>
          <ul className="mt-2 space-y-0.5" role="group" aria-label="Your rules">
            {CLAUSES.map((c) => {
              const pressed = on.includes(c.rule);
              const Icon = ICON[c.status];
              return (
                <li key={c.rule}>
                  <button
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => toggle(c.rule)}
                    className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-2 text-left text-[14.5px] transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <span
                      className={cx(
                        "grid size-4 shrink-0 place-items-center rounded-[4px] border transition-colors",
                        pressed && "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]",
                      )}
                    >
                      {pressed && <Check className="size-3" strokeWidth={3} aria-hidden />}
                    </span>
                    <span className="flex-1">{c.label}</span>
                    <Icon className={cx("size-4 transition-opacity duration-300", TONE[c.status], !pressed && "opacity-0")} strokeWidth={2.5} aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => {
              saveAnonRules(on.length ? on : DEFAULTS);
              document.getElementById("analyze-url")?.focus();
            }}
            className="btn btn-quiet mt-4 w-full text-sm"
          >
            Use these rules on any app
          </button>
        </div>

        <div className="p-5 sm:p-7">
          <p className="font-serif text-[26px] leading-tight transition-colors duration-300 sm:text-[30px]" style={{ color }} aria-live="polite">
            {headline}
          </p>
          <ul className="mt-5 divide-y">
            {CLAUSES.map((c) => {
              const isOn = on.includes(c.rule);
              const Icon = ICON[c.status];
              return (
                <li key={c.rule} className={cx("py-3.5 transition-opacity duration-300", !isOn && active.length > 0 && "opacity-40")}>
                  <p className="data muted">{c.source}</p>
                  <p className="mt-1 font-serif text-[17px] leading-relaxed">
                    {c.before}
                    <span className="sweep" data-on={isOn} style={{ "--sweep": MARK[c.status] } as React.CSSProperties}>
                      {c.mark}
                    </span>
                    {c.after}
                  </p>
                  <div className="reveal" data-on={isOn} inert={!isOn}>
                    <p className={cx("flex items-center gap-1.5 pt-1.5 text-sm font-medium", TONE[c.status])}>
                      <Icon className="size-4" strokeWidth={2.5} aria-hidden /> {c.note}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
