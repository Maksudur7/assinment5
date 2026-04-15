/* eslint-disable @typescript-eslint/no-explicit-any */
import { portalService } from "../portal";
import { setAuthToken, setStoredUser } from "../portal/storage";
import {
  MediaQuery,
  PaymentInput,
  PurchaseType,
  SocialProvider,
  UserRole,
} from "../portal/types";
import { authClient } from "@/src/lib/auth-client";

function toPortalRole(user: Record<string, unknown>): UserRole {
  return (user.role as UserRole) || "user";
}

function getAuthErrorMessage(error: any, fallback: string): string {
  return error?.message || fallback;
}

export const authFetchers = {
  async me() {
    const sessionData = await authClient.getSession();

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
    // সরাসরি রেজাল্ট নিন, { data, error } নয়
    const res = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });

    // Better Auth সফল হলে রেজাল্ট অবজেক্ট দেয়।
    // যদি throw: true থাকে তবে এরর হলে catch-এ যাবে।
    if (!res) throw new Error("Login failed");

    // সেশন টোকেন সেভ করা
    const sessionToken = (res as any).token || (res as any).session?.token;
    if (sessionToken) setAuthToken(sessionToken);

    // ইউজার ডাটা সেভ করা
    if (res.user) {
      setStoredUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: (res.user as any).role || "user",
      });
    }

    return res;
  },

  async register(name: string, email: string, password: string) {
    // সরাসরি রেজাল্ট নিন
    const res = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    });

    if (!res) throw new Error("Signup failed");

    const sessionToken = (res as any).token || (res as any).session?.token;
    if (sessionToken) setAuthToken(sessionToken);

    if (res.user) {
      setStoredUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: (res.user as any).role || "user",
      });
    }

    return res;
  },

 async socialLogin(provider: SocialProvider) {
    // সরাসরি রেজাল্ট নিন, { data, error } নয়
    const res = await authClient.signIn.social({
      provider,
      callbackURL: "/",
    });

    // Better Auth যদি এরর হয় তবে সে অটোমেটিক এরর থ্রো করবে (যেহেতু throw: true আছে)
    if (!res) throw new Error("Social login failed");

    // সেশন টোকেন সেভ করা (টাইপস্ক্রিপ্টের এরর এড়াতে as any ব্যবহার করা হয়েছে)
    const sessionToken = (res as any).token || (res as any).session?.token;
    if (sessionToken) setAuthToken(sessionToken);

    return res;
  },

 async requestPasswordReset(email: string) {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "/reset-password";

    // আপনার এরর মেসেজ অনুযায়ী মেথডটি forgetPassword হওয়ার কথা। 
    // যদি টাইপ এরর দেয় তবে সরাসরি এভাবে কল করুন:
    const res = await (authClient as any).forgetPassword({
      email,
      redirectTo,
    });

    if (!res) throw new Error("Failed to request reset");

    return { ok: true, resetToken: "" };
  },

  async resetPassword(token: string, newPassword: string) {
    // এখানেও সরাসরি রেজাল্ট নিন
    const res = await authClient.resetPassword({
      token, // Better Auth অনেক সময় 'token' কে 'key' হিসেবে নিতে পারে, আপনার ভার্সন অনুযায়ী চেক করবেন
      newPassword,
    });

    if (!res) throw new Error("Failed to reset password");
    
    return res;
  },

  async logout() {
    // signOut মেথডটিও সরাসরি কল করুন
    await authClient.signOut();
    
    // টোকেন ক্লিয়ার করে দিন
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
  comment: (reviewId: string, content: string, parentCommentId?: string) =>
    portalService.addComment(reviewId, content, parentCommentId),
  comments: (reviewId: string) => portalService.getComments(reviewId),
};

export const paymentFetchers = {
  create: (type: PurchaseType, mediaId?: string, payment?: PaymentInput) =>
    portalService.createPurchase(type, mediaId, payment),
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
