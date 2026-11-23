"use client";

import { ArrowUpRight, X as Close } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { RuleStatus } from "@privacy-radar/core/rules";
import { cx, GradeBadge, Quote, ServiceIcon, StatusIcon } from "./ui";

export type VendorRow = {
  slug: string;
  name: string;
  iconUrl: string | null;
  grade: string | null;
  docs: number;
  cells: Record<string, { status: RuleStatus; quote: string }>;
  risk: { score: number; level: "High" | "Elevated" | "Moderate" | "Low"; high: number };
};

const LEVEL_STYLE: Record<VendorRow["risk"]["level"], string> = {
  High: "bg-fail text-white",
  Elevated: "bg-[color-mix(in_oklab,var(--color-fail)_18%,transparent)] text-fail",
  Moderate: "bg-[color-mix(in_oklab,var(--color-unclear)_18%,transparent)] text-unclear",
  Low: "bg-[color-mix(in_oklab,var(--color-pass)_16%,transparent)] text-pass",
};

type Rule = { id: string; label: string };

const CELL_BG: Record<RuleStatus, string> = {
  fail: "bg-[color-mix(in_oklab,var(--color-fail)_16%,transparent)]",
  unclear: "bg-[color-mix(in_oklab,var(--color-unclear)_14%,transparent)]",
  pass: "bg-[color-mix(in_oklab,var(--color-pass)_14%,transparent)]",
};
const STATUS_TEXT: Record<RuleStatus, string> = { fail: "Breaks the rule", unclear: "Needs review", pass: "Meets the rule" };
const STARTING_RULES = ["no-ai-training", "no-selling", "can-delete", "notify-changes", "no-arbitration"];

export function TeamsMatrix({ rows, rules }: { rows: VendorRow[]; rules: Rule[] }) {
  const [active, setActive] = useState(STARTING_RULES);
  const [open, setOpen] = useState<{ vendor: VendorRow; rule: Rule } | null>(null);
  const columns = rules.filter((r) => active.includes(r.id));

  const stats = useMemo(() => {
    const count = (row: VendorRow, s: RuleStatus) => columns.filter((c) => row.cells[c.id]?.status === s).length;
    const scored = rows
      .map((row) => ({ row, fails: count(row, "fail"), unclear: count(row, "unclear") }))
      .sort((a, b) => b.row.risk.score - a.row.risk.score || b.fails - a.fails || a.row.name.localeCompare(b.row.name));
    return {
      scored,
      breaking: scored.filter((s) => s.fails > 0).length,
      toReview: scored.reduce((n, s) => n + s.unclear, 0),
    };
  }, [rows, columns]);

  function toggle(id: string) {
    setActive((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  if (rows.length === 0) return <p className="muted">No vendors analyzed yet. Run the seed script to load demo data.</p>;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel !p-5"><p className="label">Vendors monitored</p><p className="tabular mt-1 text-4xl font-semibold">{rows.length}</p></div>
        <div className="panel !p-5"><p className="label">Break at least one rule</p><p className="tabular mt-1 text-4xl font-semibold text-fail">{stats.breaking}</p></div>
        <div className="panel !p-5"><p className="label">Clauses that need a human</p><p className="tabular mt-1 text-4xl font-semibold text-unclear">{stats.toReview}</p></div>
      </div>

      <div className="mt-8">
        <p className="font-semibold">Your company rules</p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Company rules">
          {rules.map((r) => {
            const pressed = active.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => toggle(r.id)}
                className={cx(
                  "rounded-full border px-3 py-1.5 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-95",
                  pressed ? "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]" : "bg-[var(--surface)] hover:border-[var(--text)]",
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-[var(--surface)]">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 z-10 bg-[var(--surface)] p-4 text-sm font-semibold">Vendor</th>
              <th className="p-3 align-bottom text-[13px] font-semibold leading-tight muted">Business risk</th>
              {columns.map((c) => (
                <th key={c.id} className="p-3 align-bottom text-[13px] font-semibold leading-tight muted">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.scored.map(({ row, fails }) => (
              <tr key={row.slug} className="border-b last:border-0">
                <th scope="row" className="sticky left-0 z-10 bg-[var(--surface)] p-3 font-normal">
                  <Link href={`/s/${row.slug}`} className="flex items-center gap-3 hover:underline">
                    <ServiceIcon src={row.iconUrl} name={row.name} className="size-8" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{row.name}</span>
                      <span className="block text-xs muted">{fails ? `${fails} broken` : "No broken rules"}</span>
                    </span>
                    <GradeBadge grade={row.grade} className="ml-auto size-7 text-sm" />
                  </Link>
                </th>
                <td className="p-1.5">
                  <Link
                    href={`/teams/${row.slug}`}
                    className={cx("flex h-12 flex-col items-center justify-center rounded-lg px-2 text-center transition-transform hover:scale-[1.04]", LEVEL_STYLE[row.risk.level])}
                    aria-label={`${row.name}: ${row.risk.level} risk, score ${row.risk.score}. Open risk report`}
                  >
                    <span className="tabular text-base font-semibold leading-none">{row.risk.score}</span>
                    <span className="mt-0.5 text-[11px] font-bold leading-none">{row.risk.level}</span>
                  </Link>
                </td>
                {columns.map((c) => {
                  const cell = row.cells[c.id];
                  if (!cell) return <td key={c.id} />;
                  return (
                    <td key={c.id} className="p-1.5">
                      <button
                        type="button"
                        onClick={() => setOpen({ vendor: row, rule: c })}
                        className={cx("pop-in flex h-12 w-full items-center justify-center rounded-lg transition-[transform,box-shadow] hover:scale-[1.04] hover:shadow-md", CELL_BG[cell.status])}
                        aria-label={`${row.name}: ${c.label}: ${STATUS_TEXT[cell.status]}`}
                      >
                        <StatusIcon status={cell.status} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm muted">Live data from each vendor’s current privacy policy and terms. Click a risk score for the full risk report, or any cell to see the clause.</p>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setOpen(null)} role="dialog" aria-modal aria-label={`${open.vendor.name}: ${open.rule.label}`}>
          <div className="pop-in h-full w-full max-w-md overflow-y-auto overscroll-contain bg-[var(--surface)] p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <ServiceIcon src={open.vendor.iconUrl} name={open.vendor.name} />
                <p className="text-xl font-bold">{open.vendor.name}</p>
              </div>
              <button onClick={() => setOpen(null)} aria-label="Close" className="rounded-md p-1.5 hover:bg-[var(--surface-2)]">
                <Close className="size-5" aria-hidden />
              </button>
            </div>
            <p className="label mt-6">Company rule</p>
            <p className="mt-1 text-lg font-semibold">{open.rule.label}</p>
            <p className="mt-4 flex items-center gap-2 font-semibold">
              <StatusIcon status={open.vendor.cells[open.rule.id]!.status} /> {STATUS_TEXT[open.vendor.cells[open.rule.id]!.status]}
            </p>
            {open.vendor.cells[open.rule.id]!.quote ? (
              <>
                <p className="label mt-6">The clause</p>
                <Quote text={open.vendor.cells[open.rule.id]!.quote} tone={open.vendor.cells[open.rule.id]!.status} />
              </>
            ) : (
              <p className="mt-6 muted">The vendor’s documents don’t address this. Ask them in your next security review.</p>
            )}
            <Link href={`/s/${open.vendor.slug}`} className="btn btn-ink mt-8 w-full">
              Open the full report <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
