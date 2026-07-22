import { getFalconCms } from "@/lib/cms";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import type { FalconBlock } from "@/lib/cms/falconTypes";

/** Standalone monograph — not part of the single-page scroll stack. */
export default async function ExperienceDetailsPage() {
  const page = await getFalconCms().getPageBySlug("experience-details");
  return (
    <main className="experience-details-page">
      <BlockRenderer blocks={(page?.blocks || []) as FalconBlock[]} />
    </main>
  );
}
