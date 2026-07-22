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
import { triggerGlobalError } from "../events";

// Helper: On 401, auto-logout and clear token/user, then optionally run a callback (e.g. show login modal)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleAuthError(err: any, onLogout?: () => void, isSilentCheck = false) {
  if (err?.message?.includes("401")) {
    setAuthToken("");
    setStoredUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ngv-portal-store-v2");
    }
    
    // Show a popup if it's not a silent background check (like getSessionUser on load)
    if (typeof window !== "undefined" && !isSilentCheck) {
      triggerGlobalError({
        title: "Authentication Required",
        message: "You need to be logged in to access this feature. Please sign in to continue.",
        action: "login"
      });
    }
    
    if (onLogout) onLogout();
  }
}

async function call<T>(
  path: string,
  init?: RequestInit,
  onLogout?: () => void,
  isSilentCheck = false,
): Promise<T> {
  const token = getAuthToken();
  const API_URL = (() => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL;
    if (envUrl && envUrl.trim() !== "") {
      return envUrl.replace(/\/+$/, "");
    }
    return "https://ngv-backend.vercel.app/api";
  })();

  // Ensure no double slash in URL
  const url = path.startsWith("/") ? `${API_URL}${path}` : `${API_URL}/${path}`;
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleAuthError({ message: `${res.status}` }, onLogout, isSilentCheck);
      throw new Error(`Unauthorized (${res.status})`);
    }

    if (res.status === 403) {
      if (typeof window !== "undefined" && !isSilentCheck) {
        triggerGlobalError({
          title: "Access Denied",
          message: "You do not have permission to perform this action. Admin rights required.",
          action: "dismiss"
        });
      }
      throw new Error(`Forbidden (${res.status})`);
    }
    
    let errorMsg = `API Error: ${res.status}`;
    let displayMsg = "";

    try {
      const errorBody = await res.json();
      if (errorBody && errorBody.message) {
        errorMsg = `API Error: ${res.status} - ${errorBody.message}`;
        displayMsg = errorBody.message;
      }
    } catch (e) {
      // Ignore if body isn't JSON
    }

    if (typeof window !== "undefined" && !isSilentCheck) {
      if (res.status === 404) {
        triggerGlobalError({
          title: "Not Found",
          message: "The requested resource was not found or may have been removed.",
          action: "dismiss"
        });
      } else if (res.status >= 500) {
        triggerGlobalError({
          title: "Server Error",
          message: "We're having trouble connecting to our servers. Please try again later.",
          action: "dismiss"
        });
      } else if (displayMsg) {
        triggerGlobalError({
          title: "Error",
          message: displayMsg,
          action: "dismiss"
        });
      } else {
        triggerGlobalError({
          title: "Unexpected Error",
          message: "An unexpected error occurred while communicating with the server.",
          action: "dismiss"
        });
      }
    }

    throw new Error(errorMsg);
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
        true // isSilentCheck
      );
      if (user && typeof user === "object" && user.email) {
        if (process.env.NODE_ENV === "development") {
          console.debug("[getSessionUser] Backend user:", user);
        }
        return user;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      handleAuthError(err, onLogout, true);
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
      return await call<PortalUser>("/users/me", undefined, onLogout, true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      handleAuthError(err, onLogout, true);
      if (err?.message?.includes("401") || err?.message?.includes("403")) {
        setAuthToken("");
        setStoredUser(null);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("ngv-portal-store-v2");
        }
        return null;
      }
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
  updateProfile: (name: string, email: string) =>
    call<PortalUser>("/users/me", {
      method: "PUT",
      body: JSON.stringify({ name, email }),
    }),
  uploadAvatar: (base64Image: string) =>
    call<{ success: boolean; image: string }>("/users/me/avatar", {
      method: "POST",
      body: JSON.stringify({ image: base64Image }),
    }),
  switchUser: (role: UserRole) =>
    call("/dev/switch-user", {
      method: "POST",
      body: JSON.stringify({ role }),
    }),
  async login(email: string, password: string) {
    const res = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    if (!res) throw new Error("Login failed");

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

  async register(name: string, email: string, password: string) {
    const res = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });

    if (!res) throw new Error("Signup failed");

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
  socialLogin: async (provider: SocialProvider) => {
    const callbackURL = typeof window !== "undefined"
      ? `${window.location.origin}/`
      : "https://ngv-black.vercel.app/";

    const res = await authClient.signIn.social({
      provider,
      callbackURL,
    });
    return res as any;
  },
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
  getSessions: () => call<any[]>("/auth/sessions"),
  revokeSession: (token: string) =>
    call("/auth/sessions/revoke", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  revokeAllSessions: () =>
    call("/auth/sessions/revoke-all", {
      method: "POST",
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
  getReviews: (mediaId: string, includePending = false) => 
    call(`/media/${mediaId}/reviews${includePending ? "?includePending=true" : ""}`),
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
  getWatchHistory: () => call("/users/me/watch-history"),
  addToHistory: (mediaId: string) => call(`/watchlist/history/${mediaId}`, { method: "POST" }),

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

  unpublishReview: (reviewId: string) =>
    call(`/admin/reviews/${reviewId}/unpublish`, {
      method: "POST",
    }),
  removeReview: (reviewId: string) =>
    call(`/admin/reviews/${reviewId}`, {
      method: "DELETE",
    }),
  getLandingContent: () => call("/landing"),
  createLandingHighlight: (title: string, text: string) =>
    call("/landing/highlights", {
      method: "POST",
      body: JSON.stringify({ title, text }),
    }).then((res: any) => res.data),
  deleteLandingHighlight: (id: string) =>
    call(`/landing/highlights/${id}`, { method: "DELETE" }),
  createLandingTestimonial: (name: string, quote: string) =>
    call("/landing/testimonials", {
      method: "POST",
      body: JSON.stringify({ name, quote }),
    }).then((res: any) => res.data),
  deleteLandingTestimonial: (id: string) =>
    call(`/landing/testimonials/${id}`, { method: "DELETE" }),
  createLandingFaq: (question: string, answer: string) =>
    call("/landing/faqs", {
      method: "POST",
      body: JSON.stringify({ question, answer }),
    }).then((res: any) => res.data),
  deleteLandingFaq: (id: string) =>
    call(`/landing/faqs/${id}`, { method: "DELETE" }),
  
  getCategories: () => call<any[]>("/categories"),
  createCategory: (name: string, icon?: string) =>
    call<any>("/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name, icon }),
    }),
  deleteCategory: (id: string) =>
    call<any>(`/admin/categories/${id}`, {
      method: "DELETE",
    }),
};
