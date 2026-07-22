import { getFalconCms } from "@/lib/cms";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { redirectToSinglePageAnchorIfNeeded } from "portfolio-core/lib/singlePageNav";
import type { FalconBlock } from "@/lib/cms/falconTypes";

export default async function EducationPage() {
  const jump = await redirectToSinglePageAnchorIfNeeded("education");
  if (jump) return jump;
  const page = await getFalconCms().getPageBySlug("education");
  return <BlockRenderer blocks={(page?.blocks || []) as FalconBlock[]} />;
}
