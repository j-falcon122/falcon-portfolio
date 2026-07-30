"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  applySiteResumeToBlocks,
  normalizeSiteResume,
} from "@/lib/cms/applySiteResume";
import {
  normalizeFalconBlock,
  pageGroq,
  SITE_GROQ,
} from "@/lib/cms/falconNormalize";
import type { FalconBlock } from "@/lib/cms/falconTypes";
import type { CmsJsonViewPayload } from "@/lib/cms/cmsJsonViewTypes";
import { fetchSanityQuery } from "@/lib/cms/sanityBrowserFetch";

const DATASETS = new Set(["development", "production"]);

const DEFAULT_SECTION_SLUGS = [
  "home",
  "about",
  "experience",
  "work",
  "projects",
  "skills",
  "education",
  "contact",
] as const;

function normalizeSlug(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "").toLowerCase() || "home";
}

function JsonViewShell({
  payload,
  note,
}: {
  payload: CmsJsonViewPayload;
  note?: string;
}) {
  return (
    <div className="cms-json-view">
      <p className="cms-json-view__status" role="status">
        CMS JSON view · provider <code>{payload.provider}</code> · dataset{" "}
        <code>{payload.dataset}</code>
        {note ? ` · ${note}` : ""}
        {" · "}
        remove <code>?_jsonView</code> to return to the site
      </p>
      <pre className="cms-json-view__pre">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Static-export (GitHub Pages) support for `/?_jsonView`.
 * Server searchParams are unavailable with `output: "export"`, so detect the
 * query on the client and render the baked CMS dump (or a live Sanity fetch
 * when `?dataset=` overrides the build dataset).
 */
export default function CmsJsonViewClient({
  children,
  bakedPayload,
}: {
  children: ReactNode;
  bakedPayload: CmsJsonViewPayload;
}) {
  const searchParams = useSearchParams();
  const wantsJson = searchParams.has("_jsonView");
  const requested = searchParams.get("dataset")?.trim().toLowerCase() || "";
  const buildDataset =
    process.env.NEXT_PUBLIC_SANITY_DATASET?.trim().toLowerCase() ||
    bakedPayload.dataset;
  const needsLiveFetch =
    wantsJson &&
    Boolean(requested) &&
    DATASETS.has(requested) &&
    requested !== buildDataset;

  const [livePayload, setLivePayload] = useState<CmsJsonViewPayload | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!needsLiveFetch || !requested) return;

    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
    if (!projectId) {
      queueMicrotask(() => {
        setError("NEXT_PUBLIC_SANITY_PROJECT_ID is missing from this build.");
        setLivePayload(null);
      });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const siteRaw = await fetchSanityQuery<Record<string, unknown> | null>(
          projectId,
          requested,
          SITE_GROQ,
        );
        const siteResume = siteRaw ? normalizeSiteResume(siteRaw) : undefined;
        const rawSlugs = siteRaw?.singlePageSectionSlugs;
        const slugs =
          Array.isArray(rawSlugs) && rawSlugs.length > 0
            ? rawSlugs
                .map((s) => (typeof s === "string" ? normalizeSlug(s) : ""))
                .filter(Boolean)
            : [...DEFAULT_SECTION_SLUGS];

        const pages = await Promise.all(
          slugs.map(async (slug) => {
            const page = await fetchSanityQuery<{
              slug?: string;
              title?: string;
              blocks?: unknown[];
            } | null>(projectId, requested, pageGroq(slug));
            const blocks = applySiteResumeToBlocks(
              (Array.isArray(page?.blocks) ? page.blocks : [])
                .map((b) => normalizeFalconBlock(b))
                .filter(Boolean) as FalconBlock[],
              siteResume,
            );
            return {
              slug: normalizeSlug(page?.slug ?? slug),
              title: page?.title,
              blocks,
            };
          }),
        );

        if (cancelled) return;
        setLivePayload({
          provider: "sanity",
          dataset: requested,
          site: siteRaw ?? bakedPayload.site,
          pages,
        });
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load dataset");
        setLivePayload(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [needsLiveFetch, requested, bakedPayload.site]);

  if (!wantsJson) {
    return children;
  }

  if (needsLiveFetch) {
    if (error && (!livePayload || livePayload.dataset !== requested)) {
      return (
        <div className="cms-json-view">
          <p className="cms-json-view__status cms-json-view__status--error" role="status">
            Could not load CMS JSON for dataset <code>{requested}</code>
            {error ? `: ${error}` : "."}
          </p>
        </div>
      );
    }
    if (!livePayload || livePayload.dataset !== requested) {
      return (
        <div className="cms-json-view">
          <p className="cms-json-view__status" role="status">
            Loading CMS JSON for Sanity <code>{requested}</code>…
          </p>
        </div>
      );
    }
    return <JsonViewShell payload={livePayload} note="live client fetch" />;
  }

  return (
    <JsonViewShell payload={bakedPayload} note="static export snapshot" />
  );
}
