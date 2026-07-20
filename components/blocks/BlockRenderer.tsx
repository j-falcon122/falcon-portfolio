import type { Block } from "portfolio-core/lib/cms/types";
import GalleryBlock from "portfolio-core/components/blocks/GalleryBlock";
import VideoBlock from "portfolio-core/components/blocks/VideoBlock";
import VideoCarouselBlock from "portfolio-core/components/blocks/VideoCarouselBlock";
import TextBlock from "portfolio-core/components/blocks/TextBlock";
import CtaBlock from "portfolio-core/components/blocks/CtaBlock";
import AboutBlock from "portfolio-core/components/blocks/AboutBlock";
import ContactBlock from "portfolio-core/components/blocks/ContactBlock";
import HeroBlock from "./HeroBlock";

/** Falcon-local renderer: Figma hero override, other blocks from portfolio-core. */
export default function BlockRenderer({ blocks = [] }: { blocks: Block[] }) {
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
          default:
            return null;
        }
      })}
    </>
  );
}
