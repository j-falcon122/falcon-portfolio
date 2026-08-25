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

function CardScreenshot({ item }: { item: ProjectItem }) {
  if (!item.screenshot?.src) return null;
  return (
    <div className="project-list-block__media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveImageSrc(item.screenshot.src)}
        alt={item.screenshot.alt || `${item.title} screenshot`}
        className="project-list-block__screenshot"
        width={480}
        height={270}
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
            return (
              <article
                key={`${item.title}-${i}`}
                className={`project-list-block__card${hasScreenshot ? " project-list-block__card--has-media" : ""}`}
              >
                <CardScreenshot item={item} />
                <div className="project-list-block__body">
                  <h3 className="project-list-block__card-title">{item.title}</h3>
                  <p className="project-list-block__card-body">
                    {item.description}
                  </p>
                  {item.tags?.length ? (
                    <div className="project-list-block__tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="project-list-block__tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
