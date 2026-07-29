import { renderCmsJsonView } from "@/lib/cms/renderCmsJsonView";

/**
 * Personal CMS debug page. Prefer `/?_jsonView` when running a Node server.
 * Static Pages builds render this without searchParams so `output: "export"` works.
 */
export default async function CmsJsonPage() {
  return renderCmsJsonView();
}
