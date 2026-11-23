import { Check, CircleHelp, X } from "lucide-react";
import type { RuleStatus } from "@privacy-radar/core/rules";
import type { Severity } from "@privacy-radar/core/schema";
import { GRADE_COLORS, gradeLabel } from "@/lib/format";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Grade letter on a tinted tile; the ring carries the grade color so it survives both themes. */
export function GradeBadge({ grade, className }: { grade: string | null | undefined; className?: string }) {
  const color = grade ? GRADE_COLORS[grade] : "#8a93a3";
  return (
    <span
      className={cx("inline-grid shrink-0 place-items-center rounded-md font-semibold leading-none", className ?? "size-10 text-xl")}
      style={{ background: color, color: "#fff" }}
      aria-label={`Grade ${grade ?? "unknown"}: ${gradeLabel(grade)}`}
    >
      {grade ?? "?"}
    </span>
  );
}

const STATUS_STYLE: Record<RuleStatus, { icon: typeof Check; color: string; label: string }> = {
  pass: { icon: Check, color: "var(--color-pass)", label: "Meets rule" },
  fail: { icon: X, color: "var(--color-fail)", label: "Breaks rule" },
  unclear: { icon: CircleHelp, color: "var(--color-unclear)", label: "Unclear" },
};

export function StatusIcon({ status, className }: { status: RuleStatus; className?: string }) {
  const s = STATUS_STYLE[status];
  const Icon = s.icon;
  return (
    <span className={cx("inline-grid shrink-0 place-items-center", className ?? "size-5")} style={{ color: s.color }} role="img" aria-label={s.label} title={s.label}>
      <Icon className="size-full" strokeWidth={2.75} aria-hidden />
    </span>
  );
}

const SEVERITY_MARK: Record<Severity, string> = { bad: "mark-bad", caution: "mark-caution", good: "mark-good", neutral: "mark-neutral" };
const STATUS_MARK: Record<RuleStatus, string> = { fail: "mark-bad", unclear: "mark-caution", pass: "mark-good" };

/** A company's own words: serif italic, highlighted in the color of what it means for the reader. */
export function Quote({ text, tone, className }: { text: string; tone?: Severity | RuleStatus; className?: string }) {
  if (!text) return null;
  const markClass = tone ? (SEVERITY_MARK[tone as Severity] ?? STATUS_MARK[tone as RuleStatus]) : "mark-neutral";
  return (
    <p className={cx("fine-print mt-2", className)}>
      <span className={cx("mark", markClass)}>“{text}”</span>
    </p>
  );
}

export function ServiceIcon({ src, name, className }: { src: string | null | undefined; name: string; className?: string }) {
  if (!src) {
    return (
      <span className={cx("surface-2 inline-grid shrink-0 place-items-center rounded-lg font-bold", className ?? "size-10")} aria-hidden>
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={40} height={40} className={cx("shrink-0 rounded-lg object-cover", className ?? "size-10")} loading="lazy" />;
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="text-xl">{children}</h2>
      {hint ? <div className="text-sm muted">{hint}</div> : null}
    </div>
  );
}

/** The mark: a pen nib whose breather hole is an eye. We read it before you sign. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className ?? "size-7"} aria-hidden>
      <rect width="64" height="64" rx="14" fill="var(--text)" />
      <path d="M22.5 8h19c0 5.5 5.5 10.5 5.5 18 0 7.5-6.5 16.5-15 31-8.5-14.5-15-23.5-15-31 0-7.5 5.5-12.5 5.5-18z" fill="var(--bg)" />
      <path d="M23.5 27.5c4.6-6.4 12.4-6.4 17 0-4.6 6.4-12.4 6.4-17 0z" fill="var(--text)" />
      <circle cx="32" cy="27.5" r="3.6" fill="#f0c04f" />
      <circle cx="32" cy="27.5" r="1.5" fill="var(--text)" />
      <circle cx="33.3" cy="26.2" r=".75" fill="var(--bg)" />
      <path d="M32 34.5v20" stroke="var(--text)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
