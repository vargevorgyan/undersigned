import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { UpgradeButton } from "@/components/upgrade-button";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Pricing", description: "Reports are free. Pro adds unlimited watching, custom rules and daily checks for $4 a month." };

const FREE = ["Unlimited reports and summaries", "All 12 quick rules", "3 rules in your own words", "Watch 3 services", "Weekly checks with email alerts", "Browser extension"];
const PRO = ["Everything in Free", "Unlimited rules in your own words", "Watch as many services as you like", "Daily checks", "Instant push alerts on your phone", "Check any new document on demand"];

function Plan({ name, price, per, items, children, featured }: { name: string; price: string; per: string; items: string[]; children: React.ReactNode; featured?: boolean }) {
  return (
    <div className={featured ? "rounded-2xl border-2 border-[var(--text)] bg-[var(--surface)] p-7" : "rounded-2xl border bg-[var(--surface)] p-7"}>
      <h2 className="text-xl">{name}</h2>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="tabular text-5xl font-semibold">{price}</span>
        <span className="muted">{per}</span>
      </p>
      <ul className="mt-6 space-y-2.5">
        {items.map((f) => (
          <li key={f} className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-pass" strokeWidth={3} aria-hidden /> {f}
          </li>
        ))}
      </ul>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export default async function Pricing() {
  const user = await currentUser();
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
      <h1 className="max-w-xl text-4xl sm:text-5xl">Reading the fine print is free. Watching it costs $4.</h1>
      <p className="mt-4 max-w-xl text-[17px] muted">Every report and rule check is free for everyone. Pro is for people who want their services watched every day.</p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Plan name="Free" price="$0" per="forever" items={FREE}>
          <Link href={user ? "/dashboard" : "/signup"} className="btn btn-quiet w-full">{user ? "Go to your dashboard" : "Create a free account"}</Link>
        </Plan>
        <Plan name="Pro" price="$4" per="a month, cancel anytime" items={PRO} featured>
          {user?.plan === "pro" ? <p className="btn btn-quiet w-full">You're on Pro</p> : <UpgradeButton signedIn={Boolean(user)} />}
        </Plan>
      </div>
      <p className="mt-10 muted">Monitoring vendor policies for a team? <a href="mailto:hello@undersigned.app" className="link">Email us</a>.</p>
    </div>
  );
}
