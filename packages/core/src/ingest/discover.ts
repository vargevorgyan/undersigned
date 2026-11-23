import type { PolicyAnalysis } from "../analyze/schema";
import { extractPage, fetchHtml, hostnameOf, IngestError } from "./fetch";

type DocType = PolicyAnalysis["documentType"];

const PATTERNS: { type: DocType; href: RegExp; text: RegExp }[] = [
  { type: "privacy", href: /privacy|datenschutz|confidentialit/i, text: /privacy|data (policy|protection)|datenschutz/i },
  { type: "terms", href: /terms|tos|conditions|legal\/user|user-agreement|eula/i, text: /terms|conditions|user agreement|eula/i },
];

/** Classifies a URL by its path/title alone. */
export function guessDocType(url: string, title = ""): DocType | null {
  const hay = `${new URL(url).pathname} ${title}`;
  for (const p of PATTERNS) if (p.href.test(hay) || p.text.test(title)) return p.type;
  if (/cookie/i.test(hay)) return "cookies";
  return null;
}

export type PolicyLink = { url: string; type: DocType };

/** Finds privacy/terms links on a page, preferring same-site links and footer-like text. */
export function findPolicyLinks(links: { href: string; text: string }[], baseUrl: string): PolicyLink[] {
  const baseHost = hostnameOf(baseUrl);
  const site = baseHost.split(".").slice(-2).join(".");
  const found = new Map<DocType, { url: string; score: number }>();
  for (const link of links) {
    if (!/^https?:/.test(link.href)) continue;
    const host = hostnameOf(link.href);
    for (const p of PATTERNS) {
      const textHit = p.text.test(link.text);
      const hrefHit = p.href.test(new URL(link.href).pathname);
      if (!textHit && !hrefHit) continue;
      let score = (textHit ? 2 : 0) + (hrefHit ? 1 : 0);
      if (host.endsWith(site)) score += 2;
      if (link.text.length > 40) score -= 2;
      const prev = found.get(p.type);
      if (!prev || score > prev.score) found.set(p.type, { url: link.href.split("#")[0]!, score });
    }
  }
  return [...found.entries()].map(([type, v]) => ({ type, url: v.url }));
}

/** Policies for popular sites whose homepages render links with JavaScript or live on another domain. */
const KNOWN: Record<string, PolicyLink[]> = {
  "tiktok.com": [
    { type: "privacy", url: "https://www.tiktok.com/legal/page/us/privacy-policy/en" },
    { type: "terms", url: "https://www.tiktok.com/legal/page/us/terms-of-service/en" },
  ],
  "reddit.com": [
    { type: "privacy", url: "https://www.reddit.com/policies/privacy-policy" },
    { type: "terms", url: "https://redditinc.com/policies/user-agreement" },
  ],
  "spotify.com": [
    { type: "privacy", url: "https://www.spotify.com/us/legal/privacy-policy/" },
    { type: "terms", url: "https://www.spotify.com/us/legal/end-user-agreement/" },
  ],
  "x.com": [
    { type: "privacy", url: "https://x.com/en/privacy" },
    { type: "terms", url: "https://x.com/en/tos" },
  ],
  "instagram.com": [
    { type: "privacy", url: "https://privacycenter.instagram.com/policy" },
    { type: "terms", url: "https://help.instagram.com/581066165581870" },
  ],
  "facebook.com": [
    { type: "privacy", url: "https://www.facebook.com/privacy/policy/" },
    { type: "terms", url: "https://www.facebook.com/legal/terms" },
  ],
  "netflix.com": [
    { type: "privacy", url: "https://help.netflix.com/legal/privacy" },
    { type: "terms", url: "https://help.netflix.com/legal/termsofuse" },
  ],
  "amazon.com": [
    { type: "privacy", url: "https://www.amazon.com/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ" },
    { type: "terms", url: "https://www.amazon.com/gp/help/customer/display.html?nodeId=GLSBYFE9MGKKQXXM" },
  ],
  "linkedin.com": [
    { type: "privacy", url: "https://www.linkedin.com/legal/privacy-policy" },
    { type: "terms", url: "https://www.linkedin.com/legal/user-agreement" },
  ],
  "paypal.com": [
    { type: "privacy", url: "https://www.paypal.com/us/legalhub/paypal/privacy-full" },
    { type: "terms", url: "https://www.paypal.com/us/legalhub/paypal/useragreement-full" },
  ],
  "etsy.com": [
    { type: "privacy", url: "https://www.etsy.com/legal/privacy" },
    { type: "terms", url: "https://www.etsy.com/legal/terms-of-use" },
  ],
  "google.com": [
    { type: "privacy", url: "https://policies.google.com/privacy?hl=en" },
    { type: "terms", url: "https://policies.google.com/terms?hl=en" },
  ],
  "youtube.com": [
    { type: "privacy", url: "https://policies.google.com/privacy?hl=en" },
    { type: "terms", url: "https://www.youtube.com/static?template=terms" },
  ],
};

