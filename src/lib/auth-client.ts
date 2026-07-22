import { createAuthClient } from "better-auth/react";
import { getAuthToken } from "./portal/storage";

function normalizeAuthUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/api/auth") ? trimmed : `${trimmed}/api/auth`;
}

const BACKEND_AUTH_URL = (() => {
  const envUrl =
    process.env.NEXT_PUBLIC_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    process.env.BACKEND_AUTH_URL;
  if (envUrl && envUrl.trim() !== "") {
    return normalizeAuthUrl(envUrl);
  }
  return "https://ngv-backend.vercel.app/api/auth";
})();

export const authClient = createAuthClient({
  baseURL: BACKEND_AUTH_URL,
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => getAuthToken(),
    },
    throw: true,
    credentials: "include",
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
  verifyEmail,
} = authClient;