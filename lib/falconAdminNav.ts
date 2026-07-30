import { getDeployEnv } from "portfolio-core/lib/deployEnv";
import { FALCON_SANITY_STUDIO_URL } from "./falconStudioUrl";

/**
 * Studio URL for `/admin` redirects (Falcon-specific).
 * Not passed into the public site header — Admin stays out of the nav.
 */
export function resolveFalconAdminNav():
  | { href: string; label: string }
  | undefined {
  const label =
    process.env.ADMIN_NAV_LABEL?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_LABEL?.trim() ||
    "Admin";

  const remote =
    process.env.NEXT_PUBLIC_ADMIN_URL?.trim() ||
    process.env.ADMIN_NAV_URL?.trim() ||
    process.env.SANITY_STUDIO_URL?.trim() ||
    FALCON_SANITY_STUDIO_URL;

  const deploy = getDeployEnv();

  if (deploy === "local") {
    if (process.env.DISABLE_DEV_SANITY_MANAGE_NAV === "1") {
      return remote ? { href: remote, label } : undefined;
    }
    const port = process.env.SANITY_DEV_PORT?.trim() || "3333";
    return { href: `http://localhost:${port}`, label };
  }

  return { href: remote, label };
}
