import { Suspense } from "react";
import { getFalconCms, resolveCmsProviderKey } from "@/lib/cms";
import { resolveSinglePageSectionSlugs } from "portfolio-core/lib/cms/singlePageSections";
import { normalizePageSlug } from "portfolio-core/lib/normalizePageSlug";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import CmsDatasetPreview from "@/components/CmsDatasetPreview";
import CmsJsonViewClient from "@/components/CmsJsonViewClient";
import type { FalconBlock } from "@/lib/cms/falconTypes";
import type { CmsJsonViewPayload } from "@/lib/cms/cmsJsonViewTypes";
import {
  hasJsonViewParam,
  renderCmsJsonView,
} from "@/lib/cms/renderCmsJsonView";
import { resolveSanityDataset } from "@/lib/sanityEnv";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const isStaticExport =
  process.env.GITHUB_PAGES === "true" || process.env.NEXT_OUTPUT === "export";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  // searchParams opts the route into dynamic rendering — skip on static Pages export.
  if (!isStaticExport && searchParams) {
    const params = await searchParams;
    if (hasJsonViewParam(params)) {
      return renderCmsJsonView({ slug: params.slug });
    }
  }

  const cms = getFalconCms();
  const site = await cms.getSiteSettings();
  const singlePage = (site.navigationMode ?? "routes") === "single-page";

  if (!singlePage) {
    const home = await cms.getPageBySlug("home");
    const bakedPayload: CmsJsonViewPayload = {
      provider: resolveCmsProviderKey(),
      dataset: resolveSanityDataset(),
      site,
      pages: [
        {
          slug: "home",
          title: home?.title,
          blocks: home?.blocks ?? [],
        },
      ],
    };
    const homeView = (
      <BlockRenderer blocks={(home?.blocks || []) as FalconBlock[]} />
    );
    if (!isStaticExport) return homeView;
    return (
      <Suspense fallback={homeView}>
        <CmsJsonViewClient bakedPayload={bakedPayload}>
          {homeView}
        </CmsJsonViewClient>
      </Suspense>
    );
  }

  const sectionSlugs = resolveSinglePageSectionSlugs(site);
  const pages = await Promise.all(sectionSlugs.map((s) => cms.getPageBySlug(s)));

  const pageViews = pages.map((p, i) => {
    const slug = normalizePageSlug(p?.slug ?? sectionSlugs[i] ?? `section-${i}`);
    return {
      slug,
      title: p?.title,
      blocks: (p?.blocks || []) as FalconBlock[],
    };
  });

  const bakedPayload: CmsJsonViewPayload = {
    provider: resolveCmsProviderKey(),
    dataset: resolveSanityDataset(),
    site,
    pages: pageViews,
  };

  const baked = (
    <>
      {pageViews.map((section) => (
        <section
          id={section.slug}
          key={section.slug}
          className={`page-section page-section--${section.slug}`}
          aria-label={section.title || section.slug}
        >
          <div className="page-section__inner">
            <BlockRenderer blocks={section.blocks} />
          </div>
        </section>
      ))}
    </>
  );

  return (
    <Suspense fallback={baked}>
      <CmsJsonViewClient bakedPayload={bakedPayload}>
        <CmsDatasetPreview>{baked}</CmsDatasetPreview>
      </CmsJsonViewClient>
    </Suspense>
  );
}
