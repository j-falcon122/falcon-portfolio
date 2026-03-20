"use client";

import Carousel from "./Carousel";
import type { GalleryBlock as GalleryBlockType, GalleryItem } from "@/lib/cms/types";

export default function GalleryBlock({ title, items = [], isWork = false }: GalleryBlockType & { isWork?: boolean }) {
	// when isWork is true, render a 3x2 grid (3 columns, 2 rows)
		if (isWork) {
			const visibleItems: GalleryItem[] = items.slice(0, 6);
			return (
				<section className="max-w-6xl mx-auto py-12">
					{title ? <h2 className="gallery__title">{title}</h2> : null}
					{/* optional subtitle if provided in the block data */}
					{(title && (title as any).subtitle) ? <div className="gallery__subtitle">{(title as any).subtitle}</div> : null}
					<div className="gallery__items grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
						{visibleItems.map((it, idx) => (
							<div key={(it as any).src || idx} className="gallery__card aspect-[4/3] overflow-hidden">
								{((it as any)._type === "video" || (it as any).videoUrl || (it as any).embedUrl) ? (
									(it as any).videoUrl ? (
										<video src={(it as any).videoUrl} controls poster={(it as any).poster} className="w-full h-full object-cover" />
									) : (it as any).embedUrl ? (
										<iframe src={(it as any).embedUrl} title={(it as any).alt || "Video"} className="w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
									) : null
								) : (
									<img src={(it as any).src} alt={(it as any).alt || ""} className="w-full h-full object-cover" />
								)}
							</div>
						))}
					</div>
				</section>
			);
		}

	return (
		<section className="max-w-6xl mx-auto py-12">
			{title ? <h2 className="mb-6 text-2xl font-semibold">{title}</h2> : null}
			<Carousel items={items} />
		</section>
	);
}
