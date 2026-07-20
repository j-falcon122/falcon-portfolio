# Sanity CMS setup

falcon-portfolio uses **one Sanity project**. On the free plan you only get
**two datasets**, so this repo standardizes on a single active dataset:
**`development`**.

Use `development` for local, QA, and production until you upgrade. Keep the
default `production` dataset as your unused second slot (or delete it if empty
and unused).

## Connect

1. In [Sanity Manage](https://www.sanity.io/manage) open project `SANITY_PROJECT_ID`.
2. **Datasets → Create dataset → `development`** (if it does not exist yet).
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

## Later (paid plan / more datasets)

When you can create more datasets, add `staging` / use `production` per host
and set `SANITY_DATASET` differently in each environment. Studio can gain
workspaces again at that point — see git history on `feat/sanity-multi-env`
for the earlier multi-dataset config.

## Hosting checklist

For every deploy target for now:

1. `CMS_PROVIDER=sanity`
2. `SANITY_PROJECT_ID`
3. `SANITY_DATASET=development`
4. Optional: `SANITY_API_READ_TOKEN`, `SANITY_STUDIO_URL` / `ADMIN_NAV_URL`
