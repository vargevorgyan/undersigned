"use client";

import { GRADE_INFO } from "@privacy-radar/core/rules";
import { ArrowRight, Building2, Check, CircleHelp, Globe, Puzzle, Smartphone } from "lucide-react";
import Link from "next/link";
import { AnalyzeBox } from "../analyze-box";
import { AgreeStory } from "../agree-story";
import { st, useCount, useInView } from "../deck/motion";
import { Scene3D } from "../deck/scene-3d";
import { PolicyReport } from "../policy-report";
import { cx, GradeBadge } from "../ui";

type BandProps = {
  dark?: boolean;
  className?: string;
  label: string;
  threshold?: number;
  children: (seen: boolean, near: boolean) => React.ReactNode;
};

/** A full-bleed section whose `.st` children play the deck's entrance once it scrolls into view. */
function Band({ dark, className, label, threshold, children }: BandProps) {
  const { ref, seen, near } = useInView<HTMLElement>(threshold);
  return (
    <section ref={ref} aria-label={label} data-active={seen} className={cx("reveal-group relative overflow-hidden", dark && "deck-dark bg-[var(--bg)]", className)}>
      {children(seen, near)}
    </section>
  );
}

const wrap = "mx-auto w-full max-w-6xl px-4 sm:px-6";
const h2 = "font-serif text-[2.6rem] leading-[1] tracking-[-0.02em] sm:text-6xl lg:text-[5rem]";

export function HeroBand() {
  return (
    <Band dark label="Introduction" threshold={0.1}>
      {(_, near) => (
        <div className={cx(wrap, "grid items-center gap-6 py-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.1fr_1fr] lg:py-0")}>
          <div>
            <h1 className="st font-serif text-[3.4rem] leading-[0.95] tracking-[-0.03em] sm:text-[5rem] lg:text-[6.25rem]" style={st(0)}>
              Know what<br />you sign.
            </h1>
            <p className="st mt-7 max-w-[34rem] text-lg leading-relaxed opacity-70 sm:text-xl" style={st(2)}>
              Paste any website, Play Store or App Store link. In seconds, get a plain-language verdict on its privacy policy and terms, checked against your own rules, and an alert when they change.
            </p>
            <div className="st mt-8 max-w-xl" style={st(3)}>
              <AnalyzeBox />
            </div>
          </div>
          <div className="st relative order-first -mb-2 h-[200px] sm:h-[400px] lg:order-none lg:mb-0 lg:h-[640px]" style={st(1)}>
            {near && <Scene3D kind="nib" className="absolute inset-0" />}
          </div>
        </div>
      )}
    </Band>
  );
}

export function ProblemBand() {
  return (
    <Band label="The problem">
      {(seen, near) => <ProblemInner seen={seen} near={near} />}
    </Band>
  );
}

function ProblemInner({ seen, near }: { seen: boolean; near: boolean }) {
  const pct = useCount(seen, 0, 91, 1600, 400);
  const days = useCount(seen, 0, 76, 1900, 800);
  return (
    <div className={cx(wrap, "grid items-center gap-8 py-24 lg:grid-cols-2")}>
      <div>
        <h2 className={cx("st", h2)} style={st(0)}>Nobody reads<br />the fine print.</h2>
        <div className="mt-12 grid grid-cols-2 gap-6 sm:gap-10">
          <div className="st border-t-2 border-[var(--text)] pt-5" style={st(2)}>
            <p className="tabular font-serif text-6xl leading-none sm:text-8xl">{Math.round(pct)}%</p>
            <p className="mt-3 leading-snug opacity-70 sm:text-lg">of people accept terms without reading them</p>
            <p className="data mt-2 opacity-50">Deloitte survey, 2017</p>
          </div>
          <div className="st border-t-2 border-[var(--text)] pt-5" style={st(3)}>
            <p className="tabular font-serif text-6xl leading-none sm:text-8xl">{Math.round(days)}</p>
            <p className="mt-3 leading-snug opacity-70 sm:text-lg">work days a year to read every privacy policy you meet</p>
            <p className="data mt-2 opacity-50">McDonald and Cranor, 2008</p>
          </div>
        </div>
      </div>
      <div className="st relative h-[360px] sm:h-[480px] lg:h-[620px]" style={st(1)}>
        {near && <Scene3D kind="pages" className="absolute inset-0" />}
      </div>
    </div>
  );
}

