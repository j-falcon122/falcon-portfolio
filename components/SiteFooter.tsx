import type { SiteSettings } from "@/lib/cms/types";

export default function SiteFooter({ site }: { site: SiteSettings }) {
  return (
<<<<<<< HEAD
    <footer className="site-footer fixed-footer">
      <div className="mx-auto max-w-6xl px-6 py-4 text-sm opacity-80">
        {site.footerText || `© ${site.title}`}
      </div>
=======
    <footer className="mx-auto max-w-6xl px-6 py-10 text-sm opacity-70">
      {site.footerText || `© ${site.title}`}
>>>>>>> falcon/main
    </footer>
  );
}