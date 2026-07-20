import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderToReadableStream } from "react-dom/server";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import type { Block } from "portfolio-core/lib/cms/types";
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
    // next/image → plain img for SSR smoke coverage
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

async function renderBlocks(blocks: Block[]): Promise<string> {
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

    const html = await renderBlocks(home!.blocks as Block[]);

    expect(html).toContain("Jordan Falcon");
    expect(html).toContain("Frontend-Focused Software Engineer");
    expect(html).toContain("View My Work");
  });

  it("renders about, work, and contact blocks from content/mock/pages.json", async () => {
    for (const slug of ["about", "work", "contact"] as const) {
      const page = pages.find((entry) => entry.slug === slug);
      expect(page, `missing ${slug}`).toBeDefined();

      const html = await renderBlocks(page!.blocks as Block[]);
      expect(html.length).toBeGreaterThan(0);
    }

    const about = pages.find((page) => page.slug === "about")!;
    const contact = pages.find((page) => page.slug === "contact")!;

    expect(await renderBlocks(about.blocks as Block[])).toContain("About me");
    expect(await renderBlocks(contact.blocks as Block[])).toContain(
      "Get in touch"
    );
  });
});
