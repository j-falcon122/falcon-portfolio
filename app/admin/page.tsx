import AdminStudioRedirect from "@/components/AdminStudioRedirect";
import {
  FALCON_SANITY_STUDIO_URL,
  resolveFalconStudioUrl,
} from "@/lib/falconStudioUrl";
import { getDeployEnv } from "portfolio-core/lib/deployEnv";

function resolveAdminTarget(): string {
  const fromResolver = resolveFalconStudioUrl();
  if (fromResolver) return fromResolver;

  if (getDeployEnv() === "local") {
    const port = process.env.SANITY_DEV_PORT?.trim() || "3333";
    return `http://localhost:${port}`;
  }

  return FALCON_SANITY_STUDIO_URL;
}

/**
 * Always render a static-friendly redirect UI.
 * Middleware handles AWS/OpenNext when available; this page covers GitHub Pages
 * static export (no force-dynamic) and acts as a fallback under the site header.
 */
export default function AdminPage() {
  const href = resolveAdminTarget();
  const projectId = process.env.SANITY_PROJECT_ID?.trim();

  return (
    <div className="admin-fallback">
      <div className="admin-fallback__panel">
        <h1 className="admin-fallback__title">Studio</h1>
        <AdminStudioRedirect href={href} />
        <ul className="admin-fallback__list">
          <li>
            Hosted Studio:{" "}
            <a href={FALCON_SANITY_STUDIO_URL} rel="noopener noreferrer">
              jordan-falcon.sanity.studio
            </a>
          </li>
          <li>
            Local Studio: <code>npm run sanity:dev</code>
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
