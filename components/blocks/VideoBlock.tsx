import type { VideoBlock as VideoBlockType } from "@/lib/cms/types";

export default function VideoBlock({ title, embedUrl, videoUrl }: VideoBlockType) {
	return (
		<section className="max-w-4xl mx-auto py-12">
			{title ? <h2 className="mb-4 text-2xl font-semibold">{title}</h2> : null}

			{embedUrl ? (
				<div className="aspect-video w-full">
					<iframe
						src={embedUrl}
						title={title || "video"}
						className="w-full h-full"
						frameBorder={0}
						allowFullScreen
					/>
				</div>
			) : videoUrl ? (
				<video controls className="w-full">
					<source src={videoUrl} />
					Your browser does not support the video tag.
				</video>
			) : (
				<div className="text-sm text-neutral-500">No video available</div>
			)}
		</section>
	);
}
