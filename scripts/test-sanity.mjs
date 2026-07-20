import { createClient } from "@sanity/client";
import {
  resolveSanityDataset,
  resolveSanityProjectId,
} from "./lib/sanityEnv.mjs";

let projectId;
let dataset;
try {
  projectId = resolveSanityProjectId();
  dataset = resolveSanityDataset();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  useCdn: process.env.SANITY_USE_CDN !== "false",
  apiVersion: process.env.SANITY_API_VERSION?.trim() || "2024-01-01",
  token: process.env.SANITY_API_READ_TOKEN?.trim() || undefined,
});

console.log(
  `Sanity client ready (project=${projectId}, dataset=${dataset}), running small fetch...`
);

(async () => {
  try {
    const res = await client.fetch('*[_type == "siteSettings"][0]{_id, title}');
    console.log("fetch OK:", res);
    process.exit(0);
  } catch (err) {
    console.error("fetch failed:", err);
    process.exit(1);
  }
})();
