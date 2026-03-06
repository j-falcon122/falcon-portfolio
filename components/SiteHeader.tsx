import Link from "next/link";
import type { SiteSettings } from "@/lib/cms/types";

export default function SiteHeader({ site }: { site: SiteSettings }) {
  return (
    <header className="absolute left-0 right-0 top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-sm font-medium">{site.title}</div>

        <nav className="flex gap-6 text-sm opacity-90">
          {site.nav?.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-100">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}