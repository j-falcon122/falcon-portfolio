import type { CmsProvider, Page } from "portfolio-core/lib/cms/types";
import falconMock from "./falconMock";
import falconSanity from "./falconSanity";
import type { FalconPage } from "./falconTypes";

/**
 * Falcon CMS entrypoint with Figma block support.
 * - mock → local content/mock
 * - sanity → falcon Sanity provider (schemas + normalize for new block types)
 */
export function getFalconCms(): CmsProvider {
  const key = (process.env.CMS_PROVIDER ?? "mock").trim().toLowerCase();
  if (key === "sanity") return falconSanity;
  return falconMock;
}

export async function getFalconPageBySlug(
  slug: string
): Promise<FalconPage | null> {
  const page = await getFalconCms().getPageBySlug(slug);
  return page as FalconPage | null;
}

export type { Page };
