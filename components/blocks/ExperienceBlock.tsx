"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import type {
  ExperienceBlock,
  ExperienceMilestone,
  ExperienceMilestoneKind,
} from "@/lib/cms/falconTypes";
import SectionHeader from "./SectionHeader";

function milestoneKind(m: ExperienceMilestone): ExperienceMilestoneKind {
  if (m.kind === "job" || m.kind === "internship" || m.kind === "education") {
    return m.kind;
  }
  return m.highlighted ? "internship" : "job";
}

function MilestoneCardBody({ m }: { m: ExperienceMilestone }) {
  const hasDetails = Boolean(m.details?.length);
  return (
    <>
      <p className="experience-block__role">{m.title}</p>
      {m.organization ? (
        <p className="experience-block__org">{m.organization}</p>
      ) : null}
      {hasDetails ? (
        <ul className="experience-block__details">
          {m.details!.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function MilestoneCard({
  m,
  href,
  children,
}: {
  m: ExperienceMilestone;
  href?: string;
  children: ReactNode;
}) {
  if (href) {
    return (
      <Link
        href={href}
        className="experience-block__card experience-block__card--link"
        aria-label={`Open full details for ${m.title}`}
        draggable={false}
      >
        {children}
      </Link>
    );
  }
  return <div className="experience-block__card">{children}</div>;
}

/** Scroll about three milestone cards (200px + 20px gap). */
const SCROLL_STEP = 660;
/** Ignore click/tap activation after a horizontal drag past this distance. */
const DRAG_CLICK_THRESHOLD_PX = 10;

export default function ExperienceBlock({
  eyebrow = "02 / Experience",
  title = "Professional Track Record",
  subtitle,
  milestones = [],
  ctaLabel = "Show More",
  ctaHint = "Open the full monograph for a complete breakdown of each role.",
  ctaHref = "/experience-details",
}: ExperienceBlock) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    moved: boolean;
  }>({ pointerId: null, startX: 0, startY: 0, moved: false });
  const detailsBase = ctaHref || "/experience-details";

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;
    setCanScrollLeft(left > 2);
    setCanScrollRight(maxScroll > 2 && left < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [milestones.length, updateScrollState]);

  const scrollByAmount = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" });
  };

  const onScrollerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByAmount(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByAmount(1);
    }
  };

  const onScrollerPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
  };

  const onScrollerPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId || drag.moved) return;
    const dx = Math.abs(event.clientX - drag.startX);
    const dy = Math.abs(event.clientY - drag.startY);
    if (dx > DRAG_CLICK_THRESHOLD_PX || dy > DRAG_CLICK_THRESHOLD_PX) {
      drag.moved = true;
      // Don't leave a mid-swipe card expanded / focused
      const active = document.activeElement;
      const scroller = scrollerRef.current;
      if (
        scroller &&
        active instanceof HTMLElement &&
        active !== scroller &&
        scroller.contains(active)
      ) {
        active.blur();
      }
    }
  };

  const clearDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId === event.pointerId) {
      // Keep `moved` until click so we can cancel activation after a swipe.
      window.setTimeout(() => {
        if (dragRef.current.pointerId === event.pointerId) {
          dragRef.current.pointerId = null;
          dragRef.current.moved = false;
        }
      }, 0);
    }
  };

  const onScrollerClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current.moved = false;
    dragRef.current.pointerId = null;
  };

  return (
    <section className="experience-block">
      <div className="experience-block__inner">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          tone="dark"
        />

        <div
          className={`experience-block__viewport${canScrollLeft ? " experience-block__viewport--fade-left" : ""}${canScrollRight ? " experience-block__viewport--fade-right" : ""}`}
        >
          {canScrollLeft ? (
            <button
              type="button"
              className="experience-block__arrow experience-block__arrow--left"
              aria-label="Scroll timeline backward"
              onClick={() => scrollByAmount(-1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
          ) : null}

          {canScrollRight ? (
            <button
              type="button"
              className="experience-block__arrow experience-block__arrow--right"
              aria-label="Scroll timeline forward"
              onClick={() => scrollByAmount(1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          ) : null}

          <div
            ref={scrollerRef}
            className="experience-block__scroller"
            tabIndex={0}
            role="region"
            aria-label="Career timeline"
            onKeyDown={onScrollerKeyDown}
            onPointerDown={onScrollerPointerDown}
            onPointerMove={onScrollerPointerMove}
            onPointerUp={clearDrag}
            onPointerCancel={clearDrag}
            onClickCapture={onScrollerClickCapture}
          >
            <div className="experience-block__track">
              <div className="experience-block__line" aria-hidden="true">
                {milestones.map((m, i) => (
                  <span
                    key={`${m.dates}-tick-${i}`}
                    className="experience-block__hash"
                  />
                ))}
              </div>
              <ol className="experience-block__milestones">
                {milestones.map((m, i) => {
                  const kind = milestoneKind(m);
                  const hasDetails = Boolean(m.details?.length);
                  const detailHref = m.detailId
                    ? `${detailsBase}#${m.detailId}`
                    : undefined;
                  const isLinked = Boolean(detailHref);
                  return (
                    <li
                      key={`${m.dates}-${i}`}
                      className={`experience-block__milestone experience-block__milestone--${kind}${hasDetails ? " experience-block__milestone--has-details" : ""}${isLinked ? " experience-block__milestone--linked" : ""}`}
                      tabIndex={!isLinked && hasDetails ? 0 : undefined}
                    >
                      <span className="experience-block__dates">{m.dates}</span>
                      <MilestoneCard m={m} href={detailHref}>
                        <MilestoneCardBody m={m} />
                      </MilestoneCard>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>

        {ctaLabel ? (
          <div className="experience-block__cta-row">
            {ctaHint ? <p className="experience-block__hint">{ctaHint}</p> : null}
            <Link
              href={detailsBase}
              className="experience-block__cta"
            >
              {ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
