import { browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";
import type { CatalogEntry, User } from "./types";

export const DEFAULT_API_BASE = "http://localhost:3000";

export const apiBaseItem = storage.defineItem<string>("local:apiBase", { fallback: DEFAULT_API_BASE });
export const tokenItem = storage.defineItem<string | null>("local:token", { fallback: null });
export const userItem = storage.defineItem<User | null>("local:user", { fallback: null });
export const catalogItem = storage.defineItem<{ services: CatalogEntry[]; fetchedAt: number } | null>("local:catalog", { fallback: null });
/** Preset rule ids chosen while signed out. */
export const anonRulesItem = storage.defineItem<string[] | null>("local:anonRules", { fallback: null });
export const seenAlertsItem = storage.defineItem<string[]>("local:seenAlerts", { fallback: [] });
export const unreadItem = storage.defineItem<number>("local:unread", { fallback: 0 });

export async function apiBase() {
  return (await apiBaseItem.getValue()).replace(/\/+$/, "");
}

export async function openWeb(path: string) {
  await browser.tabs.create({ url: `${await apiBase()}${path}` });
}
