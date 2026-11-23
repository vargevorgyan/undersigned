import { parseHTML } from "linkedom";
import { fetchHtml, IngestError, normalizeText } from "./fetch";

export type StoreApp = {
  kind: "android" | "ios";
  storeId: string;
  name: string;
  iconUrl: string | null;
  developerSite: string | null;
  policyUrl: string | null;
  /** Store-provided privacy label (Play "Data safety" / App Store "App Privacy"), tracked as its own document. */
  label: { url: string; text: string } | null;
};

export function parseStoreUrl(input: string): { kind: "android" | "ios"; storeId: string; country: string } | null {
  const url = new URL(input);
  if (url.hostname === "play.google.com" && url.pathname.startsWith("/store/apps/")) {
    const id = url.searchParams.get("id");
    return id ? { kind: "android", storeId: id, country: "us" } : null;
  }
  if (url.hostname === "apps.apple.com" || url.hostname === "itunes.apple.com") {
    const m = url.pathname.match(/^\/(?:([a-z]{2})\/)?app\/(?:[^/]+\/)?id(\d+)/);
    return m ? { kind: "ios", storeId: m[2]!, country: m[1] ?? "us" } : null;
  }
  return null;
}

function meta(document: Document, prop: string) {
  return document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`)?.getAttribute("content") ?? null;
}

function externalPolicyLink(document: Document, baseUrl: string, storeHosts: RegExp) {
  for (const a of document.querySelectorAll("a[href]")) {
    const text = `${a.textContent ?? ""} ${a.getAttribute("aria-label") ?? ""}`;
    if (!/privacy policy/i.test(text)) continue;
    try {
      const href = new URL(a.getAttribute("href")!, baseUrl);
      if (!storeHosts.test(href.hostname)) return href.toString();
    } catch {}
  }
  return null;
}

function sliceSection(text: string, start: RegExp, maxChars: number) {
  const idx = text.search(start);
  return idx === -1 ? "" : text.slice(idx, idx + maxChars);
}

async function fetchPlay(storeId: string): Promise<StoreApp> {
  const detailsUrl = `https://play.google.com/store/apps/details?id=${encodeURIComponent(storeId)}&hl=en&gl=US`;
  const { html } = await fetchHtml(detailsUrl);
  const { document } = parseHTML(html);
  const doc = document as unknown as Document;
  const name = (meta(doc, "og:title") ?? storeId).replace(/ - Apps on Google Play$/, "");
  const policyUrl = externalPolicyLink(doc, detailsUrl, /(^|\.)google\.com$/);

  const labelUrl = `https://play.google.com/store/apps/datasafety?id=${encodeURIComponent(storeId)}&hl=en&gl=US`;
  let label: StoreApp["label"] = null;
  try {
    const ds = await fetchHtml(labelUrl);
    const body = normalizeText(parseHTML(ds.html).document.body?.textContent ?? "");
    const text = sliceSection(body, /Data safety/i, 6000);
    if (text.length > 200) label = { url: labelUrl, text };
  } catch {}

  const devSite = [...document.querySelectorAll("a[href]")]
    .map((a) => a.getAttribute("href") ?? "")
    .find((h) => /^https?:/.test(h) && !/google\.com|goo\.gl|youtube\.com/.test(h));
  return { kind: "android", storeId, name, iconUrl: meta(doc, "og:image"), developerSite: devSite ?? null, policyUrl, label };
}

async function fetchAppStore(storeId: string, country: string): Promise<StoreApp> {
  const pageUrl = `https://apps.apple.com/${country}/app/id${storeId}`;
  const { html, finalUrl } = await fetchHtml(pageUrl);
  const { document } = parseHTML(html);
  const doc = document as unknown as Document;
  const name = (meta(doc, "og:title") ?? `App ${storeId}`).replace(/( App)? [-–] App Store$| (on|in) the App Store$/, "");
  const policyUrl = externalPolicyLink(doc, finalUrl, /(^|\.)apple\.com$/);
  const body = normalizeText(document.body?.textContent ?? "");
  const text = sliceSection(body, /App Privacy/i, 4000);
  const label = text.length > 150 ? { url: `${finalUrl.split("?")[0]}#privacy`, text } : null;
  return { kind: "ios", storeId, name, iconUrl: meta(doc, "og:image"), developerSite: null, policyUrl, label };
}

export async function fetchStoreApp(input: string): Promise<StoreApp> {
  const parsed = parseStoreUrl(input);
  if (!parsed) throw new IngestError("not a store url", "That isn't a Google Play or App Store app link.");
  const app = parsed.kind === "android" ? await fetchPlay(parsed.storeId) : await fetchAppStore(parsed.storeId, parsed.country);
  if (!app.policyUrl && !app.label) {
    throw new IngestError(`no policy for ${input}`, "This app doesn't list a privacy policy or privacy label in the store.");
  }
  return app;
}
