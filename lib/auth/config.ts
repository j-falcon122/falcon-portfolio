import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example for setup instructions.`);
  }
  return value;
}

function buildAuthOptions(): NextAuthOptions {
  return {
    providers: [
      GithubProvider({
        clientId: requireEnv("GITHUB_CLIENT_ID"),
        clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
      }),
    ],
    callbacks: {
      async signIn({ profile }) {
        // Allow only the portfolio owner's GitHub account to sign in.
        // Set ALLOWED_GITHUB_LOGIN in your environment to your GitHub username.
        const allowed = process.env.ALLOWED_GITHUB_LOGIN;
        if (!allowed) return true;
        return (profile as { login?: string })?.login === allowed;
      },
      async session({ session, token }) {
        return { ...session, user: { ...session.user, login: token.login as string | undefined } };
      },
      async jwt({ token, profile }) {
        if (profile) {
          token.login = (profile as { login?: string }).login;
        }
        return token;
      },
    },
    pages: {
      signIn: "/admin/login",
      error: "/admin/login",
    },
  };
}

let _authOptions: NextAuthOptions | null = null;

export function getAuthOptions(): NextAuthOptions {
  if (!_authOptions) {
    _authOptions = buildAuthOptions();
  }
  return _authOptions;
}

// Convenience re-export for getServerSession calls
export const authOptions: NextAuthOptions = new Proxy({} as NextAuthOptions, {
  get(_target, prop) {
    return getAuthOptions()[prop as keyof NextAuthOptions];
  },
});
