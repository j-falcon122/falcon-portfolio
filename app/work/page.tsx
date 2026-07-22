import { getFalconCms } from "@/lib/cms";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { redirectToSinglePageAnchorIfNeeded } from "portfolio-core/lib/singlePageNav";
import type { FalconBlock } from "@/lib/cms/falconTypes";

export default async function WorkPage() {
  const jump = await redirectToSinglePageAnchorIfNeeded("work");
  if (jump) return jump;
  const page = await getFalconCms().getPageBySlug("work");
  return <BlockRenderer blocks={(page?.blocks || []) as FalconBlock[]} />;
}
