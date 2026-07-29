import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getResumePdfFetchUrl,
  getResumePreviewIframeSrc,
  isStaticExportBuild,
} from "./resumePreviewSrc";

describe("resumePreviewSrc", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("leaves same-origin paths unchanged for fetch", () => {
    expect(getResumePdfFetchUrl("/Jordan-Falcon-Resume.pdf")).toBe(
      "/Jordan-Falcon-Resume.pdf"
    );
  });

  it("proxies remote PDFs for PDF.js fetch", () => {
    expect(
      getResumePdfFetchUrl("https://cdn.sanity.io/files/demo/resume.pdf")
    ).toBe(
      "/api/resume-preview?url=https%3A%2F%2Fcdn.sanity.io%2Ffiles%2Fdemo%2Fresume.pdf"
    );
  });

  it("builds a Google viewer iframe src for static hosts", () => {
    expect(
      getResumePreviewIframeSrc("https://cdn.sanity.io/files/demo/resume.pdf")
    ).toBe(
      "https://docs.google.com/gview?embedded=true&url=https%3A%2F%2Fcdn.sanity.io%2Ffiles%2Fdemo%2Fresume.pdf"
    );
  });

  it("detects static export builds", () => {
    vi.stubEnv("NEXT_PUBLIC_STATIC_EXPORT", "true");
    expect(isStaticExportBuild()).toBe(true);
  });
});
