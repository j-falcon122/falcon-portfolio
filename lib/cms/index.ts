import type { CmsProvider } from "./types";
import mock from "./providers/mock";
import sanity from "./providers/sanity";

const providers: Record<string, CmsProvider> = {
  mock,
  sanity,
};

export function getCms(): CmsProvider {
  const key = process.env.CMS_PROVIDER || "mock";
  const provider = providers[key];
  if (!provider) throw new Error(`Unknown CMS_PROVIDER: ${key}`);
  return provider;
}