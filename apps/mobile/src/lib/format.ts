export function timeAgo(iso: string | null | undefined) {
  if (!iso) return 'never';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function timeUntil(iso: string | null | undefined) {
  if (!iso) return null;
  const s = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  if (s <= 0) return 'soon';
  const h = Math.round(s / 3600);
  if (h < 24) return `in ${Math.max(1, h)}h`;
  return `in ${Math.round(h / 24)}d`;
}

const titleCase = (s: string) => s.replace(/[-_.]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();

/** Finds a checkable link in arbitrary text and gives it a human label ("WhatsApp", "tiktok.com"). */
export function detectLink(text: string | null | undefined): { url: string; label: string } | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s<>"']+/i) ?? text.trim().match(/^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?$/i);
  if (!match) return null;
  const raw = match[0].replace(/[).,]+$/, '');
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(url);
    if (u.hostname === 'play.google.com') {
      const id = u.searchParams.get('id');
      if (!id) return null;
      return { url, label: titleCase(id.split('.').pop() ?? id) };
    }
    if (u.hostname === 'apps.apple.com') {
      const name = u.pathname.match(/\/app\/([^/]+)\/id\d+/)?.[1];
      return { url, label: name ? titleCase(decodeURIComponent(name)) : 'this app' };
    }
    return { url, label: u.hostname.replace(/^www\./, '') };
  } catch {
    return null;
  }
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
