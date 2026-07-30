"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { HeroBlock as HeroBlockType } from "portfolio-core/lib/cms/types";
import { withAssetPath } from "portfolio-core/lib/basePath";
import SinglePageNavLink from "portfolio-core/components/SinglePageNavLink";
import ResumePreviewModal from "./ResumePreviewModal";

const HERO_PANEL_SRC = "/figma/hero-logo.png";

function isPdfHref(href: string): boolean {
  return /\.pdf($|\?)/i.test(href);
}

function isFileOrExternalHref(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    isPdfHref(href)
  );
}

function resolveAssetHref(href: string): string {
  return href.startsWith("http://") || href.startsWith("https://")
    ? href
    : withAssetPath(href);
}

/**
 * Sync / client-safe: do not import getCms (pulls node:fs via the mock CMS provider).
 * Falcon is single-page; navigationMode is fixed accordingly.
 */
export default function HeroBlock({
  brandTitle,
  headline,
  subheadline,
  cta,
  ctas,
}: HeroBlockType) {
  const [resumeHref, setResumeHref] = useState<string | null>(null);
  const closeResume = useCallback(() => setResumeHref(null), []);

  const heroCtas =
    ctas?.length
      ? ctas
      : cta?.label && cta?.href
        ? [cta]
        : [];

  return (
    <section className="hero relative min-h-screen w-full overflow-hidden">
      <div className="hero__inner">
        <div className="hero__layout">
          <div className="hero__content">
            <div className="hero__badge">
              <span className="hero__badge-dot" aria-hidden="true" />
              Currently open to software engineering opportunities
            </div>

            {brandTitle ? <div className="hero__brand">{brandTitle}</div> : null}

            <h1 className="hero__headline">{headline}</h1>

            {subheadline ? <p className="hero__sub">{subheadline}</p> : null}

            {heroCtas.length ? (
              <div className="hero__ctas">
                {heroCtas.map((item, index) => {
                  const className = `hero__cta${index > 0 ? " hero__cta--secondary" : ""}`;
                  if (isFileOrExternalHref(item.href)) {
                    const href = resolveAssetHref(item.href);
                    if (isPdfHref(href)) {
                      return (
                        <a
                          key={`${item.href}-${index}`}
                          href={href}
                          className={className}
                          aria-haspopup="dialog"
                          onClick={(event) => {
                            event.preventDefault();
                            setResumeHref(href);
                          }}
                        >
                          {item.label}
                        </a>
                      );
                    }
                    return (
                      <a
                        key={`${item.href}-${index}`}
                        href={href}
                        className={className}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.label}
                      </a>
                    );
                  }
                  return (
                    <SinglePageNavLink
                      key={`${item.href}-${index}`}
                      href={item.href}
                      navigationMode="single-page"
                      className={className}
                    >
                      {item.label}
                    </SinglePageNavLink>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="hero__panel" aria-hidden="true">
            <div className="hero__panel-inner">
              <span className="hero__panel-ring" />
              <Image
                src={withAssetPath(HERO_PANEL_SRC)}
                alt=""
                width={640}
                height={480}
                priority
                className="hero__panel-logo"
              />
            </div>
          </div>
        </div>
      </div>

      <ResumePreviewModal href={resumeHref} onClose={closeResume} />
    </section>
  );
}
