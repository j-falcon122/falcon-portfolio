"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import {
  normalizeFalconBlock,
  pageGroq,
  SITE_GROQ,
} from "@/lib/cms/falconNormalize";
import type { FalconBlock } from "@/lib/cms/falconTypes";

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

type SectionView = {
  slug: string;
  title?: string;
  blocks: FalconBlock[];
};

function normalizeSlug(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "").toLowerCase() || "home";
}

async function fetchSanityQuery<T>(
  projectId: string,
  dataset: string,
  query: string
): Promise<T> {
  const url = new URL(
    `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}`
  );
  url.searchParams.set("query", query);
  url.searchParams.set("returnQuery", "false");
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Sanity query failed (${res.status})`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}

/**
 * GitHub Pages preview helper: `?dataset=production` (or `development`)
 * loads that Sanity dataset in the browser. Default build stays on
 * development; omit the param to keep the statically baked content.
 */
export default function CmsDatasetPreview({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const requested = searchParams.get("dataset")?.trim().toLowerCase() || "";
  const buildDataset =
    process.env.NEXT_PUBLIC_SANITY_DATASET?.trim().toLowerCase() ||
    "development";

  const needsOverride =
    Boolean(requested) &&
    DATASETS.has(requested) &&
    requested !== buildDataset;

  const [cache, setCache] = useState<{
    dataset: string;
    sections: SectionView[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!needsOverride || !requested) return;

    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
    if (!projectId) {
      queueMicrotask(() => {
        setError("NEXT_PUBLIC_SANITY_PROJECT_ID is missing from this build.");
        setCache(null);
      });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const site = await fetchSanityQuery<{
          title?: string;
          singlePageSectionSlugs?: string[];
        } | null>(projectId, requested, SITE_GROQ);

        const rawSlugs = site?.singlePageSectionSlugs;
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
            const blocks = Array.isArray(page?.blocks)
              ? page.blocks
                  .map((b) => normalizeFalconBlock(b))
                  .filter(Boolean)
              : [];
            return {
              slug: normalizeSlug(page?.slug ?? slug),
              title: page?.title,
              blocks: blocks as FalconBlock[],
            };
          })
        );
        if (cancelled) return;
        setCache({ dataset: requested, sections: pages });
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load dataset");
        setCache(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [needsOverride, requested]);

  if (!needsOverride) {
    return children;
  }

  if (error && cache?.dataset !== requested) {
    return (
      <p className="px-6 py-16 text-center text-sm text-red-300">
        Could not load dataset <code>{requested}</code>
        {error ? `: ${error}` : "."}
      </p>
    );
  }

  if (!cache || cache.dataset !== requested) {
    return (
      <p className="px-6 py-16 text-center text-sm text-[var(--figma-muted)]">
        Loading Sanity <code>{requested}</code> dataset…
      </p>
    );
  }

  return (
    <>
      <p
        className="px-6 pt-4 text-center text-xs uppercase tracking-wide text-[var(--figma-gold)]"
        role="status"
      >
        Previewing Sanity dataset: {requested}
      </p>
      {cache.sections.map((section) => (
        <section
          id={section.slug}
          key={section.slug}
          className={`page-section page-section--${section.slug}`}
          aria-label={section.title || section.slug}
        >
          <div className="page-section__inner">
            <BlockRenderer blocks={section.blocks} />
          </div>
        </section>
      ))}
    </>
  );
}
