import { describe, expect, it } from "vitest";
import {
  applySiteResumeToBlocks,
  isResumeHref,
  normalizeSiteResume,
} from "./applySiteResume";
import type { FalconBlock } from "./falconTypes";

describe("isResumeHref", () => {
  it("matches resume aliases", () => {
    expect(isResumeHref("/resume")).toBe(true);
    expect(isResumeHref("resume")).toBe(true);
    expect(isResumeHref("#resume")).toBe(true);
    expect(isResumeHref("/work")).toBe(false);
  });
});

describe("normalizeSiteResume", () => {
  it("reads Sanity projection fields", () => {
    expect(
      normalizeSiteResume({
        resumeUrl: "https://cdn.sanity.io/files/x/resume.pdf",
        resumeFilename: "Jordan.pdf",
      })
    ).toEqual({
      href: "https://cdn.sanity.io/files/x/resume.pdf",
      filename: "Jordan.pdf",
    });
  });
});

describe("applySiteResumeToBlocks", () => {
  it("rewrites hero /resume CTAs and fills about when empty", () => {
    const blocks = applySiteResumeToBlocks(
      [
        {
          _type: "hero",
          headline: "Jordan",
          ctas: [
            { label: "Work", href: "/work" },
            { label: "View Résumé", href: "/resume" },
          ],
        },
        {
          _type: "about",
          title: "About",
        },
      ] as FalconBlock[],
      { href: "https://cdn.example/resume.pdf", filename: "resume.pdf" }
    );

    expect(blocks[0]).toMatchObject({
      _type: "hero",
      ctas: [
        { label: "Work", href: "/work" },
        { label: "View Résumé", href: "https://cdn.example/resume.pdf" },
      ],
    });
    expect(blocks[1]).toMatchObject({
      _type: "about",
      resume: { href: "https://cdn.example/resume.pdf" },
    });
  });
});
