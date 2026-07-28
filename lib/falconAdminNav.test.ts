import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveFalconAdminNav } from "./falconAdminNav";

const ENV_KEYS = [
  "SITE_ENV",
  "NODE_ENV",
  "ADMIN_NAV_URL",
  "NEXT_PUBLIC_ADMIN_URL",
  "SANITY_STUDIO_URL",
  "DISABLE_DEV_SANITY_MANAGE_NAV",
  "SANITY_DEV_PORT",
] as const;

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

describe("resolveFalconAdminNav", () => {
  afterEach(() => {
    for (const key of ENV_KEYS) delete process.env[key];
    vi.unstubAllEnvs();
  });

  it("points local dev at localhost Sanity", () => {
    setEnv("SITE_ENV", "local");
    expect(resolveFalconAdminNav()).toEqual({
      href: "http://localhost:3333",
      label: "Admin",
    });
  });

  it("points GitHub Pages preview at hosted Studio", () => {
    setEnv("SITE_ENV", "qa");
    setEnv("NODE_ENV", "production");
    expect(resolveFalconAdminNav()?.href).toBe(
      "https://jordan-falcon.sanity.studio"
    );
  });

  it("prefers NEXT_PUBLIC_ADMIN_URL when set", () => {
    setEnv("SITE_ENV", "qa");
    setEnv("NEXT_PUBLIC_ADMIN_URL", "https://custom.example/studio");
    expect(resolveFalconAdminNav()?.href).toBe("https://custom.example/studio");
  });
});
