import { listServices } from "@privacy-radar/core";
import { ClauseQuiz } from "@/components/clause-quiz";
import { ClickBand, CloseBand, HeroBand, HowBand, PlacesBand, ProblemBand, ProductBand, TiersBand } from "@/components/landing/story";
import { RecentReports } from "@/components/recent-reports";

export const dynamic = "force-dynamic";

const FAQ = [
  { q: "Is this legal advice?", a: "No. It's a plain-language guide that points to the exact text so you can check it yourself. For legal decisions, talk to a lawyer." },
  { q: "How accurate is it?", a: "The AI must quote the document for every finding, and quotes that don't appear word for word in the source are removed automatically. When a document doesn't cover something, the report says “unclear” instead of guessing." },
  { q: "How often are policies re-checked?", a: "Weekly on the free plan and daily on Pro. Date stamps and formatting edits are ignored, so you only hear about real changes." },
  { q: "Do you see my browsing?", a: "No. The extension works out grades on your device from a downloaded list. We never collect your history, and we don't sell or share anything." },
  { q: "What does it cost?", a: "Reports and rule checks are free. Pro adds unlimited watched services, unlimited custom rules and daily checks for $4 a month." },
];

/** The landing page tells the presentation's story as you scroll; dark and light bands alternate like its slides. */
export default async function Home() {
  const recent = await listServices({ limit: 8 }).catch(() => []);

  return (
    <>
      <HeroBand />
      <ProblemBand />
      <ClickBand />
      <HowBand />
      <PlacesBand />
      <ProductBand />
      <RecentReports items={recent} />

      <section className="deck-dark bg-[var(--bg)] py-24" aria-labelledby="quiz-heading">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:items-center">
          <div>
            <h2 id="quiz-heading" className="text-4xl sm:text-5xl">Who wrote this?</h2>
            <p className="mt-4 max-w-sm text-lg opacity-70">Eight real clauses from apps you probably use. Guess the company. We read 52 policies to find them.</p>
          </div>
          <div className="deck-light rounded-2xl">
            <ClauseQuiz />
          </div>
        </div>
      </section>

      <TiersBand />

      <section className="mx-auto max-w-3xl px-4 pb-24" aria-labelledby="faq-heading">
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

      <CloseBand />
    </>
  );
}
