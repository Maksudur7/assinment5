import { createAuthClient } from "better-auth/react";

function resolveClientAuthBaseUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

  if (typeof window === "undefined") {
    return configured;
  }

  const origin = window.location.origin;
  const isConfiguredLocalhost = !!configured && /localhost|127\.0\.0\.1/.test(configured);
  const isRunningOnLocalhost = /localhost|127\.0\.0\.1/.test(window.location.hostname);

  if (isConfiguredLocalhost && !isRunningOnLocalhost) {
    return origin;
  }

  return configured || origin;
}

const resolvedAuthBaseUrl = resolveClientAuthBaseUrl();

export const authClient = createAuthClient({
  baseURL: resolvedAuthBaseUrl,
});
