import type { TextBlock as TextBlockType } from "@/lib/cms/types";

export default function TextBlock({ title, body }: TextBlockType) {
	return (
		<section className="text-block prose max-w-4xl mx-auto py-8">
			{title ? <h2 className="text-block__title">{title}</h2> : null}
			<div className="text-block__body" dangerouslySetInnerHTML={{ __html: body }} />
		</section>
	);
}
