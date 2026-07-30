import { describe, expect, it } from "vitest";
import {
  applySiteResumeToBlocks,
  isResumeHref,
  isResumeCta,
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

describe("isResumeCta", () => {
  it("matches résumé labels even when href is wrong", () => {
    expect(isResumeCta({ label: "View Résumé", href: "/contact" })).toBe(true);
    expect(isResumeCta({ label: "Download CV", href: "#contact" })).toBe(true);
    expect(isResumeCta({ label: "Contact Me", href: "/contact" })).toBe(false);
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
  it("rewrites hero /resume CTAs without adding an About download", () => {
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
    expect(blocks[1]).toEqual({
      _type: "about",
      title: "About",
    });
  });

  it("rewrites View Résumé when href still points at contact", () => {
    const blocks = applySiteResumeToBlocks(
      [
        {
          _type: "hero",
          headline: "Hi",
          ctas: [{ label: "View Résumé", href: "/contact" }],
        },
      ],
      { href: "https://cdn.example/resume.pdf", filename: "resume.pdf" }
    );

    expect(blocks[0]).toMatchObject({
      ctas: [{ label: "View Résumé", href: "https://cdn.example/resume.pdf" }],
    });
  });
});
