import { redirect } from "next/navigation";
import { getDeployEnv } from "portfolio-core/lib/deployEnv";
import { resolveFalconStudioUrl } from "@/lib/falconStudioUrl";

/** Always evaluate env / defaults at request time (do not bake the help page at build). */
export const dynamic = "force-dynamic";

/**
 * Opens CMS / Sanity Studio. Hosted QA/PROD: env or falcon hosted Studio URL.
 * Local: redirects to `sanity dev` (:3333 by default).
 */
export default function AdminPage() {
  const deploy = getDeployEnv();
  const studioUrl = resolveFalconStudioUrl();

  if (studioUrl) {
    redirect(studioUrl);
  }

  if (
    deploy === "local" &&
    process.env.DISABLE_DEV_SANITY_MANAGE_NAV !== "1"
  ) {
    const port = process.env.SANITY_DEV_PORT?.trim() || "3333";
    redirect(`http://localhost:${port}`);
  }

  const projectId = process.env.SANITY_PROJECT_ID?.trim();
  const isStaticHost = process.env.GITHUB_PAGES === "true";

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-neutral-800">
      <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
      {isStaticHost ? (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          This site is a static export on GitHub Pages. The header <strong>Admin</strong> link opens
          this page. To jump straight to Sanity Studio from the nav, set repository variable{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">ADMIN_NAV_URL</code> to your
          hosted Studio URL, then re-run the Deploy GitHub Pages workflow.
        </p>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Set <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">SANITY_STUDIO_URL</code>{" "}
          or <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">ADMIN_NAV_URL</code> to
          your deployed Sanity Studio URL. For local editing, run{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">npm run sanity:dev</code>{" "}
          (default port {process.env.SANITY_DEV_PORT || "3333"}), keep this site in{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">next dev</code>, then visit{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">/admin</code> — it redirects
          to Studio.
        </p>
      )}
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-600">
        <li>
          Deploy Studio:{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">npm run sanity:deploy</code>
        </li>
        <li>
          Local Studio:{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">npm run sanity:dev</code>
        </li>
        <li>
          Hosted Studio:{" "}
          <a
            className="text-neutral-900 underline underline-offset-2"
            href="https://jordan-falcon.sanity.studio"
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
      ) : (
        <p className="mt-4 text-sm text-neutral-600">
          Set <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">SANITY_PROJECT_ID</code>{" "}
          in the host environment to link your Sanity project here.
        </p>
      )}
    </div>
  );
}
