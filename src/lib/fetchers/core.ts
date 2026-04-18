/* eslint-disable @typescript-eslint/no-explicit-any */
import { portalService } from "../portal";
import { setAuthToken, setStoredUser } from "../portal/storage";
import {
  MediaQuery,
  PurchaseType,
  SocialProvider,
  UserRole,
} from "../portal/types";
import { authClient } from "@/src/lib/auth-client";

function toPortalRole(user: Record<string, unknown>): UserRole {
  return (user.role as UserRole) || "user";
}

export const authFetchers = {
  async me() {
    const sessionData = await portalService.getCurrentUser();

    console.log("my data ", sessionData);

    if (!sessionData || !sessionData.user) {
      throw new Error("Failed to fetch current user");
    }

    const user = sessionData.user;

    return {
      id: String(user.id ?? ""),
      name: typeof user.name === "string" ? user.name : "Unknown",
      email: typeof user.email === "string" ? user.email : "",
      role: toPortalRole(user as Record<string, any>),
    };
  },

  async login(email: string, password: string) {
    const res = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    console.log("[DEBUG] login response:", res);

    if (!res) throw new Error("Login failed");

    const sessionToken =
      (res as any).token ||
      (res as any).session?.token ||
      (res as any).accessToken ||
      (res as any).jwt;
    console.log("[DEBUG] sessionToken:", sessionToken);
    if (sessionToken) {
      setAuthToken(sessionToken);
      console.log("[DEBUG] setAuthToken called with:", sessionToken);
    }

    if (res.user) {
      setStoredUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: (res.user as any).role || "user",
      });
      console.log("[DEBUG] setStoredUser called with:", {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: (res.user as any).role || "user",
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

    const sessionToken =
      (res as any).token ||
      (res as any).session?.token ||
      (res as any).accessToken ||
      (res as any).jwt;
    console.log("[DEBUG] sessionToken:", sessionToken);
    if (sessionToken) {
      setAuthToken(sessionToken);
      console.log("[DEBUG] setAuthToken called with:", sessionToken);
    }

    if (res.user) {
      setStoredUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: (res.user as any).role || "user",
      });
      console.log("[DEBUG] setStoredUser called with:", {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: (res.user as any).role || "user",
      });
    }

    return res;
  },

  async socialLogin(provider: SocialProvider) {
    // Directly return result, not { data, error }
    const res = await authClient.signIn.social({
      provider,
      callbackURL: "/",
    });

    // Better Auth will automatically throw error if any (since throw: true)
    if (!res) throw new Error("Social login failed");

    // Save session token (using as any to avoid TypeScript error)
    const sessionToken = (res as any).token || (res as any).session?.token;
    if (sessionToken) setAuthToken(sessionToken);

    return res;
  },

  async requestPasswordReset(email: string) {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "/reset-password";

    // Call forgetPassword method directly if type error occurs.
    const res = await (authClient as any).forgetPassword({
      email,
      redirectTo,
    });

    if (!res) throw new Error("Failed to request reset");

    return { ok: true, resetToken: "" };
  },

  async resetPassword(token: string, newPassword: string) {
    // Directly return result here as well
    const res = await authClient.resetPassword({
      token,
      newPassword,
    });

    if (!res) throw new Error("Failed to reset password");

    return res;
  },

  async logout() {
    // Call signOut method directly
    await authClient.signOut();

    // Clear token
    setAuthToken("");
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
  list: (mediaId: string) => portalService.getReviews(mediaId),
  create: portalService.createReview.bind(portalService),
  updateOwnUnpublished:
    portalService.updateOwnUnpublishedReview.bind(portalService),
  deleteOwnUnpublished:
    portalService.deleteOwnUnpublishedReview.bind(portalService),
  toggleLike: portalService.toggleReviewLike.bind(portalService),
  comment: (reviewId: string, content: string) =>
    portalService.addComment(reviewId, content),
  comments: (reviewId: string) => portalService.getComments(reviewId),
};

export const paymentFetchers = {
  create: (type: PurchaseType, mediaId?: string, payment?: any) =>
    portalService.createPurchase(type, mediaId || "", payment ?? undefined),
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
  unpublishReview: (reviewId: string) =>
    portalService.unpublishReview(reviewId),
  removeReview: (reviewId: string) => portalService.removeReview(reviewId),
  pendingComments: () => portalService.getPendingComments(),
  approveComment: (commentId: string) =>
    portalService.approveComment(commentId),
  unpublishComment: (commentId: string) =>
    portalService.unpublishComment(commentId),
  removeComment: (commentId: string) => portalService.removeComment(commentId),
};

export const homeFetchers = {
  getTrending: () =>
    portalService
      .getMedia({ sort: "most-reviewed", pageSize: 12 })
      .then((r: any) => r.items || []),

  getFeatured: () =>
    portalService
      .getMedia({ sort: "highest-rated", pageSize: 6 })
      .then((r: any) => r.items || []),

  getNewReleases: () =>
    portalService
      .getMedia({ sort: "latest", pageSize: 12 })
      .then((r: any) => r.items || []),

  getRecommendations: () =>
    portalService.getMedia({ pageSize: 12 }).then((r: any) => r.items || []),
};

export const dashboardFetchers = {
  getStats: () =>
    portalService.getAdminOverview().then((r: any) => ({
      totalWatchTime: r.totalWatchTime || "0h 0m",
      currentPlan: r.currentPlan || "Free",
    })),

  getFavorites: () =>
    portalService.getWatchlist().then((r: any) => r.items || []),

  getWatchHistory: () =>
    portalService
      .getMedia({ sort: "latest", pageSize: 20 })
      .then((r: any) => r.items || []),

  getResumeWatching: () =>
    portalService.getMedia({ pageSize: 6 }).then((r: any) => r.items || []),

  getContinueWatching: () =>
    portalService.getMedia({ pageSize: 6 }).then((r: any) => r.items || []),

  updateWatchProgress: (mediaId: string, progressSeconds: number) =>
    portalService.toggleWatchlist(mediaId).then(() => ({
      mediaId,
      progressSeconds,
      updatedAt: new Date().toISOString(),
    })),
};
