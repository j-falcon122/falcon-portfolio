import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function collectFiles(dir: string, matches: (filePath: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return [];

  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, matches));
      continue;
    }
    if (matches(fullPath)) results.push(fullPath);
  }
  return results;
}

describe("test discovery", () => {
  it("keeps unit and smoke suites non-empty so CI does not exit with no test files", () => {
    const libDir = path.resolve(__dirname);

    const unitFiles = collectFiles(
      libDir,
      (filePath) => filePath.endsWith(".test.ts") && !filePath.endsWith(".smoke.test.ts")
    );
    const smokeFiles = collectFiles(libDir, (filePath) =>
      filePath.endsWith(".smoke.test.tsx")
    );

    expect(unitFiles.length, "expected lib/**/*.test.ts").toBeGreaterThan(0);
    expect(smokeFiles.length, "expected lib/**/*.smoke.test.tsx").toBeGreaterThan(0);
  });
});
