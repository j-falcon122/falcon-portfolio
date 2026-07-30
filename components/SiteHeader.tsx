"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { SiteSettings } from "portfolio-core/lib/cms/types";
import { withBasePath } from "portfolio-core/lib/basePath";
import { resolveNavHref } from "portfolio-core/lib/resolveNavHref";
import { scrollToPageSectionWhenReady } from "portfolio-core/lib/scrollToPageSection";
import SiteBrand from "portfolio-core/components/SiteBrand";

/** Matches the CSS hamburger breakpoint in globals.css */
const MOBILE_NAV_MQ = "(max-width: 1100px)";
const SCROLL_DELTA = 8;

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
  const [isAtTop, setIsAtTop] = useState(true);
  const [navHidden, setNavHidden] = useState(false);
  const [menuOpenForRoute, setMenuOpenForRoute] = useState<string | null>(null);
  const lastScrollY = useRef(0);
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

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_NAV_MQ);
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const isMobileNav = () => mq.matches;

    const revealNav = () => setNavHidden(false);

    const updateFromScroll = () => {
      const y = window.scrollY;
      setIsAtTop(y <= 0);

      if (!isMobileNav() || menuOpen) {
        setNavHidden(false);
        lastScrollY.current = y;
        return;
      }

      const delta = y - lastScrollY.current;
      if (y <= 12) {
        setNavHidden(false);
      } else if (delta > SCROLL_DELTA) {
        setNavHidden(true);
      } else if (delta < -SCROLL_DELTA) {
        setNavHidden(false);
      }
      lastScrollY.current = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateFromScroll();
        ticking = false;
      });
    };

    const onTapReveal = () => {
      if (isMobileNav()) revealNav();
    };

    const onMqChange = () => {
      if (!isMobileNav()) setNavHidden(false);
    };

    updateFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Tap/click (not scroll) brings the bar back after it auto-hides
    window.addEventListener("click", onTapReveal, { capture: true });
    window.addEventListener("keydown", onTapReveal);
    mq.addEventListener("change", onMqChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onTapReveal, { capture: true });
      window.removeEventListener("keydown", onTapReveal);
      mq.removeEventListener("change", onMqChange);
    };
  }, [menuOpen]);

  const useHeroNavStyle = hasMounted
    ? isHome && isAtTop && isHomeHash
    : isHome;
  const headerState = [
    useHeroNavStyle ? "site-header--at-top" : "site-header--solid",
    navHidden && !menuOpen ? "site-header--hidden" : "",
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
      data-nav-hidden={navHidden && !menuOpen ? "true" : "false"}
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
