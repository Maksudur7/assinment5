import { betterAuth } from "better-auth";
import { memoryAdapter, type MemoryDB } from "better-auth/adapters/memory";

const memoryDb: MemoryDB = {
  user: [],
  session: [],
  account: [],
  verification: [],
};

function resolveServerBaseUrl(): string {
  const configured = process.env.BETTER_AUTH_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

  if (configured) {
    const isConfiguredLocalhost = /localhost|127\.0\.0\.1/.test(configured);
    if (isConfiguredLocalhost && vercelUrl) {
      return vercelUrl;
    }
    return configured;
  }

  return vercelUrl || "http://localhost:3000";
}

const resolvedServerBaseUrl = resolveServerBaseUrl();

const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
    ? {
        facebook: {
          clientId: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        },
      }
    : {}),
};

export const auth = betterAuth({
  database: memoryAdapter(memoryDb),
  secret: process.env.BETTER_AUTH_SECRET || "replace-this-in-env-with-a-strong-secret-key-32chars",
  baseURL: resolvedServerBaseUrl,
  trustHost: true,
  emailAndPassword: {
    enabled: true,
    autoSignUpCallback: async (user: { email?: string }) => {
      console.info(`[better-auth] New user signed up: ${user.email ?? "unknown-email"}`);
      return user;
    },
    sendResetPassword: async ({ url, user }) => {
      console.info(`[better-auth] Password reset for ${user.email}: ${url}`);
    },
  },
  socialProviders,
});
