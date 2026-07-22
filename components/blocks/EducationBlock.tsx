import type { EducationBlock } from "@/lib/cms/falconTypes";
import SectionHeader from "./SectionHeader";

export default function EducationBlock({
  eyebrow = "06 / Education",
  title = "Education",
  items = [],
}: EducationBlock) {
  return (
    <section className="education-block">
      <div className="education-block__inner">
        <SectionHeader eyebrow={eyebrow} title={title} tone="light" />
        <ul className="education-block__list">
          {items.map((item, i) => (
            <li key={`${item.school}-${i}`} className="education-block__item">
              <div>
                <h3 className="education-block__school">{item.school}</h3>
                <p className="education-block__detail">{item.detail}</p>
              </div>
              {item.years ? (
                <span className="education-block__years">{item.years}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
