/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PortalService } from "./service";
import type {
  MediaInput,
  MediaQuery,
  PaymentInput,
  PurchaseRecord,
  PurchaseType,
  Review,
  ReviewComment,
  SocialProvider,
  UserRole,
} from "./types";
import { getAuthToken } from "./storage";
import { authClient } from "../auth-client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://ngv-backend.vercel.app/api";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken(); 
  // const API_URL = "https://ngv-backend.vercel.app/api";
  const API_URL = "https://ngv-backend.vercel.app/api";

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized (401)");
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

export const httpPortalService: PortalService = {
  getCurrentUser: () => call("/users/me"),

  switchUser: (role: UserRole) =>
    call("/dev/switch-user", {
      method: "POST",
      body: JSON.stringify({ role }),
    }),

  login: async (email, password) => {
    const result = await authClient.signIn.email({ email, password });
    return {
      ...result.user,
      role: (result.user.role ?? "user") as UserRole,
    } as PortalUser;
  },
  register: async (name, email, password) => {
    const result = await authClient.signUp.email({ email, password, name });
    return {
      ...result.user,
      role: (result.user.role ?? "user") as UserRole,
    } as PortalUser;
  },
  logout: async () => {
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

  createReview: (input: any) =>
    call(`/media/${input.mediaId}/reviews`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateOwnUnpublishedReview: (reviewId: string, input: any) =>
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

  createPurchase: (type, mediaId, payment) =>
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
