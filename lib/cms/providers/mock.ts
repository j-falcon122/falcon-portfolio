import site from "../../../content/mock/site.json";
import pages from "../../../content/mock/pages.json";
import type { CmsProvider, Page, SiteSettings } from "../types";

const provider: CmsProvider = {
  async getSiteSettings(): Promise<SiteSettings> {
    return site as SiteSettings;
  },
  async getPageBySlug(slug: string): Promise<Page | null> {
    const page = (pages as Page[]).find((p) => p.slug === slug);
    return page || null;
  }
};

export default provider;