/**
 * Browser-side Sanity CDN query helper (GitHub Pages / client previews).
 */
export async function fetchSanityQuery<T>(
  projectId: string,
  dataset: string,
  query: string,
): Promise<T> {
  const url = new URL(
    `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}`,
  );
  url.searchParams.set("query", query);
  url.searchParams.set("returnQuery", "false");
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Sanity query failed (${res.status})`);
  }
  const json = (await res.json()) as { result: T };
  return json.result;
}
