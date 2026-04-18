// Helper to safely cast any value to UserRole
function toUserRole(role: unknown): UserRole {
  return role === "admin" ? "admin" : "user";
}
import type {
  MediaInput,
  MediaQuery,
  PortalUser,
  SocialProvider,
  UserRole,
} from "./types";
import {
  getAuthToken,
  setAuthToken,
  setStoredUser,
  getStoredUser,
} from "./storage";
import { authClient } from "../auth-client";

// Helper: On 401/403, auto-logout and clear token/user, then optionally run a callback (e.g. show login modal)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleAuthError(err: any, onLogout?: () => void) {
  if (err?.message?.includes("401") || err?.message?.includes("403")) {
    setAuthToken("");
    setStoredUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ngv-portal-store-v2");
    }
    if (onLogout) onLogout();
  }
}

async function call<T>(
  path: string,
  init?: RequestInit,
  onLogout?: () => void,
): Promise<T> {
  const token = getAuthToken();
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // Ensure no double slash in URL
  const url = path.startsWith("/") ? `${API_URL}${path}` : `${API_URL}/${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      handleAuthError({ message: `${res.status}` }, onLogout);
      throw new Error(`Unauthorized (${res.status})`);
    }
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}

export const httpPortalService = {
  /**
   * Fetches the current session user from the backend using /auth/get-session.
   * Robust fallback: if backend fails (401/403/404/network), tries local/session storage.
   * Always returns a valid PortalUser object or null.
   *
   * @returns {Promise<PortalUser|null>} The current user, or null if not found/unauthorized.
   */
  getSessionUser: async function (
    onLogout?: () => void,
  ): Promise<PortalUser | null> {
    try {
      const user = await call<PortalUser>(
        "/auth/get-session",
        undefined,
        onLogout,
      );
      if (user && typeof user === "object" && user.email) {
        if (process.env.NODE_ENV === "development") {
          console.debug("[getSessionUser] Backend user:", user);
        }
        return user;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      handleAuthError(err, onLogout);
      if (process.env.NODE_ENV === "development") {
        console.warn("[getSessionUser] Backend failed:", err?.message || err);
      }
      // Only fallback for auth errors or network issues
      if (
        err?.message?.includes("401") ||
        err?.message?.includes("403") ||
        err?.message?.includes("404") ||
        err?.message?.includes("API Error") ||
        err?.name === "TypeError"
      ) {
        try {
          const localUser = getStoredUser();
          if (process.env.NODE_ENV === "development") {
            console.debug("[getSessionUser] Fallback local user:", localUser);
          }
          if (localUser) {
            return {
              ...localUser,
              user: localUser,
              role: toUserRole(localUser.role),
            } as PortalUser;
          }
          return null;
        } catch {
          return null;
        }
      }
    }
    // If all else fails, return null
    return null;
  },
  getCurrentUser: async function (
    onLogout?: () => void,
  ): Promise<PortalUser | null> {
    try {
      return await call<PortalUser>("/users/me", undefined, onLogout);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      handleAuthError(err, onLogout);
      try {
        const localUser = getStoredUser();
        if (localUser) {
          return {
            ...localUser,
            user: localUser,
            role: toUserRole(localUser.role),
          } as PortalUser;
        }
        return null;
      } catch {
        return null;
      }
    }
  },
  switchUser: (role: UserRole) =>
    call("/dev/switch-user", {
      method: "POST",
      body: JSON.stringify({ role }),
    }),
  async login(email: string, password: string) {
    // 1. Better Auth request pathachche
    const res = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    console.log("[DEBUG] login response:", res);

    if (!res) throw new Error("Login failed");

    // 2. Token extraction logic update (Backend theke asha token khuje ber kora)
    // res.data thakle setar bhetore check korbe, na thakle direct res-e check korbe
    const resultData = (res as { data?: unknown })?.data ?? res;

    // Try to extract possible token fields (loose type, backend may change shape)
    const sessionToken =
      (resultData as Record<string, unknown>)?.token ||
      ((resultData as Record<string, unknown>)?.session as Record<string, unknown> | undefined)?.token ||
      (res as Record<string, unknown>)?.accessToken ||
      (res as Record<string, unknown>)?.jwt;

    console.log("[DEBUG] sessionToken found:", sessionToken);

    if (sessionToken) {
      setAuthToken(sessionToken as string);
      console.log("[DEBUG] setAuthToken called with:", sessionToken);
    } else {
      console.warn(
        "[DEBUG] NO TOKEN FOUND in response! Check backend controller.",
      );
    }

    // 3. User info save kora
    const user = ((resultData as Record<string, unknown>)?.user ?? (res as Record<string, unknown>)?.user) as {
      id: string;
      name: string;
      email: string;
      role?: string;
    } | undefined;
    if (user) {
      setStoredUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: toUserRole(user.role),
      });
    }

    return res;
  },

  async register(name: string, email: string, password: string) {
    const res = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });

    console.log("[DEBUG] register response:", res);

    if (!res) throw new Error("Signup failed");

    // Login-er motoi same logic
    const resultData = (res as { data?: unknown })?.data ?? res;

    const sessionToken =
      (resultData as Record<string, unknown>)?.token ||
      ((resultData as Record<string, unknown>)?.session as Record<string, unknown> | undefined)?.token ||
      (res as Record<string, unknown>)?.accessToken ||
      (res as Record<string, unknown>)?.jwt;

    if (sessionToken) {
      setAuthToken(sessionToken as string);
    }

    const user = ((resultData as Record<string, unknown>)?.user ?? (res as Record<string, unknown>)?.user) as {
      id: string;
      name: string;
      email: string;
      role?: string;
    } | undefined;
    if (user) {
      setStoredUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: toUserRole(user.role),
      });
    }

    return res;
  },
  logout: async (): Promise<void> => {
    await authClient.signOut();
  },
  socialLogin: (provider: SocialProvider) =>
    call("/auth/social/signin", {
      method: "POST",
      body: JSON.stringify({ provider }),
    }),
  requestPasswordReset: (email: string) =>
    call("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    call("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
  getMedia: (query: MediaQuery = {}) => {
    const qs = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return call(`/media${qs ? `?${qs}` : ""}`);
  },
  getMediaById: (id: string) => call(`/media/${id}`),
  createMedia: (input: MediaInput) =>
    call("/admin/media", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateMedia: (id: string, input: Partial<MediaInput>) =>
    call(`/media/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteMedia: (id: string) => call(`/media/${id}`, { method: "DELETE" }),
  getReviews: (mediaId: string) => call(`/media/${mediaId}/reviews`),
  createReview: (input: Record<string, unknown>) =>
    call(`/media/${input.mediaId}/reviews`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateOwnUnpublishedReview: (
    reviewId: string,
    input: Record<string, unknown>,
  ) =>
    call(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteOwnUnpublishedReview: (reviewId: string) =>
    call(`/reviews/${reviewId}`, { method: "DELETE" }),
  toggleReviewLike: (reviewId: string) =>
    call(`/reviews/${reviewId}/like`, { method: "POST" }),
  addComment: (reviewId: string, content: string) =>
    call(`/reviews/${reviewId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  getComments: (reviewId: string) => call(`/reviews/${reviewId}/comments`),
  toggleWatchlist: (mediaId: string) =>
    call(`/watchlist/${mediaId}`, { method: "POST" }),
  getWatchlist: () => call("/watchlist"),
  createPurchase: (
    type: string,
    mediaId: string,
    payment: Record<string, unknown>,
  ) =>
    call("/purchases", {
      method: "POST",
      body: JSON.stringify({ type, mediaId, payment }),
    }),
  getPurchaseHistory: () => call("/purchases/history"),
  getAllPurchases: () => call("/purchases"),
  getPendingReviews: () => call("/admin/reviews/pending"),
  approveReview: (reviewId: string) =>
    call(`/admin/reviews/${reviewId}/approve`, {
      method: "POST",
    }),
  getAdminOverview: () => call("/admin/overview"),
  getPendingComments: () => call("/admin/comments/pending"),
  approveComment: (commentId: string) =>
    call(`/admin/comments/${commentId}/approve`, {
      method: "POST",
    }),
  unpublishComment: (commentId: string) =>
    call(`/admin/comments/${commentId}/unpublish`, {
      method: "POST",
    }),
  removeComment: (commentId: string) =>
    call(`/admin/comments/${commentId}`, {
      method: "DELETE",
    }),
  revokePurchase: (purchaseId: string) =>
    call(`/purchases/${purchaseId}/revoke`, {
      method: "POST",
    }),
  unpublishReview: (reviewId: string) =>
    call(`/admin/reviews/${reviewId}/unpublish`, {
      method: "POST",
    }),
  removeReview: (reviewId: string) =>
    call(`/admin/reviews/${reviewId}`, {
      method: "DELETE",
    }),
};
