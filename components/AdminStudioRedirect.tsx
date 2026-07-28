"use client";

import { useEffect } from "react";

/** Static hosts (GitHub Pages) cannot server-redirect; send the browser to Studio. */
export default function AdminStudioRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);

  return (
    <p className="mx-auto max-w-lg px-6 py-20 text-sm text-[var(--figma-muted)]">
      Opening Sanity Studio…
    </p>
  );
}
