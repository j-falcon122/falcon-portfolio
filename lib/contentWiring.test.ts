import { beforeEach, describe, expect, it } from "vitest";
import { getFalconCms } from "./cms";
import { FALCON_BLOCK_TYPES } from "./cms/falconTypes";
import pages from "../content/mock/pages.json";
import site from "../content/mock/site.json";

describe("content/config wiring", () => {
  beforeEach(() => {
    process.env.CMS_PROVIDER = "mock";
  });

  it("falcon mock site uses single-page navigation with Figma sections", () => {
    expect(site.navigationMode).toBe("single-page");
    expect(site.singlePageSectionSlugs).toEqual([
      "home",
      "about",
      "experience",
      "work",
      "projects",
      "skills",
      "education",
      "contact",
    ]);
  });

  it("falcon mock pages cover each section with known block types", () => {
    const known = new Set<string>(FALCON_BLOCK_TYPES);
    const bySlug = Object.fromEntries(pages.map((page) => [page.slug, page]));

    for (const slug of site.singlePageSectionSlugs) {
      const page = bySlug[slug];
      expect(page, `missing page for slug "${slug}"`).toBeDefined();
      expect(page.blocks.length).toBeGreaterThan(0);

      for (const block of page.blocks) {
        expect(known.has(block._type)).toBe(true);
      }
    }
  });

  it("getFalconCms mock provider returns pages for every configured section slug", async () => {
    const cms = getFalconCms();
    const settings = await cms.getSiteSettings();

    expect(settings.navigationMode).toBe("single-page");

    for (const slug of site.singlePageSectionSlugs) {
      const page = await cms.getPageBySlug(slug);
      expect(page, `getFalconCms missing page "${slug}"`).not.toBeNull();
      expect(page!.blocks.length).toBeGreaterThan(0);
    }
  });
});
