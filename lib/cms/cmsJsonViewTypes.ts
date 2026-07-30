export type CmsJsonViewPayload = {
  provider: string;
  dataset: string;
  site: unknown;
  pages: Array<{
    slug: string;
    title?: string;
    blocks: unknown[];
  }>;
};
