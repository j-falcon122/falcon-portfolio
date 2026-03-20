import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { CmsProvider, Page, SiteSettings, Block, GalleryItem } from "../types";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";

// Only initialize Sanity client when a valid projectId is supplied.
// Sanity project IDs may only contain a-z, 0-9 and dashes.
const isValidProjectId = typeof projectId === "string" && /^[a-z0-9-]+$/.test(projectId);
if (!isValidProjectId) {
	// Keep behavior non-throwing at import time to preserve dev experience when SANITY isn't configured.
	// A runtime error will be thrown if the provider is used without a valid config.
}

const client = isValidProjectId
	? createClient({ projectId: projectId as string, dataset, useCdn: !!process.env.SANITY_USE_CDN, apiVersion: "2024-01-01" })
	: null;

const builder = client ? imageUrlBuilder(client) : null;

function imageUrl(source: any) {
	if (!builder) return undefined;
	return builder.image(source).url();
}

function mapGalleryItem(item: any): GalleryItem {
	if (!item) return { src: "", alt: "" } as GalleryItem;
	if (item._type === "video") {
		return {
			_type: "video",
			videoUrl: item.videoUrl || undefined,
			embedUrl: item.embedUrl || undefined,
			poster: item.poster ? imageUrl(item.poster) : item.poster || undefined,
			alt: item.alt || undefined,
		};
	}

	// default to image
	return {
		_type: "image",
		src: item.asset ? imageUrl(item.asset) : item.src || "",
		alt: item.alt || undefined,
		poster: item.poster ? imageUrl(item.poster) : item.poster || undefined,
	};
}

function mapBlock(block: any): Block | null {
	if (!block || !block._type) return null;
	switch (block._type) {
		case "hero":
			return {
				_type: "hero",
				brandTitle: block.brandTitle,
				headline: block.headline,
				subheadline: block.subheadline,
				cta: block.cta,
				backgroundImage: block.backgroundImage ? { src: imageUrl(block.backgroundImage.asset || block.backgroundImage), alt: block.backgroundImage.alt } : undefined,
				gallery: (block.gallery || []).map(mapGalleryItem),
			} as any;
		case "gallery":
			return {
				_type: "gallery",
				title: block.title,
				items: (block.items || []).map(mapGalleryItem),
			} as any;
		case "video":
			return {
				_type: "video",
				title: block.title,
				embedUrl: block.embedUrl,
				videoUrl: block.videoUrl,
			} as any;
		case "text":
			return {
				_type: "text",
				title: block.title,
				body: block.body || "",
				image: block.image ? { src: block.image.asset ? imageUrl(block.image.asset) : undefined, alt: block.image.alt } : undefined,
			} as any;
		case "cta":
			return {
				_type: "cta",
				label: block.label,
				href: block.href,
			} as any;
		default:
			return null;
	}
}

const provider: CmsProvider = {
	async getSiteSettings(): Promise<SiteSettings> {
		if (!client) throw new Error("SANITY_PROJECT_ID is not configured");
		const query = `*[_type == "siteSettings"][0]{title, nav, footerText}`;
		const res = await client.fetch(query);
		return {
			title: res?.title || "",
			nav: res?.nav || [],
			footerText: res?.footerText || undefined,
		} as SiteSettings;
	},
	async getPageBySlug(slug: string): Promise<Page | null> {
		if (!client) throw new Error("SANITY_PROJECT_ID is not configured");
		const query = `*[_type == "page" && slug.current == $slug][0]{title, "blocks": blocks[]}`;
		const res = await client.fetch(query, { slug });
		if (!res) return null;
		const blocks = (res.blocks || []).map(mapBlock).filter(Boolean) as any[];
		return { slug, title: res.title, blocks } as Page;
	}
};

export default provider;
