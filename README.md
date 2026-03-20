## falcon-portfolio — J. Falcon's personal portfolio site

A Next.js + TypeScript portfolio site for J. Falcon, built on top of a flexible template with a pluggable CMS layer and GitHub OAuth.

### Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

### Environment variables

See `.env.example` for a full list with descriptions.

| Variable | Purpose |
|---|---|
| `CMS_PROVIDER` | `mock` (default) or `sanity` |
| `SANITY_PROJECT_ID` | Sanity project ID (required when `CMS_PROVIDER=sanity`) |
| `SANITY_DATASET` | Sanity dataset (default: `production`) |
| `SANITY_API_TOKEN` | Optional Sanity read token for private datasets |
| `NEXTAUTH_SECRET` | Random secret for NextAuth session encryption |
| `NEXTAUTH_URL` | Canonical deployment URL |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `ALLOWED_GITHUB_LOGIN` | GitHub username allowed to access `/admin` |

### CMS

Content is driven by a swappable CMS provider:

- **Mock** (`CMS_PROVIDER=mock`): reads from `content/mock/site.json` and `content/mock/pages.json` — no external services needed.
- **Sanity** (`CMS_PROVIDER=sanity`): fetches live content from your Sanity project using GROQ queries.

### Admin / OAuth

Visit `/admin` to access the admin dashboard. You will be redirected to `/admin/login` where you can sign in with GitHub. Only the GitHub account matching `ALLOWED_GITHUB_LOGIN` is permitted.

Create a GitHub OAuth App at <https://github.com/settings/developers> and set the callback URL to:

```
{NEXTAUTH_URL}/api/auth/callback/github
```

### What's included

- Next.js App Router with example routes (`/`, `/about`, `/work`, `/contact`)
- Pluggable CMS abstraction (`lib/cms/`) with mock and Sanity providers
- Reusable content blocks (`components/blocks/`): Hero, Gallery, Text, Video, CTA
- GitHub OAuth via NextAuth.js protecting `/admin`
- Tailwind CSS with a custom dark theme and accent colour

### License

MIT
