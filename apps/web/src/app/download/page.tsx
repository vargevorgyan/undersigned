import { Bell, Clipboard, Cpu, Share } from "lucide-react";
import type { Metadata } from "next";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = { title: "Browser extension & mobile app" };

export default function Download() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <section className="grid items-center gap-10 sm:grid-cols-2">
        <div>
          <h1 className="text-4xl">The grade, right in your toolbar</h1>
          <p className="mt-3 muted">See a site's privacy grade as you browse, check it against your rules in one click, and analyze any new site's policies without leaving the page. Works in Chrome, Edge and Firefox.</p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex gap-3"><Cpu className="size-5 shrink-0" /> Badges are computed on your device from a downloaded list. We never collect your browsing history.</li>
            <li className="flex gap-3"><Bell className="size-5 shrink-0" /> Desktop notifications when a watched policy changes.</li>
          </ul>
          <p className="mt-6 text-sm muted">Store listing coming soon. For now, developers can load it unpacked from <code className="chip">apps/extension</code> (see README).</p>
        </div>
        <div className="panel mx-auto w-full max-w-xs !p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-grade-d text-2xl font-semibold text-white">D</span>
            <div>
              <p className="font-bold">example.com</p>
              <p className="text-sm text-fail">Breaks 2 of your 4 rules</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>✗ Never sell my data</li>
            <li>✗ No tracking across other sites</li>
            <li>✓ I can delete my account</li>
            <li>✓ Don't train AI on my content</li>
          </ul>
        </div>
      </section>

      <section id="mobile" className="mt-24 grid items-center gap-10 sm:grid-cols-2">
        <div className="order-2 sm:order-1">
          <div className="panel mx-auto w-full max-w-xs space-y-3 !p-4 shadow-xl">
            <p className="flex items-center gap-2 text-sm font-semibold"><Clipboard className="size-4" /> Check WhatsApp from your clipboard?</p>
            <p className="flex items-center gap-2 text-sm font-semibold"><Share className="size-4" /> Share any app link to Undersigned</p>
            <p className="flex items-center gap-2 text-sm font-semibold"><Bell className="size-4" /> “TikTok now breaks 1 of your rules”</p>
          </div>
        </div>
        <div className="order-1 sm:order-2">
          <h2 className="text-4xl">Check apps before you install</h2>
          <p className="mt-3 muted">Copy any Play Store or App Store link and the app offers to check it. Get push alerts when apps you use change their policies. For iPhone and Android.</p>
          <div className="mt-6 max-w-sm">
            <p className="mb-2 text-sm font-semibold">Get notified at launch</p>
            <WaitlistForm source="download" />
          </div>
        </div>
      </section>
    </div>
  );
}
