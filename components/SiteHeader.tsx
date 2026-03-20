"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/cms/types";

export default function SiteHeader({ site }: { site: SiteSettings }) {
  // avoid using path-derived values during server render to prevent hydration
  // mismatches — determine path on the client after mount
  const [clientPath, setClientPath] = useState<string | null>(null);

  useEffect(() => {
    setClientPath(window.location.pathname || "/");
  }, []);

  return (
    <header className="header">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-sm font-medium">{site.title}</div>

        <nav className="site-nav flex gap-6 text-sm opacity-90">
          {site.nav?.map((item) => {
            const active = clientPath
              ? item.href === clientPath || (item.href !== "/" && clientPath.startsWith(item.href))
              : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${active ? "nav-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  try {
                    const href = item.href || "";
                    // normalize to an id: if href is '/', target the 'home' section
                    let parsed = "";
                    if (href.startsWith("/")) parsed = href.replace(/^\//, "").replace(/\/$/, "");
                    else parsed = href.replace(/^#/, "");
                    const targetId = parsed === "" ? "home" : parsed;
                    const el = document.getElementById(targetId);
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                      // update history so back/forward restore position
                      try {
                        const newUrl = href.startsWith("/") ? href : `#${targetId}`;
                        window.history.pushState({ section: targetId }, "", newUrl);
                      } catch (err) {
                        // ignore history errors
                      }
                    }
                  } catch (err) {
                    // ignore and allow normal navigation
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}