import {defineCliConfig} from "sanity/cli";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID?.trim() ||
  process.env.SANITY_PROJECT_ID?.trim();
const dataset =
  process.env.SANITY_STUDIO_DATASET?.trim() ||
  process.env.SANITY_DATASET?.trim() ||
  "development";

if (!projectId) {
  throw new Error(
    "SANITY_PROJECT_ID is required for the Sanity CLI. Add it to .env.local (see .env.example)."
  );
}

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
