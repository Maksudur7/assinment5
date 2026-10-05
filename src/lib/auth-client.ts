"use client";

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
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }
  return "https://ngv-backend.vercel.app/api/auth";
})();

const clientInstance =
  typeof window !== "undefined"
    ? createAuthClient({
        baseURL: BACKEND_AUTH_URL,
        fetchOptions: {
          credentials: "include",
        },
      })
    : ({
        signIn: { email: () => Promise.resolve(null), social: () => Promise.resolve(null) },
        signUp: { email: () => Promise.resolve(null) },
        signOut: () => Promise.resolve(),
        useSession: () => ({ data: null, isPending: false, error: null }),
        forgetPassword: () => Promise.resolve({ error: null }),
        resetPassword: () => Promise.resolve({ error: null }),
        verifyEmail: () => Promise.resolve({ error: null }),
      } as any);

export const authClient = clientInstance;

export const signIn = clientInstance.signIn;
export const signUp = clientInstance.signUp;
export const signOut = clientInstance.signOut;
export const useSession = clientInstance.useSession;

export const forgetPassword = (...args: any[]) =>
  clientInstance.forgetPassword ? clientInstance.forgetPassword(...args) : Promise.resolve({ error: null });
export const resetPassword = (...args: any[]) =>
  clientInstance.resetPassword ? clientInstance.resetPassword(...args) : Promise.resolve({ error: null });
export const verifyEmail = (...args: any[]) =>
  clientInstance.verifyEmail ? clientInstance.verifyEmail(...args) : Promise.resolve({ error: null });