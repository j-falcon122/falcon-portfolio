"use client";

import { useCallback, useState, type KeyboardEvent } from "react";
import type {
  WorkGridBlock as WorkGridBlockType,
  WorkItem,
} from "@/lib/cms/falconTypes";
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

export default function WorkGridBlock({
  eyebrow = "03 / Selected Work",
  title = "Selected ESPN & Disney Initiatives",
  items = [],
}: WorkGridBlockType) {
  const [activeItem, setActiveItem] = useState<WorkItem | null>(null);
  const closeModal = useCallback(() => setActiveItem(null), []);

  const openItem = useCallback((item: WorkItem) => {
    setActiveItem(item);
  }, []);

  const onCardKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, item: WorkItem) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openItem(item);
      }
    },
    [openItem],
  );

  return (
    <section className="work-grid-block">
      <div className="work-grid-block__inner">
        <SectionHeader eyebrow={eyebrow} title={title} tone="dark" />
        <div className="work-grid-block__grid">
          {items.map((item, i) => {
            const canOpenModal = hasCaseStudyContent(item.caseStudy);
            const label = item.linkLabel || "Case Study Highlights";

            if (canOpenModal) {
              return (
                <article
                  key={`${item.title}-${i}`}
                  className="work-grid-block__card work-grid-block__card--interactive"
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  aria-label={`Open case study: ${item.title}`}
                  onClick={() => openItem(item)}
                  onKeyDown={(event) => onCardKeyDown(event, item)}
                >
                  <CardContent item={item} />
                  <CardScreenshot item={item} />
                  <span className="work-grid-block__link" aria-hidden="true">
                    {label}
                  </span>
                </article>
              );
            }

            return (
              <article
                key={`${item.title}-${i}`}
                className="work-grid-block__card"
              >
                <CardContent item={item} />
                <CardScreenshot item={item} />
                {item.href ? (
                  <a className="work-grid-block__link" href={item.href}>
                    {label}
                  </a>
                ) : (
                  <span className="work-grid-block__link work-grid-block__link--static">
                    {label}
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
