import { redirect } from "next/navigation";
import AdminStudioRedirect from "@/components/AdminStudioRedirect";
import { resolveFalconAdminNav } from "@/lib/falconAdminNav";
import { FALCON_SANITY_STUDIO_URL } from "@/lib/falconStudioUrl";

const isStaticHost = process.env.GITHUB_PAGES === "true";

/**
 * Opens CMS / Sanity Studio.
 * - Local: localhost Sanity dev server
 * - GitHub Pages: client redirect (static export)
 * - Amplify: server redirect to hosted Studio
 */
export default function AdminPage() {
  const admin = resolveFalconAdminNav();

  if (admin?.href) {
    if (isStaticHost) {
      return <AdminStudioRedirect url={admin.href} />;
    }
    redirect(admin.href);
  }

  const projectId = process.env.SANITY_PROJECT_ID?.trim();

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-neutral-800">
      <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        Run <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">npm run sanity:dev</code>{" "}
        locally, then visit <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">/admin</code>
        , or open the hosted Studio directly.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-600">
        <li>
          Local Studio:{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">npm run sanity:dev</code>
        </li>
        <li>
          Hosted Studio:{" "}
          <a
            className="text-neutral-900 underline underline-offset-2"
            href={FALCON_SANITY_STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            jordan-falcon.sanity.studio
          </a>
        </li>
      </ul>
      {projectId ? (
        <p className="mt-4 text-sm">
          <a
            className="text-neutral-900 underline underline-offset-2"
            href={`https://www.sanity.io/manage/project/${projectId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open project in Sanity manage
          </a>
        </p>
      ) : null}
    </div>
  );
}
