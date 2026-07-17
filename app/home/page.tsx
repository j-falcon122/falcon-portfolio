import { notFound } from "next/navigation";
import { getCms } from "portfolio-core/lib/cms";
import BlockRenderer from "portfolio-core/components/blocks/BlockRenderer";
import { redirectToSinglePageAnchorIfNeeded } from "portfolio-core/lib/singlePageNav";

export default async function HomeAliasPage() {
  const jump = await redirectToSinglePageAnchorIfNeeded("home");
  if (jump) return jump;

  const cms = getCms();
  const page = await cms.getPageBySlug("home");
  if (!page) return notFound();
  return <BlockRenderer blocks={page.blocks || []} />;
}