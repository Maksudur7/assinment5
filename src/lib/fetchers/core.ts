import { portalService } from "@/src/lib/portal";
import type { MediaQuery, PaymentInput, PurchaseType, SocialProvider } from "@/src/lib/portal/types";

export const authFetchers = {
  me: () => portalService.getCurrentUser(),
  login: (email: string, password: string) => portalService.login(email, password),
  register: (name: string, email: string, password: string) => portalService.register(name, email, password),
  socialLogin: (provider: SocialProvider) => portalService.socialLogin(provider),
  requestPasswordReset: (email: string) => portalService.requestPasswordReset(email),
  resetPassword: (token: string, newPassword: string) => portalService.resetPassword(token, newPassword),
  logout: () => portalService.logout(),
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
