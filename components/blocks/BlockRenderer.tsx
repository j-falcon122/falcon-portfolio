import type { FalconBlock } from "@/lib/cms/falconTypes";
import GalleryBlock from "portfolio-core/components/blocks/GalleryBlock";
import VideoBlock from "portfolio-core/components/blocks/VideoBlock";
import VideoCarouselBlock from "portfolio-core/components/blocks/VideoCarouselBlock";
import TextBlock from "portfolio-core/components/blocks/TextBlock";
import CtaBlock from "portfolio-core/components/blocks/CtaBlock";
import ContactBlock from "portfolio-core/components/blocks/ContactBlock";
import HeroBlock from "./HeroBlock";
import AboutBlock from "./AboutBlock";
import ExperienceBlock from "./ExperienceBlock";
import ExperienceDetailsBlock from "./ExperienceDetailsBlock";
import WorkGridBlock from "./WorkGridBlock";
import ProjectListBlock from "./ProjectListBlock";
import SkillsBlock from "./SkillsBlock";
import EducationBlock from "./EducationBlock";

/** Falcon renderer: Figma section blocks + portfolio-core media/contact/text. */
export default function BlockRenderer({
  blocks = [],
}: {
  blocks: FalconBlock[];
}) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block._type) {
          case "hero":
            return <HeroBlock key={i} {...block} />;
          case "gallery":
            return <GalleryBlock key={i} {...block} />;
          case "video":
            return <VideoBlock key={i} {...block} />;
          case "videoCarousel":
            return <VideoCarouselBlock key={i} {...block} />;
          case "text":
            return <TextBlock key={i} {...block} />;
          case "cta":
            return <CtaBlock key={i} {...block} />;
          case "about":
            return <AboutBlock key={i} {...block} />;
          case "contact":
            return <ContactBlock key={i} {...block} />;
          case "experience":
            return <ExperienceBlock key={i} {...block} />;
          case "experienceDetails":
            return <ExperienceDetailsBlock key={i} {...block} />;
          case "workGrid":
            return <WorkGridBlock key={i} {...block} />;
          case "projectList":
            return <ProjectListBlock key={i} {...block} />;
          case "skills":
            return <SkillsBlock key={i} {...block} />;
          case "education":
            return <EducationBlock key={i} {...block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
