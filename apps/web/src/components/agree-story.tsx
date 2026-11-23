"use client";

import { Check, RotateCcw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cx } from "./ui";

/**
 * A signup nobody reads: the cursor skims the terms, ticks "I agree", signs up.
 * Then the consequences arrive, each lighting up the sentence that allowed it.
 * The app and its terms are a composite illustration of clauses common in real policies.
 */

type Seg = string | { clause: number; text: string };

const TERMS: Seg[] = [
  "1. Acceptance. By creating an account you agree to these Terms and our Privacy Policy, which describe how we collect, use and share information about you. ",
  "2. Your account. You are responsible for activity under your account and for keeping your password confidential. ",
  "3. Information we collect. We collect information you provide, information about your device, and information about how you use the Service, including through cookies and similar technologies. ",
  { clause: 0, text: "We share information with advertising partners so they can show you more relevant ads across other sites and apps. " },
  "4. Your content. You keep ownership of content you post. ",
  { clause: 1, text: "You grant us a worldwide, royalty-free license to use, copy and modify your content, including to develop and train our machine learning models. " },
  "5. Service changes. We may add or remove features at any time. ",
  { clause: 2, text: "We may update these Terms from time to time, and your continued use of the Service means you accept the changes. " },
  "6. Disclaimers. The Service is provided “as is” without warranties of any kind. 7. Limitation of liability. To the extent permitted by law, our total liability is limited to the amount you paid us in the last twelve months. ",
  { clause: 3, text: "8. Disputes. Any dispute will be resolved by binding individual arbitration, and you waive your right to participate in a class action. " },
  "9. Governing law. These Terms are governed by the laws of the State of Delaware. 10. Contact. Questions about these Terms can be sent to our legal team.",
];

const AFTERMATH = [
  { when: "A week later", title: "The ads start following you", body: "The shoes you looked at once now appear on every site you visit." },
  { when: "Two months later", title: "Your photos help train their AI", body: "Pictures you posted are used to build a model. You were never asked again." },
  { when: "Eight months later", title: "The rules change overnight", body: "New terms take effect. You were never told; you kept using the app." },
  { when: "A year later", title: "A breach, and you can’t sue", body: "Your data leaks. Other users go to court; you already gave up that right." },
];

// step: 0 idle · 1 to terms · 2 skimming · 3 to checkbox · 4 checked · 5 to button · 6 signed up · 7 rewind · 8-11 aftermath · 12 done
const SCHEDULE = [0, 200, 1000, 1900, 2700, 3100, 3900, 4600, 5300, 6500, 7700, 8900, 10100];
const FINAL = SCHEDULE.length - 1;
const TONES = ["var(--mark-bad)", "var(--mark-caution)", "var(--mark-caution)", "var(--mark-bad)"];

