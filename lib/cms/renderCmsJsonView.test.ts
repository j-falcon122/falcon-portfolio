import { describe, expect, it } from "vitest";
import { hasJsonViewParam } from "./renderCmsJsonView";

describe("hasJsonViewParam", () => {
  it("is true when _jsonView is present with any value", () => {
    expect(hasJsonViewParam({ _jsonView: "" })).toBe(true);
    expect(hasJsonViewParam({ _jsonView: "1" })).toBe(true);
    expect(hasJsonViewParam({ _jsonView: undefined })).toBe(true);
  });

  it("is false when _jsonView is absent", () => {
    expect(hasJsonViewParam({})).toBe(false);
    expect(hasJsonViewParam({ dataset: "production" })).toBe(false);
  });
});
