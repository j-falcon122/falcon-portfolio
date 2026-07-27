import { createClient, type SanityClient } from "@sanity/client";
import { normalizePageSlug } from "portfolio-core/lib/normalizePageSlug";
import type { CmsProvider, Page, SiteSettings } from "portfolio-core/lib/cms/types";
import { resolveSanityDataset } from "@/lib/sanityEnv";
import {
  applySiteResumeToBlocks,
  normalizeSiteResume,
} from "./applySiteResume";
import type { FalconBlock, FalconPage, FalconSiteSettings } from "./falconTypes";
import {
  normalizeFalconBlock,
  pageGroq,
  SITE_GROQ,
} from "./falconNormalize";

export type FalconSanityClientOptions = {
  projectId?: string;
  dataset?: string;
  apiVersion?: string;
  useCdn?: boolean;
  token?: string;
};

export function createFalconSanityClient(
  options: FalconSanityClientOptions = {}
): SanityClient {
  const projectId =
    options.projectId?.trim() ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ||
    process.env.SANITY_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error(
      "SANITY_PROJECT_ID is required. Set it in .env.local or your host environment."
    );
  }
  const dataset =
    options.dataset?.trim() ||
    process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() ||
    resolveSanityDataset();
  const token =
    options.token?.trim() || process.env.SANITY_API_READ_TOKEN?.trim();
  return createClient({
    projectId,
    dataset,
    apiVersion:
      options.apiVersion?.trim() ||
      process.env.SANITY_API_VERSION?.trim() ||
      "2024-01-01",
    useCdn: options.useCdn ?? process.env.SANITY_USE_CDN !== "false",
    ...(token ? { token } : {}),
  });
}

export {
  normalizeFalconBlock,
  pageGroq,
  SITE_GROQ,
} from "./falconNormalize";

function normalizeFalconSiteSettings(data: Record<string, unknown>): FalconSiteSettings {
  const resume = normalizeSiteResume(data);
  return {
    title: typeof data.title === "string" ? data.title : "Jordan Falcon",
    nav: Array.isArray(data.nav) ? (data.nav as SiteSettings["nav"]) : [],
    ...(typeof data.footerText === "string" ? { footerText: data.footerText } : {}),
    ...(data.navigationMode === "routes" || data.navigationMode === "single-page"
      ? { navigationMode: data.navigationMode }
      : { navigationMode: "single-page" as const }),
    ...(Array.isArray(data.singlePageSectionSlugs)
      ? {
          singlePageSectionSlugs: data.singlePageSectionSlugs.filter(
            (s): s is string => typeof s === "string"
          ),
        }
      : {}),
    ...(resume ? { resume } : {}),
  };
}

export function createFalconSanityProvider(
  options: FalconSanityClientOptions = {}
): CmsProvider {
  const getClient = () => createFalconSanityClient(options);
  return {
    async getSiteSettings(): Promise<SiteSettings> {
      const data = await getClient().fetch(SITE_GROQ);
      if (!data?.title) {
        return {
          title: "Jordan Falcon",
          nav: [],
          navigationMode: "single-page",
        };
      }
      return normalizeFalconSiteSettings(data as Record<string, unknown>);
    },

    async getPageBySlug(slug: string): Promise<Page | null> {
      const client = getClient();
      const [data, siteRaw] = await Promise.all([
        client.fetch(pageGroq(slug)),
        client.fetch(SITE_GROQ),
      ]);
      if (!data) return null;

      const site = siteRaw?.title
        ? normalizeFalconSiteSettings(siteRaw as Record<string, unknown>)
        : undefined;

      const blocks = applySiteResumeToBlocks(
        (Array.isArray(data.blocks) ? data.blocks : [])
          .map((b: unknown) => normalizeFalconBlock(b))
          .filter((b): b is FalconBlock => Boolean(b)),
        site?.resume
      );

      return {
        slug: normalizePageSlug(data.slug || slug),
        title: data.title,
        blocks,
      } as FalconPage as Page;
    },
  };
}

const falconSanityProvider = createFalconSanityProvider();

export default falconSanityProvider;
