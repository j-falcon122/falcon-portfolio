import { createClient, type SanityClient } from "next-sanity";
import { normalizeBlock, normalizeSiteSettings } from "../normalize";
import type { CmsProvider, Page, SiteSettings } from "../types";

let _client: SanityClient | null = null;

function getClient(): SanityClient {
  if (_client) return _client;
  const projectId = process.env.SANITY_PROJECT_ID;
  if (!projectId) {
    throw new Error("SANITY_PROJECT_ID environment variable is required when CMS_PROVIDER=sanity");
  }
  _client = createClient({
    projectId,
    dataset: process.env.SANITY_DATASET || "production",
    apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
    useCdn: process.env.NODE_ENV === "production",
    token: process.env.SANITY_API_TOKEN,
  });
  return _client;
}

const provider: CmsProvider = {
  async getSiteSettings(): Promise<SiteSettings> {
    const raw = await getClient().fetch(
      `*[_type == "siteSettings"][0]{
        title,
        "nav": nav[]{label, "href": href},
        footerText
      }`
    );
    return normalizeSiteSettings(raw);
  },

  async getPageBySlug(slug: string): Promise<Page | null> {
    const raw = await getClient().fetch(
      `*[_type == "page" && slug.current == $slug][0]{
        "slug": slug.current,
        title,
        "blocks": blocks[]{
          _type,
          headline,
          subheadline,
          brandTitle,
          "cta": cta{label, href},
          "backgroundImage": backgroundImage{"src": asset->url, alt},
          title,
          body,
          "items": items[]{
            "src": asset->url,
            alt
          },
          embedUrl,
          videoUrl,
          label,
          href
        }
      }`,
      { slug }
    );
    if (!raw) return null;
    return {
      slug: raw.slug,
      title: raw.title,
      blocks: (raw.blocks || []).map(normalizeBlock),
    };
  },
};

export default provider;
