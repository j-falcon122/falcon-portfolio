import { beforeEach, describe, expect, it } from "vitest";
import { getCms } from "portfolio-core/lib/cms";
import type { Block } from "portfolio-core/lib/cms/types";
import pages from "../content/mock/pages.json";
import site from "../content/mock/site.json";

const KNOWN_BLOCK_TYPES = new Set([
  "hero",
  "gallery",
  "video",
  "videoCarousel",
  "text",
  "cta",
  "about",
  "contact",
]);

describe("content/config wiring", () => {
  beforeEach(() => {
    process.env.CMS_PROVIDER = "mock";
  });

  it("falcon mock site uses single-page navigation with expected sections", () => {
    expect(site.navigationMode).toBe("single-page");
    expect(site.singlePageSectionSlugs).toEqual([
      "home",
      "about",
      "work",
      "contact",
    ]);
    expect(site.nav.map((item) => item.href)).toEqual([
      "/",
      "/about",
      "/work",
      "/contact",
    ]);
  });

  it("falcon mock pages cover each section with known block types", () => {
    const bySlug = Object.fromEntries(pages.map((page) => [page.slug, page]));

    for (const slug of site.singlePageSectionSlugs) {
      const page = bySlug[slug];
      expect(page, `missing page for slug "${slug}"`).toBeDefined();
      expect(page.blocks.length).toBeGreaterThan(0);

      for (const block of page.blocks as Block[]) {
        expect(KNOWN_BLOCK_TYPES.has(block._type)).toBe(true);
      }
    }
  });

  it("getCms mock provider returns pages for every configured section slug", async () => {
    const cms = getCms();
    const settings = await cms.getSiteSettings();

    expect(settings.navigationMode).toBe("single-page");

    for (const slug of site.singlePageSectionSlugs) {
      const page = await cms.getPageBySlug(slug);
      expect(page, `getCms missing page "${slug}"`).not.toBeNull();
      expect(page!.blocks.length).toBeGreaterThan(0);
    }
  });
});
