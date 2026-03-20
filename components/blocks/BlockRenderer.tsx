import type { Block } from "@/lib/cms/types";
import HeroBlock from "./HeroBlock";
import GalleryBlock from "./GalleryBlock";
import VideoBlock from "./VideoBlock";
import TextBlock from "./TextBlock";
<<<<<<< HEAD
import AboutBlock from "./AboutBlock";

export default function BlockRenderer({ blocks = [], pageSlug }: { blocks: Block[]; pageSlug?: string }) {
=======

export default function BlockRenderer({ blocks = [] }: { blocks: Block[] }) {
>>>>>>> falcon/main
  return (
    <>
      {blocks.map((block, i) => {
        switch (block._type) {
          case "hero":
            return <HeroBlock key={i} {...block} />;
          case "gallery":
<<<<<<< HEAD
            return <GalleryBlock key={i} isWork={pageSlug === "work"} {...block} />;
          case "video":
            return <VideoBlock key={i} {...block} />;
          case "text":
            // when rendering the about page, use the AboutBlock layout
            if (pageSlug === "about") return <AboutBlock key={i} {...block} />;
=======
            return <GalleryBlock key={i} {...block} />;
          case "video":
            return <VideoBlock key={i} {...block} />;
          case "text":
>>>>>>> falcon/main
            return <TextBlock key={i} {...block} />;
          default:
            return null;
        }
      })}
    </>
  );
}