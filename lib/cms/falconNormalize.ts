/**
 * Shared Falcon block normalize + GROQ helpers (browser + server safe).
 * Keep free of Node-only imports so client components can use them.
 */
import type { FalconAboutBlock, FalconBlock } from "./falconTypes";

function normalizePageSlug(slug: string | undefined | null): string {
  const trimmed = (slug ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!trimmed) return "home";
  return trimmed;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStringList(values: unknown): string[] | undefined {
  if (!Array.isArray(values)) return undefined;
  const items = values
    .map((value) => asString(value))
    .filter((value): value is string => Boolean(value));
  return items.length ? items : undefined;
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
    case "about": {
      const imageRaw = block.image;
      let image: FalconAboutBlock["image"];
      if (imageRaw && typeof imageRaw === "object" && !Array.isArray(imageRaw)) {
        const img = imageRaw as { src?: unknown; alt?: unknown };
        const src = asString(img.src);
        if (src) {
          image = {
            src,
            ...(asString(img.alt) ? { alt: asString(img.alt) } : {}),
          };
        }
      }

      const resumeHref =
        asString(block.resumeUrl) ||
        (block.resume &&
        typeof block.resume === "object" &&
        !Array.isArray(block.resume)
          ? asString((block.resume as { href?: unknown }).href)
          : undefined);
      const resumeLabel =
        asString(block.resumeLabel) ||
        (block.resume &&
        typeof block.resume === "object" &&
        !Array.isArray(block.resume)
          ? asString((block.resume as { label?: unknown }).label)
          : undefined);
      const resume: FalconAboutBlock["resume"] = resumeHref
        ? {
            href: resumeHref,
            ...(resumeLabel ? { label: resumeLabel } : {}),
            ...(asString(block.resumeFilename)
              ? { filename: asString(block.resumeFilename) }
              : {}),
          }
        : undefined;

      return {
        _type: "about",
        eyebrow: asString(block.eyebrow),
        title: asString(block.title),
        body: asString(block.body),
        playbookTitle: asString(block.playbookTitle),
        ...(image ? { image } : {}),
        ...(resume ? { resume } : {}),
        stats: Array.isArray(block.stats)
          ? (block.stats as { value?: string; label?: string }[]).map((s) => ({
              value: s.value || "",
              label: s.label || "",
            }))
          : undefined,
      };
    }
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
                screenshot?: { src?: unknown; alt?: unknown };
                caseStudy?: {
                  project?: string;
                  problem?: string;
                  myRole?: string;
                  actionsAndDecisions?: string;
                  challenge?: string;
                  result?: string;
                  learning?: string;
                };
              }[]
            )
              .filter((i) => i?.title && i?.description)
              .map((i) => {
                const cs = i.caseStudy;
                const caseStudy = cs
                  ? {
                      project: asString(cs.project),
                      problem: asString(cs.problem),
                      myRole: asString(cs.myRole),
                      actionsAndDecisions: asString(cs.actionsAndDecisions),
                      challenge: asString(cs.challenge),
                      result: asString(cs.result),
                      learning: asString(cs.learning),
                    }
                  : undefined;
                const hasCaseStudy =
                  caseStudy &&
                  Object.values(caseStudy).some((v) => Boolean(v));
                const shotSrc = asString(i.screenshot?.src);
                const screenshot = shotSrc
                  ? {
                      src: shotSrc,
                      ...(asString(i.screenshot?.alt)
                        ? { alt: asString(i.screenshot?.alt) }
                        : {}),
                    }
                  : undefined;
                return {
                  title: i.title!,
                  description: i.description!,
                  tags: asStringList(i.tags),
                  href: asString(i.href),
                  linkLabel: asString(i.linkLabel),
                  ...(screenshot ? { screenshot } : {}),
                  caseStudy: hasCaseStudy ? caseStudy : undefined,
                };
              })
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
                screenshot?: { src?: unknown; alt?: unknown };
              }[]
            )
              .filter((i) => asString(i?.title) && asString(i?.description))
              .map((i) => {
                const shotSrc = asString(i.screenshot?.src);
                const screenshot = shotSrc
                  ? {
                      src: shotSrc,
                      ...(asString(i.screenshot?.alt)
                        ? { alt: asString(i.screenshot?.alt) }
                        : {}),
                    }
                  : undefined;
                return {
                  title: asString(i.title)!,
                  description: asString(i.description)!,
                  tags: asStringList(i.tags),
                  ...(screenshot ? { screenshot } : {}),
                };
              })
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
  footerText,
  "resumeUrl": resume.asset->url,
  "resumeFilename": resume.asset->originalFilename
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
      "_type": select(_type == "textBlock" => "text", _type),
      image{
        "src": coalesce(asset->url, src),
        "alt": coalesce(alt, asset->altText)
      },
      items[]{
        ...,
        screenshot{
          "src": coalesce(asset->url, src),
          "alt": coalesce(alt, asset->altText)
        },
        image{
          "src": coalesce(asset->url, src),
          "alt": coalesce(alt, asset->altText)
        }
      },
      "resumeUrl": resume.asset->url,
      "resumeFilename": resume.asset->originalFilename,
      "videoUrl": coalesce(videoUrl, videoFile.asset->url)
    }
  }`;
}
