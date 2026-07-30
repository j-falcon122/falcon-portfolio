import { describe, expect, it } from "vitest";
import { resolveCmsProviderKey } from "./index";

describe("resolveCmsProviderKey", () => {
  it("honors explicit CMS_PROVIDER", () => {
    expect(
      resolveCmsProviderKey({
        CMS_PROVIDER: "mock",
        SANITY_PROJECT_ID: "abc",
        NODE_ENV: "production",
      }),
    ).toBe("mock");
    expect(
      resolveCmsProviderKey({
        CMS_PROVIDER: "sanity",
        NODE_ENV: "development",
      }),
    ).toBe("sanity");
  });

  it("prefers NEXT_PUBLIC_CMS_PROVIDER when CMS_PROVIDER is unset", () => {
    expect(
      resolveCmsProviderKey({
        NEXT_PUBLIC_CMS_PROVIDER: "mock",
        NODE_ENV: "production",
      }),
    ).toBe("mock");
  });

  it("uses Sanity when a project id is present", () => {
    expect(
      resolveCmsProviderKey({
        NEXT_PUBLIC_SANITY_PROJECT_ID: "59l1zlij",
        NODE_ENV: "development",
      }),
    ).toBe("sanity");
  });

  it("defaults production builds to Sanity without explicit provider", () => {
    expect(resolveCmsProviderKey({ NODE_ENV: "production" })).toBe("sanity");
  });

  it("defaults non-production to mock without Sanity config", () => {
    expect(resolveCmsProviderKey({ NODE_ENV: "development" })).toBe("mock");
  });
});
