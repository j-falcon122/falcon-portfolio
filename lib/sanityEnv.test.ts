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
  it("uses development for every deploy stage on the free plan", () => {
    expect(defaultDatasetForDeployEnv("local")).toBe("development");
    expect(defaultDatasetForDeployEnv("qa")).toBe("development");
    expect(defaultDatasetForDeployEnv("production")).toBe("development");
  });

  it("lets SANITY_DATASET override the default", () => {
    const dataset = resolveSanityDataset({
      SITE_ENV: "production",
      SANITY_DATASET: "production",
    } as NodeJS.ProcessEnv);
    expect(dataset).toBe("production");
  });

  it("defaults to development when SANITY_DATASET is unset", () => {
    const dataset = resolveSanityDataset({
      SITE_ENV: "qa",
    } as NodeJS.ProcessEnv);
    expect(dataset).toBe("development");
  });

  it("requires SANITY_PROJECT_ID", () => {
    expect(() =>
      resolveSanityProjectId({} as NodeJS.ProcessEnv)
    ).toThrow(/SANITY_PROJECT_ID/);
  });
});
