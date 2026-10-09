"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  WorkGridBlock as WorkGridBlockType,
  WorkItem,
} from "@/lib/cms/falconTypes";
import {
  catalogItemHashHref,
  hashFromLocation,
  uniqueCatalogAnchorIds,
} from "@/lib/catalogItemAnchor";
import { withAssetPath } from "portfolio-core/lib/basePath";
import SectionHeader from "./SectionHeader";
import WorkCaseStudyModal, {
  hasCaseStudyContent,
} from "./WorkCaseStudyModal";

function resolveImageSrc(src: string): string {
  return src.startsWith("http://") || src.startsWith("https://")
    ? src
    : withAssetPath(src);
}

function CardContent({ item }: { item: WorkItem }) {
  return (
    <>
      {item.tags?.length ? (
        <div className="work-grid-block__tags">
          {item.tags.map((tag) => (
            <span key={tag} className="work-grid-block__tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <h3 className="work-grid-block__card-title">{item.title}</h3>
      <p className="work-grid-block__card-body">{item.description}</p>
    </>
  );
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function ViewButton({
  href,
  title,
  className,
}: {
  href: string;
  title: string;
  className: string;
}) {
  const external = isExternalHref(href);
  return (
    <a
      className={className}
      href={href}
      aria-label={`View ${title}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      View Here
    </a>
  );
}

function CardScreenshot({ item }: { item: WorkItem }) {
  if (!item.screenshot?.src) return null;
  return (
    <div className="work-grid-block__media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveImageSrc(item.screenshot.src)}
        alt={item.screenshot.alt || `${item.title} screenshot`}
        className="work-grid-block__screenshot"
        width={200}
        height={112}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function setLocationHash(href: string) {
  if (typeof window === "undefined") return;
  const next = new URL(href, window.location.origin);
  const current = `${window.location.pathname}${window.location.hash}`;
  const target = `${next.pathname}${next.hash}`;
  if (current === target) return;
  window.history.pushState(null, "", target);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export default function WorkGridBlock({
  eyebrow = "03 / Selected Work",
  title = "Selected ESPN & Disney Initiatives",
  items = [],
}: WorkGridBlockType) {
  const [activeItem, setActiveItem] = useState<WorkItem | null>(null);
  const anchorIds = useMemo(
    () => uniqueCatalogAnchorIds("work", items),
    [items],
  );

  const itemForHash = useCallback(
    (hash: string) => {
      const index = anchorIds.indexOf(hash);
      return index >= 0 ? items[index] : undefined;
    },
    [anchorIds, items],
  );

  useEffect(() => {
    function syncFromHash() {
      const match = itemForHash(hashFromLocation());
      setActiveItem(
        match && hasCaseStudyContent(match.caseStudy) ? match : null,
      );
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [itemForHash]);

  const closeModal = useCallback(() => {
    setActiveItem(null);
    if (itemForHash(hashFromLocation())) {
      setLocationHash(catalogItemHashHref("work"));
    }
  }, [itemForHash]);

  const openItem = useCallback((item: WorkItem, id: string) => {
    setActiveItem(item);
    setLocationHash(catalogItemHashHref(id));
  }, []);

  return (
    <section className="work-grid-block">
      <div className="work-grid-block__inner">
        <SectionHeader eyebrow={eyebrow} title={title} tone="dark" />
        <div className="work-grid-block__grid">
          {items.map((item, i) => {
            const canOpenModal = hasCaseStudyContent(item.caseStudy);
            const href = item.href?.trim();
            const anchorId = anchorIds[i];
            const hashHref = catalogItemHashHref(anchorId);
            const viewButton = href ? (
              <ViewButton
                href={href}
                title={item.title}
                className="work-grid-block__view"
              />
            ) : null;

            if (canOpenModal) {
              return (
                <article
                  key={`${item.title}-${i}`}
                  id={anchorId}
                  className="work-grid-block__card work-grid-block__card--interactive"
                >
                  <a
                    className="work-grid-block__open"
                    href={hashHref}
                    aria-haspopup="dialog"
                    aria-label={`Open case study: ${item.title}`}
                    onClick={(event) => {
                      event.preventDefault();
                      openItem(item, anchorId);
                    }}
                  >
                    <CardContent item={item} />
                    <CardScreenshot item={item} />
                    <span className="work-grid-block__link">
                      Case Study Highlights
                    </span>
                  </a>
                  {viewButton}
                </article>
              );
            }

            return (
              <article
                key={`${item.title}-${i}`}
                id={anchorId}
                className="work-grid-block__card"
              >
                <CardContent item={item} />
                <CardScreenshot item={item} />
                {viewButton ?? (
                  <span className="work-grid-block__link work-grid-block__link--static">
                    Case Study Highlights
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <WorkCaseStudyModal item={activeItem} onClose={closeModal} />
    </section>
  );
}
