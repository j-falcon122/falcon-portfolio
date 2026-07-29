import { getFalconCms, resolveCmsProviderKey } from "@/lib/cms";
import { resolveSinglePageSectionSlugs } from "portfolio-core/lib/cms/singlePageSections";
import { normalizePageSlug } from "portfolio-core/lib/normalizePageSlug";
import { resolveSanityDataset } from "@/lib/sanityEnv";

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function renderCmsJsonView(options?: {
  slug?: string | string[];
  from?: string | string[];
}) {
  const slugParam = firstParam(options?.slug)?.trim();
  const fromPath = firstParam(options?.from)?.trim() || "/";

  const cms = getFalconCms();
  const site = await cms.getSiteSettings();
  const sectionSlugs = resolveSinglePageSectionSlugs(site);

  const pathSlug = normalizePageSlug(
    fromPath.replace(/^\/+|\/+$/g, "") || "home",
  );
  const focusSlug = slugParam
    ? normalizePageSlug(slugParam)
    : pathSlug !== "home" && sectionSlugs.includes(pathSlug)
      ? pathSlug
      : null;

  const fetchSlugs = focusSlug ? [focusSlug] : sectionSlugs;
  const pages = await Promise.all(
    fetchSlugs.map(async (slug) => {
      const page = await cms.getPageBySlug(slug);
      return {
        slug: normalizePageSlug(page?.slug ?? slug),
        title: page?.title,
        blocks: page?.blocks ?? [],
      };
    }),
  );

  const payload = {
    provider: resolveCmsProviderKey(),
    dataset: resolveSanityDataset(),
    site,
    pages,
  };

  return (
    <div className="cms-json-view">
      <p className="cms-json-view__status" role="status">
        CMS JSON view · provider <code>{payload.provider}</code> · dataset{" "}
        <code>{payload.dataset}</code>
        {" · "}
        remove <code>?_jsonView</code> to return to the site
      </p>
      <pre className="cms-json-view__pre">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}

export function hasJsonViewParam(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  return Object.prototype.hasOwnProperty.call(searchParams, "_jsonView");
}
