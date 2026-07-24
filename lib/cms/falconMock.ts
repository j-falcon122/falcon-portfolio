import site from "../../content/mock/site.json";
import pages from "../../content/mock/pages.json";
import type { CmsProvider, Page, SiteSettings } from "portfolio-core/lib/cms/types";
import {
  applySiteResumeToBlocks,
  normalizeSiteResume,
} from "./applySiteResume";
import type { FalconPage, FalconSiteSettings } from "./falconTypes";
import { normalizeFalconBlock } from "./falconNormalize";

function getMockSite(): FalconSiteSettings {
  const raw = site as Record<string, unknown>;
  const resume = normalizeSiteResume(raw);
  return {
    ...(site as SiteSettings),
    ...(resume ? { resume } : {}),
  };
}

/** Local mock CMS — reads falcon-portfolio `content/mock`, not portfolio-core's copy. */
const falconMockProvider: CmsProvider = {
  async getSiteSettings(): Promise<SiteSettings> {
    return getMockSite();
  },
  async getPageBySlug(slug: string): Promise<Page | null> {
    const page = (pages as FalconPage[]).find((p) => p.slug === slug);
    if (!page) return null;
    const siteSettings = getMockSite();
    const blocks = applySiteResumeToBlocks(
      (page.blocks || [])
        .map((b) => normalizeFalconBlock(b))
        .filter(Boolean),
      siteSettings.resume
    );
    return { ...page, blocks } as Page;
  },
};

export default falconMockProvider;
