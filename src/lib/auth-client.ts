import { createAuthClient } from "better-auth/react";
import { getAuthToken } from "./portal/storage";

function normalizeAuthUrl(url: string): string {
  let trimmed = url.replace(/\/+$/, "");
  trimmed = trimmed.endsWith("/api/auth") ? trimmed : `${trimmed}/api/auth`;

  // If the URL is relative and we are running on the server (like next build / SSR),
  // we must prepend a mock base URL to prevent ERR_INVALID_URL from Node's URL parser.
  if (trimmed.startsWith("/") && typeof window === "undefined") {
    return `http://localhost:3000${trimmed}`;
  }

  return trimmed;
}

const BACKEND_AUTH_URL = normalizeAuthUrl(
  process.env.NEXT_PUBLIC_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "https://ngv-backend.vercel.app/api/auth",
);

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