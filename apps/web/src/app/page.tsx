import { ArrowRight, Check, Puzzle, Smartphone } from "lucide-react";
import Link from "next/link";
import { listServices } from "@privacy-radar/core";
import { AgreeStory } from "@/components/agree-story";
import { AnalyzeBox } from "@/components/analyze-box";
import { ClauseQuiz } from "@/components/clause-quiz";
import { RecentReports } from "@/components/recent-reports";
import { PolicyReport } from "@/components/policy-report";
import { AlertFragment, PasteFragment, VerdictFragment } from "@/components/workflow-fragments";
import { WaitlistForm } from "@/components/waitlist-form";

export const dynamic = "force-dynamic";

// One row per job the product does; supporting points carry what used to be the feature list.
const CAPABILITIES = [
  {
    Art: PasteFragment,
    title: "Check any site or app",
    body: "Paste a website, a privacy policy, or a Google Play or App Store link. We find the documents and read them for you.",
    points: ["Reads the store’s own privacy label for apps", "Every finding quotes the exact sentence", "Quotes that aren’t word for word in the original are dropped"],
  },
  {
    Art: VerdictFragment,
    title: "Judge it by your rules",
    body: "Pick what you won’t accept, or write it in your own words. Every service gets a pass or fail against those rules, not someone else’s.",
    points: ["Twelve common rules ready to switch on", "Custom rules in plain language", "“Unclear” when a document doesn’t say, never a guess"],
  },
  {
    Art: AlertFragment,
    title: "Hear when it changes",
    body: "Watch the services you use. When a document changes, you get one short note: what changed and whether it now breaks a rule.",
    points: ["Date stamps and formatting edits are ignored", "Email and phone notifications", "Full change history on every report"],
  },
];

const FAQ = [
  { q: "Is this legal advice?", a: "No. It's a plain-language guide that points to the exact text so you can check it yourself. For legal decisions, talk to a lawyer." },
  { q: "How accurate is it?", a: "The AI must quote the document for every finding, and quotes that don't appear word for word in the source are removed automatically. When a document doesn't cover something, the report says “unclear” instead of guessing." },
  { q: "How often are policies re-checked?", a: "Weekly on the free plan and daily on Pro. Date stamps and formatting edits are ignored, so you only hear about real changes." },
  { q: "Do you see my browsing?", a: "No. The extension works out grades on your device from a downloaded list. We never collect your history, and we don't sell or share anything." },
  { q: "What does it cost?", a: "Reports and rule checks are free. Pro adds unlimited watched services, unlimited custom rules and daily checks for $4 a month." },
];

export default async function Home() {
  const recent = await listServices({ limit: 8 }).catch(() => []);
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:pt-20">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <h1 className="text-[3.25rem] leading-[0.98] sm:text-[6rem]">
            <span className="rise block" style={{ "--d": "0ms" } as React.CSSProperties}>Know what</span>
            <span className="rise block" style={{ "--d": "80ms" } as React.CSSProperties}>you sign.</span>
          </h1>
          <div className="rise" style={{ "--d": "180ms" } as React.CSSProperties}>
            <p className="max-w-[34rem] text-lg leading-relaxed muted">
              Paste any website, Play Store or App Store link. In seconds, get a plain-language verdict on its privacy policy and terms, checked against your own rules, and an alert when they change.
            </p>
            <div className="mt-6">
              <AnalyzeBox />
            </div>
          </div>
        </div>
        <div className="rise mt-14" style={{ "--d": "320ms" } as React.CSSProperties}>
          <PolicyReport />
          <p className="mt-3 text-sm muted">Every highlight is a verbatim sentence from Spotify’s documents. Switch rules on and off to see the verdict change.</p>
        </div>
      </section>

      <section className="border-t py-24" aria-labelledby="agree-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="agree-heading" className="text-4xl sm:text-5xl">Everyone clicks “I agree”</h2>
          <p className="mt-4 max-w-xl text-lg muted">A typical signup, and what one unread checkbox can cost over the next year. The app is made up; every clause is the kind we find in real policies.</p>
          <div className="mt-12">
            <AgreeStory />
          </div>
        </div>
      </section>

      <RecentReports items={recent} />

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-4xl sm:text-5xl">How it works</h2>
        <ol className="mt-12 divide-y border-y">
          {CAPABILITIES.map(({ Art, title, body, points }) => (
            <li key={title} className="grid gap-8 py-10 md:grid-cols-2 md:gap-16">
              <div>
                <h3 className="font-serif text-[28px] leading-tight">{title}</h3>
                <p className="mt-3 max-w-[48ch] text-[17px] leading-relaxed muted">{body}</p>
                <ul className="mt-5 space-y-2">
                  {points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[15px]">
                      <Check className="mt-1 size-4 shrink-0 muted" strokeWidth={2} aria-hidden /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:self-center">
                <Art />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-[var(--band)] py-24 text-white" aria-labelledby="quiz-heading">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:items-center">
          <div>
            <h2 id="quiz-heading" className="text-4xl sm:text-5xl">Who wrote this?</h2>
            <p className="mt-4 max-w-sm text-lg text-white/75">Eight real clauses from apps you probably use. Guess the company. We read 52 policies to find them.</p>
          </div>
          <div className="text-[var(--text)]">
            <ClauseQuiz />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-2" aria-label="Ways to use Undersigned">
        <div className="flex flex-col rounded-xl border bg-[var(--surface)] p-8 sm:p-10">
          <h2 className="text-3xl">For you</h2>
          <p className="mt-3 max-w-md text-[17px] leading-relaxed muted">The browser extension shows a grade next to every site you visit and checks a signup page against your rules in one click.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/download" className="btn btn-primary press"><Puzzle className="size-4" aria-hidden /> Get the extension</Link>
            <Link href="/download#mobile" className="btn btn-quiet press"><Smartphone className="size-4" aria-hidden /> Mobile app</Link>
          </div>
          <div className="mt-auto pt-10">
            <p className="text-[15px] font-medium">Get an email when the iPhone and Android apps launch</p>
            <div className="mt-3">
              <WaitlistForm source="home" />
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-xl border bg-[var(--band)] p-8 text-white sm:p-10">
          <h2 className="text-3xl">For teams</h2>
          <p className="mt-3 max-w-md text-[17px] leading-relaxed text-white/75">Set company rules once. Get a risk score for every vendor, the clause behind it, how to reduce it, and the questions to send them.</p>
          <ul className="mt-6 space-y-2 text-[15px] text-white/85">
            {["Risk report per vendor, ready to save as PDF", "Data, liability and legal-recourse risks", "Alerts when a vendor’s terms change"].map((p) => (
              <li key={p} className="flex gap-2.5">
                <Check className="mt-1 size-4 shrink-0 text-white/60" aria-hidden /> {p}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-10">
            <Link href="/teams" className="btn press bg-white text-[#141518] hover:bg-white/90">
              See the team demo <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-3xl px-4" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-4xl">Questions</h2>
        <div className="mt-6 border-t">
          {FAQ.map((f) => (
            <details key={f.q} className="group border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-medium">
                {f.q}
                <span className="text-xl font-light muted transition-transform duration-200 group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="max-w-[65ch] pb-5 leading-relaxed muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
