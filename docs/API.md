# Undersigned API (v1)

Base: `${APP_URL}/api/v1` (dev: `http://localhost:3000/api/v1`). JSON in/out. CORS open.
Auth: `Authorization: Bearer <token>` (extension/mobile) or the `pr_session` cookie (web).
Errors: `{ error: string, code?: string }` with HTTP status. `code` values: `unauthorized` (401), `limit_watchlist` / `limit_rules` (402 → show upgrade), `rate_limited` (429).

## Auth
- `POST /auth/signup` `{ email, password (min 8), name?, client: "web"|"extension"|"mobile", presetIds?: string[] }` → `201 { token, user }`
- `POST /auth/login` `{ email, password, client }` → `{ token, user }`
- `POST /auth/logout` → `{ ok }`
- `GET /me` → `{ user, limits: { customRules, watchlist, checkIntervalHours }, billingEnabled }`
- `PATCH /me` `{ name?, emailAlerts? }` → `{ user }`; `DELETE /me` → deletes account + all data

`user = { id, email, name, plan: "free"|"pro", emailAlerts, createdAt }`

## Analyze
`POST /analyze` `{ url }` — any website, policy URL, Google Play or App Store link.
- Default: waits, returns `{ slug }` or `422 { error }` (user-friendly message). Can take 5–60s.
- With `Accept: text/event-stream`: SSE events
  - `progress` `{ stage: "fetching"|"finding"|"reading"|"analyzing"|"saving"|"done", message }`
  - `done` `{ slug }`
  - `error` `{ error }`

## Services
- `GET /services/:slug[?rules=no-selling,can-delete]` → ServiceView (verdict uses the signed-in user's rules; anonymous callers may pass `rules`)
- `GET /services?q=` → `{ services: [{ slug, name, domain, kind, grade, iconUrl, updatedAt }] }`
- `GET /catalog` → `{ services: [{ slug, domain, grade, name }] }` (website services only; cache locally)

```ts
type ServiceView = {
  service: { id, slug, name, domain, kind: "website"|"android"|"ios", storeId, iconUrl, grade: "A".."E"|null, updatedAt };
  isWatching: boolean;
  watchers: number;
  verdict: {
    status: "ok"|"warning"|"violation"|"none";
    passed: number; failed: number; unclear: number;
    results: { ruleId, label, status: "pass"|"fail"|"unclear", reason, quote, custom: boolean }[]; // fails first
  };
  documents: {
    id, url, type: "privacy"|"terms"|"cookies"|"app_privacy_label"|"other", title, lastCheckedAt, lastError,
    version: null | { id, fetchedAt, engine: "ai"|"basic", wordCount, analysis: PolicyAnalysis };
  }[];
  history: { id, documentId, fetchedAt, grade, change: { headline, impact: "better"|"worse"|"neutral", points: string[] } }[];
};
type PolicyAnalysis = {
  serviceName, documentType, summary, grade: "A".."E", dataRetention, jurisdiction,
  highlights: { title, explanation, severity: "good"|"neutral"|"caution"|"bad", quote }[];
  facts: Record<FactKey, { value: "yes"|"no"|"unclear", quote }>;
};
```

Grades: A Respects you · B Mostly fair · C Mixed · D Invasive · E Very invasive.

## Rules
- `GET /rules` → `{ presets: [{ id, label, description, fact, want }], presetIds, customRules: [{ id, text }], limits }` (works anonymously → defaults)
- `PUT /rules` `{ presetIds, customRules: [{ id?, text }] }` → same as GET (auth)

## Watchlist & alerts (auth)
- `GET /watchlist` → `{ items: [{ slug, name, domain, kind, grade, iconUrl, addedAt, lastCheckedAt, nextCheckAt, hasError, lastChange: null | { at, headline, impact } }], limit }`
- `POST /watchlist` `{ slug }` → `201`; `DELETE /watchlist/:slug`
- `GET /alerts` → `{ unread, alerts: [{ id, slug, serviceName, iconUrl, title, body, impact, brokenRules: string[], read, createdAt }] }`
- `POST /alerts/read` `{ ids? }` (omit ids = mark all read)
- `POST /push-tokens` `{ token, platform }` (Expo push token)

## Billing (auth)
- `POST /billing/checkout` → `{ url }` (open it); `POST /billing/portal` → `{ url }`

## Misc
- `POST /waitlist` `{ email, source? }`
- Web report page for a service: `${APP_URL}/s/:slug`
