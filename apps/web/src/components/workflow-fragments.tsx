import { Check, CircleHelp, X } from "lucide-react";
import { cx } from "./ui";

/** Small pieces of the real interface for "How it works". Sample content is labelled as such. */

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative rounded-lg border bg-[var(--surface)] p-4 text-[14px]">
      <p className="data muted mb-3">{label}</p>
      {children}
    </div>
  );
}

export function PasteFragment() {
  return (
    <Frame label="Sample">
      <div className="data truncate rounded-md border bg-[var(--bg)] px-3 py-2 text-[var(--text)]">play.google.com/store/apps/details?id=com.whatsapp</div>
      <ul className="mt-3 space-y-1.5">
        {["Privacy policy found", "Terms of service found", "Play Store data safety label read"].map((t) => (
          <li key={t} className="flex items-center gap-2">
            <Check className="size-3.5 text-pass" strokeWidth={2.5} aria-hidden /> {t}
          </li>
        ))}
      </ul>
    </Frame>
  );
}

const ROWS = [
  { rule: "Don’t sell my data", status: "pass" as const, text: "Meets" },
  { rule: "Keep my right to go to court", status: "fail" as const, text: "Breaks" },
  { rule: "Don’t train AI on my content", status: "unclear" as const, text: "Unclear" },
];
const ICON = { pass: Check, fail: X, unclear: CircleHelp };
const TONE = { pass: "text-pass", fail: "text-fail", unclear: "text-unclear" };

export function VerdictFragment() {
  return (
    <Frame label="Sample">
      <ul className="divide-y">
        {ROWS.map((r) => {
          const Icon = ICON[r.status];
          return (
            <li key={r.rule} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
              <span className="flex-1">{r.rule}</span>
              <span className={cx("flex items-center gap-1 text-[13px] font-medium", TONE[r.status])}>
                <Icon className="size-3.5" strokeWidth={2.5} aria-hidden /> {r.text}
              </span>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}

export function AlertFragment() {
  return (
    <Frame label="Sample alert">
      <p className="font-medium">Terms of Service changed</p>
      <div className="mt-2 space-y-1 font-serif text-[15px] leading-snug">
        <p className="rounded-sm bg-[var(--mark-bad)] px-1.5 py-0.5 line-through decoration-1">You may opt out of arbitration within 30 days.</p>
        <p className="rounded-sm bg-[var(--mark-neutral)] px-1.5 py-0.5">All disputes are resolved by binding arbitration.</p>
      </div>
      <p className="mt-2.5 flex items-center gap-1.5 text-[13px] font-medium text-fail">
        <X className="size-3.5" strokeWidth={2.5} aria-hidden /> Now breaks: Keep my right to go to court
      </p>
    </Frame>
  );
}
