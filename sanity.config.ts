import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./sanity/schemaTypes";
import {DEFAULT_SANITY_DATASET} from "./lib/sanityEnv";

// Studio (Vite) only inlines SANITY_STUDIO_* into the browser. Prefer those,
// then fall back to shared SANITY_* from .env.local / scripts/run-sanity.mjs.
const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID?.trim() ||
  process.env.SANITY_PROJECT_ID?.trim();
const dataset =
  process.env.SANITY_STUDIO_DATASET?.trim() ||
  process.env.SANITY_DATASET?.trim() ||
  DEFAULT_SANITY_DATASET;

if (!projectId) {
  throw new Error(
    "SANITY_STUDIO_PROJECT_ID (or SANITY_PROJECT_ID) is required for Sanity Studio. Use `npm run sanity:deploy` so Studio env vars are mapped from .env.local."
  );
}

export default defineConfig({
  name: "development",
  title: "Falcon Portfolio",
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
