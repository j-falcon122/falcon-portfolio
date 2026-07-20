import { getCms } from "portfolio-core/lib/cms";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { redirectToSinglePageAnchorIfNeeded } from "portfolio-core/lib/singlePageNav";

export default async function ContactPage() {
  const jump = await redirectToSinglePageAnchorIfNeeded("contact");
  if (jump) return jump;

  const cms = getCms();
  const page = await cms.getPageBySlug("contact");
  return <BlockRenderer blocks={page?.blocks || []} />;
}
