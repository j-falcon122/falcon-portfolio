/**
 * Shared Sanity environment resolution for falcon-portfolio.
 *
 * Datasets:
 * - `development` — local, GitHub Pages preview (default), Amplify QA
 * - `production` — live AWS / manual Pages deploy with sanity_env=production
 *
 * Explicit `SANITY_DATASET` always wins when set.
 */

import type { DeployEnv } from "portfolio-core/lib/deployEnv";

export const SANITY_DATASETS = ["development", "production"] as const;

export type SanityDataset = (typeof SANITY_DATASETS)[number];

/** Default dataset for preview / local when nothing else is set. */
export const DEFAULT_SANITY_DATASET: SanityDataset = "development";

/**
 * Public Sanity project id for this portfolio (also appears in CDN URLs).
 * Used when Amplify SSR omits SANITY_PROJECT_ID from the Lambda env.
 */
export const FALCON_SANITY_PROJECT_ID = "59l1zlij";

export function resolveDeployEnvFromProcessEnv(
  env: NodeJS.ProcessEnv = process.env
): DeployEnv {
  const site = env.SITE_ENV?.trim().toLowerCase();
  if (site === "local") return "local";
  if (site === "qa" || site === "staging" || site === "preview") return "qa";
  if (site === "production" || site === "prod") return "production";

  const vercel = env.VERCEL_ENV?.trim();
  if (vercel === "preview") return "qa";
  if (vercel === "production") return "production";

  if (env.NODE_ENV === "development") return "local";
  return "production";
}

export function defaultDatasetForDeployEnv(
  deploy: DeployEnv
): SanityDataset {
  if (deploy === "production") return "production";
  return DEFAULT_SANITY_DATASET;
}

/** Explicit SANITY_DATASET / NEXT_PUBLIC_SANITY_DATASET wins; else map from deploy stage. */
export function resolveSanityDataset(
  env: NodeJS.ProcessEnv = process.env
): string {
  const explicit =
    env.SANITY_DATASET?.trim() || env.NEXT_PUBLIC_SANITY_DATASET?.trim();
  if (explicit) return explicit;
  return defaultDatasetForDeployEnv(resolveDeployEnvFromProcessEnv(env));
}

export function resolveSanityProjectId(
  env: NodeJS.ProcessEnv = process.env
): string {
  const projectId =
    env.SANITY_PROJECT_ID?.trim() ||
    env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ||
    FALCON_SANITY_PROJECT_ID;
  return projectId;
}
