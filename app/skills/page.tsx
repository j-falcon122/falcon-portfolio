import { getFalconCms } from "@/lib/cms";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { redirectToSinglePageAnchorIfNeeded } from "portfolio-core/lib/singlePageNav";
import type { FalconBlock } from "@/lib/cms/falconTypes";

export default async function SkillsPage() {
  const jump = await redirectToSinglePageAnchorIfNeeded("skills");
  if (jump) return jump;
  const page = await getFalconCms().getPageBySlug("skills");
  return <BlockRenderer blocks={(page?.blocks || []) as FalconBlock[]} />;
}
