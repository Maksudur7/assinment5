import type {
  AdminOverview,
  MediaItem,
  MediaInput,
  MediaQuery,
  Paginated,
  PortalUser,
  PurchaseRecord,
  PurchaseType,
  Review,
  ReviewComment,
  SocialProvider,
} from "./types";

export type CreateReviewInput = {
  mediaId: string;
  rating: number;
  content: string;
  tags: string[];
  spoiler: boolean;
};

export interface PortalService {
  getCurrentUser(): Promise<PortalUser>;
  switchUser(role: "user" | "admin"): Promise<PortalUser>;
  login(email: string, password: string): Promise<PortalUser>;
  register(name: string, email: string, password: string): Promise<PortalUser>;
  socialLogin(provider: SocialProvider): Promise<PortalUser>;
  logout(): Promise<void>;

  getMedia(query?: MediaQuery): Promise<Paginated<MediaItem>>;
  getMediaById(id: string): Promise<MediaItem | null>;
  createMedia(input: MediaInput): Promise<MediaItem>;
  updateMedia(id: string, input: Partial<MediaInput>): Promise<MediaItem>;
  deleteMedia(id: string): Promise<void>;

  getReviews(mediaId: string, includePending?: boolean): Promise<Review[]>;
  createReview(input: CreateReviewInput): Promise<Review>;
  updateOwnUnpublishedReview(reviewId: string, input: Omit<CreateReviewInput, "mediaId">): Promise<Review>;
  deleteOwnUnpublishedReview(reviewId: string): Promise<void>;

  toggleReviewLike(reviewId: string): Promise<Review>;
  addComment(reviewId: string, content: string): Promise<ReviewComment>;
  getComments(reviewId: string): Promise<ReviewComment[]>;
  getPendingComments(): Promise<ReviewComment[]>;
  approveComment(commentId: string): Promise<ReviewComment>;
  unpublishComment(commentId: string): Promise<ReviewComment>;
  removeComment(commentId: string): Promise<void>;

  toggleWatchlist(mediaId: string): Promise<{ saved: boolean }>;
  getWatchlist(): Promise<MediaItem[]>;

  createPurchase(type: PurchaseType, mediaId?: string): Promise<PurchaseRecord>;
  getPurchaseHistory(): Promise<PurchaseRecord[]>;
  getAllPurchases(): Promise<PurchaseRecord[]>;
  revokePurchase(purchaseId: string): Promise<PurchaseRecord>;

  getPendingReviews(): Promise<Review[]>;
  approveReview(reviewId: string): Promise<Review>;
  unpublishReview(reviewId: string): Promise<Review>;
  removeReview(reviewId: string): Promise<void>;

  getAdminOverview(): Promise<AdminOverview>;
}
