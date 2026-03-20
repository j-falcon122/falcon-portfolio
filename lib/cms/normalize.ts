import type {
  Block,
  HeroBlock,
  GalleryBlock,
  VideoBlock,
  TextBlock,
  CtaBlock,
  SiteSettings,
  NavItem,
} from "./types";

type RawSanityRecord = Record<string, unknown>;

export function normalizeSiteSettings(raw: RawSanityRecord | null): SiteSettings {
  if (!raw) {
    return { title: "J. Falcon", nav: [] };
  }
  return {
    title: (raw.title as string) || "J. Falcon",
    nav: ((raw.nav as NavItem[]) || []).filter((n) => n?.label && n?.href),
    footerText: (raw.footerText as string | undefined) || undefined,
  };
}

export function normalizeBlock(raw: RawSanityRecord): Block {
  switch (raw._type as string) {
    case "hero": {
      const cta = raw.cta as { label?: string; href?: string } | undefined;
      const bg = raw.backgroundImage as { src?: string; alt?: string } | undefined;
      const block: HeroBlock = {
        _type: "hero",
        headline: (raw.headline as string) || "",
        subheadline: raw.subheadline as string | undefined,
        brandTitle: raw.brandTitle as string | undefined,
        cta: cta?.label && cta?.href ? { label: cta.label, href: cta.href } : undefined,
        backgroundImage: bg?.src ? { src: bg.src, alt: bg.alt } : undefined,
      };
      return block;
    }
    case "gallery": {
      const items = (raw.items as RawSanityRecord[] | undefined) || [];
      const block: GalleryBlock = {
        _type: "gallery",
        title: raw.title as string | undefined,
        items: items
          .filter((i) => typeof i?.src === "string")
          .map((i) => ({ src: i.src as string, alt: (i.alt as string) || "" })),
      };
      return block;
    }
    case "video": {
      const block: VideoBlock = {
        _type: "video",
        title: raw.title as string | undefined,
        embedUrl: raw.embedUrl as string | undefined,
        videoUrl: raw.videoUrl as string | undefined,
      };
      return block;
    }
    case "text": {
      const block: TextBlock = {
        _type: "text",
        title: raw.title as string | undefined,
        body: (raw.body as string) || "",
      };
      return block;
    }
    case "cta": {
      const block: CtaBlock = {
        _type: "cta",
        label: (raw.label as string) || "",
        href: (raw.href as string) || "/",
      };
      return block;
    }
    default:
      return { _type: "text", body: "" } as TextBlock;
  }
}
