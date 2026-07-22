import { Suspense } from "react";
import { getFalconCms } from "@/lib/cms";
import { resolveSinglePageSectionSlugs } from "portfolio-core/lib/cms/singlePageSections";
import { normalizePageSlug } from "portfolio-core/lib/normalizePageSlug";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import CmsDatasetPreview from "@/components/CmsDatasetPreview";
import type { FalconBlock } from "@/lib/cms/falconTypes";

export default async function HomePage() {
  const cms = getFalconCms();
  const site = await cms.getSiteSettings();
  const singlePage = (site.navigationMode ?? "routes") === "single-page";

  if (!singlePage) {
    const home = await cms.getPageBySlug("home");
    return <BlockRenderer blocks={(home?.blocks || []) as FalconBlock[]} />;
  }

  const sectionSlugs = resolveSinglePageSectionSlugs(site);
  const pages = await Promise.all(sectionSlugs.map((s) => cms.getPageBySlug(s)));

  const baked = (
    <>
      {pages.map((p, i) => {
        const slug = normalizePageSlug(p?.slug ?? sectionSlugs[i] ?? `section-${i}`);
        return (
          <section
            id={slug}
            key={slug}
            className={`page-section page-section--${slug}`}
            aria-label={p?.title || slug}
          >
            <div className="page-section__inner">
              <BlockRenderer blocks={(p?.blocks || []) as FalconBlock[]} />
            </div>
          </section>
        );
      })}
    </>
  );

  return (
    <Suspense fallback={baked}>
      <CmsDatasetPreview>{baked}</CmsDatasetPreview>
    </Suspense>
  );
}
