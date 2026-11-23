import type { ButtonHTMLAttributes, ReactNode } from "react";
import { GRADES } from "@/lib/grades";
import type { Grade, Highlight, RuleResult, RuleStatus, Verdict } from "@/lib/types";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { block?: boolean };

const cls = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ");

// Separate components per style instead of a variant prop.
export const PrimaryButton = ({ block, className, ...p }: BtnProps) => <button {...p} className={cls("btn btn-primary", block && "btn-block", className)} />;
export const SecondaryButton = ({ block, className, ...p }: BtnProps) => <button {...p} className={cls("btn btn-secondary", block && "btn-block", className)} />;
export const GhostButton = ({ block, className, ...p }: BtnProps) => <button {...p} className={cls("btn btn-ghost", block && "btn-block", className)} />;

export const Card = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cls("card", className)}>{children}</div>;
export const Spinner = () => <div className="spinner" role="status" aria-label="Loading" />;
export const ErrorBox = ({ children }: { children: ReactNode }) => <div className="error" role="alert">{children}</div>;

export function Logo({ size = 22 }: { size?: number }) {
  // A pen nib whose breather hole is an eye: we read it before you sign.
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="14" fill="var(--ink)" />
      <path d="M22.5 8h19c0 5.5 5.5 10.5 5.5 18 0 7.5-6.5 16.5-15 31-8.5-14.5-15-23.5-15-31 0-7.5 5.5-12.5 5.5-18z" fill="var(--bg)" />
      <path d="M23.5 27.5c4.6-6.4 12.4-6.4 17 0-4.6 6.4-12.4 6.4-17 0z" fill="var(--ink)" />
      <circle cx="32" cy="27.5" r="3.6" fill="#f0c04f" />
      <circle cx="32" cy="27.5" r="1.5" fill="var(--ink)" />
      <circle cx="33.3" cy="26.2" r=".75" fill="var(--bg)" />
      <path d="M32 34.5v20" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const SearchIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export function GradeBadge({ grade, small }: { grade: Grade; small?: boolean }) {
  return (
    <div className={cls("grade", small && "grade-sm")} style={{ background: GRADES[grade].color }} aria-label={`Grade ${grade}: ${GRADES[grade].label}`}>
      {grade}
    </div>
  );
}

const STATUS_MARK: Record<RuleStatus, string> = { pass: "✓", fail: "✕", unclear: "?" };

export function StatusIcon({ status }: { status: RuleStatus }) {
  return (
    <span className={`status-icon status-${status}`} aria-label={status}>
      {STATUS_MARK[status]}
    </span>
  );
}

export function verdictText(v: Verdict) {
  const total = v.results.length;
  if (v.status === "violation") return { cls: "verdict-bad", text: `Breaks ${v.failed} of your ${total} rules` };
  if (v.status === "warning") return { cls: "verdict-warn", text: `${v.unclear} of your rules ${v.unclear === 1 ? "is" : "are"} unclear` };
  if (v.status === "ok") return { cls: "verdict-good", text: `Meets all your ${total} rules` };
  return { cls: "verdict-none", text: "Pick your rules to get a personal verdict" };
}

const VERDICT_ICON: Record<Verdict["status"], RuleStatus> = { violation: "fail", ok: "pass", warning: "unclear", none: "unclear" };

export function VerdictLine({ verdict, onClick }: { verdict: Verdict; onClick?: () => void }) {
  const { cls: c, text } = verdictText(verdict);
  return (
    <div className={`verdict ${c}`} onClick={onClick} role={onClick ? "button" : undefined} style={onClick ? { cursor: "pointer" } : undefined}>
      <StatusIcon status={VERDICT_ICON[verdict.status]} />
      <span>{text}</span>
    </div>
  );
}

export function RuleRow({ r }: { r: RuleResult }) {
  return (
    <div className="rule">
      <StatusIcon status={r.status} />
      <div className="grow">
        <div style={{ fontWeight: 600 }}>{r.label}</div>
        {r.status !== "pass" && <div className="small muted">{r.reason}</div>}
      </div>
    </div>
  );
}

export function HighlightRow({ h }: { h: Highlight }) {
  return (
    <div className="row" style={{ alignItems: "flex-start" }}>
      <span className={`sev sev-${h.severity}`} />
      <div className="grow">
        <div style={{ fontWeight: 600 }}>{h.title}</div>
        <div className="small muted">{h.explanation}</div>
      </div>
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={cls("toggle", on && "toggle-on")} onClick={() => onChange(!on)} />;
}
