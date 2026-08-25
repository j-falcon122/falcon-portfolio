import type {
  ProjectItem,
  ProjectListBlock as ProjectListBlockType,
} from "@/lib/cms/falconTypes";
import { withAssetPath } from "portfolio-core/lib/basePath";
import SectionHeader from "./SectionHeader";

function resolveImageSrc(src: string): string {
  return src.startsWith("http://") || src.startsWith("https://")
    ? src
    : withAssetPath(src);
}

function textEntries(values?: string[]): string[] {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function CardScreenshot({ item }: { item: ProjectItem }) {
  if (!item.screenshot?.src) return null;
  return (
    <div className="project-list-block__media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveImageSrc(item.screenshot.src)}
        alt={item.screenshot.alt || `${item.title} screenshot`}
        className="project-list-block__screenshot"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export default function ProjectListBlock({
  eyebrow = "04 / Personal Projects",
  title = "Personal Projects & Passion Pursuits",
  items = [],
}: ProjectListBlockType) {
  return (
    <section className="project-list-block">
      <div className="project-list-block__inner">
        <SectionHeader eyebrow={eyebrow} title={title} tone="light" />
        <div className="project-list-block__list">
          {items.map((item, i) => {
            const hasScreenshot = Boolean(item.screenshot?.src);
            const cardTitle = item.title.trim();
            const cardDescription = item.description.trim();
            const tags = textEntries(item.tags);
            const hasCopy = Boolean(cardTitle || cardDescription || tags.length);
            if (!hasCopy && !hasScreenshot) return null;
            return (
              <article
                key={`${item.title}-${i}`}
                className={`project-list-block__card${hasScreenshot ? " project-list-block__card--has-media" : ""}`}
              >
                <CardScreenshot item={item} />
                {hasCopy ? (
                  <div className="project-list-block__body">
                    {cardTitle ? (
                      <h3 className="project-list-block__card-title">
                        {cardTitle}
                      </h3>
                    ) : null}
                    {cardDescription ? (
                      <p className="project-list-block__card-body">
                        {cardDescription}
                      </p>
                    ) : null}
                    {tags.length ? (
                      <div className="project-list-block__tags">
                        {tags.map((tag) => (
                          <span key={tag} className="project-list-block__tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
