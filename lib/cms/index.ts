import type { CmsProvider, Page } from "portfolio-core/lib/cms/types";
import falconMock from "./falconMock";
import falconSanity from "./falconSanity";
import type { FalconPage } from "./falconTypes";

/**
 * Resolve which CMS backend to use.
 * Explicit CMS_PROVIDER / NEXT_PUBLIC_CMS_PROVIDER wins. If unset, prefer
 * Sanity when a project id is configured (Amplify SSR sometimes omits
 * non-NEXT_PUBLIC vars unless a fresh build re-injects them).
 */
export function resolveCmsProviderKey(
  env: NodeJS.ProcessEnv = process.env,
): "sanity" | "mock" {
  const explicit = (
    env.CMS_PROVIDER ||
    env.NEXT_PUBLIC_CMS_PROVIDER ||
    ""
  )
    .trim()
    .toLowerCase();
  if (explicit === "sanity" || explicit === "mock") return explicit;
  if (env.SANITY_PROJECT_ID?.trim() || env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim()) {
    return "sanity";
  }
  return "mock";
}

/**
 * Falcon CMS entrypoint with Figma block support.
 * - mock → local content/mock
 * - sanity → falcon Sanity provider (schemas + normalize for new block types)
 */
export function getFalconCms(): CmsProvider {
  if (resolveCmsProviderKey() === "sanity") return falconSanity;
  return falconMock;
}

export async function getFalconPageBySlug(
  slug: string
): Promise<FalconPage | null> {
  const page = await getFalconCms().getPageBySlug(slug);
  return page as FalconPage | null;
}

export type { Page };
