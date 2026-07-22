import type { WorkGridBlock } from "@/lib/cms/falconTypes";
import SectionHeader from "./SectionHeader";

export default function WorkGridBlock({
  eyebrow = "03 / Selected Work",
  title = "Selected ESPN & Disney Initiatives",
  items = [],
}: WorkGridBlock) {
  return (
    <section className="work-grid-block">
      <div className="work-grid-block__inner">
        <SectionHeader eyebrow={eyebrow} title={title} tone="dark" />
        <div className="work-grid-block__grid">
          {items.map((item, i) => (
            <article key={`${item.title}-${i}`} className="work-grid-block__card">
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
              {item.href ? (
                <a className="work-grid-block__link" href={item.href}>
                  {item.linkLabel || "Case Study Highlights"}
                </a>
              ) : (
                <span className="work-grid-block__link work-grid-block__link--static">
                  {item.linkLabel || "Case Study Highlights"}
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
