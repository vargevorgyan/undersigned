import { GRADE_INFO, type Verdict } from "@privacy-radar/core/rules";

export const GRADE_COLORS: Record<string, string> = { A: "#1f8a55", B: "#5e9a1f", C: "#b98500", D: "#d4601c", E: "#c8372d" };

export function gradeLabel(grade: string | null | undefined) {
  return grade ? GRADE_INFO[grade as keyof typeof GRADE_INFO]?.label ?? "" : "Not graded";
}

export function timeAgo(date: Date | string | null | undefined) {
  if (!date) return "never";
  const s = Math.round((Date.now() - new Date(date).getTime()) / 1000);
  const abs = Math.abs(s);
  const units: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, name] of units) {
    if (abs >= secs) {
      const n = Math.floor(abs / secs);
      const label = `${n} ${name}${n > 1 ? "s" : ""}`;
      return s >= 0 ? `${label} ago` : `in ${label}`;
    }
  }
  return "just now";
}

export function verdictHeadline(v: Verdict) {
  const total = v.results.length;
  if (v.status === "none") return "Pick a few rules to get a personal verdict";
  if (v.status === "violation") return `Breaks ${v.failed} of your ${total} rules`;
  if (v.status === "warning") return `No broken rules, ${v.unclear} unclear`;
  return `Meets all ${total} of your rules`;
}

export const DOC_LABELS: Record<string, string> = {
  privacy: "Privacy policy",
  terms: "Terms of service",
  cookies: "Cookie policy",
  app_privacy_label: "Store privacy label",
  other: "Document",
};

export const KIND_LABELS: Record<string, string> = { website: "Website", android: "Android app", ios: "iPhone app" };
