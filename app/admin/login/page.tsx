"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const params = useSearchParams();
  const error = params?.get("error");

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      {error ? (
        <p className="text-sm text-red-400">
          {error === "AccessDenied"
            ? "Access denied. Only the site owner can sign in."
            : error === "OAuthSignin" || error === "OAuthCallback"
            ? "GitHub sign-in failed. Check that your OAuth app credentials are configured correctly."
            : `Sign-in error: ${error}. Verify your environment variables and try again.`}
        </p>
      ) : null}
      <button
        onClick={() => signIn("github", { callbackUrl: "/admin" })}
        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
      >
        Sign in with GitHub
      </button>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
