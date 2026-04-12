import { betterAuth } from "better-auth";
import { memoryAdapter, type MemoryDB } from "better-auth/adapters/memory";

const memoryDb: MemoryDB = {};

export const auth = betterAuth({
  database: memoryAdapter(memoryDb),
  secret: process.env.BETTER_AUTH_SECRET || "replace-this-in-env-with-a-strong-secret-key-32chars",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ url, user }) => {
      console.info(`[better-auth] Password reset for ${user.email}: ${url}`);
    },
  },
});
