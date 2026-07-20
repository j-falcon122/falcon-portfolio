import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {visionTool} from "@sanity/vision";
import {schemaTypes} from "./sanity/schemaTypes";
import {DEFAULT_SANITY_DATASET} from "./lib/sanityEnv";

const projectId = process.env.SANITY_PROJECT_ID?.trim();
const dataset =
  process.env.SANITY_DATASET?.trim() || DEFAULT_SANITY_DATASET;

if (!projectId) {
  throw new Error(
    "SANITY_PROJECT_ID is required for Sanity Studio. Add it to .env.local (see .env.example)."
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
