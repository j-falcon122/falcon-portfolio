import { afterEach, describe, expect, it } from "vitest";
import { FALCON_SANITY_STUDIO_URL, resolveFalconStudioUrl } from "./falconStudioUrl";

const ENV_KEYS = [
  "SANITY_STUDIO_URL",
  "ADMIN_NAV_URL",
  "NEXT_PUBLIC_ADMIN_URL",
  "SITE_ENV",
  "NODE_ENV",
  "VERCEL_ENV",
] as const;

const original: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> = {};

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (key in original) {
      const value = original[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
      delete original[key];
    }
  }
});

function setEnv(key: (typeof ENV_KEYS)[number], value: string | undefined) {
  if (!(key in original)) original[key] = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

describe("resolveFalconStudioUrl", () => {
  it("prefers explicit env URLs", () => {
    setEnv("SITE_ENV", "production");
    setEnv("SANITY_STUDIO_URL", "https://custom.sanity.studio");
    expect(resolveFalconStudioUrl()).toBe("https://custom.sanity.studio");
  });

  it("ignores /admin placeholders from SITE_ADMIN_NAV-style env", () => {
    setEnv("SITE_ENV", "production");
    setEnv("ADMIN_NAV_URL", "/admin");
    expect(resolveFalconStudioUrl()).toBe(FALCON_SANITY_STUDIO_URL);
  });

  it("defaults to hosted studio outside local", () => {
    setEnv("SITE_ENV", "production");
    setEnv("SANITY_STUDIO_URL", undefined);
    setEnv("ADMIN_NAV_URL", undefined);
    setEnv("NEXT_PUBLIC_ADMIN_URL", undefined);
    expect(resolveFalconStudioUrl()).toBe(FALCON_SANITY_STUDIO_URL);
  });

  it("does not default on local (sanity:dev handles redirect)", () => {
    setEnv("SITE_ENV", "local");
    setEnv("SANITY_STUDIO_URL", undefined);
    setEnv("ADMIN_NAV_URL", undefined);
    setEnv("NEXT_PUBLIC_ADMIN_URL", undefined);
    expect(resolveFalconStudioUrl()).toBe("");
  });
});
