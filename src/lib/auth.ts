import { betterAuth } from "better-auth";
import { memoryAdapter, type MemoryDB } from "better-auth/adapters/memory";

const memoryDb: MemoryDB = {};

export const auth = betterAuth({
  database: memoryAdapter(memoryDb),
  secret: process.env.BETTER_AUTH_SECRET || "replace-this-in-env-with-a-strong-secret-key-32chars",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
      autoSignUpCallback: async (user: any) => {
      console.info(`[better-auth] New user signed up: ${user.email}`);
      return user;
    },
    sendResetPassword: async ({ url, user }) => {
      console.info(`[better-auth] Password reset for ${user.email}: ${url}`);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    },
  },
});
