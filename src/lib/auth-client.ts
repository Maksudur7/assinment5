import { createAuthClient } from "better-auth/react";
import { getAuthToken } from "./portal/storage";

function normalizeAuthUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/api/auth") ? trimmed : `${trimmed}/api/auth`;
}

const BACKEND_AUTH_URL = normalizeAuthUrl(
  process.env.NEXT_PUBLIC_AUTH_URL
    || process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    || "https://ngv-backend.vercel.app/api/auth",
);

export const authClient = createAuthClient({
  baseURL: BACKEND_AUTH_URL,
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => getAuthToken(), 
    },
    throw: true,
  },
});