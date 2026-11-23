import type { CatalogEntry, Grade } from "./types";

export const GRADES: Record<Grade, { label: string; color: string }> = {
  A: { label: "Respects you", color: "#1f8f4e" },
  B: { label: "Mostly fair", color: "#5e9a1f" },
  C: { label: "Mixed", color: "#b98500" },
  D: { label: "Invasive", color: "#d4601c" },
  E: { label: "Very invasive", color: "#c8372d" },
};

export const ACCENT = "#141518";

export function hostOf(url: string | undefined): string | null {
  if (!url || !/^https?:/.test(url)) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** App-store listing pages are about the app, not the store, so skip the store's own grade. */
export function isStorePage(url: string | undefined) {
  if (!url) return false;
  return /^https:\/\/play\.google\.com\/store\/apps\/details/.test(url) || /^https:\/\/apps\.apple\.com\/([a-z]{2}\/)?app\//.test(url);
}

/** Same slug rule as the server for website services (github.com → github-com). */
export const slugForHost = (host: string) => host.toLowerCase().replace(/[\s._]+/g, "-").replace(/[^\w-]/g, "");

/** Local lookup: exact host, then parent domains (mail.google.com → google.com). */
export function lookupHost(host: string, services: CatalogEntry[]): CatalogEntry | null {
  const byDomain = new Map(services.map((s) => [s.domain.replace(/^www\./, ""), s]));
  const parts = host.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const hit = byDomain.get(parts.slice(i).join("."));
    if (hit) return hit;
  }
  return null;
}
