/**
 * Sanity env helpers for Node scripts (.mjs).
 * Keep dataset mapping in sync with lib/sanityEnv.ts.
 *
 * Free plan: single active dataset `development` for all stages.
 */

export const SANITY_DATASETS = ["development"];
export const DEFAULT_SANITY_DATASET = "development";

/**
 * @param {string | undefined} siteEnv
 * @param {string | undefined} vercelEnv
 * @param {string | undefined} nodeEnv
 * @returns {"local" | "qa" | "production"}
 */
export function resolveDeployEnv(siteEnv, vercelEnv, nodeEnv) {
  const site = siteEnv?.trim().toLowerCase();
  if (site === "local") return "local";
  if (site === "qa" || site === "staging" || site === "preview") return "qa";
  if (site === "production" || site === "prod") return "production";

  if (vercelEnv === "preview") return "qa";
  if (vercelEnv === "production") return "production";
  if (nodeEnv === "development") return "local";
  return "production";
}

/**
 * @param {"local" | "qa" | "production"} _deploy
 * @returns {"development"}
 */
export function defaultDatasetForDeployEnv(_deploy) {
  return DEFAULT_SANITY_DATASET;
}

/**
 * Explicit SANITY_DATASET wins; otherwise development.
 * @param {NodeJS.ProcessEnv} [env]
 */
export function resolveSanityDataset(env = process.env) {
  const explicit = env.SANITY_DATASET?.trim();
  if (explicit) return explicit;
  return DEFAULT_SANITY_DATASET;
}

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function resolveSanityProjectId(env = process.env) {
  const projectId = env.SANITY_PROJECT_ID?.trim();
  if (!projectId) {
    throw new Error(
      "SANITY_PROJECT_ID is required. Set it in .env.local or your host environment."
    );
  }
  return projectId;
}
