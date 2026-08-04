import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import ExperienceBlock from "./ExperienceBlock";

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
      <a href={typeof href === "string" ? href : "#"} {...rest}>
        {children}
      </a>
    );
  },
}));

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
});

const milestones = [
  {
    dates: "2015",
    title: "Web Developer Intern",
    organization: "at The New York Times",
    kind: "internship" as const,
    detailId: "nyt-intern",
    details: ["Built an image-upload tool for editors and a CMS"],
  },
  {
    dates: "2016",
    title: "Started Computer Science",
    organization: "at CUNY Lehman College",
    kind: "education" as const,
  },
  {
    dates: "2019-2026",
    title: "Grew into Software Engineer II",
    organization: "at ESPN and Disney",
    kind: "job" as const,
    detailId: "espn-swe-ii",
    details: [
      "Built fan-facing products with React and TypeScript",
      "Shipped responsive experiences across devices",
    ],
  },
];

function mockScrollerMetrics(
  el: HTMLElement,
  { scrollWidth = 1200, clientWidth = 400, scrollLeft = 0 } = {},
) {
  Object.defineProperty(el, "scrollWidth", {
    configurable: true,
    get: () => scrollWidth,
  });
  Object.defineProperty(el, "clientWidth", {
    configurable: true,
    get: () => clientWidth,
  });
  Object.defineProperty(el, "scrollLeft", {
    configurable: true,
    writable: true,
    value: scrollLeft,
  });
  el.scrollBy = vi.fn(({ left }: ScrollToOptions) => {
    const current = el.scrollLeft;
    Object.defineProperty(el, "scrollLeft", {
      configurable: true,
      writable: true,
      value: current + (left ?? 0),
    });
    el.dispatchEvent(new Event("scroll"));
  }) as HTMLElement["scrollBy"];
}

describe("ExperienceBlock", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the timeline region and milestone cards", () => {
    render(
      <ExperienceBlock
        _type="experience"
        title="Professional Track Record"
        milestones={milestones}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Career timeline" }),
    ).toBeTruthy();
    expect(screen.getByText("Web Developer Intern")).toBeTruthy();
    expect(screen.getByText("Grew into Software Engineer II")).toBeTruthy();
    expect(
      screen.getByRole("link", {
        name: "Open full details for Web Developer Intern",
      }),
    ).toHaveAttribute("href", "/experience-details#nyt-intern");
  });

  it("starts scrolled to the end so the latest milestone is visible", () => {
    const scrollWidthDesc = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollWidth",
    );
    const clientWidthDesc = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "clientWidth",
    );

    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get() {
        return (this as HTMLElement).classList.contains(
          "experience-block__scroller",
        )
          ? 1200
          : (scrollWidthDesc?.get?.call(this) ?? 0);
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return (this as HTMLElement).classList.contains(
          "experience-block__scroller",
        )
          ? 400
          : (clientWidthDesc?.get?.call(this) ?? 0);
      },
    });

    try {
      render(
        <ExperienceBlock
          _type="experience"
          milestones={milestones}
        />,
      );

      const scroller = screen.getByRole("region", { name: "Career timeline" });
      expect(scroller.scrollLeft).toBe(800);
      expect(
        screen.getByRole("button", { name: "Scroll timeline backward" }),
      ).toBeTruthy();
      expect(
        screen.queryByRole("button", { name: "Scroll timeline forward" }),
      ).toBeNull();
    } finally {
      if (scrollWidthDesc) {
        Object.defineProperty(
          HTMLElement.prototype,
          "scrollWidth",
          scrollWidthDesc,
        );
      }
      if (clientWidthDesc) {
        Object.defineProperty(
          HTMLElement.prototype,
          "clientWidth",
          clientWidthDesc,
        );
      }
    }
  });

  it("shows forward arrow when content overflows and scrolls on click", () => {
    render(
      <ExperienceBlock
        _type="experience"
        milestones={milestones}
      />,
    );

    const scroller = screen.getByRole("region", { name: "Career timeline" });
    mockScrollerMetrics(scroller);
    fireEvent.scroll(scroller);

    const forward = screen.getByRole("button", {
      name: "Scroll timeline forward",
    });
    fireEvent.click(forward);
    expect(scroller.scrollBy).toHaveBeenCalled();
  });

  it("suppresses card activation after a horizontal drag", () => {
    render(
      <ExperienceBlock
        _type="experience"
        milestones={milestones}
      />,
    );

    const scroller = screen.getByRole("region", { name: "Career timeline" });
    const link = screen.getByRole("link", {
      name: "Open full details for Web Developer Intern",
    });

    fireEvent.pointerDown(scroller, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 100,
      clientY: 40,
      button: 0,
    });
    fireEvent.pointerMove(scroller, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 160,
      clientY: 42,
    });
    fireEvent.pointerUp(scroller, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 160,
      clientY: 42,
    });

    // Click originates on the card but bubbles through the scroller capture handler.
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    const prevented = !link.dispatchEvent(event);
    expect(prevented || event.defaultPrevented).toBe(true);
  });

  it("keeps tap-to-activate when movement stays under the drag threshold", () => {
    render(
      <ExperienceBlock
        _type="experience"
        milestones={milestones}
      />,
    );

    const scroller = screen.getByRole("region", { name: "Career timeline" });
    const link = screen.getByRole("link", {
      name: "Open full details for Web Developer Intern",
    });

    fireEvent.pointerDown(scroller, {
      pointerId: 2,
      pointerType: "touch",
      clientX: 100,
      clientY: 40,
      button: 0,
    });
    fireEvent.pointerMove(scroller, {
      pointerId: 2,
      pointerType: "touch",
      clientX: 104,
      clientY: 41,
    });
    fireEvent.pointerUp(scroller, {
      pointerId: 2,
      pointerType: "touch",
      clientX: 104,
      clientY: 41,
    });

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
