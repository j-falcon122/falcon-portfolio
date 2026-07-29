"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import type { WorkCaseStudy, WorkItem } from "@/lib/cms/falconTypes";
import { withAssetPath } from "portfolio-core/lib/basePath";

const CASE_STUDY_SECTIONS: { key: keyof WorkCaseStudy; label: string }[] = [
  { key: "project", label: "Project" },
  { key: "problem", label: "Problem" },
  { key: "myRole", label: "My role" },
  { key: "actionsAndDecisions", label: "Actions and decisions" },
  { key: "challenge", label: "Challenge" },
  { key: "result", label: "Result" },
  { key: "learning", label: "Learning" },
];

export function hasCaseStudyContent(caseStudy?: WorkCaseStudy): boolean {
  if (!caseStudy) return false;
  return CASE_STUDY_SECTIONS.some(({ key }) => Boolean(caseStudy[key]?.trim()));
}

function resolveImageSrc(src: string): string {
  return src.startsWith("http://") || src.startsWith("https://")
    ? src
    : withAssetPath(src);
}

type WorkCaseStudyModalProps = {
  item: WorkItem | null;
  onClose: () => void;
};

export default function WorkCaseStudyModal({
  item,
  onClose,
}: WorkCaseStudyModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = Boolean(item && hasCaseStudyContent(item.caseStudy));

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !item?.caseStudy) return null;

  const sections = CASE_STUDY_SECTIONS.filter(({ key }) =>
    Boolean(item.caseStudy?.[key]?.trim()),
  );

  return (
    <div
      className="work-case-study-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="work-case-study-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="work-case-study-modal__header">
          <div className="work-case-study-modal__header-copy">
            {item.tags?.length ? (
              <div className="work-case-study-modal__tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="work-grid-block__tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <h2 id={titleId} className="work-case-study-modal__title">
              {item.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="work-case-study-modal__close"
            onClick={onClose}
            aria-label="Close case study"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="work-case-study-modal__body">
          {item.screenshot?.src ? (
            <div className="work-case-study-modal__media">
              <Image
                src={resolveImageSrc(item.screenshot.src)}
                alt={item.screenshot.alt || `${item.title} screenshot`}
                width={1200}
                height={675}
                className="work-case-study-modal__screenshot"
                sizes="(max-width: 720px) 100vw, 40rem"
              />
            </div>
          ) : null}
          {sections.map(({ key, label }, index) => (
            <section key={key} className="work-case-study-modal__section">
              <p className="work-case-study-modal__step">
                {String(index + 1).padStart(2, "0")} / {label}
              </p>
              <p className="work-case-study-modal__text">
                {item.caseStudy?.[key]}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
