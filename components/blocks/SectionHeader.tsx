type SectionHeaderProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tone?: "light" | "dark";
};

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  tone = "dark",
}: SectionHeaderProps) {
  if (!eyebrow && !title && !subtitle) return null;

  return (
    <header className={`section-header section-header--${tone}`}>
      {eyebrow ? (
        <div className="section-header__eyebrow">
          <span className="section-header__accent" aria-hidden="true" />
          <span className="section-header__eyebrow-text">{eyebrow}</span>
        </div>
      ) : null}
      {title ? <h2 className="section-header__title">{title}</h2> : null}
      {subtitle ? <p className="section-header__subtitle">{subtitle}</p> : null}
    </header>
  );
}
