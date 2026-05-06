# Chronicle

Personalized news aggregator. Next.js 14 (App Router) on Vercel, content refreshed every 6 hours via GitHub Actions, personalization powered by Adobe Target / Analytics / Customer Attributes (configured outside this repo).

## Getting started

```bash
cp .env.example .env.local   # fill in keys
npm install
npm run ingest               # generates /public/data/articles.json + recs CSV
npm run dev
```

Open http://localhost:3000. Append `?demo=true` to any URL to show the Reader Picker.

## Architecture

- `scripts/ingest.ts` — runs RSS + NewsAPI + Guardian fetch, extracts article bodies (JSON-LD → Readability fallback), normalizes to a common schema, emits three artifacts to `public/data/`.
- `public/data/articles.json` — read by the Next.js app at build/runtime.
- `public/data/articles-feed.csv` — Adobe Target Recommendations URL feed.
- `public/data/categories.json` — category metadata.
- `app/` — App Router pages: `/`, `/category/[slug]`, `/article/[id]`, `/about`. Article pages are statically generated via `generateStaticParams`.
- `components/PageContext.tsx` — populates `window.chronicleData` and calls `adobe.target.triggerView` on every route.
- `target-zone` divs wrap every region a Target activity manipulates (hero, recently-viewed, category-sections, weather, layout, for-you, related). Selectors: `.target-zone[data-zone="<name>"]`.

## Adobe wiring

This repo handles the data layer only. Manual steps in Adobe:

1. Create a Launch property; install ECID, Target v2, Analytics, Core extensions.
2. Set `NEXT_PUBLIC_LAUNCH_URL`, `NEXT_PUBLIC_TARGET_PROPERTY`, `NEXT_PUBLIC_ECID_ORG_ID` in Vercel.
3. Upload `public/data/articles-feed.csv` as the Recommendations product/content feed.
4. Upload the Customer Attributes CSV (10 fake readers — see project spec).
5. Create profile scripts (`categoryAffinity`, `articleViewCount`, `readingDepth`, `trafficSource`) in Target.
6. Create activities 1–7 (hero Auto-Target, category XT, related Recs, recently-viewed Recs, weather XT, premium-tier A/B, for-you position A/B).

The pre-hiding snippet and `targetPageParams` function are already wired in `app/layout.tsx`.

## GitHub Action

`.github/workflows/refresh-content.yml` runs every 6 hours. Configure repo secrets `NEWSAPI_KEY` and `GUARDIAN_API_KEY`, plus an optional repo variable `PUBLIC_BASE_URL` (used in the Recs CSV `pageUrl` column).

## Deployment

1. Push to GitHub.
2. Import repo into Vercel — framework auto-detected.
3. Set the four `NEXT_PUBLIC_*` env vars.
4. Trigger the GitHub Action once manually (`workflow_dispatch`) to populate initial content.

## Reader Picker

Demo-only. Hidden by default. Show via `?demo=true` query string or set `NEXT_PUBLIC_DEMO_MODE=true`. Clicking a reader calls `Visitor.setCustomerIDs` with `crm_id` + `AUTHENTICATED`, then re-fires `triggerView` so Target gets a fresh decision in that auth context.