export function ClickBand() {
  return (
    <Band label="One click" className="border-t" threshold={0.15}>
      {() => (
        <div className={cx(wrap, "py-24")}>
          <h2 className={cx("st", h2)} style={st(0)}>One click.<br className="sm:hidden" /> A year of consequences.</h2>
          <p className="st mt-5 max-w-xl text-lg opacity-70" style={st(1)}>A typical signup and four clauses hiding in the text nobody reads. The app is made up; the clauses are the kind we find in real policies.</p>
          <div className="st mt-12" style={st(2)}>
            <AgreeStory />
          </div>
        </div>
      )}
    </Band>
  );
}

const STEPS = [
  { title: "Paste a link", text: "Any website, Google Play or App Store link. Undersigned finds the privacy policy and terms, plus the store’s privacy label for apps." },
  { title: "AI reads every word", text: "Each document gets a grade from A to E, a plain-language summary and 12 key facts. Every finding quotes the exact sentence it comes from." },
  { title: "Checked against your rules", text: "Pick what matters to you, like “Never sell my data”, or write your own rules in plain words. You get a clear yes, no or unclear for each one." },
  { title: "Alerted when it changes", text: "Watch the services you use. When their fine print changes, you get a summary of what’s different and whether it now breaks one of your rules." },
];

