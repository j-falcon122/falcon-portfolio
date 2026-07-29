"use client";

import { useEffect, useId, useRef } from "react";
import ResumePdfCanvas from "./ResumePdfCanvas";
import {
  getResumePdfFetchUrl,
  getResumePreviewIframeSrc,
  isStaticExportBuild,
} from "@/lib/resumePreviewSrc";

type ResumePreviewModalProps = {
  href: string | null;
  filename?: string;
  title?: string;
  onClose: () => void;
};

export default function ResumePreviewModal({
  href,
  filename,
  title = "Résumé",
  onClose,
}: ResumePreviewModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = Boolean(href);
  const usePdfJs = !isStaticExportBuild();

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

  if (!href) return null;

  const downloadName = filename || title;

  return (
    <div
      className="resume-preview-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="resume-preview-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="resume-preview-modal__header">
          <h2 id={titleId} className="resume-preview-modal__title">
            {title}
          </h2>
          <div className="resume-preview-modal__actions">
            <a
              className="resume-preview-modal__action"
              href={href}
              download={downloadName}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
            <a
              className="resume-preview-modal__action"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
            </a>
            <button
              ref={closeRef}
              type="button"
              className="resume-preview-modal__close"
              onClick={onClose}
              aria-label="Close résumé preview"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>

        <div className="resume-preview-modal__body">
          {usePdfJs ? (
            <ResumePdfCanvas
              src={getResumePdfFetchUrl(href)}
              title={title}
              openHref={href}
            />
          ) : (
            <iframe
              className="resume-preview-modal__frame"
              src={getResumePreviewIframeSrc(href)}
              title={`${title} PDF preview`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
