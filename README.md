# Portfolio Template

A reusable Next.js portfolio template designed for creators, artists, and personal websites.

## Features

- Next.js App Router
- CMS-ready architecture
- Block-based page system
- Hero / Gallery / Video / Text / CTA blocks
- Mock content for development

## Usage

1. Clone or use this repository as a template.
2. Install dependencies:

```bash
npm install
```

3. Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000 to view the site.

## Project structure

- `app/` — Next.js app routes and pages
- `components/` — UI components and blocks
- `content/mock` — Mock CMS content for local development
- `lib/cms` — CMS adapter and types

## Environment

See `.env.example` for example variables. The template uses a mock CMS provider by default.

## Concept

This template uses a modern headless CMS architecture:

Next.js
  ↓
Page Route
  ↓
CMS Adapter
  ↓
Blocks
  ↓
React Components

## License

MIT
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
