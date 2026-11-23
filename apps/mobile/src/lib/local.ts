import { useCallback, useEffect, useState } from 'react';
import { readJson, writeJson } from './storage';
import type { Grade } from './types';

// Device-local state: recent checks and anonymous rule picks.

export type RecentCheck = { url: string; slug: string; name: string; grade: Grade | null; at: string };

const RECENT_KEY = 'pr_recent';
const RULES_KEY = 'pr_local_rules';
export const DEFAULT_PRESETS = ['no-selling', 'no-ai-training', 'can-delete', 'no-cross-tracking'];

let recentListeners: ((r: RecentCheck[]) => void)[] = [];

export async function addRecent(entry: Omit<RecentCheck, 'at'>) {
  const list = await readJson<RecentCheck[]>(RECENT_KEY, []);
  const next = [{ ...entry, at: new Date().toISOString() }, ...list.filter((r) => r.slug !== entry.slug)].slice(0, 12);
  await writeJson(RECENT_KEY, next);
  recentListeners.forEach((l) => l(next));
}

export async function clearRecent() {
  await writeJson(RECENT_KEY, []);
  recentListeners.forEach((l) => l([]));
}

export function useRecent() {
  const [items, setItems] = useState<RecentCheck[]>([]);
  useEffect(() => {
    readJson<RecentCheck[]>(RECENT_KEY, []).then(setItems);
    recentListeners.push(setItems);
    return () => {
      recentListeners = recentListeners.filter((l) => l !== setItems);
    };
  }, []);
  return items;
}

let rulesListeners: ((r: string[]) => void)[] = [];
let cachedRules: string[] | null = null;

export async function getLocalPresets() {
  cachedRules ??= await readJson<string[]>(RULES_KEY, DEFAULT_PRESETS);
  return cachedRules;
}

/** Anonymous users' preset picks; sent as ?rules= and carried into signup. */
export function useLocalPresets() {
  const [ids, setIds] = useState<string[] | null>(cachedRules);
  useEffect(() => {
    getLocalPresets().then(setIds);
    rulesListeners.push(setIds);
    return () => {
      rulesListeners = rulesListeners.filter((l) => l !== setIds);
    };
  }, []);
  const save = useCallback(async (next: string[]) => {
    cachedRules = next;
    await writeJson(RULES_KEY, next);
    rulesListeners.forEach((l) => l(next));
  }, []);
  return [ids, save] as const;
}
