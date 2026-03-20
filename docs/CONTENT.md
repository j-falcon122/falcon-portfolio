# Mock CMS content and syncing

This template uses a simple mock CMS under `content/mock/` for local development. The mock JSON files are intentionally placeholder content so you can quickly prototype and then replace with real CMS data.

Quick notes:

- `content/mock/pages.json` is the primary file used by the mock provider. Edit it to add pages/blocks for local testing.
- Local placeholder images live under `public/` (e.g. `placeholder-hero.svg`, `placeholder-work-1.svg`).
- To use a local video in the hero carousel, put the MP4 under `public/` and reference it with `videoUrl` in the gallery item.

Syncing from another project
- Use `./scripts/sync-mock-content.sh /path/to/other/project/content/mock [--copy-assets]` to copy JSON files into this template. The optional `--copy-assets` will rsync the `public/` folder from the other project into this one.

Workflow example
1. In your other project, export or copy the `content/mock/*.json` files.
2. Run the sync script above to bring them into this template.
3. Run `npm run dev` and verify the pages render.

Replace placeholders
- When ready to ship from a new project, replace placeholder images/videos with production assets or remove the `content/mock/` provider and wire your real CMS provider in `lib/cms/index.ts`.
