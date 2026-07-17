import { getCms } from "portfolio-core/lib/cms";
import BlockRenderer from "portfolio-core/components/blocks/BlockRenderer";
import { redirectToSinglePageAnchorIfNeeded } from "portfolio-core/lib/singlePageNav";

export default async function WorkPage() {
  const jump = await redirectToSinglePageAnchorIfNeeded("work");
  if (jump) return jump;

  const cms = getCms();
  const page = await cms.getPageBySlug("work");
  return <BlockRenderer blocks={page?.blocks || []} />;
}
