"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useId,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { SiteSettings } from "portfolio-core/lib/cms/types";
import { withBasePath } from "portfolio-core/lib/basePath";
import { resolveNavHref } from "portfolio-core/lib/resolveNavHref";
import { scrollToPageSectionWhenReady } from "portfolio-core/lib/scrollToPageSection";
import { useAutoHideHeader } from "portfolio-core/lib/useAutoHideHeader";
import SiteBrand from "portfolio-core/components/SiteBrand";

/** Matches the CSS hamburger breakpoint in globals.css */
const MOBILE_NAV_MQ = "(max-width: 1100px)";

function sectionKeyFromNavHref(href: string): string | null {
  if (href === "/" || href === "") return "home";
  const m = href.match(/^\/([^/]+)\/?$/);
  return m ? m[1] : null;
}

export default function SiteHeader({
  site,
  adminNav,
}: {
  site: SiteSettings;
  adminNav?: { href: string; label: string };
}) {
  const pathname = usePathname() || "/";
  const navMode = site.navigationMode ?? "routes";
  const singlePage = navMode === "single-page";
  const isHome = pathname === "/";
  const [menuOpenForRoute, setMenuOpenForRoute] = useState<string | null>(null);
  const menuId = useId();

  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const hash = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("hashchange", onStoreChange);
      return () => window.removeEventListener("hashchange", onStoreChange);
    },
    () => window.location.hash,
    () => ""
  );

  const hashSection = hash.replace(/^#/, "");
  const isHomeHash = !hashSection || hashSection === "home";
  const routeKey = `${pathname}${hash}`;
  const menuOpen = menuOpenForRoute === routeKey;

  const { isAtTop, headerVisible } = useAutoHideHeader({
    mode: "scroll-direction",
    forceVisible: menuOpen,
    mediaQuery: MOBILE_NAV_MQ,
  });

  const useHeroNavStyle = hasMounted
    ? isHome && isAtTop && isHomeHash
    : isHome;
  const headerState = [
    useHeroNavStyle ? "site-header--at-top" : "site-header--solid",
    !headerVisible ? "site-header--hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function closeMenu() {
    setMenuOpenForRoute(null);
  }

  function toggleMenu() {
    setMenuOpenForRoute((current) => (current === routeKey ? null : routeKey));
  }

  function handleSinglePageNavClick(
    e: ReactMouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    const hashMatch = href.match(/#([^/?#]+)$/);
    if (!singlePage || !hashMatch) return;
    e.preventDefault();
    closeMenu();
    const sectionId = hashMatch[1];
    const targetHref = withBasePath(`/#${sectionId}`);

    if (!isHome) {
      window.location.assign(targetHref);
      return;
    }

    window.history.pushState(null, "", targetHref);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    scrollToPageSectionWhenReady(sectionId);
  }

  function isNavActive(itemHref: string): boolean {
    if (singlePage && isHome) {
      const section = sectionKeyFromNavHref(itemHref);
      const current = hash.replace(/^#/, "") || "home";
      if (section === "home") return current === "home";
      if (section) return current === section;
      return false;
    }
    return (
      itemHref === pathname || (itemHref !== "/" && pathname.startsWith(itemHref))
    );
  }

  function navAriaCurrent(itemHref: string, active: boolean) {
    if (!active) return undefined;
    return singlePage && isHome ? "location" : "page";
  }

  const navItems = site.nav ?? [];

  return (
    <header
      className={`site-header site-header--persistent fixed inset-x-0 top-0 z-50 w-full ${headerState}`}
      data-nav-hidden={headerVisible ? "false" : "true"}
    >
      <div className="site-header__inner">
        <div className="site-header__brand-wrap shrink-0">
          {singlePage && isHome ? (
            <Link
              href="/#home"
              className="site-header__brand text-lg font-semibold tracking-wide no-underline"
              onClick={(e) => handleSinglePageNavClick(e, "/#home")}
            >
              <SiteBrand title={site.title} logoClassName="w-auto" />
            </Link>
          ) : (
            <Link
              href="/"
              className="site-header__brand text-lg font-semibold tracking-wide no-underline"
            >
              <SiteBrand title={site.title} logoClassName="w-auto" />
            </Link>
          )}
        </div>

        <button
          type="button"
          className="site-header__menu-toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={toggleMenu}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true">{menuOpen ? "✕" : "Menu"}</span>
        </button>

        <nav
          id={menuId}
          className={`site-nav${menuOpen ? " site-nav--open" : ""}`}
          aria-label="Main"
        >
          {navItems.map((item) => {
            const resolvedHref = resolveNavHref(item.href, navMode);
            const active = isNavActive(item.href);
            const className = `nav-link no-underline ${active ? "nav-link--active" : ""}`;
            const ariaCurrent = navAriaCurrent(item.href, active);
            const useNativeAnchor = resolvedHref.startsWith("/#");
            const anchorHref = useNativeAnchor
              ? withBasePath(resolvedHref)
              : resolvedHref;

            if (useNativeAnchor) {
              return (
                <a
                  key={`${item.href}-${resolvedHref}`}
                  href={anchorHref}
                  className={className}
                  aria-current={ariaCurrent}
                  onClick={(e) => handleSinglePageNavClick(e, anchorHref)}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={`${item.href}-${resolvedHref}`}
                href={resolvedHref}
                className={className}
                aria-current={ariaCurrent}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            );
          })}
          {adminNav ? (
            /^https?:\/\//i.test(adminNav.href) ? (
              <a
                href={adminNav.href}
                className="nav-link nav-link--admin"
                target={
                  /localhost|127\.0\.0\.1/i.test(adminNav.href)
                    ? undefined
                    : "_blank"
                }
                rel={
                  /localhost|127\.0\.0\.1/i.test(adminNav.href)
                    ? undefined
                    : "noopener noreferrer"
                }
                aria-label={`${adminNav.label} (opens in new tab)`}
              >
                {adminNav.label}
              </a>
            ) : (
              <Link
                href={adminNav.href}
                className="nav-link nav-link--admin"
                onClick={closeMenu}
              >
                {adminNav.label}
              </Link>
            )
          ) : null}
        </nav>
      </div>
    </header>
  );
}
