"use client";

import { useEffect } from "react";

type AdminStudioRedirectProps = {
  href: string;
};

/** Client navigation works for static export and as a backup when middleware is skipped. */
export default function AdminStudioRedirect({ href }: AdminStudioRedirectProps) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <p className="admin-fallback__body">
      Opening Studio…{" "}
      <a href={href} rel="noopener noreferrer">
        Continue
      </a>
    </p>
  );
}
