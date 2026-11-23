"use client";

import { Check, RotateCcw, Share2, X } from "lucide-react";
import { useState } from "react";
import { cx } from "./ui";

type Question = { quote: string; options: string[]; answer: string; why: string; source: string };

// Every quote is verbatim from the company's current policy or terms (read November 22, 2026).
const QUESTIONS: Question[] = [
  {
    quote: "We do not sell your personal data governed by this Privacy Statement in the conventional sense.",
    options: ["Netflix", "Zoom", "Slack"],
    answer: "Zoom",
    why: "The very next sentence: sales of business contact data “may occur through our Zoom Common Room offering”.",
    source: "https://www.zoom.com/en/trust/privacy/privacy-statement/",
  },
  {
    quote: "…we may provide certain personal information to your Benefit Sponsor, including… the date on which you last used our Platform.",
    options: ["Headspace", "Calm", "Peloton"],
    answer: "Headspace",
    why: "A “Benefit Sponsor” is your employer or health plan. Yes, a mental health app.",
    source: "https://www.headspace.com/privacy-policy",
  },
  {
    quote: "…any person or corporation with whom you have had, currently have, or may have a financial relationship, including without limitation past, present, and future places of employment…",
    options: ["Venmo", "PayPal", "Cash App"],
    answer: "Cash App",
    why: "It’s about exchanging your credit-related information, including with future employers.",
    source: "https://cash.app/us/en/legal/privacy",
  },
  {
    quote: "We understand that the nature of conversations with an AI companion may lead you to incidentally share such information.",
    options: ["Replika", "Character.AI", "Snapchat My AI"],
    answer: "Replika",
    why: "“Such information” means your health, sex life and religion, which the same policy tells you not to share.",
    source: "https://replika.com/legal/privacy",
  },
  {
    quote: "This provision shall be binding upon and enforceable against you, your estate, heirs… including any party who is deceased at the time the dispute arises.",
    options: ["TikTok", "Snapchat", "Instagram"],
    answer: "Snapchat",
    why: "Its arbitration clause follows you after death.",
    source: "https://snap.com/en-US/terms",
  },
  {
    quote: "If you delete the App from your device or your account becomes inactive, we will retain your personal data for three years…",
    options: ["Flo", "Fitbit", "Strava"],
    answer: "Flo",
    why: "A period tracker. Uninstalling isn’t deleting.",
    source: "https://flo.health/privacy-policy",
  },
  {
    quote: "…we may also use personal information about United States residents for other purposes, such as to develop and train our artificial intelligence algorithms and models.",
    options: ["Apple", "Samsung", "LG"],
    answer: "Samsung",
    why: "Only United States residents are named. Europeans are protected by GDPR.",
    source: "https://www.samsung.com/us/account/privacy-policy/",
  },
  {
    quote: "You agree that your sole and exclusive remedy for any problems or dissatisfaction with the [app] service is to uninstall any [app] software and to stop using the [app] service.",
    options: ["Apple Music", "YouTube", "Spotify"],
    answer: "Spotify",
    why: "In the original it’s in capital letters, and “[app]” is “Spotify”. Your only remedy is to leave.",
    source: "https://www.spotify.com/us/legal/end-user-agreement/",
  },
];

export function ClauseQuiz() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [shareState, setShareState] = useState("Share your score");
  const done = index >= QUESTIONS.length;
  const q = QUESTIONS[index];

  function pick(option: string) {
    if (picked || !q) return;
    setPicked(option);
    if (option === q.answer) setScore((s) => s + 1);
  }

  function next() {
    setPicked(null);
    setIndex((i) => i + 1);
  }

  async function share() {
    const text = `I matched ${score} of ${QUESTIONS.length} real privacy clauses to the app that wrote them. Can you beat that?`;
    const url = window.location.origin;
    if (navigator.share) return navigator.share({ text, url }).catch(() => {});
    await navigator.clipboard.writeText(`${text} ${url}`);
    setShareState("Copied to clipboard");
  }

  if (done || !q) {
    const perfect = score === QUESTIONS.length;
    return (
      <div className="panel pop-in text-center sm:!p-12">
        <p className="label">Your score</p>
        <p className="tabular mt-2 text-7xl font-semibold">
          {score}/{QUESTIONS.length}
        </p>
        <p className="mx-auto mt-3 max-w-md text-lg muted">
          {perfect ? "Impressive. Now imagine checking every app you use like this." : "Nobody can keep up with all of this. That’s exactly why we read it for you."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={share} className="btn btn-primary"><Share2 className="size-4" aria-hidden /> {shareState}</button>
          <button
            onClick={() => {
              setIndex(0);
              setScore(0);
              setShareState("Share your score");
            }}
            className="btn btn-quiet"
          >
            <RotateCcw className="size-4" aria-hidden /> Play again
          </button>
        </div>
      </div>
    );
  }

  const answered = picked !== null;
  return (
    <div className="panel sm:!p-10" key={index}>
      <div className="flex items-center justify-between gap-4">
        <p className="label tabular whitespace-nowrap">Clause {index + 1} of {QUESTIONS.length}</p>
        <div className="flex gap-1.5" aria-hidden>
          {QUESTIONS.map((_, i) => {
            let fill = "bg-[var(--surface-2)]";
            if (i < index) fill = "bg-[var(--muted)]";
            if (i === index) fill = "bg-[var(--text)]";
            return <span key={i} className={cx("h-1.5 w-6 rounded-full transition-colors", fill)} />;
          })}
        </div>
      </div>
      <p className="fine-print pop-in mt-6 !text-xl leading-relaxed sm:!text-2xl">
        “{q.quote}”
      </p>
      <p className="mt-6 font-semibold">Which app wrote this?</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {q.options.map((o) => {
          const isAnswer = o === q.answer;
          const isPicked = o === picked;
          return (
            <button
              key={o}
              type="button"
              disabled={answered}
              onClick={() => pick(o)}
              className={cx(
                "btn justify-between border py-3.5 text-base disabled:opacity-100",
                !answered && "bg-[var(--surface)] hover:border-[var(--text)]",
                answered && isAnswer && "border-pass bg-pass text-white",
                answered && isPicked && !isAnswer && "nope border-fail bg-fail text-white",
                answered && !isAnswer && !isPicked && "opacity-50",
              )}
            >
              {o}
              {answered && isAnswer && <Check className="size-5" strokeWidth={3} aria-label="Correct answer" />}
              {answered && isPicked && !isAnswer && <X className="size-5" strokeWidth={3} aria-label="Wrong answer" />}
            </button>
          );
        })}
      </div>
      <div className="reveal" data-on={answered} inert={!answered}>
        <div>
          <p className="mt-5 text-[17px]">
            <b>{picked === q.answer ? "Right." : `It was ${q.answer}.`}</b> {q.why}{" "}
            <a href={q.source} target="_blank" rel="noreferrer" className="link text-[15px]">Read the original</a>
          </p>
          <button onClick={next} className="btn btn-ink mt-5">
            {index + 1 === QUESTIONS.length ? "See my score" : "Next clause"}
          </button>
        </div>
      </div>
    </div>
  );
}
