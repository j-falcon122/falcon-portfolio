# Sanity CMS setup

falcon-portfolio uses **one Sanity project** with two datasets:

| Dataset | Use |
|---------|-----|
| `development` | Local + GitHub Pages preview (default) |
| `production` | AWS prod + optional manual Pages deploy |

## Connect

1. In [Sanity Manage](https://www.sanity.io/manage) open project `SANITY_PROJECT_ID`.
2. Ensure datasets **`development`** and **`production`** exist (seed each as needed).
3. In `.env.local`:
   ```bash
   SITE_ENV=local
   CMS_PROVIDER=sanity
   SANITY_PROJECT_ID=your-project-id
   SANITY_DATASET=development
   SANITY_API_WRITE_TOKEN=…   # Editor token for seed scripts
   ```
4. Seed and verify:
   ```bash
   npm run seed:sanity
   npm run test:sanity
   ```
5. Run the site + Studio:
   ```bash
   npm run dev
   npm run sanity:dev
   ```

## Tokens

| Token | Purpose |
|-------|---------|
| `SANITY_API_READ_TOKEN` | Site read access when the dataset is private |
| `SANITY_API_WRITE_TOKEN` | Local scripts only (`seed:sanity`, uploads, migrations) |

Never expose write tokens to the browser or public CI logs.

## GitHub Pages (preview)

Pages builds against Sanity **`development` by default**.

- **Push to `main`** → always `development` (`SITE_ENV=qa`)
- **Actions → Deploy GitHub Pages → Run workflow** → choose:
  - `development` (default preview)
  - `production` (bake prod Sanity content into Pages)
- **Runtime URL switch (no rebuild):** append `?dataset=production` or
  `?dataset=development` on the Pages URL to load that dataset in the browser.
  Example: `https://j-falcon122.github.io/falcon-portfolio/?dataset=production`

Repo secrets / vars needed:

1. `CMS_PROVIDER=sanity` (or rely on workflow default)
2. `SANITY_PROJECT_ID` (secret)
3. Optional: `SANITY_API_READ_TOKEN`, `SANITY_STUDIO_URL` / `ADMIN_NAV_URL`

## Hosting checklist (AWS prod)

1. `CMS_PROVIDER=sanity` (also set `NEXT_PUBLIC_CMS_PROVIDER=sanity` on Amplify)
2. `SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_PROJECT_ID` (same value)
3. `SANITY_DATASET=production` and `NEXT_PUBLIC_SANITY_DATASET=production`
4. `SITE_ENV=production`
5. Optional: `SANITY_API_READ_TOKEN`
6. Studio URL: falcon defaults `/admin` to `https://jordan-falcon.sanity.studio`
   when `SANITY_STUDIO_URL` / `ADMIN_NAV_URL` are unset. Admin is never shown
   in the site header — open Studio directly or visit `/admin`.

After changing Amplify env vars, trigger a **new build** (not “redeploy this
version”). Confirm with `/?_jsonView` — status should say `provider sanity`.
If it still says `mock`, the running build never received those variables.

## Figma block types

Page `blocks` in Studio can include: `hero`, `about`, `experience`, `workGrid`,
`projectList`, `skills`, `education`, `contact` (plus legacy gallery/video/text/cta).

On the **About** block you can upload:
- **Headshot** (`image`) — portrait shown beside the playbook card
- **Resume** (`file`, PDF/Word) — optional block-level download link
  (optional `resumeLabel`, defaults to “Download resume”)

Prefer uploading the résumé once under **Site Settings → Resume**. Hero CTAs with
`href: "/resume"` (e.g. “View Résumé”) open that file. About uses the Site
Settings file when the About block has no resume of its own.

`npm run seed:sanity` writes the mock portfolio content for all of these into
the active dataset. The Next app reads them via `getFalconCms()` (local mock or
falcon Sanity normalize — not portfolio-core’s older block allow-list alone).
