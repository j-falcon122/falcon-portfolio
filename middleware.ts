import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_STUDIO_URL = "https://jordan-falcon.sanity.studio";

function resolveStudioTarget(): string {
  const fromEnv =
    process.env.SANITY_STUDIO_URL?.trim() ||
    process.env.ADMIN_NAV_URL?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_URL?.trim() ||
    "";

  if (fromEnv && fromEnv !== "/admin" && !fromEnv.startsWith("/admin/")) {
    return fromEnv;
  }

  const siteEnv = process.env.SITE_ENV?.trim().toLowerCase();
  const isLocal =
    siteEnv === "local" ||
    (!siteEnv && process.env.NODE_ENV === "development");

  if (isLocal) {
    const port = process.env.SANITY_DEV_PORT?.trim() || "3333";
    return `http://localhost:${port}`;
  }

  return DEFAULT_STUDIO_URL;
}

/**
 * Edge redirect so /admin is not stuck on a prerendered help page
 * (OpenNext / CloudFront can cache the App Router page for a long time).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== "/admin" && pathname !== "/admin/") {
    return NextResponse.next();
  }

  return NextResponse.redirect(resolveStudioTarget());
}

export const config = {
  matcher: ["/admin", "/admin/"],
};
