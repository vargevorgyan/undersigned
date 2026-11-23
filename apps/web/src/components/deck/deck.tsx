"use client";

import { ArrowLeft, ArrowRight, Check, CircleHelp, Expand, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AgreeStory } from "../agree-story";
import { PolicyReport } from "../policy-report";
import { cx, GradeBadge, Logo } from "../ui";
import { st, Swept, useCount, useLinger } from "./motion";
import { Scene3D } from "./scene-3d";

export type DeckData = {
  grade: string;
  gradeLabel: string;
  docs: { label: string; grade: string; words: number }[];
};

type SlideProps = { active: boolean; data: DeckData };

function Title({ active }: SlideProps) {
  const live = useLinger(active);
  return (
    <div className="grid h-full grid-cols-[1.1fr_1fr] items-center px-28">
      <div>
        <div className="st flex items-center gap-4 font-serif text-[34px]" style={st(0)}>
          <Logo className="size-12" /> Undersigned
        </div>
        <h1 className="st mt-16 whitespace-nowrap font-serif text-[128px] leading-[0.95] tracking-[-0.03em]" style={st(1)}>
          Know what<br />you sign.
        </h1>
        <p className="st mt-10 max-w-[620px] text-[30px] leading-snug opacity-70" style={st(3)}>
          AI that reads privacy policies and terms, checks them against your rules, and tells you when they change.
        </p>
      </div>
      <div className="st relative h-[760px]" style={st(2)}>
        {live && <Scene3D kind="nib" className="absolute inset-0" />}
      </div>
    </div>
  );
}

function Problem({ active }: SlideProps) {
  const live = useLinger(active);
  const pct = useCount(active, 0, 91, 1600, 400);
  const days = useCount(active, 0, 76, 1900, 900);
  return (
    <div className="grid h-full grid-cols-[1fr_1fr] items-center gap-10 px-28">
      <div>
        <h2 className="st font-serif text-[96px] leading-[0.98] tracking-[-0.02em]" style={st(0)}>Nobody reads<br />the fine print.</h2>
        <div className="mt-16 grid grid-cols-2 gap-12">
          <div className="st border-t-2 border-[var(--text)] pt-6" style={st(2)}>
            <p className="tabular font-serif text-[120px] leading-none">{Math.round(pct)}%</p>
            <p className="mt-4 text-[24px] leading-snug opacity-70">of people accept terms without reading them</p>
            <p className="data mt-3 opacity-50">Deloitte survey, 2017</p>
          </div>
          <div className="st border-t-2 border-[var(--text)] pt-6" style={st(3)}>
            <p className="tabular font-serif text-[120px] leading-none">{Math.round(days)}</p>
            <p className="mt-4 text-[24px] leading-snug opacity-70">work days a year to read every privacy policy you meet</p>
            <p className="data mt-3 opacity-50">McDonald and Cranor, 2008</p>
          </div>
        </div>
      </div>
      <div className="st relative h-[820px]" style={st(1)}>
        {live && <Scene3D kind="pages" className="absolute inset-0" />}
      </div>
    </div>
  );
}

function Click({ active }: SlideProps) {
  const live = useLinger(active);
  return (
    <div className="flex h-full flex-col justify-center px-28">
      <h2 className="st font-serif text-[72px] leading-none tracking-[-0.02em]" style={st(0)}>One click. A year of consequences.</h2>
      <div className="st mt-14 text-[17px]" style={st(1)}>
        {live && <AgreeStory />}
      </div>
    </div>
  );
}

