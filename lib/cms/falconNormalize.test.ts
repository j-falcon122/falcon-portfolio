import { describe, expect, it } from "vitest";
import { normalizeFalconBlock } from "./falconNormalize";

describe("normalizeFalconBlock about media", () => {
  it("maps headshot image and resume download fields", () => {
    const block = normalizeFalconBlock({
      _type: "about",
      title: "About Me",
      body: "Hello",
      image: {
        src: "https://cdn.sanity.io/images/demo/headshot.jpg",
        alt: "Jordan Falcon",
      },
      resumeUrl: "https://cdn.sanity.io/files/demo/resume.pdf",
      resumeFilename: "Jordan-Falcon-Resume.pdf",
      resumeLabel: "Download CV",
      stats: [{ label: "Focus", value: "Frontend" }],
    });

    expect(block).toMatchObject({
      _type: "about",
      title: "About Me",
      image: {
        src: "https://cdn.sanity.io/images/demo/headshot.jpg",
        alt: "Jordan Falcon",
      },
      resume: {
        href: "https://cdn.sanity.io/files/demo/resume.pdf",
        label: "Download CV",
        filename: "Jordan-Falcon-Resume.pdf",
      },
    });
  });

  it("accepts mock-style resume.href without Sanity projection fields", () => {
    const block = normalizeFalconBlock({
      _type: "about",
      resume: { href: "/Jordan-Falcon-Resume.pdf", label: "Resume" },
    });

    expect(block).toMatchObject({
      _type: "about",
      resume: {
        href: "/Jordan-Falcon-Resume.pdf",
        label: "Resume",
      },
    });
  });
});

describe("normalizeFalconBlock projectList tags", () => {
  it("omits blank tag strings and whitespace-only copy", () => {
    const block = normalizeFalconBlock({
      _type: "projectList",
      items: [
        {
          title: "  Falcon Finds  ",
          description: "Word puzzle game.",
          tags: ["TypeScript", "", "  ", "React"],
        },
        {
          title: "   ",
          description: "No title",
          tags: ["Next.js"],
        },
      ],
    });

    expect(block).toMatchObject({
      _type: "projectList",
      items: [
        {
          title: "Falcon Finds",
          description: "Word puzzle game.",
          tags: ["TypeScript", "React"],
        },
      ],
    });
  });

  it("keeps example links and drops unsafe hrefs", () => {
    const block = normalizeFalconBlock({
      _type: "projectList",
      items: [
        {
          title: "Falcon Finds",
          description: "Word puzzle game.",
          href: "https://example.com/falcon-finds",
          linkLabel: "Play the demo",
        },
        {
          title: "Local only",
          description: "Internal example.",
          href: "/projects/local",
        },
        {
          title: "Unsafe",
          description: "Should not link.",
          href: "javascript:alert(1)",
        },
      ],
    });

    expect(block).toMatchObject({
      _type: "projectList",
      items: [
        {
          title: "Falcon Finds",
          href: "https://example.com/falcon-finds",
          linkLabel: "Play the demo",
        },
        {
          title: "Local only",
          href: "/projects/local",
        },
        {
          title: "Unsafe",
          href: undefined,
        },
      ],
    });
  });
});

describe("normalizeFalconBlock workGrid anchors", () => {
  it("keeps a custom link id on work items", () => {
    const block = normalizeFalconBlock({
      _type: "workGrid",
      items: [
        {
          title: "DraftCast",
          description: "Live draft tools.",
          id: "draftcast",
        },
      ],
    });

    expect(block).toMatchObject({
      _type: "workGrid",
      items: [{ title: "DraftCast", id: "draftcast" }],
    });
  });
});
