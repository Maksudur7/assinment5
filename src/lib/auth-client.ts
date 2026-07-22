import { createAuthClient } from "better-auth/react";
import { getAuthToken } from "./portal/storage";

function normalizeAuthUrl(url: string): string {
  let trimmed = url.replace(/\/+$/, "");
  return trimmed.endsWith("/api/auth") ? trimmed : `${trimmed}/api/auth`;
}

const BACKEND_AUTH_URL = (() => {
  if (typeof window === "undefined") {
    const serverUrl = process.env.BACKEND_AUTH_URL;
    if (serverUrl && !serverUrl.startsWith("/")) {
      return normalizeAuthUrl(serverUrl);
    }
    const clientUrl = process.env.NEXT_PUBLIC_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
    if (clientUrl && !clientUrl.startsWith("/")) {
      return normalizeAuthUrl(clientUrl);
    }
    return "https://ngv-backend.vercel.app/api/auth";
  }
  return "/api/auth";
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