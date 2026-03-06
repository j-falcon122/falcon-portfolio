import type { SiteSettings } from "@/lib/cms/types";

export default function SiteFooter({ site }: { site: SiteSettings }) {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-10 text-sm opacity-70">
      {site.footerText || `© ${site.title}`}
    </footer>
  );
}