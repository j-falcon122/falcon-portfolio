import { describe, expect, it } from "vitest";
import {
  catalogItemAnchorId,
  catalogItemHashHref,
  slugifyAnchor,
  uniqueCatalogAnchorIds,
} from "./catalogItemAnchor";

describe("catalogItemAnchor", () => {
  it("slugifies titles for hash targets", () => {
    expect(slugifyAnchor("Where to Watch Guide")).toBe("where-to-watch-guide");
    expect(slugifyAnchor("Falcon Finds")).toBe("falcon-finds");
  });

  it("prefixes derived ids and honors a custom id", () => {
    expect(catalogItemAnchorId("work", "DraftCast")).toBe("work-draftcast");
    expect(catalogItemAnchorId("project", "Falcon Finds", "falcon-finds")).toBe(
      "falcon-finds",
    );
  });

  it("does not collide with section slugs", () => {
    expect(catalogItemAnchorId("project", "Work")).toBe("project-work");
    expect(catalogItemAnchorId("work", "Contact", "contact")).toBe(
      "work-contact",
    );
  });

  it("uniques duplicate titles", () => {
    expect(
      uniqueCatalogAnchorIds("project", [
        { title: "Falcon Finds" },
        { title: "Falcon Finds" },
      ]),
    ).toEqual(["project-falcon-finds", "project-falcon-finds-2"]);
  });

  it("builds an in-page hash href", () => {
    expect(catalogItemHashHref("work-draftcast")).toBe("/#work-draftcast");
  });
});
