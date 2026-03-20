import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Dashboard</h1>
      <p className="opacity-80">
        Welcome, {session.user?.name || session.user?.email}. You are signed in as the site owner.
      </p>
      <ul className="mt-8 flex flex-col gap-3 text-sm">
        <li>
          <strong>CMS:</strong> Set <code>CMS_PROVIDER=sanity</code> and configure Sanity environment variables to
          switch from mock content to live Sanity data.
        </li>
        <li>
          <strong>OAuth:</strong> Configure <code>GITHUB_CLIENT_ID</code>, <code>GITHUB_CLIENT_SECRET</code>, and{" "}
          <code>ALLOWED_GITHUB_LOGIN</code> to restrict admin access to your GitHub account.
        </li>
      </ul>
    </main>
  );
}
