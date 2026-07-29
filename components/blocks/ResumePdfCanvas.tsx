"use client";

import { useEffect, useRef, useState } from "react";

type ResumePdfCanvasProps = {
  src: string;
  title: string;
  openHref: string;
};

export default function ResumePdfCanvas({
  src,
  title,
  openHref,
}: ResumePdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();
    setStatus("loading");

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const { getDocument, GlobalWorkerOptions, version } = pdfjs;
        // CDN worker avoids Next/Turbopack bundling quirks with the .mjs worker.
        GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

        const task = getDocument({ url: src, withCredentials: false });
        const pdf = await task.promise;
        if (cancelled) {
          await pdf.destroy();
          return;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          if (cancelled) break;
          const page = await pdf.getPage(pageNumber);
          const unscaled = page.getViewport({ scale: 1 });
          const width = container.clientWidth || 800;
          const scale = width / unscaled.width;
          const viewport = page.getViewport({ scale: scale * dpr });

          const canvas = document.createElement("canvas");
          canvas.className = "resume-preview-modal__page";
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / dpr}px`;
          canvas.style.height = `${viewport.height / dpr}px`;
          canvas.setAttribute(
            "aria-label",
            `${title} page ${pageNumber} of ${pdf.numPages}`
          );

          await page.render({ canvas, viewport }).promise;
          if (cancelled) {
            page.cleanup();
            break;
          }
          container.appendChild(canvas);
          page.cleanup();
        }

        await pdf.destroy();
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [src, title]);

  return (
    <div className="resume-preview-modal__canvas-wrap">
      {status === "loading" ? (
        <p className="resume-preview-modal__status" role="status">
          Loading preview…
        </p>
      ) : null}
      {status === "error" ? (
        <p className="resume-preview-modal__status" role="alert">
          Preview unavailable.{" "}
          <a href={openHref} target="_blank" rel="noopener noreferrer">
            Open the PDF
          </a>
          .
        </p>
      ) : null}
      <div
        ref={containerRef}
        className="resume-preview-modal__pages"
        hidden={status !== "ready"}
      />
    </div>
  );
}