export function HowBand() {
  return (
    <Band dark label="How it works" threshold={0.15}>
      {() => (
        <div className={cx(wrap, "py-24 lg:py-32")}>
          <h2 className={cx("st", h2)} style={st(0)}>Meet Undersigned.</h2>
          <p className="st mt-5 max-w-2xl text-lg leading-relaxed opacity-70 sm:text-xl" style={st(1)}>
            An AI that reads privacy policies and terms for you, tells you what they really say, and keeps watching after you’ve agreed.
          </p>
          <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="st border-t pt-5" style={st(i + 2)}>
                <p className="tabular font-serif text-5xl leading-none opacity-40">{i + 1}</p>
                <p className="mt-5 text-xl font-semibold leading-tight">{s.title}</p>
                <p className="mt-3 leading-relaxed opacity-70">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="st mt-16 flex flex-wrap items-center gap-x-6 gap-y-3" style={st(6)}>
            <p className="data opacity-50">The grades</p>
            {(Object.keys(GRADE_INFO) as (keyof typeof GRADE_INFO)[]).map((g) => (
              <span key={g} className="flex items-center gap-2.5">
                <GradeBadge grade={g} className="size-8 text-base" />
                <span className="opacity-80">{GRADE_INFO[g].label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </Band>
  );
}

const PLACES = [
  { Icon: Globe, title: "On the web", text: "Paste any link and get a report you can share with anyone.", href: "/directory", cta: "Browse reports" },
  { Icon: Puzzle, title: "In your browser", text: "See a site’s grade in your toolbar. Worked out on your device, so your browsing stays private.", href: "/download", cta: "Get the extension" },
  { Icon: Smartphone, title: "On your phone", text: "Copy a Play Store or App Store link to check an app before you install it. Push alerts when policies change.", href: "/download#mobile", cta: "Get the app" },
  { Icon: Building2, title: "For your team", text: "Company rules for every vendor, a risk report per vendor as a PDF, and questions to send them.", href: "/teams", cta: "See the team demo" },
];

export function PlacesBand() {
  return (
    <Band label="Where it works" threshold={0.2}>
      {() => (
        <div className={cx(wrap, "py-24")}>
          <h2 className={cx("st", h2)} style={st(0)}>Wherever you click “Agree”.</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PLACES.map(({ Icon, title, text, href, cta }, i) => (
              <div key={title} className="st flex flex-col rounded-2xl border bg-[var(--surface)] p-7" style={st(i + 1)}>
                <Icon className="size-6 opacity-70" aria-hidden />
                <p className="mt-5 text-lg font-semibold">{title}</p>
                <p className="mt-2 leading-relaxed opacity-70">{text}</p>
                <Link href={href} className="mt-auto pt-6 inline-flex items-center gap-1.5 self-start font-medium underline-offset-4 hover:underline">
                  {cta} <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </Band>
  );
}

export function ProductBand() {
  return (
    <Band label="The product" className="border-t" threshold={0.15}>
      {() => (
        <div className={cx(wrap, "grid items-center gap-12 py-24 lg:grid-cols-[360px_1fr]")}>
          <div>
            <h2 className={cx("st", h2)} style={st(0)}>Your rules. Their fine print.</h2>
            <ul className="mt-10 space-y-4 text-lg">
              {[
                [Check, "Every finding quotes the exact sentence"],
                [CircleHelp, "“Unclear” when a document doesn’t say, never a guess"],
                [Check, "Websites, Google Play and App Store apps"],
                [Check, "An alert when the fine print changes"],
              ].map(([Icon, text], i) => {
                const I = Icon as typeof Check;
                return (
                  <li key={text as string} className="st flex gap-3" style={st(i + 2)}>
                    <I className="mt-1 size-5 shrink-0 opacity-60" aria-hidden /> {text as string}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="st" style={st(1)}>
            <PolicyReport />
            <p className="mt-3 text-sm opacity-60">Live demo on Spotify’s real policy. Switch rules on and off to see the verdict change.</p>
          </div>
        </div>
      )}
    </Band>
  );
}

const TIERS = [
  { name: "Free", price: "$0", points: ["Every report and grade", "3 personal rules", "3 watched services, weekly checks"], href: "/signup", cta: "Get started" },
  { name: "Pro", price: "$4 / month", points: ["Unlimited rules, in your own words", "Unlimited watchlist", "Daily checks, instant alerts"], href: "/pricing", cta: "See Pro" },
  { name: "Teams", price: "Pilot", points: ["Company rules for every vendor", "Risk report per vendor, as PDF", "Questions to send each vendor"], href: "/teams", cta: "See the team demo" },
];

export function TiersBand() {
  return (
    <Band label="Pricing" threshold={0.2}>
      {() => (
        <div className={cx(wrap, "py-24")}>
          <h2 className={cx("st", h2)} style={st(0)}>Free to read. Paid to watch.</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TIERS.map((t, i) => (
              <div key={t.name} className={cx("st flex flex-col rounded-2xl border bg-[var(--surface)] p-8", i === 1 && "border-[var(--text)] [box-shadow:var(--shadow)]")} style={st(i + 1)}>
                <p className="text-lg font-semibold">{t.name}</p>
                <p className="mt-1 font-serif text-5xl leading-none">{t.price}</p>
                <ul className="mt-6 space-y-2.5 opacity-80">
                  {t.points.map((p) => (
                    <li key={p} className="flex gap-2.5"><Check className="mt-1 size-4 shrink-0" aria-hidden /> {p}</li>
                  ))}
                </ul>
                <Link href={t.href} className={cx("btn press mt-8 self-start", i === 1 ? "btn-primary" : "btn-quiet")}>{t.cta}</Link>
              </div>
            ))}
          </div>
          <p className="st mt-8 opacity-60" style={st(4)}>
            Also in your browser and on your phone: <Link href="/download" className="link">get the extension and app</Link>.
          </p>
        </div>
      )}
    </Band>
  );
}

export function CloseBand() {
  return (
    <Band dark label="Get started" threshold={0.2}>
      {(_, near) => (
        <div className={cx(wrap, "flex flex-col items-center pb-24 pt-10 text-center")}>
          <div className="st relative h-[300px] w-full sm:h-[440px]" style={st(0)}>
            {near && <Scene3D kind="nib" className="absolute inset-0" />}
          </div>
          <h2 className="st font-serif text-5xl leading-none tracking-[-0.03em] sm:text-7xl lg:text-[6.5rem]" style={st(1)}>Know what you sign.</h2>
          <button
            type="button"
            className="st btn btn-primary press mt-10 px-6 py-3 text-base"
            style={st(2)}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTimeout(() => document.getElementById("analyze-url")?.focus({ preventScroll: true }), 500);
            }}
          >
            Check a site now
          </button>
        </div>
      )}
    </Band>
  );
}
