"use client";

import dynamic from "next/dynamic";
import type { GalleryItem } from "@/lib/cms/types";

const Carousel = dynamic(() => import("./Carousel"), { ssr: false });

export default function CarouselClient({ items, className, showControls = true }: { items?: GalleryItem[]; className?: string; showControls?: boolean }) {
  return <Carousel items={items} className={className} showControls={showControls} />;
}
