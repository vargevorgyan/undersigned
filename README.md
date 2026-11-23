# Undersigned

AI reads privacy policies and terms for websites, Android and iPhone apps, checks them against **your own rules**, and alerts you when they change.

## Structure

| Path | What |
|---|---|
| `packages/core` | Engine: fetching, store parsing (Play / App Store), Claude analysis, rules, change detection, DB schema (Drizzle) |
| `apps/web` | Next.js 16: landing, reports (`/s/:slug`), dashboard, rules, pricing, SEO pages, REST API (`/api/v1`), cron |
| `apps/extension` | WXT browser extension (Chrome/Edge/Firefox), standalone package. See its README |
| `apps/mobile` | Expo app (iOS/Android), standalone package. See its README |
| `docs/API.md` | API contract used by extension and mobile |

## Quick start

```bash
npm install
cp .env.example .env          # add ANTHROPIC_API_KEY for AI analysis (optional)
npm run seed                  # analyze ~30 popular services
npm run dev                   # http://localhost:3000
```

- No database setup: it uses embedded Postgres in `.data/pglite`. Set `DATABASE_URL` for real Postgres. Only one process can open PGlite at a time, so stop `dev` before running `seed`.
- No `ANTHROPIC_API_KEY`: a clearly labelled keyword analyzer is used instead of AI.
- No Stripe keys: "Upgrade" switches plans instantly (dev only).
- No `SMTP_URL`: alert emails print to the console.
- Change checks run in-process every 15 min in dev (`INTERNAL_CRON_MINUTES`). In production, call `GET /api/cron/check` with `Authorization: Bearer $CRON_SECRET` (configured in `vercel.json`).

Extension: `cd apps/extension && npm install && npm run dev`. Mobile: `cd apps/mobile && npm install && npx expo start`.

## How it works

1. **Resolve**: a link becomes a service and its documents (homepage link discovery, known-policy list, common-path probing, Play "Data safety" / App Store "App Privacy" labels).
2. **Analyze once, share with everyone**: each document version is analyzed by Claude (`claude-opus-5-5` by default, `ANALYSIS_MODEL` to override) into a fixed schema: grade, summary, highlights, and 12 facts with verbatim quotes. Quotes not found word-for-word in the source are removed.
3. **Personal verdict**: preset rules map to facts (instant, free). Custom plain-language rules are checked by AI and cached per (version, rules).
4. **Track**: content is hashed (ignoring dates and whitespace). On change, a new version is created, the AI summarizes what changed, and watchers get an alert (in-app, email, Expo push) when it's meaningful or breaks one of their rules.

## Deploy (suggested)

Vercel (web + cron) + Neon/Supabase Postgres (`DATABASE_URL`) + Stripe (`STRIPE_*`, webhook → `/api/v1/billing/webhook`) + any SMTP provider. Migrations run automatically on boot.

## Tests

```bash
npm test                      # core unit + end-to-end pipeline test (local fake site, change → alert)
npm run typecheck
```

## Known limitations

- Sites that block bots (e.g. Amazon, PayPal, Etsy return 403) and pages that need JavaScript to render can't be read. The report shows the error with a link to the original.
- Mobile share-sheet target needs a dev build with `expo-share-intent`. Push needs `eas init` for a project ID.
- PDFs aren't supported yet.

## Presentation

`/present` is a full-screen, animated product deck (three.js scenes, live product embeds). Arrow keys or space to move, `F` for full screen, `#n` deep-links a slide.

## Design skills

`.claude/skills` holds third-party Claude Code skills used while designing the UI, each with its original license:
[frontend-design](https://github.com/anthropics/skills) (Apache 2.0),
[impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0),
[web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines),
[animate, choreograph, review-animations](https://github.com/emilkowalski/skills),
[motion-design](https://github.com/LottieFiles/motion-design-skill),
[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill),
[product-proof-saas](https://github.com/MengTo/Skills) (all MIT unless noted).
