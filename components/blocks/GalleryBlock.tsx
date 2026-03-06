"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryBlock as GalleryBlockType } from "@/lib/cms/types";

export default function GalleryBlock({ title, items = [] }: GalleryBlockType) {
	return (
			<section className="gallery max-w-6xl mx-auto py-12">
				{title ? <h2 className="gallery__title mb-6 text-2xl font-semibold">{title}</h2> : null}

				<div className="gallery__items grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{items.map((item, idx) => {
						const [src, setSrc] = useState(item.src);
						return (
							<div key={idx} className="gallery__item overflow-hidden rounded">
								<Image
									src={src}
									alt={item.alt || ""}
									width={800}
									height={600}
									className="gallery__img object-cover w-full h-48"
									onError={() => setSrc("/file.svg")}
								/>
							</div>
						);
					})}
				</div>
			</section>
	);
}
