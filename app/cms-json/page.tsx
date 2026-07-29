import {
  hasJsonViewParam,
  renderCmsJsonView,
} from "@/lib/cms/renderCmsJsonView";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Personal CMS debug page. Prefer `/?_jsonView` or open `/cms-json` directly.
 */
export default async function CmsJsonPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  // Allow `/cms-json` always; also accept `?_jsonView` if someone lands here.
  void hasJsonViewParam(params);
  return renderCmsJsonView({
    slug: params.slug,
    from: params.from,
  });
}