const KNOWN_NAMES: Record<string, string> = {
  "tiktok.com": "TikTok", "reddit.com": "Reddit", "spotify.com": "Spotify", "x.com": "X (Twitter)", "instagram.com": "Instagram",
  "facebook.com": "Facebook", "netflix.com": "Netflix", "amazon.com": "Amazon", "linkedin.com": "LinkedIn", "google.com": "Google",
  "youtube.com": "YouTube", "duckduckgo.com": "DuckDuckGo", "github.com": "GitHub", "whatsapp.com": "WhatsApp", "paypal.com": "PayPal",
  "ebay.com": "eBay", "openai.com": "OpenAI", "chatgpt.com": "ChatGPT",
};

export function knownName(host: string): string | null {
  return KNOWN_NAMES[host.replace(/^www\./, "").split(".").slice(-2).join(".")] ?? null;
}

export function knownPolicies(host: string): PolicyLink[] | null {
  const parts = host.replace(/^www\./, "").split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const hit = KNOWN[parts.slice(i).join(".")];
    if (hit) return hit;
  }
  return null;
}

const COMMON_PATHS: Record<"privacy" | "terms", string[]> = {
  privacy: ["/privacy", "/privacy-policy", "/legal/privacy", "/legal/privacy-policy", "/policies/privacy", "/about/privacy"],
  terms: ["/terms", "/terms-of-service", "/terms-of-use", "/legal/terms", "/legal/terms-of-service", "/tos"],
};

/** Last resort: probe conventional policy paths when the homepage has no usable links. */
async function probeCommonPaths(origin: string): Promise<PolicyLink[]> {
  const found: PolicyLink[] = [];
  for (const type of ["privacy", "terms"] as const) {
    const attempts = COMMON_PATHS[type].map(async (p) => {
      const { html, finalUrl } = await fetchHtml(new URL(p, origin).toString(), 8000);
      const page = extractPage(html, finalUrl);
      if (page.text.length < 1500 || guessDocType(finalUrl, page.title) !== type) throw new Error("not a policy");
      return finalUrl;
    });
    const url = await Promise.any(attempts).catch(() => null);
    if (url) found.push({ type, url });
  }
  return found;
}

/** For a homepage URL, returns the policy documents to analyze. */
export async function discoverPolicies(siteUrl: string): Promise<PolicyLink[]> {
  const known = knownPolicies(hostnameOf(siteUrl));
  if (known) return known;
  let links: PolicyLink[] = [];
  let origin = new URL(siteUrl).origin;
  try {
    const { html, finalUrl } = await fetchHtml(siteUrl);
    origin = new URL(finalUrl).origin;
    links = findPolicyLinks(extractPage(html, finalUrl).links, finalUrl);
  } catch {}
  if (links.length === 0) links = await probeCommonPaths(origin);
  if (links.length === 0) {
    throw new IngestError(
      `no policy links on ${siteUrl}`,
      "We couldn't find a privacy policy or terms link on that page. Try pasting the policy link directly.",
    );
  }
  return links;
}
