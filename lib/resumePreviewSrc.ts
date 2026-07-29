import { withBasePath } from "portfolio-core/lib/basePath";

export function isStaticExportBuild(): boolean {
  return process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
}

/**
 * URL used to fetch PDF bytes for PDF.js rendering.
 * Remote Sanity files are proxied same-origin so Safari/Chrome can load them
 * (Sanity CDN rejects browser CORS Origin requests).
 */
export function getResumePdfFetchUrl(href: string): string {
  if (!/^https?:\/\//i.test(href)) return href;
  return withBasePath(
    `/api/resume-preview?url=${encodeURIComponent(href)}`
  );
}

/**
 * Iframe embed for static GitHub Pages (no API proxy). Chrome/Safari often
 * won't render cross-origin PDFs in iframes, so use Google's HTML viewer.
 */
export function getResumePreviewIframeSrc(href: string): string {
  if (!/^https?:\/\//i.test(href)) return href;
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(href)}`;
}
