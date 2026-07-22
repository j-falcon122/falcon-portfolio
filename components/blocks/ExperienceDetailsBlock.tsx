"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { ExperienceDetailsBlock, ExperienceRoleDetail } from "@/lib/cms/falconTypes";

function RoleCard({ role }: { role: ExperienceRoleDetail }) {
  return (
    <article
      id={role.id || undefined}
      className="experience-details__card"
      tabIndex={role.id ? -1 : undefined}
    >
      <header className="experience-details__card-header">
        <div className="experience-details__card-titles">
          <h2 className="experience-details__company">{role.company}</h2>
          <p className="experience-details__role">{role.title}</p>
        </div>
        <div className="experience-details__meta">
          <p className="experience-details__meta-row experience-details__meta-row--date">
            <span className="experience-details__icon experience-details__icon--calendar" aria-hidden="true" />
            <span>{role.dates}</span>
          </p>
          {role.location ? (
            <p className="experience-details__meta-row experience-details__meta-row--location">
              <span className="experience-details__icon experience-details__icon--pin" aria-hidden="true" />
              <span>{role.location}</span>
            </p>
          ) : null}
        </div>
      </header>
      {role.summary ? (
        <p className="experience-details__summary">{role.summary}</p>
      ) : null}
      {role.bullets?.length ? (
        <ul className="experience-details__bullets">
          {role.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function focusHashTarget() {
  if (typeof window === "undefined") return;
  const id = window.location.hash.replace(/^#/, "");
  if (!id) return;
  const el = document.getElementById(id);
  if (!el || !el.classList.contains("experience-details__card")) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  if (el instanceof HTMLElement) {
    el.focus({ preventScroll: true });
  }
}

export default function ExperienceDetailsBlock({
  eyebrow = "Detailed Monograph",
  title = "Professional Experience — Full Details",
  subtitle = "Complete breakdown of each role",
  roles = [],
  earlierLabel = "Earlier Leadership Experience",
  earlierRoles = [],
  backLabel = "Back",
  collapseLabel = "Collapse Details",
  collapseHref = "/#experience",
}: ExperienceDetailsBlock) {
  const backHref = collapseHref || "/#experience";

  useEffect(() => {
    // Defer until after paint so App Router hash navigation can settle.
    const timer = window.setTimeout(focusHashTarget, 50);
    window.addEventListener("hashchange", focusHashTarget);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", focusHashTarget);
    };
  }, []);

  return (
    <section className="experience-details">
      <div className="experience-details__inner">
        <header className="experience-details__header">
          <p className="experience-details__eyebrow">
            <span className="experience-details__eyebrow-dot" aria-hidden="true" />
            {eyebrow}
          </p>
          <div className="experience-details__title-row">
            {backLabel ? (
              <Link href={backHref} className="experience-details__back">
                <span aria-hidden="true">←</span>
                {backLabel}
              </Link>
            ) : null}
            <h1 className="experience-details__title">{title}</h1>
          </div>
          {subtitle ? (
            <p className="experience-details__subtitle">{subtitle}</p>
          ) : null}
        </header>

        <div className="experience-details__roles">
          {roles.map((role) => (
            <RoleCard key={role.id || `${role.company}-${role.title}-${role.dates}`} role={role} />
          ))}

          {earlierRoles.length ? (
            <div className="experience-details__earlier">
              <div className="experience-details__divider" role="separator">
                <span>{earlierLabel}</span>
              </div>
              {earlierRoles.map((role) => (
                <RoleCard
                  key={role.id || `${role.company}-${role.title}-${role.dates}`}
                  role={role}
                />
              ))}
            </div>
          ) : null}
        </div>

        {collapseLabel ? (
          <div className="experience-details__footer">
            <Link href={backHref} className="experience-details__collapse">
              <span aria-hidden="true">⌃</span>
              {collapseLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
