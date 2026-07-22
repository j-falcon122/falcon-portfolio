import site from "../../content/mock/site.json";
import pages from "../../content/mock/pages.json";
import type { CmsProvider, Page, SiteSettings } from "portfolio-core/lib/cms/types";
import type { FalconPage } from "./falconTypes";

/** Local mock CMS — reads falcon-portfolio `content/mock`, not portfolio-core's copy. */
const falconMockProvider: CmsProvider = {
  async getSiteSettings(): Promise<SiteSettings> {
    return site as SiteSettings;
  },
  async getPageBySlug(slug: string): Promise<Page | null> {
    const page = (pages as FalconPage[]).find((p) => p.slug === slug);
    return (page as Page | undefined) ?? null;
  },
};

export default falconMockProvider;
