/**
 * Shared Sanity environment resolution for falcon-portfolio.
 *
 * Free-plan constraint: Sanity allows two datasets. This project uses a
 * single active dataset — `development` — for local, QA, and production
 * until the plan is upgraded. `SANITY_DATASET` can still override.
 *
 * portfolio-core's Sanity client also reads SANITY_DATASET directly —
 * keep that value set to `development` in every host env for now.
 */

import type { DeployEnv } from "portfolio-core/lib/deployEnv";

/** Datasets this Studio knows about (free plan: only development is active). */
export const SANITY_DATASETS = ["development"] as const;

export type SanityDataset = (typeof SANITY_DATASETS)[number];

/** Default dataset while on the free plan (all deploy stages). */
export const DEFAULT_SANITY_DATASET: SanityDataset = "development";

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
  _deploy: DeployEnv
): SanityDataset {
  return DEFAULT_SANITY_DATASET;
}

/** Explicit SANITY_DATASET wins; otherwise use development (free-plan default). */
export function resolveSanityDataset(
  env: NodeJS.ProcessEnv = process.env
): string {
  const explicit = env.SANITY_DATASET?.trim();
  if (explicit) return explicit;
  return defaultDatasetForDeployEnv(resolveDeployEnvFromProcessEnv(env));
}

export function resolveSanityProjectId(
  env: NodeJS.ProcessEnv = process.env
): string {
  const projectId = env.SANITY_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error(
      "SANITY_PROJECT_ID is required. Set it in .env.local or your host environment."
    );
  }
  return projectId;
}
