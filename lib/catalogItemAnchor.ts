import { withBasePath } from "portfolio-core/lib/basePath";

const RESERVED_SECTION_IDS = new Set([
  "home",
  "about",
  "experience",
  "work",
  "projects",
  "skills",
  "education",
  "contact",
  "main-content",
]);

export function slugifyAnchor(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function catalogItemAnchorId(
  kind: "work" | "project",
  title: string,
  explicitId?: string,
): string {
  const explicit = explicitId ? slugifyAnchor(explicitId) : "";
  if (explicit && !RESERVED_SECTION_IDS.has(explicit)) return explicit;
  const fromTitle = slugifyAnchor(title) || "item";
  const prefixed = `${kind}-${fromTitle}`;
  return RESERVED_SECTION_IDS.has(prefixed) ? `${prefixed}-card` : prefixed;
}

export function uniqueCatalogAnchorIds(
  kind: "work" | "project",
  items: { title: string; id?: string }[],
): string[] {
  const used = new Set<string>();
  return items.map((item) => {
    const base = catalogItemAnchorId(kind, item.title, item.id);
    let id = base;
    let n = 2;
    while (used.has(id) || RESERVED_SECTION_IDS.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    return id;
  });
}

export function catalogItemHashHref(id: string): string {
  return withBasePath(`/#${id}`);
}

export function hashFromLocation(): string {
  if (typeof window === "undefined") return "";
  return decodeURIComponent(window.location.hash.replace(/^#/, "")).trim();
}
