import { anonRulesItem, apiBase, tokenItem, userItem } from "./store";
import type { Alert, CatalogEntry, Limits, RulesPayload, ServiceView, Stage, User } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

type Opts = { method?: string; body?: unknown; headers?: Record<string, string> };

async function headers(extra?: Record<string, string>) {
  const token = await tokenItem.getValue();
  return { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...extra };
}

async function request<T>(path: string, opts: Opts = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${await apiBase()}/api/v1${path}`, {
      method: opts.method ?? "GET",
      headers: await headers(opts.headers),
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
  } catch {
    throw new ApiError("Can't reach Undersigned. Check your connection or the server address in Settings.", 0);
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!res.ok) {
    // Expired or revoked session: forget it so the UI falls back to signed-out.
    if (res.status === 401) await signOutLocal();
    throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status, data.code);
  }
  return data as T;
}

export async function signOutLocal() {
  await tokenItem.setValue(null);
  await userItem.setValue(null);
}

export const api = {
  catalog: () => request<{ services: CatalogEntry[] }>("/catalog"),

  async service(slug: string) {
    const signedIn = Boolean(await tokenItem.getValue());
    const anon = signedIn ? null : await anonRulesItem.getValue();
    const q = anon ? `?rules=${encodeURIComponent(anon.join(","))}` : "";
    return request<ServiceView>(`/services/${encodeURIComponent(slug)}${q}`);
  },

  async auth(mode: "login" | "signup", email: string, password: string) {
    const presetIds = (await anonRulesItem.getValue()) ?? undefined;
    const out = await request<{ token: string; user: User }>(`/auth/${mode}`, {
      method: "POST",
      body: { email, password, client: "extension", ...(mode === "signup" ? { presetIds } : {}) },
    });
    await tokenItem.setValue(out.token);
    await userItem.setValue(out.user);
    return out.user;
  },

  async logout() {
    await request("/auth/logout", { method: "POST" }).catch(() => {});
    await signOutLocal();
  },

  me: () => request<{ user: User; limits: Limits; billingEnabled: boolean }>("/me"),
  rules: () => request<RulesPayload>("/rules"),
  saveRules: (presetIds: string[], customRules: { id?: string; text: string }[]) =>
    request<RulesPayload>("/rules", { method: "PUT", body: { presetIds, customRules } }),
  watch: (slug: string) => request("/watchlist", { method: "POST", body: { slug } }),
  unwatch: (slug: string) => request(`/watchlist/${encodeURIComponent(slug)}`, { method: "DELETE" }),
  alerts: () => request<{ unread: number; alerts: Alert[] }>("/alerts"),
  markRead: (ids?: string[]) => request("/alerts/read", { method: "POST", body: ids ? { ids } : {} }),
};

/** POST /analyze with SSE progress. Resolves with the service slug. */
export async function analyzeStream(url: string, onProgress: (stage: Stage, message: string) => void): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${await apiBase()}/api/v1/analyze`, {
      method: "POST",
      headers: await headers({ accept: "text/event-stream" }),
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new ApiError("Can't reach Undersigned. Check your connection or the server address in Settings.", 0);
  }
  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
    throw new ApiError(data.error ?? `Analysis failed (${res.status})`, res.status, data.code);
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const event = raw.match(/^event: (.*)$/m)?.[1];
      const data = JSON.parse(raw.match(/^data: (.*)$/m)?.[1] ?? "{}");
      if (event === "progress") onProgress(data.stage, data.message);
      if (event === "done") return data.slug as string;
      if (event === "error") throw new ApiError(data.error ?? "Analysis failed.", 422);
    }
  }
  throw new ApiError("The analysis was interrupted. Please try again.", 0);
}
