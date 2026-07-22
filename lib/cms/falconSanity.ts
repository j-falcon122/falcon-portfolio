import { createClient, type SanityClient } from "@sanity/client";
import { normalizePageSlug } from "portfolio-core/lib/normalizePageSlug";
import type { CmsProvider, Page, SiteSettings } from "portfolio-core/lib/cms/types";
import {
  resolveSanityDataset,
} from "@/lib/sanityEnv";
import type { FalconBlock, FalconPage } from "./falconTypes";

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

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function normalizeFalconBlock(raw: unknown): FalconBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const block = raw as Record<string, unknown>;
  const type =
    block._type === "textBlock" ? "text" : asString(block._type);
  if (!type) return null;

  switch (type) {
    case "hero":
      return {
        _type: "hero",
        headline: asString(block.headline) || "Home",
        brandTitle: asString(block.brandTitle),
        subheadline: asString(block.subheadline),
        ctas: Array.isArray(block.ctas)
          ? (block.ctas as { label?: string; href?: string }[])
              .filter((c) => c?.label && c?.href)
              .map((c) => ({ label: c.label!, href: c.href! }))
          : undefined,
      };
    case "about":
      return {
        _type: "about",
        eyebrow: asString(block.eyebrow),
        title: asString(block.title),
        body: asString(block.body),
        playbookTitle: asString(block.playbookTitle),
        stats: Array.isArray(block.stats)
          ? (block.stats as { value?: string; label?: string }[]).map((s) => ({
              value: s.value || "",
              label: s.label || "",
            }))
          : undefined,
      };
    case "contact":
      return {
        _type: "contact",
        eyebrow: asString(block.eyebrow),
        title: asString(block.title),
        subtitle: asString(block.subtitle),
        email: asString(block.email),
        phone: asString(block.phone),
        location: asString(block.location),
        submitLabel: asString(block.submitLabel),
        socialLinks: Array.isArray(block.socialLinks)
          ? (block.socialLinks as { label?: string; href?: string }[])
              .filter((s) => s?.label && s?.href)
              .map((s) => ({ label: s.label!, href: s.href! }))
          : undefined,
      };
    case "experience":
      return {
        _type: "experience",
        eyebrow: asString(block.eyebrow),
        title: asString(block.title),
        subtitle: asString(block.subtitle),
        ctaLabel: asString(block.ctaLabel),
        ctaHint: asString(block.ctaHint),
        ctaHref: asString(block.ctaHref),
        milestones: Array.isArray(block.milestones)
          ? (
              block.milestones as {
                dates?: string;
                title?: string;
                organization?: string;
                details?: string[];
                kind?: string;
                detailId?: string;
                highlighted?: boolean;
              }[]
            )
              .filter((m) => m?.dates && m?.title)
              .map((m) => {
                const kind =
                  m.kind === "job" ||
                  m.kind === "internship" ||
                  m.kind === "education"
                    ? m.kind
                    : m.highlighted
                      ? "internship"
                      : "job";
                return {
                  dates: m.dates!,
                  title: m.title!,
                  organization: asString(m.organization),
                  details: Array.isArray(m.details)
                    ? m.details.filter((d): d is string => typeof d === "string")
                    : undefined,
                  kind,
                  detailId: asString(m.detailId),
                };
              })
          : [],
      };
    case "experienceDetails": {
      const mapRole = (r: {
        id?: string;
        company?: string;
        title?: string;
        dates?: string;
        location?: string;
        summary?: string;
        bullets?: string[];
      }) => ({
        id: asString(r.id),
        company: r.company!,
        title: r.title!,
        dates: r.dates!,
        location: asString(r.location),
        summary: asString(r.summary),
        bullets: Array.isArray(r.bullets)
          ? r.bullets.filter((b): b is string => typeof b === "string")
          : undefined,
      });
      return {
        _type: "experienceDetails",
        eyebrow: asString(block.eyebrow),
        title: asString(block.title),
        subtitle: asString(block.subtitle),
        earlierLabel: asString(block.earlierLabel),
        backLabel: asString(block.backLabel),
        collapseLabel: asString(block.collapseLabel),
        collapseHref: asString(block.collapseHref),
        roles: Array.isArray(block.roles)
          ? (
              block.roles as {
                id?: string;
                company?: string;
                title?: string;
                dates?: string;
                location?: string;
                summary?: string;
                bullets?: string[];
              }[]
            )
              .filter((r) => r?.company && r?.title && r?.dates)
              .map(mapRole)
          : [],
        earlierRoles: Array.isArray(block.earlierRoles)
          ? (
              block.earlierRoles as {
                id?: string;
                company?: string;
                title?: string;
                dates?: string;
                location?: string;
                summary?: string;
                bullets?: string[];
              }[]
            )
              .filter((r) => r?.company && r?.title && r?.dates)
              .map(mapRole)
          : [],
      };
    }
    case "workGrid":
      return {
        _type: "workGrid",
        eyebrow: asString(block.eyebrow),
        title: asString(block.title),
        items: Array.isArray(block.items)
          ? (
              block.items as {
                title?: string;
                description?: string;
                tags?: string[];
                href?: string;
                linkLabel?: string;
              }[]
            )
              .filter((i) => i?.title && i?.description)
              .map((i) => ({
                title: i.title!,
                description: i.description!,
                tags: Array.isArray(i.tags)
                  ? i.tags.filter((t): t is string => typeof t === "string")
                  : undefined,
                href: asString(i.href),
                linkLabel: asString(i.linkLabel),
              }))
          : [],
      };
    case "projectList":
      return {
        _type: "projectList",
        eyebrow: asString(block.eyebrow),
        title: asString(block.title),
        items: Array.isArray(block.items)
          ? (
              block.items as {
                title?: string;
                description?: string;
                tags?: string[];
              }[]
            )
              .filter((i) => i?.title && i?.description)
              .map((i) => ({
                title: i.title!,
                description: i.description!,
                tags: Array.isArray(i.tags)
                  ? i.tags.filter((t): t is string => typeof t === "string")
                  : undefined,
              }))
          : [],
      };
    case "skills":
      return {
        _type: "skills",
        eyebrow: asString(block.eyebrow),
        title: asString(block.title),
        categories: Array.isArray(block.categories)
          ? (
              block.categories as {
                title?: string;
                items?: string[];
              }[]
            )
              .filter((c) => c?.title && Array.isArray(c.items))
              .map((c) => ({
                title: c.title!,
                items: (c.items || []).filter(
                  (t): t is string => typeof t === "string"
                ),
              }))
          : [],
      };
    case "education":
      return {
        _type: "education",
        eyebrow: asString(block.eyebrow),
        title: asString(block.title),
        items: Array.isArray(block.items)
          ? (
              block.items as {
                school?: string;
                detail?: string;
                years?: string;
              }[]
            )
              .filter((i) => i?.school && i?.detail)
              .map((i) => ({
                school: i.school!,
                detail: i.detail!,
                years: asString(i.years),
              }))
          : [],
      };
    case "text":
      return {
        _type: "text",
        title: asString(block.title),
        body: asString(block.body) || "",
      };
    case "cta":
      return {
        _type: "cta",
        label: asString(block.label) || "Learn more",
        href: asString(block.href) || "/",
      };
    default:
      return null;
  }
}

export const SITE_GROQ = `coalesce(
  *[_type == "siteSettings" && _id == "siteSettings"][0],
  *[_type == "siteSettings"][0]
){
  title,
  navigationMode,
  singlePageSectionSlugs,
  nav[]{ label, href },
  footerText
}`;

export function pageGroq(slug: string): string {
  const normalized = normalizePageSlug(slug);
  const docId = JSON.stringify(`page-${normalized}`);
  const safe = JSON.stringify(normalized);
  return `coalesce(
    *[_type == "page" && _id == ${docId}][0],
    *[_type == "page" && (slug.current == ${safe} || slug == ${safe})][0]
  ){
    "slug": coalesce(slug.current, slug),
    title,
    blocks[]{
      ...,
      "_type": select(_type == "textBlock" => "text", _type)
    }
  }`;
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
      return data as SiteSettings;
    },

    async getPageBySlug(slug: string): Promise<Page | null> {
      const data = await getClient().fetch(pageGroq(slug));
      if (!data) return null;
      const blocks = Array.isArray(data.blocks)
        ? data.blocks
            .map((b: unknown) => normalizeFalconBlock(b))
            .filter(Boolean)
        : [];
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
