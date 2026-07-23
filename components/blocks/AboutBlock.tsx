import Image from "next/image";
import type { FalconAboutBlock } from "@/lib/cms/falconTypes";
import { withAssetPath } from "portfolio-core/lib/basePath";
import SectionHeader from "./SectionHeader";

export default function AboutBlock({
  eyebrow = "01 / About",
  title = "About Me",
  body,
  playbookTitle = "Personal Playbook",
  image,
  resume,
  stats = [],
}: FalconAboutBlock) {
  const resumeHref = resume?.href
    ? resume.href.startsWith("http://") || resume.href.startsWith("https://")
      ? resume.href
      : withAssetPath(resume.href)
    : undefined;
  const resumeLabel = resume?.label || "Download resume";

  return (
    <section className="about-block about-block--figma">
      <div className="about-block__inner">
        <div className="about-block__narrative">
          <SectionHeader eyebrow={eyebrow} title={title} tone="light" />
          {body ? <p className="about-block__body">{body}</p> : null}
          {resumeHref ? (
            <p className="about-block__resume">
              <a
                className="about-block__resume-link"
                href={resumeHref}
                download={resume?.filename || undefined}
                target="_blank"
                rel="noopener noreferrer"
              >
                {resumeLabel}
              </a>
            </p>
          ) : null}
        </div>

        {image?.src || stats.length ? (
          <div className="about-block__aside">
            {image?.src ? (
              <div className="about-block__media">
                <Image
                  src={
                    image.src.startsWith("http://") ||
                    image.src.startsWith("https://")
                      ? image.src
                      : withAssetPath(image.src)
                  }
                  alt={image.alt || "Headshot"}
                  width={720}
                  height={900}
                  className="about-block__image"
                  sizes="(max-width: 900px) 100vw, 30rem"
                />
              </div>
            ) : null}

            {stats.length ? (
              <aside className="about-block__playbook">
                <h3 className="about-block__playbook-title">{playbookTitle}</h3>
                <ul className="about-block__playbook-list">
                  {stats.map((stat, i) => (
                    <li
                      key={`${stat.label}-${i}`}
                      className="about-block__playbook-item"
                    >
                      <span className="about-block__playbook-label">
                        {stat.label || stat.value}
                      </span>
                      <span className="about-block__playbook-value">
                        {stat.label ? stat.value : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
