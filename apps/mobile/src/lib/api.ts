import { getApiUrl } from './config';
import { getToken } from './storage';
import type { AlertItem, AuthResponse, Me, RulesPayload, ServiceListItem, ServiceView, User, WatchItem } from './types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export const isUnauthorized = (e: unknown) => e instanceof ApiError && e.status === 401;
export const isLimit = (e: unknown) => e instanceof ApiError && e.status === 402;

async function request<T>(path: string, init: RequestInit & { json?: unknown; timeoutMs?: number } = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = { accept: 'application/json' };
  if (init.json !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${getApiUrl()}/api/v1${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string>) },
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
      signal: AbortSignal.timeout(init.timeoutMs ?? 20_000),
    });
  } catch {
    throw new ApiError(0, "Can't reach Undersigned. Check your connection (or the server address in Account).");
  }
  const text = await res.text();
  const data = text ? safeParse(text) : null;
  if (!res.ok) {
    const body = (data ?? {}) as { error?: string; code?: string };
    throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`, body.code);
  }
  return data as T;
}

function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const api = {
  signUp: (input: { email: string; password: string; name?: string; presetIds?: string[] }) =>
    request<AuthResponse>('/auth/signup', { method: 'POST', json: { ...input, client: 'mobile' } }),
  signIn: (input: { email: string; password: string }) => request<AuthResponse>('/auth/login', { method: 'POST', json: { ...input, client: 'mobile' } }),
  signOut: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  me: () => request<Me>('/me'),
  updateMe: (patch: { name?: string | null; emailAlerts?: boolean }) => request<{ user: User }>('/me', { method: 'PATCH', json: patch }),
  deleteAccount: () => request<{ ok: true }>('/me', { method: 'DELETE' }),

  // Analysis can take up to a minute while the AI reads long policies.
  analyze: (url: string) => request<{ slug: string }>('/analyze', { method: 'POST', json: { url }, timeoutMs: 180_000 }),
  service: (slug: string, rules?: string[]) =>
    request<ServiceView>(`/services/${encodeURIComponent(slug)}${rules ? `?rules=${rules.join(',')}` : ''}`),
  services: (q?: string) => request<{ services: ServiceListItem[] }>(`/services${q ? `?q=${encodeURIComponent(q)}` : ''}`),

  rules: () => request<RulesPayload>('/rules'),
  saveRules: (input: { presetIds: string[]; customRules: { id?: string; text: string }[] }) => request<RulesPayload>('/rules', { method: 'PUT', json: input }),

  watchlist: () => request<{ items: WatchItem[]; limit: number }>('/watchlist'),
  watch: (slug: string) => request<{ ok: true }>('/watchlist', { method: 'POST', json: { slug } }),
  unwatch: (slug: string) => request<{ ok: true }>(`/watchlist/${encodeURIComponent(slug)}`, { method: 'DELETE' }),

  alerts: () => request<{ unread: number; alerts: AlertItem[] }>('/alerts'),
  markRead: (ids?: string[]) => request<{ ok: true }>('/alerts/read', { method: 'POST', json: ids ? { ids } : {} }),

  registerPushToken: (token: string, platform: string) => request<{ ok: true }>('/push-tokens', { method: 'POST', json: { token, platform } }),
  checkout: () => request<{ url: string }>('/billing/checkout', { method: 'POST' }),
  portal: () => request<{ url: string }>('/billing/portal', { method: 'POST' }),
};
