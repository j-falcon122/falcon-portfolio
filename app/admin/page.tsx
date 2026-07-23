import { redirect } from "next/navigation";
import { getDeployEnv } from "portfolio-core/lib/deployEnv";
import {
  FALCON_SANITY_STUDIO_URL,
  resolveFalconStudioUrl,
} from "@/lib/falconStudioUrl";

/** Prefer request-time evaluation when the host supports it. */
export const dynamic = "force-dynamic";

/**
 * Fallback UI if middleware cannot redirect (rare). Content is padded below
 * the fixed site header so it never sits under the nav.
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
    <div className="admin-fallback">
      <div className="admin-fallback__panel">
        <h1 className="admin-fallback__title">Studio setup</h1>
        {isStaticHost ? (
          <p className="admin-fallback__body">
            This site is a static export on GitHub Pages. Set repository variable{" "}
            <code>ADMIN_NAV_URL</code> to your hosted Studio URL, then re-run the
            Deploy GitHub Pages workflow.
          </p>
        ) : (
          <p className="admin-fallback__body">
            Set <code>SANITY_STUDIO_URL</code> or <code>ADMIN_NAV_URL</code> to
            your deployed Sanity Studio URL, then redeploy. Locally, run{" "}
            <code>npm run sanity:dev</code> and open{" "}
            <code>http://localhost:{process.env.SANITY_DEV_PORT || "3333"}</code>
            .
          </p>
        )}
        <ul className="admin-fallback__list">
          <li>
            Deploy Studio: <code>npm run sanity:deploy</code>
          </li>
          <li>
            Local Studio: <code>npm run sanity:dev</code>
          </li>
          <li>
            Hosted Studio:{" "}
            <a href={FALCON_SANITY_STUDIO_URL} rel="noopener noreferrer">
              jordan-falcon.sanity.studio
            </a>
          </li>
        </ul>
        {projectId ? (
          <p className="admin-fallback__body">
            <a
              href={`https://www.sanity.io/manage/project/${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open project in Sanity manage
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
