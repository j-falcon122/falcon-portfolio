"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { HeroBlock as HeroBlockType } from "@/lib/cms/types";

export default function HeroBlock({
  brandTitle,
  headline,
  subheadline,
  cta,
  backgroundImage
}: HeroBlockType) {
  const [bgSrc, setBgSrc] = useState<string | undefined>(backgroundImage?.src);
  return (
    <section className="hero hero--large relative min-h-[80vh] w-full overflow-hidden">
      {bgSrc ? (
        <>
          <Image
            src={bgSrc}
            alt={backgroundImage?.alt || ""}
            fill
            priority
            className="object-cover opacity-60"
            sizes="100vw"
            onError={() => setBgSrc("/file.svg")}
          />
          <div className="absolute inset-0 bg-black/40" />
        </>
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}

      <div className="hero__inner relative mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
        {brandTitle ? <div className="hero__brand mb-10 text-sm tracking-wide opacity-90">{brandTitle}</div> : null}

        <h1 className="hero__headline text-4xl font-semibold leading-tight md:text-6xl">{headline}</h1>

        {subheadline ? (
          <p className="hero__sub mt-4 max-w-2xl text-base opacity-90 md:text-lg">{subheadline}</p>
        ) : null}

        {cta?.href && cta?.label ? (
          <Link href={cta.href} className="hero__cta mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black">
            {cta.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}