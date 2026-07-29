import { NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set(["cdn.sanity.io"]);

function isAllowedResumeUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!ALLOWED_HOSTS.has(url.hostname)) return null;
  if (!/\.pdf$/i.test(url.pathname)) return null;
  return url;
}

/**
 * Same-origin PDF proxy so Chrome can embed the résumé in an iframe.
 * Cross-origin Sanity CDN PDFs often show Chrome's download stub instead of a preview.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url")?.trim() || "";
  const target = isAllowedResumeUrl(raw);
  if (!target) {
    return NextResponse.json(
      { error: "Resume URL is missing or not allowed." },
      { status: 400 }
    );
  }

  const upstream = await fetch(target.toString(), {
    headers: { Accept: "application/pdf" },
    // Avoid forwarding the browser Origin (Sanity CDN can 403 CORS Origin requests).
    cache: "force-cache",
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Failed to fetch resume (${upstream.status}).` },
      { status: 502 }
    );
  }

  const filename =
    target.pathname.split("/").pop()?.replace(/[^\w.\- ]+/g, "") ||
    "resume.pdf";

  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") || "application/pdf"
  );
  headers.set("Content-Disposition", `inline; filename="${filename}"`);
  headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new NextResponse(upstream.body, { status: 200, headers });
}
