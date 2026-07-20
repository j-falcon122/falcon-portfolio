import Image from "next/image";
import type { HeroBlock as HeroBlockType } from "portfolio-core/lib/cms/types";
import { withAssetPath } from "portfolio-core/lib/basePath";
import { getCms } from "portfolio-core/lib/cms";
import SinglePageNavLink from "portfolio-core/components/SinglePageNavLink";

const HERO_PANEL_SRC = "/figma/hero-logo.png";

export default async function HeroBlock({
  brandTitle,
  headline,
  subheadline,
  cta,
  ctas,
}: HeroBlockType) {
  const site = await getCms().getSiteSettings();
  const heroCtas =
    ctas?.length
      ? ctas
      : cta?.label && cta?.href
        ? [cta]
        : [];

  return (
    <section className="hero relative -mt-[var(--header-height)] min-h-screen w-full overflow-hidden">
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
                {heroCtas.map((item, index) => (
                  <SinglePageNavLink
                    key={`${item.href}-${index}`}
                    href={item.href}
                    navigationMode={site.navigationMode}
                    className={`hero__cta${index > 0 ? " hero__cta--secondary" : ""}`}
                  >
                    {item.label}
                  </SinglePageNavLink>
                ))}
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
    </section>
  );
}
