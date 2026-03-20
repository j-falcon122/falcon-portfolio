import type { SiteSettings } from "@/lib/cms/types";

export default function SiteFooter({ site }: { site: SiteSettings }) {
  return (
    <footer className="site-footer fixed-footer">
      <div className="mx-auto max-w-6xl px-6 py-4 text-sm opacity-80">
        {site.footerText || `© ${site.title}`}
      </div>
    </footer>
  );
}