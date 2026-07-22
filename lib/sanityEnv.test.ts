import { afterEach, describe, expect, it } from "vitest";
import {
  defaultDatasetForDeployEnv,
  resolveSanityDataset,
  resolveSanityProjectId,
} from "./sanityEnv";

const ORIGINAL = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL)) delete process.env[key];
  }
  Object.assign(process.env, ORIGINAL);
});

describe("sanityEnv", () => {
  it("maps deploy stages to datasets", () => {
    expect(defaultDatasetForDeployEnv("local")).toBe("development");
    expect(defaultDatasetForDeployEnv("qa")).toBe("development");
    expect(defaultDatasetForDeployEnv("production")).toBe("production");
  });

  it("lets SANITY_DATASET override the default", () => {
    const dataset = resolveSanityDataset({
      SITE_ENV: "qa",
      SANITY_DATASET: "production",
    } as NodeJS.ProcessEnv);
    expect(dataset).toBe("production");
  });

  it("defaults to development for preview stages when SANITY_DATASET is unset", () => {
    const dataset = resolveSanityDataset({
      SITE_ENV: "qa",
    } as NodeJS.ProcessEnv);
    expect(dataset).toBe("development");
  });

  it("uses production dataset when SITE_ENV is production", () => {
    const dataset = resolveSanityDataset({
      SITE_ENV: "production",
    } as NodeJS.ProcessEnv);
    expect(dataset).toBe("production");
  });

  it("requires SANITY_PROJECT_ID", () => {
    expect(() =>
      resolveSanityProjectId({} as NodeJS.ProcessEnv)
    ).toThrow(/SANITY_PROJECT_ID/);
  });
});
