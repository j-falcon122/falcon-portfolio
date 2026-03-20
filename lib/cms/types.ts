export type NavItem = { label: string; href: string };

export type SiteSettings = {
  title: string;
  nav: NavItem[];
  footerText?: string;
};

export type HeroBlock = {
  _type: "hero"; 
  brandTitle?: string;
  headline: string;
  subheadline?: string;
  cta?: { label: string; href: string };
  backgroundImage?: { src: string; alt?: string };
  /** optional gallery to show as the hero background */
  gallery?: GalleryItem[];
};

export type GalleryImageItem = {
  _type?: "image";
  src: string;
  alt?: string;
  /** optional thumbnail or poster for videos */
  poster?: string;
};

export type GalleryVideoItem = {
  _type: "video";
  /** direct video file url (mp4/webm) */
  videoUrl?: string;
  /** embed url for iframe embeds (YouTube/Vimeo) */
  embedUrl?: string;
  /** optional poster image */
  poster?: string;
  alt?: string;
};

export type GalleryItem = GalleryImageItem | GalleryVideoItem;

export type GalleryBlock = {
  _type: "gallery";
  title?: string;
  items: GalleryItem[];
};

export type VideoBlock = {
  _type: "video";
  title?: string;
  embedUrl?: string;
  videoUrl?: string;
};

export type TextBlock = {
  _type: "text";
  title?: string;
  body: string;
  /** optional image for About / text blocks */
  image?: { src: string; alt?: string };
};

export type CtaBlock = {
  _type: "cta";
  label: string;
  href: string;
};

export type Block = HeroBlock | GalleryBlock | VideoBlock | TextBlock | CtaBlock;

export type Page = {
  slug: string;
  title?: string;
  blocks: Block[];
};

export type CmsProvider = {
  getSiteSettings: () => Promise<SiteSettings>;
  getPageBySlug: (slug: string) => Promise<Page | null>;
};