import type { ProjectListBlock } from "@/lib/cms/falconTypes";
import SectionHeader from "./SectionHeader";

export default function ProjectListBlock({
  eyebrow = "04 / Personal Projects",
  title = "Personal Projects & Passion Pursuits",
  items = [],
}: ProjectListBlock) {
  return (
    <section className="project-list-block">
      <div className="project-list-block__inner">
        <SectionHeader eyebrow={eyebrow} title={title} tone="light" />
        <div className="project-list-block__list">
          {items.map((item, i) => (
            <article key={`${item.title}-${i}`} className="project-list-block__card">
              <h3 className="project-list-block__card-title">{item.title}</h3>
              <p className="project-list-block__card-body">{item.description}</p>
              {item.tags?.length ? (
                <div className="project-list-block__tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="project-list-block__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
