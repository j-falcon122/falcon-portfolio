# falcon-portfolio

Personal portfolio site for **Jordan Falcon** — built with Next.js, TypeScript, and a content-driven block system (shared via [`portfolio-core`](https://github.com/j-falcon122/portfolio-core)).

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

By default `CMS_PROVIDER=mock` serves `content/mock/*.json`.

## Sanity CMS

Free plan: use one active dataset — **`development`** — everywhere for now.

1. Create dataset `development` in Sanity Manage.
2. In `.env.local`:
   ```bash
   SITE_ENV=local
   CMS_PROVIDER=sanity
   SANITY_PROJECT_ID=your-project-id
   SANITY_DATASET=development
   SANITY_API_WRITE_TOKEN=…   # Editor token
   ```
3. Seed and run:
   ```bash
   npm run seed:sanity
   npm run test:sanity
   npm run dev
   npm run sanity:dev
   ```

See [docs/SANITY.md](docs/SANITY.md) for tokens and hosting notes.

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm run validate:content` — validate content JSON
- `npm run test` — run tests
- `npm run sanity:dev` — Sanity Studio
- `npm run seed:sanity` — seed the configured dataset from mock JSON

## Deploy

Configured for GitHub Pages (preview) and AWS (production). Pages defaults to
Sanity `development`; use **Actions → Deploy GitHub Pages → Run workflow** and
set `sanity_env=production` to bake prod content. For Sanity-backed deploys, set
`CMS_PROVIDER=sanity` and the right `SANITY_DATASET` (see `.env.example` and
[docs/SANITY.md](docs/SANITY.md)).

## URL params (runtime)

| Param | Example | Purpose |
| --- | --- | --- |
| `dataset` | `/?dataset=development` or `/?dataset=production` | Load that Sanity dataset in the browser (no rebuild). Needs `NEXT_PUBLIC_SANITY_PROJECT_ID` (and ideally `NEXT_PUBLIC_SANITY_DATASET`) in the build. Only switches when the param differs from the baked dataset. |
| `_jsonView` | `/?_jsonView` | CMS JSON debug dump of site settings + pages. Works on Node (`next start` / AWS) and static GitHub Pages (client-side; uses the build snapshot, or a live Sanity fetch when combined with `?dataset=`). `/cms-json` is a static fallback route. |
