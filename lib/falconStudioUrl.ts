import { getDeployEnv } from "portfolio-core/lib/deployEnv";

/** Hosted Studio for this project (see `npm run sanity:deploy`). */
export const FALCON_SANITY_STUDIO_URL = "https://jordan-falcon.sanity.studio";

/**
 * Prefer env (AWS / CI), then the known hosted Studio outside local.
 * Local keeps using `sanity:dev` via `/admin` → localhost redirect.
 */
export function resolveFalconStudioUrl(): string {
  const fromEnv =
    process.env.SANITY_STUDIO_URL?.trim() ||
    process.env.ADMIN_NAV_URL?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_URL?.trim() ||
    "";

  if (fromEnv && fromEnv !== "/admin" && !fromEnv.startsWith("/admin/")) {
    return fromEnv;
  }

  if (getDeployEnv() === "local") {
    return "";
  }

  return FALCON_SANITY_STUDIO_URL;
}
