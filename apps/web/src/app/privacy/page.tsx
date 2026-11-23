import type { Metadata } from "next";

export const metadata: Metadata = { title: "Our privacy policy" };

const SECTIONS: [string, string][] = [
  ["What we collect", "Your email, a password hash, your rules and your watchlist. If you use the extension, badges are computed on your device from a list we send you, so your browsing history never reaches us. We receive a site's address only when you open the extension popup on it or click Analyze."],
  ["What we never do", "We don't sell your data. We don't share it with advertisers. We don't use your data to train AI. We don't track you across other sites. We use no third-party analytics or ad pixels."],
  ["Who processes data for us", "Our hosting provider, our email provider (to send alerts), Stripe (payments, Pro only), and Anthropic (to analyze public policy documents; your personal data is never sent)."],
  ["How long we keep it", "As long as you have an account. Deleting your account removes your data immediately; backups expire within 30 days."],
  ["Your rights", "Download all your data or delete your account at any time in Settings. No email needed, no waiting."],
  ["Changes", "We'll email you at least 14 days before any material change, and we track our own policy on Undersigned like any other service."],
];

export default function Privacy() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl">Our privacy policy</h1>
      <p className="mt-2 muted">Short, because there's not much to say. Last updated November 2026.</p>
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
