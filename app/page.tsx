import { getCms } from "@/lib/cms";
import BlockRenderer from "@/components/blocks/BlockRenderer";

export default async function HomePage() {
  const cms = getCms();
  const page = await cms.getPageBySlug("home");
  return <BlockRenderer blocks={page?.blocks || []} />;
}