import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderToReadableStream } from "react-dom/server";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import type { FalconBlock } from "@/lib/cms/falconTypes";
import pages from "../content/mock/pages.json";

vi.mock("next/image", () => ({
  default: function MockImage({
    alt = "",
    src,
    ...rest
  }: {
    alt?: string;
    src: string;
    [key: string]: unknown;
  }) {
    return <img alt={alt} src={typeof src === "string" ? src : ""} {...rest} />;
  },
}));

vi.mock("next/link", () => ({
  default: function MockLink({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

async function renderBlocks(blocks: FalconBlock[]): Promise<string> {
  const stream = await renderToReadableStream(<BlockRenderer blocks={blocks} />);
  return new Response(stream).text();
}

describe("BlockRenderer smoke (falcon mock content)", () => {
  beforeAll(() => {
    process.env.CMS_PROVIDER = "mock";
  });

  it("renders the home hero from content/mock/pages.json", async () => {
    const home = pages.find((page) => page.slug === "home");
    expect(home).toBeDefined();

    const html = await renderBlocks(home!.blocks as FalconBlock[]);

    expect(html).toContain("Jordan Falcon");
    expect(html).toContain("Frontend-Focused Software Engineer");
    expect(html).toContain("View My Work");
  });

  it("renders about, experience, work, and contact blocks", async () => {
    for (const slug of ["about", "experience", "work", "contact"] as const) {
      const page = pages.find((entry) => entry.slug === slug);
      expect(page, `missing ${slug}`).toBeDefined();
      const html = await renderBlocks(page!.blocks as FalconBlock[]);
      expect(html.length).toBeGreaterThan(0);
    }

    const about = pages.find((page) => page.slug === "about")!;
    const experience = pages.find((page) => page.slug === "experience")!;

    expect(await renderBlocks(about.blocks as FalconBlock[])).toContain("About Me");
    expect(await renderBlocks(experience.blocks as FalconBlock[])).toContain(
      "Professional Track Record"
    );
  });
});
