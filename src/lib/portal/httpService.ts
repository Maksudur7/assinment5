import type { PortalService } from "./service";
import type {
  MediaInput,
  MediaQuery,
  PaymentInput,
  PurchaseType,
  SocialProvider,
  UserRole,
} from "./types";
import { getAuthToken } from "./storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return (await res.json()) as T;
}

export const httpPortalService: PortalService = {
  getCurrentUser: () => call("/auth/me"),
  switchUser: (role: UserRole) => call("/dev/switch-user", { method: "POST", body: JSON.stringify({ role }) }),
  login: (email: string, password: string) => call("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string) => call("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  socialLogin: (provider: SocialProvider) => call("/auth/social-login", { method: "POST", body: JSON.stringify({ provider }) }),
  requestPasswordReset: (email: string) => call("/auth/password-reset/request", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (resetToken: string, newPassword: string) => call("/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ resetToken, newPassword }) }),
  logout: () => call("/auth/logout", { method: "POST" }),

  getMedia: (query: MediaQuery = {}) => {
    const qs = new URLSearchParams(
      Object.entries(query)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return call(`/media${qs ? `?${qs}` : ""}`);
  },
  getMediaById: (id: string) => call(`/media/${id}`),
  createMedia: (input: MediaInput) => call("/admin/media", { method: "POST", body: JSON.stringify(input) }),
  updateMedia: (id: string, input: Partial<MediaInput>) => call(`/admin/media/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteMedia: (id: string) => call(`/admin/media/${id}`, { method: "DELETE" }),

  getReviews: (mediaId: string, includePending = false) =>
    call(`/reviews?mediaId=${mediaId}&includePending=${includePending}`),
  createReview: (input) => call("/reviews", { method: "POST", body: JSON.stringify(input) }),
  updateOwnUnpublishedReview: (reviewId, input) =>
    call(`/reviews/${reviewId}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteOwnUnpublishedReview: (reviewId) =>
    call(`/reviews/${reviewId}`, { method: "DELETE" }),

  toggleReviewLike: (reviewId: string) =>
    call(`/reviews/${reviewId}/like`, { method: "POST" }),
  addComment: (reviewId: string, content: string, parentCommentId?: string) =>
    call(`/reviews/${reviewId}/comments`, { method: "POST", body: JSON.stringify({ content, parentCommentId }) }),
  getComments: (reviewId: string) => call(`/reviews/${reviewId}/comments`),
  getPendingComments: () => call("/admin/comments/pending"),
  approveComment: (commentId: string) => call(`/admin/comments/${commentId}/approve`, { method: "POST" }),
  unpublishComment: (commentId: string) => call(`/admin/comments/${commentId}/unpublish`, { method: "POST" }),
  removeComment: (commentId: string) => call(`/admin/comments/${commentId}`, { method: "DELETE" }),

  toggleWatchlist: (mediaId: string) =>
    call(`/watchlist/${mediaId}`, { method: "POST" }),
  getWatchlist: () => call("/watchlist"),

  createPurchase: (type: PurchaseType, mediaId?: string, payment?: PaymentInput) =>
    call("/payments/purchase", { method: "POST", body: JSON.stringify({ type, mediaId, payment }) }),
  getPurchaseHistory: () => call("/payments/history"),
  getAllPurchases: () => call("/admin/payments"),
  revokePurchase: (purchaseId: string) => call(`/admin/payments/${purchaseId}/revoke`, { method: "POST" }),

  getPendingReviews: () => call("/admin/reviews/pending"),
  approveReview: (reviewId: string) => call(`/admin/reviews/${reviewId}/approve`, { method: "POST" }),
  unpublishReview: (reviewId: string) => call(`/admin/reviews/${reviewId}/unpublish`, { method: "POST" }),
  removeReview: (reviewId: string) => call(`/admin/reviews/${reviewId}`, { method: "DELETE" }),
  getAdminOverview: () => call("/admin/overview"),
};
