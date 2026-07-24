import type { FalconBlock, FalconResumeAsset } from "./falconTypes";

const RESUME_HREF_ALIASES = new Set([
  "/resume",
  "resume",
  "/résumé",
  "/resume/",
  "#resume",
]);

export function isResumeHref(href: string | undefined | null): boolean {
  if (!href?.trim()) return false;
  const normalized = href.trim().toLowerCase();
  return RESUME_HREF_ALIASES.has(normalized);
}

export function normalizeSiteResume(raw: {
  resumeUrl?: unknown;
  resumeFilename?: unknown;
  resume?: { href?: unknown; label?: unknown; filename?: unknown } | string;
}): FalconResumeAsset | undefined {
  if (typeof raw.resume === "string" && raw.resume.trim()) {
    return { href: raw.resume.trim() };
  }
  if (raw.resume && typeof raw.resume === "object") {
    const href =
      typeof raw.resume.href === "string" ? raw.resume.href.trim() : "";
    if (href) {
      return {
        href,
        ...(typeof raw.resume.label === "string" && raw.resume.label.trim()
          ? { label: raw.resume.label.trim() }
          : {}),
        ...(typeof raw.resume.filename === "string" &&
        raw.resume.filename.trim()
          ? { filename: raw.resume.filename.trim() }
          : {}),
      };
    }
  }
  const href =
    typeof raw.resumeUrl === "string" ? raw.resumeUrl.trim() : "";
  if (!href) return undefined;
  return {
    href,
    ...(typeof raw.resumeFilename === "string" && raw.resumeFilename.trim()
      ? { filename: raw.resumeFilename.trim() }
      : {}),
  };
}

/** Point hero `/resume` CTAs at the Site Settings PDF; fill About when empty. */
export function applySiteResumeToBlocks(
  blocks: FalconBlock[],
  siteResume?: FalconResumeAsset
): FalconBlock[] {
  if (!siteResume?.href) return blocks;

  return blocks.map((block) => {
    if (block._type === "hero") {
      const rewrite = (cta?: { label: string; href: string }) =>
        cta && isResumeHref(cta.href)
          ? { ...cta, href: siteResume.href }
          : cta;

      return {
        ...block,
        ...(block.cta ? { cta: rewrite(block.cta) } : {}),
        ...(block.ctas
          ? {
              ctas: block.ctas.map(
                (cta) => rewrite(cta) || cta
              ),
            }
          : {}),
      };
    }

    if (block._type === "about" && !block.resume?.href) {
      return {
        ...block,
        resume: siteResume,
      };
    }

    return block;
  });
}
