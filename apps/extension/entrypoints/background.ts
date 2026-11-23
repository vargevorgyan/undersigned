import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";
import { api } from "@/lib/api";
import { ACCENT, GRADES, hostOf, isStorePage, lookupHost } from "@/lib/grades";
import { apiBase, catalogItem, seenAlertsItem, tokenItem, unreadItem } from "@/lib/store";

const CATALOG_MINUTES = 12 * 60;
const ALERTS_MINUTES = 3 * 60;

async function refreshCatalog() {
  try {
    const { services } = await api.catalog();
    await catalogItem.setValue({ services, fetchedAt: Date.now() });
  } catch {
    // Offline or server down: keep the cached catalog.
  }
}

/** Badge is computed on-device from the cached catalog; the visited URL never leaves the browser. */
async function updateBadge(tabId: number, url: string | undefined) {
  const host = hostOf(url);
  const catalog = await catalogItem.getValue();
  const hit = host && catalog && !isStorePage(url) ? lookupHost(host, catalog.services) : null;
  if (hit) {
    await browser.action.setBadgeText({ tabId, text: hit.grade });
    await browser.action.setBadgeBackgroundColor({ tabId, color: GRADES[hit.grade].color });
    await browser.action.setTitle({ tabId, title: `Undersigned: ${hit.name} — ${hit.grade} (${GRADES[hit.grade].label})` });
    return;
  }
  const unread = await unreadItem.getValue();
  await browser.action.setBadgeText({ tabId, text: unread > 0 ? String(Math.min(unread, 99)) : "" });
  await browser.action.setBadgeBackgroundColor({ tabId, color: ACCENT });
  await browser.action.setTitle({ tabId, title: unread > 0 ? `Undersigned: ${unread} unread alert${unread > 1 ? "s" : ""}` : "Undersigned" });
}

async function updateActiveTabs() {
  const tabs = await browser.tabs.query({ active: true });
  await Promise.all(tabs.map((t) => (t.id === undefined ? null : updateBadge(t.id, t.url))));
}

async function pollAlerts() {
  if (!(await tokenItem.getValue())) {
    await unreadItem.setValue(0);
    return;
  }
  try {
    const { unread, alerts } = await api.alerts();
    await unreadItem.setValue(unread);
    const seen = new Set(await seenAlertsItem.getValue());
    for (const a of alerts.filter((x) => !x.read && !seen.has(x.id)).slice(0, 3)) {
      // Slug is encoded in the id so clicks work after the worker restarts.
      await browser.notifications.create(`pr|${a.id}|${a.slug}`, {
        type: "basic",
        iconUrl: browser.runtime.getURL("/icon/128.png"),
        title: a.title,
        message: a.body,
        // Firefox doesn't support priority.
        ...(import.meta.env.FIREFOX ? {} : { priority: a.impact === "worse" ? 2 : 0 }),
      });
    }
    await seenAlertsItem.setValue([...new Set([...alerts.map((a) => a.id), ...seen])].slice(0, 500));
  } catch {
    // Retry on next alarm.
  }
}

async function ensureAlarms() {
  if (!(await browser.alarms.get("catalog"))) await browser.alarms.create("catalog", { periodInMinutes: CATALOG_MINUTES, delayInMinutes: 1 });
  if (!(await browser.alarms.get("alerts"))) await browser.alarms.create("alerts", { periodInMinutes: ALERTS_MINUTES, delayInMinutes: 1 });
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    await ensureAlarms();
    await refreshCatalog();
    await pollAlerts();
    await updateActiveTabs();
  });
  browser.runtime.onStartup.addListener(() => void ensureAlarms());

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "catalog") await refreshCatalog();
    if (alarm.name === "alerts") await pollAlerts();
    await updateActiveTabs();
  });

  browser.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.url || info.status === "complete") void updateBadge(tabId, tab.url);
  });
  browser.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await browser.tabs.get(tabId).catch(() => null);
    if (tab) await updateBadge(tabId, tab.url);
  });

  browser.notifications.onClicked.addListener(async (id) => {
    const [, alertId, slug] = id.split("|");
    if (!slug) return;
    await browser.tabs.create({ url: `${await apiBase()}/s/${slug}?alert=${alertId}` });
    await browser.notifications.clear(id);
  });

  // Popup/options ask for a refresh after sign-in, analysis or marking alerts read.
  browser.runtime.onMessage.addListener((msg: { type?: string }) => {
    if (msg?.type !== "refresh") return;
    void (async () => {
      await refreshCatalog();
      await pollAlerts();
      await updateActiveTabs();
    })();
  });

  tokenItem.watch(() => void pollAlerts().then(updateActiveTabs));
  void ensureAlarms();
});