function CaseStudy({ active, data }: SlideProps) {
  const words = data.docs.reduce((s, d) => s + d.words, 0);
  const w = useCount(active, 0, words, 1800, 500);
  const minutes = Math.round(words / 230);
  return (
    <div className="flex h-full flex-col justify-center px-28">
      <h2 className="st font-serif text-[88px] leading-none tracking-[-0.02em]" style={st(0)}>We read Spotify’s fine print.</h2>
      <div className="mt-20 grid grid-cols-[1.3fr_1fr] items-end gap-20">
        <div className="grid grid-cols-3 gap-10">
          {[
            [Math.round(w).toLocaleString("en-US"), "words in the privacy policy and terms"],
            [`${minutes} min`, "to read them at an average pace"],
            ["Seconds", "for Undersigned to read, grade and quote them"],
          ].map(([n, label], i) => (
            <div key={label} className="st border-t pt-6" style={st(i + 1)}>
              <p className="tabular font-serif text-[64px] leading-none">{n}</p>
              <p className="mt-4 text-[21px] leading-snug opacity-65">{label}</p>
            </div>
          ))}
        </div>
        <div className="st flex items-center gap-8" style={st(4)}>
          <div className="deck-stamp">
            <GradeBadge grade={data.grade} className="size-[168px] rounded-2xl text-[110px]" />
          </div>
          <div>
            <p className="font-serif text-[48px] leading-none">{data.gradeLabel}</p>
            <ul className="mt-6 space-y-3 text-[22px]">
              {data.docs.map((d) => (
                <li key={d.label} className="flex items-center gap-3">
                  <GradeBadge grade={d.grade} className="size-9 text-lg" /> {d.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThirtyDollars({ active }: SlideProps) {
  const live = useLinger(active);
  const v = useCount(active, 1_000_000, 30, 2800, 600, true);
  return (
    <div className="grid h-full grid-cols-[1.25fr_1fr] items-center px-28">
      <div>
        <p className="st max-w-[820px] text-[30px] leading-snug opacity-70" style={st(0)}>If Spotify gets something wrong, the most it owes a free user:</p>
        <p className="st tabular mt-10 font-serif text-[240px] leading-[0.9] tracking-[-0.04em] text-[#f0c04f]" style={st(1)}>
          ${v >= 1000 ? Math.round(v).toLocaleString("en-US") : v.toFixed(2)}
        </p>
        <p className="st data mt-12 max-w-[760px] text-[17px] leading-relaxed opacity-60" style={st(3)}>
          “…AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SPOTIFY SERVICE… MORE THAN THE GREATER OF (A) THE AMOUNTS PAID BY YOU TO SPOTIFY DURING THE TWELVE MONTHS PRIOR TO THE FIRST CLAIM; OR (B) $30.00.”
        </p>
        <p className="st mt-3 text-[18px] opacity-50" style={st(4)}>Spotify Terms of Use, section 6</p>
      </div>
      <div className="st relative h-[700px]" style={st(2)}>
        {live && <Scene3D kind="coin" className="absolute inset-0" />}
      </div>
    </div>
  );
}

const CLAUSES = [
  { title: "Your only fix is to uninstall", pre: "YOU AGREE THAT YOUR ", mark: "SOLE AND EXCLUSIVE REMEDY", post: " FOR ANY PROBLEMS OR DISSATISFACTION WITH THE SPOTIFY SERVICE IS TO UNINSTALL ANY SPOTIFY SOFTWARE", src: "Terms" },
  { title: "Recommendations can follow business deals", pre: "the Content that you access, including its selection and placement, ", mark: "may be influenced by commercial considerations", post: ", including Spotify's agreements with third parties.", src: "Terms" },
  { title: "Your uploads, licensed forever", pre: "you hereby grant to Spotify a non-exclusive, transferable, sublicensable, royalty-free, fully paid, ", mark: "irrevocable, worldwide license", post: "", src: "Terms" },
  { title: "Your listening and voice train AI", pre: "This includes ", mark: "development and training of algorithmic and machine learning models", post: ", which help us to keep our service safe and enhance our users’ experience.", src: "Privacy policy" },
  { title: "Paying doesn’t stop podcast ads", pre: "you will receive less relevant advertising, including on our free Service Option, ", mark: "as well as our paid Service Option", post: ", as applicable (for example, advertising in podcasts).", src: "Privacy policy" },
];

function Clauses({ active }: SlideProps) {
  return (
    <div className="flex h-full flex-col justify-center px-28 pb-10">
      <h2 className="st font-serif text-[64px] leading-none tracking-[-0.02em]" style={st(0)}>Five sentences nobody read</h2>
      <ol className="mt-9 divide-y border-y">
        {CLAUSES.map((c, i) => (
          <li key={c.title} className="st grid grid-cols-[56px_380px_1fr] items-baseline gap-8 py-[18px]" style={st(i + 1)}>
            <span className="tabular font-serif text-[40px] opacity-40">{i + 1}</span>
            <span className="text-[26px] font-semibold leading-tight">{c.title}</span>
            <span>
              <span className="font-serif text-[19px] leading-relaxed opacity-80">
                “{c.pre}<Swept active={active} delay={900 + i * 380} tone="var(--mark-bad)">{c.mark}</Swept>{c.post}”
              </span>
              <span className="data ml-3 opacity-45">{c.src}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Product({ active }: SlideProps) {
  const live = useLinger(active);
  return (
    <div className="grid h-full grid-cols-[480px_1fr] items-center gap-16 px-28">
      <div>
        <h2 className="st font-serif text-[80px] leading-[0.98] tracking-[-0.02em]" style={st(0)}>Your rules.<br />Their fine print.</h2>
        <ul className="mt-12 space-y-6 text-[24px]">
          {[
            [Check, "Every finding quotes the exact sentence"],
            [CircleHelp, "“Unclear” when a document doesn’t say, never a guess"],
            [Check, "Websites, Google Play and App Store apps"],
            [Check, "An alert when the fine print changes"],
          ].map(([Icon, text], i) => {
            const I = Icon as typeof Check;
            return (
              <li key={text as string} className="st flex gap-4" style={st(i + 2)}>
                <I className="mt-1.5 size-6 shrink-0 opacity-60" /> {text as string}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="st origin-center scale-[0.84] text-[16px]" style={st(1)}>
        {live && <PolicyReport />}
      </div>
    </div>
  );
}

function Business(_: SlideProps) {
  const tiers = [
    { name: "Free", price: "$0", points: ["Every report and grade", "3 personal rules", "3 watched services, weekly checks"] },
    { name: "Pro", price: "$4 / month", points: ["Unlimited rules, in your own words", "Unlimited watchlist", "Daily checks, instant alerts"] },
    { name: "Teams", price: "Pilot", points: ["Company rules for every vendor", "Risk report per vendor, as PDF", "Questions to send each vendor"] },
  ];
  return (
    <div className="flex h-full flex-col justify-center px-28">
      <h2 className="st font-serif text-[80px] leading-none tracking-[-0.02em]" style={st(0)}>Free to read. Paid to watch.</h2>
      <div className="mt-16 grid grid-cols-3 gap-8">
        {tiers.map((t, i) => (
          <div key={t.name} className={cx("st rounded-2xl border p-10", i === 1 && "border-[var(--text)] [box-shadow:var(--shadow)]")} style={st(i + 1)}>
            <p className="text-[26px] font-semibold">{t.name}</p>
            <p className="mt-2 font-serif text-[56px] leading-none">{t.price}</p>
            <ul className="mt-8 space-y-3 text-[21px] opacity-75">
              {t.points.map((p) => (
                <li key={p} className="flex gap-3"><Check className="mt-1 size-5 shrink-0" /> {p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="st mt-12 text-[22px] opacity-60" style={st(4)}>Each document is analysed once and shared by every user, so cost grows with documents, not with users.</p>
    </div>
  );
}

function Close({ active }: SlideProps) {
  const live = useLinger(active);
  return (
    <div className="flex h-full flex-col items-center text-center">
      <div className="st relative h-[560px] w-full" style={st(0)}>{live && <Scene3D kind="nib" className="absolute inset-0" />}</div>
      <h2 className="st font-serif text-[112px] leading-none tracking-[-0.03em]" style={st(1)}>Know what you sign.</h2>
      <p className="st mt-7 text-[28px] opacity-60" style={st(2)}>undersigned.app</p>
    </div>
  );
}

const SLIDES: { C: (p: SlideProps) => React.ReactNode; dark?: boolean; name: string }[] = [
  { C: Title, dark: true, name: "Title" },
  { C: Problem, name: "The problem" },
  { C: Click, name: "One click" },
  { C: CaseStudy, dark: true, name: "Spotify" },
  { C: ThirtyDollars, dark: true, name: "$30" },
  { C: Clauses, name: "Five sentences" },
  { C: Product, name: "The product" },
  { C: Business, name: "Business" },
  { C: Close, dark: true, name: "Close" },
];

/** A 1600×900 stage scaled to the window; arrows, space and swipes navigate, F goes full screen. */
export function Deck({ data }: { data: DeckData }) {
  const [idx, setIdx] = useState(0);
  const [scale, setScale] = useState(1);
  const touchX = useRef<number | null>(null);

  const go = useCallback((n: number) => {
    const next = Math.max(0, Math.min(SLIDES.length - 1, n));
    setIdx(next);
    history.replaceState(null, "", `#${next + 1}`);
  }, []);

  useEffect(() => {
    const fromHash = Number(location.hash.slice(1));
    if (fromHash) setIdx(Math.max(0, Math.min(SLIDES.length - 1, fromHash - 1)));
    const fit = () => setScale(Math.min(window.innerWidth / 1600, window.innerHeight / 900));
    fit();
    window.addEventListener("resize", fit);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", fit);
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) go(idx + 1);
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) go(idx - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(SLIDES.length - 1);
      else if (e.key.toLowerCase() === "f") document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, go]);

  const dark = SLIDES[idx]!.dark;
  return (
    <div
      className={cx("deck fixed inset-0 z-[60] overflow-hidden transition-colors duration-700", dark ? "bg-[#0f1012]" : "bg-[#fafaf8]")}
      onTouchStart={(e) => (touchX.current = e.touches[0]!.clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0]!.clientX - (touchX.current ?? 0);
        if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="absolute left-1/2 top-1/2 h-[900px] w-[1600px]" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        {SLIDES.map(({ C, dark: d, name }, i) => (
          <section
            key={name}
            aria-label={`Slide ${i + 1}: ${name}`}
            aria-hidden={i !== idx}
            inert={i !== idx}
            data-active={i === idx}
            data-dir={i < idx ? "past" : "future"}
            className={cx("deck-slide absolute inset-0", d ? "deck-dark" : "deck-light")}
          >
            <C active={i === idx} data={data} />
          </section>
        ))}
      </div>

      <div className={cx("absolute inset-x-0 bottom-0 flex items-center gap-4 px-6 py-4 text-sm transition-colors duration-700", dark ? "text-white/60" : "text-black/50")}>
        <Link href="/" className="rounded-md p-1.5 hover:bg-current/10" aria-label="Exit presentation"><X className="size-4" /></Link>
        <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-current/15">
          <div className="h-full bg-current transition-[width] duration-700 ease-[var(--ease-out-strong)]" style={{ width: `${((idx + 1) / SLIDES.length) * 100}%` }} />
        </div>
        <span className="tabular data">{idx + 1} / {SLIDES.length}</span>
        <button type="button" onClick={() => go(idx - 1)} className="rounded-md p-1.5 hover:bg-current/10" aria-label="Previous slide"><ArrowLeft className="size-4" /></button>
        <button type="button" onClick={() => go(idx + 1)} className="rounded-md p-1.5 hover:bg-current/10" aria-label="Next slide"><ArrowRight className="size-4" /></button>
        <button type="button" onClick={() => document.documentElement.requestFullscreen()} className="rounded-md p-1.5 hover:bg-current/10" aria-label="Full screen"><Expand className="size-4" /></button>
      </div>
    </div>
  );
}
