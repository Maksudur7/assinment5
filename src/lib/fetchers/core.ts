import { portalService } from "@/src/lib/portal";
import type { MediaQuery, PaymentInput, PurchaseType, SocialProvider } from "@/src/lib/portal/types";
import { authClient } from "@/src/lib/auth-client";
import type { UserRole } from "@/src/lib/portal/types";

function toPortalRole(user: Record<string, unknown>): UserRole {
  const role = user.role;
  if (role === "admin" || role === "user") return role;

  const email = user.email;
  if (typeof email === "string" && email.toLowerCase() === "admin@ngv.local") {
    return "admin";
  }

  return "user";
}

function getAuthErrorMessage(error: { message?: string } | null, fallback: string): string {
  return error?.message || fallback;
}

export const authFetchers = {
  async me() {
    const { data, error } = await authClient.getSession();
    if (error || !data?.user) {
      throw new Error(getAuthErrorMessage(error, "Failed to fetch current user"));
    }

    const user = data.user as Record<string, unknown>;

    return {
      id: String(user.id ?? ""),
      name: typeof user.name === "string" ? user.name : "Unknown",
      email: typeof user.email === "string" ? user.email : "",
      role: toPortalRole(user),
    };
  },
  async login(email: string, password: string) {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    if (error) {
      throw new Error(getAuthErrorMessage(error, "Login failed"));
    }

    return data;
  },
  async register(name: string, email: string, password: string) {
    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });

    if (error) {
      throw new Error(getAuthErrorMessage(error, "Signup failed"));
    }

    return data;
  },
  async socialLogin(provider: SocialProvider) {
    const { data, error } = await authClient.signIn.social({
      provider,
      callbackURL: "/",
    });

    if (error) {
      throw new Error(getAuthErrorMessage(error, "Social login failed"));
    }

    return data;
  },
  async requestPasswordReset(email: string) {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "/reset-password";

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo,
    });

    if (error) {
      throw new Error(getAuthErrorMessage(error, "Failed to request password reset"));
    }

    return { ok: true, resetToken: "" };
  },
  async resetPassword(token: string, newPassword: string) {
    const { data, error } = await authClient.resetPassword({
      token,
      newPassword,
    });

    if (error) {
      throw new Error(getAuthErrorMessage(error, "Failed to reset password"));
    }

    return data;
  },
  async logout() {
    const { error } = await authClient.signOut();

    if (error) {
      throw new Error(getAuthErrorMessage(error, "Logout failed"));
    }
  },
};

export const mediaFetchers = {
  list: (query?: MediaQuery) => portalService.getMedia(query),
  byId: (id: string) => portalService.getMediaById(id),
  create: portalService.createMedia.bind(portalService),
  update: portalService.updateMedia.bind(portalService),
  remove: portalService.deleteMedia.bind(portalService),
};

export const reviewFetchers = {
  list: (mediaId: string, includePending?: boolean) => portalService.getReviews(mediaId, includePending),
  create: portalService.createReview.bind(portalService),
  updateOwnUnpublished: portalService.updateOwnUnpublishedReview.bind(portalService),
  deleteOwnUnpublished: portalService.deleteOwnUnpublishedReview.bind(portalService),
  toggleLike: portalService.toggleReviewLike.bind(portalService),
  comment: (reviewId: string, content: string, parentCommentId?: string) => portalService.addComment(reviewId, content, parentCommentId),
  comments: (reviewId: string) => portalService.getComments(reviewId),
};

export const paymentFetchers = {
  create: (type: PurchaseType, mediaId?: string, payment?: PaymentInput) => portalService.createPurchase(type, mediaId, payment),
  history: () => portalService.getPurchaseHistory(),
  all: () => portalService.getAllPurchases(),
  revoke: (purchaseId: string) => portalService.revokePurchase(purchaseId),
};

export const watchlistFetchers = {
  list: () => portalService.getWatchlist(),
  toggle: (mediaId: string) => portalService.toggleWatchlist(mediaId),
};

export const adminFetchers = {
  overview: () => portalService.getAdminOverview(),
  pendingReviews: () => portalService.getPendingReviews(),
  approveReview: (reviewId: string) => portalService.approveReview(reviewId),
  unpublishReview: (reviewId: string) => portalService.unpublishReview(reviewId),
  removeReview: (reviewId: string) => portalService.removeReview(reviewId),
  pendingComments: () => portalService.getPendingComments(),
  approveComment: (commentId: string) => portalService.approveComment(commentId),
  unpublishComment: (commentId: string) => portalService.unpublishComment(commentId),
  removeComment: (commentId: string) => portalService.removeComment(commentId),
};

export const homeFetchers = {
  getTrending: () => portalService.getMedia({ sort: "most-reviewed", pageSize: 12 }).then(r => r.items),
  getFeatured: () => portalService.getMedia({ sort: "highest-rated", pageSize: 6 }).then(r => r.items),
  getNewReleases: () => portalService.getMedia({ sort: "latest", pageSize: 12 }).then(r => r.items),
  getRecommendations: () => portalService.getMedia({ pageSize: 12 }).then(r => r.items),
};

export const dashboardFetchers = {
  getStats: async () => ({ totalWatchTime: "0h 0m", currentPlan: "Free" }),
  getFavorites: () => portalService.getMedia({ pageSize: 8 }).then(r => r.items),
  getWatchHistory: () => portalService.getMedia({ pageSize: 20 }).then(r => r.items),
  getResumeWatching: () => portalService.getMedia({ pageSize: 6 }).then(r => r.items),
  getContinueWatching: () => portalService.getMedia({ pageSize: 6 }).then(r => r.items),
  updateWatchProgress: async (mediaId: string, progressSeconds: number) => ({
    mediaId,
    progressSeconds,
    updatedAt: new Date().toISOString(),
  }),
};
