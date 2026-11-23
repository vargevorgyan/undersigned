import { createHash } from "node:crypto";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

const UA = "Mozilla/5.0 (compatible; UndersignedBot/1.0; +https://undersigned.app/bot)";
const MAX_BYTES = 3_000_000;

export class IngestError extends Error {
  constructor(
    message: string,
    public userMessage: string,
  ) {
    super(message);
  }
}

export async function fetchHtml(url: string, timeoutMs = 20_000): Promise<{ html: string; finalUrl: string }> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml", "accept-language": "en-US,en;q=0.9" },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    throw new IngestError(`fetch failed: ${String(err)}`, "We couldn't reach that page. Check the link and try again.");
  }
  if (!res.ok) throw new IngestError(`HTTP ${res.status} for ${url}`, `That page returned an error (${res.status}).`);
  const type = res.headers.get("content-type") ?? "";
  if (type && !type.includes("html") && !type.includes("text/plain")) {
    throw new IngestError(`unsupported content-type ${type}`, "That link isn't a web page we can read (PDFs aren't supported yet).");
  }
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) throw new IngestError("page too large", "That page is too large to analyze.");
  return { html: new TextDecoder().decode(buf), finalUrl: res.url || url };
}

export type ExtractedPage = { title: string; siteName: string | null; text: string; links: { href: string; text: string }[] };

export function extractPage(html: string, baseUrl: string): ExtractedPage {
  const { document } = parseHTML(html);
  const links = [...document.querySelectorAll("a[href]")].flatMap((a) => {
    try {
      return [{ href: new URL(a.getAttribute("href") ?? "", baseUrl).toString(), text: (a.textContent ?? "").trim() }];
    } catch {
      return [];
    }
  });
  const title = (document.querySelector("title")?.textContent ?? "").trim();
  const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute("content")?.trim() || null;
  // Readability mutates the DOM, so links are collected first.
  const article = new Readability(document as unknown as Document, { charThreshold: 300 }).parse();
  const raw = article?.textContent || document.body?.textContent || "";
  return { title: article?.title || title, siteName: siteName || article?.siteName || null, text: normalizeText(raw), links };
}

export function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t ]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

/** Hash ignoring cosmetic noise (dates, whitespace, case) so trivial edits don't trigger alerts. */
export function contentHash(text: string) {
  const stable = text
    .toLowerCase()
    .replace(/\b(last )?(updated|modified|effective)[^\n]{0,40}\d{4}/g, "")
    .replace(/\s+/g, " ");
  return createHash("sha256").update(stable).digest("hex");
}

export function hostnameOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

export function normalizeInputUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new IngestError("empty url", "Paste a link to a website, app or policy.");
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withProto);
  } catch {
    throw new IngestError("invalid url", "That doesn't look like a valid link.");
  }
  if (!url.hostname.includes(".") && process.env.ALLOW_PRIVATE_HOSTS !== "1") throw new IngestError("invalid host", "That doesn't look like a valid link.");
  if (isPrivateHost(url.hostname) && process.env.ALLOW_PRIVATE_HOSTS !== "1") throw new IngestError("private host", "We can only analyze public websites.");
  url.hash = "";
  return url.toString();
}

/** Basic SSRF guard: refuse obvious local/private targets. */
function isPrivateHost(host: string) {
  return (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host) ||
    host === "0.0.0.0" ||
    host.startsWith("[")
  );
}
