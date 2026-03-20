## portfolio-template — minimal Next.js + TypeScript portfolio starter

A compact, copy-friendly template meant to be forked or copied into new projects as a starting point for personal portfolio sites.

Quick start

1. Copy the folder to a new location, or clone and remove history:

   git clone <this-repo> my-portfolio
   cd my-portfolio
   rm -rf .git

2. Install dependencies:

   npm install

3. Update project metadata in `package.json` (name, author, license).
4. Edit `app/`, `components/`, and `public/` to add your content and assets.
5. Replace the mock CMS provider in `lib/cms/providers/mock.ts` with your real provider if desired.
6. Run the dev server:

   npm run dev

What this template includes

- Next.js app router scaffolding in `app/` with example routes.
- A tiny CMS abstraction (`lib/cms/`) and a mock provider to let you develop without external services.
- Reusable, content-driven blocks in `components/blocks/` (Hero, Gallery, Text, Video, CTA).
- Tailwind CSS setup and basic global styles.

Tips

- Keep this repo as a lightweight starting point. Remove unused examples and dependencies before publishing.
- Use environment variables for secrets; don't commit `.env` files. See `.gitignore`.

License

This template is MIT licensed. See `LICENSE`.

Init script

This template includes a small helper script at `scripts/init-template.sh` that bootstraps a new project copy. It prompts for a project name and author, updates `package.json`, removes the local `.git` history, and can optionally run `npm install` for you.

Usage:

```bash
bash scripts/init-template.sh --install
```

If you want this template customized for a specific CMS or deployment target, tell me what you need and I can make a targeted version.
