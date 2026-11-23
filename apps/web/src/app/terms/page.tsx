import type { Metadata } from "next";

export const metadata: Metadata = { title: "Our terms" };

const SECTIONS: [string, string][] = [
  ["Not legal advice", "Undersigned summarizes public documents with AI. Summaries can be wrong. Always check the original text, which we link for every finding. For legal decisions, consult a lawyer."],
  ["Your account", "Keep your password safe. One account per person. You can delete your account at any time."],
  ["Pro subscription", "Billed monthly through Stripe. Cancel anytime from Settings and keep Pro until the end of the period. No refunds for partial months, but tell us if something went wrong."],
  ["Fair use", "Don't use automated tools to mass-download reports or overload the service. Rate limits apply."],
  ["Disputes", "No forced arbitration and no class action waiver. If something goes wrong, email us first, and you keep all your legal rights."],
  ["Changes", "We'll email you 14 days before material changes. Continuing to use the service after that means you accept them."],
];

export default function Terms() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl">Our terms</h1>
      <p className="mt-2 muted">Plain words. Last updated November 2026.</p>
      <div className="mt-10 border-t">
        {SECTIONS.map(([t, b]) => (
          <section key={t} className="border-b py-6">
            <h2 className="text-lg">{t}</h2>
            <p className="mt-2 max-w-[65ch] leading-relaxed muted">{b}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
