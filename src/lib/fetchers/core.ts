/* eslint-disable @typescript-eslint/no-explicit-any */
import { portalService } from "../portal";
import { setAuthToken, setStoredUser } from "../portal/storage";
import {
  MediaQuery,
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

    if (!sessionData) {
      throw new Error("Failed to fetch current user");
    }

    const user = (sessionData as any).user || sessionData;

    return {
      id: String(user.id ?? ""),
      name: typeof user.name === "string" ? user.name : "Unknown",
      email: typeof user.email === "string" ? user.email : "",
      role: toPortalRole(user as Record<string, any>),
    };
  },

  async login(email: string, password: string) {
    const res: any = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    if (res?.error) {
      throw new Error(res.error.message || "Invalid credentials");
    }

    const result = res?.data || res;
    const sessionToken =
      result?.token ||
      result?.session?.token ||
      result?.accessToken;

    if (sessionToken) {
      setAuthToken(sessionToken);
    }

    if (result?.user) {
      setStoredUser({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role || "user",
      });
    }

    return result;
  },

  async register(name: string, email: string, password: string) {
    const res: any = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });

    if (res?.error) {
      throw new Error(res.error.message || "Registration failed");
    }

    const result = res?.data || res;
    const sessionToken =
      result?.token ||
      result?.session?.token ||
      result?.accessToken;

    if (sessionToken) {
      setAuthToken(sessionToken);
    }

    if (result?.user) {
      setStoredUser({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role || "user",
      });
    }

    return result;
  },

  async socialLogin(provider: SocialProvider) {
    const callbackURL =
      typeof window !== "undefined" ? `${window.location.origin}/` : "/";

    const res: any = await authClient.signIn.social({
      provider,
      callbackURL,
      disableRedirect: true,
    });

    if (res?.error) {
      throw new Error(res.error.message || "Social login failed");
    }

    const targetUrl = res?.data?.url || res?.url;
    if (targetUrl && typeof window !== "undefined") {
      window.location.href = targetUrl;
    }

    return res;
  },

  async requestPasswordReset(email: string) {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "/reset-password";

    const res: any = await authClient.forgetPassword({
      email,
      redirectTo,
    });

    if (res?.error) {
      throw new Error(res.error.message || "Failed to request password reset");
    }

    return { ok: true };
  },

  async resetPassword(token: string, newPassword: string) {
    const res: any = await authClient.resetPassword({
      token,
      newPassword,
    });

    if (res?.error) {
      throw new Error(res.error.message || "Failed to reset password");
    }

    return res;
  },

  async logout() {
    await authClient.signOut();
    setAuthToken("");
    setStoredUser(null);
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

export const adminLandingFetchers = {
  createHighlight: portalService.createLandingHighlight.bind(portalService),
  deleteHighlight: portalService.deleteLandingHighlight.bind(portalService),
  createTestimonial: portalService.createLandingTestimonial.bind(portalService),
  deleteTestimonial: portalService.deleteLandingTestimonial.bind(portalService),
  createFaq: portalService.createLandingFaq.bind(portalService),
  deleteFaq: portalService.deleteLandingFaq.bind(portalService),
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

  getLandingContent: () =>
    portalService.getLandingContent().then((r: any) => r.data),
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
