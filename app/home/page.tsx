import { notFound } from "next/navigation";
import { getCms } from "@/lib/cms";
import BlockRenderer from "@/components/blocks/BlockRenderer";

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const cms = getCms();
  const page = await cms.getPageBySlug(params.slug);
  if (!page) return notFound();
  return <BlockRenderer blocks={page.blocks || []} />;
}