import type { SkillsBlock } from "@/lib/cms/falconTypes";
import SectionHeader from "./SectionHeader";

export default function SkillsBlock({
  eyebrow = "05 / Skills",
  title = "Technical Capabilities",
  categories = [],
}: SkillsBlock) {
  return (
    <section className="skills-block">
      <div className="skills-block__inner">
        <SectionHeader eyebrow={eyebrow} title={title} tone="light" />
        <div className="skills-block__grid">
          {categories.map((cat, i) => (
            <article key={`${cat.title}-${i}`} className="skills-block__card">
              <h3 className="skills-block__card-title">{cat.title}</h3>
              <ul className="skills-block__items">
                {cat.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
