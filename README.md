# falcon-portfolio

Personal portfolio site for **Jordan Falcon** — built with Next.js, TypeScript, and a content-driven block system.

## Local development

```bash
npm install
npm run dev
```

Content lives in `content/mock/*.json` when using the mock CMS (`CMS_PROVIDER=mock` in `.env.local`).

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm run validate:content` — validate content JSON
- `npm run test` — run tests

## Deploy

Configured for Vercel or GitHub Pages static export (`npm run build:pages`).
