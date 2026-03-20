import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    // Not signed in - redirect to NextAuth sign-in
    redirect(`/api/auth/signin`);
  }

  // Optional: username whitelist from env (comma-separated)
  const allowed = process.env.ADMIN_GITHUB_USERS;
  if (allowed) {
    const allowedList = allowed.split(",").map((s) => s.trim().toLowerCase());
    const login = (session.user?.name || session.user?.email || "").toString().toLowerCase();
    // NextAuth's GitHub provider typically exposes `session.user.email` and `session.user.name`.
    if (!allowedList.includes(login) && !allowedList.includes(session.user?.email || "")) {
      // Not authorized
      redirect(`/api/auth/signin`);
    }
  }

  // Signed in and allowed - redirect to your Sanity Studio URL (replace with your deployed studio)
  const studioUrl = process.env.SANITY_STUDIO_URL || "https://your-studio-url.sanity.studio";
  redirect(studioUrl);
}
