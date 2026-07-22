import type {
  AboutBlock,
  Block as CoreBlock,
  ContactBlock,
  CtaBlock,
  GalleryBlock,
  HeroBlock,
  Page as CorePage,
  TextBlock,
  VideoBlock,
  VideoCarouselBlock,
} from "portfolio-core/lib/cms/types";

export type SectionEyebrow = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export type ExperienceMilestoneKind = "job" | "internship" | "education";

export type ExperienceMilestone = {
  dates: string;
  title: string;
  organization?: string;
  details?: string[];
  /** Visual category for timeline cards. */
  kind?: ExperienceMilestoneKind;
  /**
   * Anchor id on the experience-details page (matches a role `id`).
   * When set, the timeline card links to Show More and highlights that role.
   */
  detailId?: string;
  /** @deprecated Prefer `kind: "internship"`. */
  highlighted?: boolean;
};

export type ExperienceBlock = SectionEyebrow & {
  _type: "experience";
  milestones: ExperienceMilestone[];
  ctaLabel?: string;
  ctaHint?: string;
  /** Opens the full monograph page (e.g. /experience-details). */
  ctaHref?: string;
};

export type ExperienceRoleDetail = {
  /** Stable anchor for deep-links from the timeline (`#id`). */
  id?: string;
  company: string;
  title: string;
  dates: string;
  location?: string;
  summary?: string;
  bullets?: string[];
};

export type ExperienceDetailsBlock = SectionEyebrow & {
  _type: "experienceDetails";
  roles: ExperienceRoleDetail[];
  earlierLabel?: string;
  earlierRoles?: ExperienceRoleDetail[];
  /** Top-left back control; uses collapseHref. */
  backLabel?: string;
  collapseLabel?: string;
  collapseHref?: string;
};

export type WorkItem = {
  title: string;
  description: string;
  tags?: string[];
  href?: string;
  linkLabel?: string;
};

export type WorkGridBlock = SectionEyebrow & {
  _type: "workGrid";
  items: WorkItem[];
};

export type ProjectItem = {
  title: string;
  description: string;
  tags?: string[];
};

export type ProjectListBlock = SectionEyebrow & {
  _type: "projectList";
  items: ProjectItem[];
};

export type SkillCategory = {
  title: string;
  items: string[];
};

export type SkillsBlock = SectionEyebrow & {
  _type: "skills";
  categories: SkillCategory[];
};

export type EducationItem = {
  school: string;
  detail: string;
  years?: string;
};

export type EducationBlock = SectionEyebrow & {
  _type: "education";
  items: EducationItem[];
};

/** About with Figma section chrome + playbook card (stats). */
export type FalconAboutBlock = AboutBlock & {
  eyebrow?: string;
  playbookTitle?: string;
  /** Sanity file asset (or public path in mock) for resume download. */
  resume?: {
    href: string;
    label?: string;
    filename?: string;
  };
};

export type FalconContactBlock = ContactBlock & {
  eyebrow?: string;
};

export type FalconBlock =
  | HeroBlock
  | GalleryBlock
  | VideoBlock
  | VideoCarouselBlock
  | TextBlock
  | CtaBlock
  | FalconAboutBlock
  | FalconContactBlock
  | ExperienceBlock
  | ExperienceDetailsBlock
  | WorkGridBlock
  | ProjectListBlock
  | SkillsBlock
  | EducationBlock
  | CoreBlock;

export type FalconPage = Omit<CorePage, "blocks"> & {
  blocks: FalconBlock[];
};

export const FALCON_BLOCK_TYPES = [
  "hero",
  "gallery",
  "video",
  "videoCarousel",
  "text",
  "cta",
  "about",
  "contact",
  "experience",
  "experienceDetails",
  "workGrid",
  "projectList",
  "skills",
  "education",
] as const;