export function AgreeStory() {
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [skim, setSkim] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const termsBox = useRef<HTMLDivElement>(null);
  const termsText = useRef<HTMLDivElement>(null);
  const checkbox = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLSpanElement>(null);
  const clauses = useRef<(HTMLSpanElement | null)[]>([]);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setStep(0);
    timers.current = SCHEDULE.map((at, i) => setTimeout(() => setStep(i), at));
  }, []);

  // Play once, when the story scrolls into view; reduced motion shows the outcome directly.
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    if (prefersReduced) return setStep(FINAL);
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        play();
        io.disconnect();
      }
    }, { threshold: 0.3 });
    if (root.current) io.observe(root.current);
    return () => {
      io.disconnect();
      timers.current.forEach(clearTimeout);
    };
  }, [play]);

  // Cursor targets are measured, so the choreography holds at any width.
  useLayoutEffect(() => {
    const s = stage.current?.getBoundingClientRect();
    if (!s) return;
    const centre = (el: HTMLElement | null, dx = 0, dy = 0) => {
      const r = el?.getBoundingClientRect();
      return r ? { x: r.left - s.left + r.width / 2 + dx, y: r.top - s.top + r.height / 2 + dy } : { x: 0, y: 0 };
    };
    if (step <= 0) setCursor({ x: s.width - 24, y: s.height + 10 });
    else if (step <= 2) setCursor(centre(termsBox.current, 60, 10));
    else if (step <= 4) setCursor(centre(checkbox.current, 2, 2));
    else if (step <= 7) setCursor(centre(button.current, 30, 4));
    if (termsBox.current && termsText.current) setSkim(termsText.current.scrollHeight - termsBox.current.clientHeight);
  }, [step]);

  const checked = step >= 4;
  const signedUp = step >= 6;
  const skimming = step === 2 || step === 3 || step === 4 || step === 5 || step === 6;
  const revealed = (i: number) => step >= 8 + i;
  const clicking = step === 4 || step === 6;
  // During the aftermath the box scrolls to the sentence behind each consequence.
  const active = step >= 8 ? Math.min(step - 8, AFTERMATH.length - 1) : -1;
  const clauseTop = active >= 0 ? (clauses.current[active]?.offsetTop ?? 0) - 24 : 0;
  let offset = 0;
  if (skimming) offset = skim;
  else if (active >= 0) offset = Math.max(0, Math.min(skim, clauseTop));

  return (
    <div ref={root} className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
      {/* The signup */}
      <div ref={stage} className="relative">
        <div className="rounded-xl border bg-[var(--surface)] p-6 [box-shadow:var(--shadow)] sm:p-7">
          <p className="font-serif text-2xl">Create your account</p>
          <div className="mt-4 rounded-lg border bg-[var(--bg)] px-3.5 py-2.5 text-[15px]">alex@example.com</div>
          <div className="mt-2 rounded-lg border bg-[var(--bg)] px-3.5 py-2.5 text-[15px] tracking-[0.3em]">••••••••••</div>

          <div className="relative mt-9">
            <div ref={termsBox} className="h-40 overflow-hidden rounded-lg border bg-[var(--bg)] px-3.5 py-3">
              <div
                ref={termsText}
                className="relative font-serif text-[12.5px] leading-[1.55] muted"
                style={{
                  transform: `translateY(${-offset}px)`,
                  transition: skimming ? "transform 700ms cubic-bezier(0.55, 0, 1, 0.45)" : "transform 600ms var(--ease-out-strong)",
                }}
              >
                <p className="mb-1 font-sans text-[12px] font-semibold text-[var(--text)]">Terms of Service and Privacy Policy</p>
                {TERMS.map((seg, i) =>
                  typeof seg === "string" ? (
                    <span key={i}>{seg}</span>
                  ) : (
                    <span key={i} ref={(el) => { clauses.current[seg.clause] = el; }} className={cx("sweep transition-colors duration-500", revealed(seg.clause) && "text-[var(--text)]")} data-on={revealed(seg.clause)} style={{ "--sweep": TONES[seg.clause] } as React.CSSProperties}>
                      <sup className={cx("tabular mr-0.5 font-sans text-[10px] font-semibold transition-opacity duration-300", revealed(seg.clause) ? "opacity-100" : "opacity-0")}>{seg.clause + 1}</sup>
                      {seg.text}
                    </span>
                  ),
                )}
              </div>
            </div>
            <span
              className={cx(
                "data absolute -top-7 right-0 rounded-md border bg-[var(--surface)] px-2 py-0.5 transition-[opacity,transform] duration-300",
                step >= 3 ? "opacity-100" : "translate-y-1 opacity-0",
              )}
            >
              Time spent reading: 0.7 s
            </span>
          </div>

          <div className="mt-4 flex items-start gap-2.5 text-[14px]">
            <span
              ref={checkbox}
              className={cx(
                "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[4px] border-[1.5px] transition-[background-color,border-color,transform] duration-150",
                checked ? "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]" : "border-[var(--muted)] bg-[var(--surface)]",
                step === 4 && "scale-90",
              )}
              aria-hidden
            >
              {checked && <Check className="size-3.5" strokeWidth={3} />}
            </span>
            <span>
              I have read and agree to the <u className="underline-offset-2">Terms of Service</u> and <u className="underline-offset-2">Privacy Policy</u>
            </span>
          </div>

          <span
            ref={button}
            className={cx(
              "mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-semibold transition-[background-color,color,transform,opacity] duration-200",
              checked ? "bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--surface-2)] text-[var(--muted)]",
              step === 6 && "scale-[0.98]",
            )}
            aria-hidden
          >
            {signedUp ? <><Check className="size-4" strokeWidth={2.5} /> Account created</> : "Create account"}
          </span>
        </div>

        {/* The cursor: moves in-out, presses on click, gone once the damage starts */}
        {!reduced && (
          <div
            className="pointer-events-none absolute left-0 top-0 z-10"
            style={{
              transform: `translate(${cursor.x}px, ${cursor.y}px)`,
              transition: "transform 750ms cubic-bezier(0.65, 0, 0.35, 1), opacity 300ms",
              opacity: step >= 1 && step < 7 ? 1 : 0,
            }}
            aria-hidden
          >
            <span className={cx("absolute -left-3 -top-3 size-6 rounded-full border-2 border-[var(--text)] opacity-0", clicking && "animate-[click-ring_420ms_ease-out]")} />
            <svg width="22" height="22" viewBox="0 0 24 24" className={cx("transition-transform duration-100", clicking && "scale-90")}>
              <path d="M5 3l14 7.5-6.2 1.6L10 18.5z" fill="var(--text)" stroke="var(--bg)" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* The aftermath */}
      <div className="flex flex-col">
        <ol className="relative space-y-3 border-l pl-6" aria-label="What that click agreed to">
          {AFTERMATH.map((a, i) => (
            <li
              key={a.title}
              className="relative transition-[opacity,transform] duration-500"
              style={{ opacity: revealed(i) ? 1 : 0.18, transform: revealed(i) ? "none" : "translateY(6px)", transitionTimingFunction: "var(--ease-out-strong)" }}
            >
              <span
                className="absolute -left-[31px] top-4 grid size-[13px] place-items-center rounded-full ring-4 ring-[var(--bg)] transition-colors duration-300"
                style={{ background: revealed(i) ? (TONES[i] === "var(--mark-bad)" ? "var(--color-fail)" : "var(--color-unclear)") : "var(--border)" }}
              />
              <div className="rounded-lg border bg-[var(--surface)] p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="data muted">{a.when}</p>
                  <p className="tabular text-[12px] font-semibold muted">Clause {i + 1}</p>
                </div>
                <p className="mt-1 flex items-center gap-2 font-semibold">
                  <TriangleAlert className={cx("size-4 shrink-0", TONES[i] === "var(--mark-bad)" ? "text-fail" : "text-unclear")} aria-hidden />
                  {a.title}
                </p>
                <p className="mt-0.5 text-[14.5px] muted">{a.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={cx("mt-6 transition-[opacity,transform] duration-500", step >= FINAL ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0")}>
          <p className="font-serif text-2xl leading-snug">All four were in the text above the checkbox. Undersigned flags them before you click.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary press" onClick={() => document.getElementById("analyze-url")?.focus()}>
              Check a site before you sign up
            </button>
            {!reduced && (
              <button type="button" className="btn btn-quiet press" onClick={play}>
                <RotateCcw className="size-4" aria-hidden /> Replay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
