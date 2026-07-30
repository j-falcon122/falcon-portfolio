import { renderCmsJsonView } from "@/lib/cms/renderCmsJsonView";

/**
 * Personal CMS debug page (static-friendly). Prefer `/?_jsonView` — that works
 * on Node and on GitHub Pages via the client JSON gate. This route remains a
 * direct static fallback without a query string.
 */
export default async function CmsJsonPage() {
  return renderCmsJsonView();
}
