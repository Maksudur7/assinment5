import { getCurrentUser, readStore, writeStore } from "./storage";
import type { PortalService, CreateReviewInput } from "./service";
import type {
  AdminOverview,
  MediaItem,
  MediaInput,
  MediaQuery,
  PaymentInput,
  Paginated,
  PurchaseRecord,
  PurchaseType,
  Review,
  SocialProvider,
} from "./types";

function applyMediaFilter(items: MediaItem[], query: MediaQuery = {}): MediaItem[] {
  const {
    search = "",
    genre,
    platform,
    releaseYear,
    minRating,
    maxRating,
    minPopularity,
    sort = "latest",
  } = query;

  const q = search.trim().toLowerCase();

  let filtered = items.filter((m) => {
    const matchesSearch =
      q.length === 0 ||
      m.title.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.cast.join(" ").toLowerCase().includes(q) ||
      m.platforms.join(" ").toLowerCase().includes(q);
    const matchesGenre = !genre || m.genres.includes(genre);
    const matchesPlatform = !platform || m.platforms.includes(platform);
    const matchesYear = !releaseYear || m.releaseYear === releaseYear;
    const matchesRating = !minRating || m.avgRating >= minRating;
    const matchesMaxRating = !maxRating || m.avgRating <= maxRating;
    const matchesPopularity = !minPopularity || m.totalReviews >= minPopularity;
    return matchesSearch && matchesGenre && matchesPlatform && matchesYear && matchesRating && matchesMaxRating && matchesPopularity;
  });

  if (sort === "highest-rated") {
    filtered = filtered.sort((a, b) => b.avgRating - a.avgRating);
  } else if (sort === "most-reviewed") {
    filtered = filtered.sort((a, b) => b.totalReviews - a.totalReviews);
  } else {
    filtered = filtered.sort((a, b) => b.releaseYear - a.releaseYear);
  }

  return filtered;
}

function paginate<T>(items: T[], page = 1, pageSize = 12): Paginated<T> {
  const start = (page - 1) * pageSize;
  const sliced = items.slice(start, start + pageSize);
  return {
    items: sliced,
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

class MockPortalService implements PortalService {
  async getCurrentUser() {
    return getCurrentUser(readStore());
  }

  async login(email: string, password: string) {
    const store = readStore();
    const found = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && (u.password ?? "") === password);
    if (!found) throw new Error("Invalid email or password");
    store.currentUserId = found.id;
    store.authToken = `mock-jwt-${btoa(`${found.id}:${Date.now()}`)}`;
    writeStore(store);
    return found;
  }

  async register(name: string, email: string, password: string) {
    const store = readStore();
    const exists = store.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error("Email already in use");

    const user = {
      id: `u_${Date.now()}`,
      name,
      email,
      password,
      role: "user" as const,
    };

    store.users.push(user);
    store.currentUserId = user.id;
    store.authToken = `mock-jwt-${btoa(`${user.id}:${Date.now()}`)}`;
    writeStore(store);
    return user;
  }

  async socialLogin(provider: SocialProvider) {
    const store = readStore();
    const email = `${provider}.user@ngv.local`;
    let user = store.users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: `u_${Date.now()}`,
        name: `${provider[0].toUpperCase()}${provider.slice(1)} User`,
        email,
        role: "user",
      };
      store.users.push(user);
    }
    store.currentUserId = user.id;
    store.authToken = `mock-jwt-${btoa(`${user.id}:${Date.now()}`)}`;
    writeStore(store);
    return user;
  }

  async requestPasswordReset(email: string) {
    const store = readStore();
    const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { ok: true, resetToken: "" };
    }
    const resetToken = `rst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    store.passwordResetTokens[resetToken] = user.id;
    writeStore(store);
    return { ok: true, resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const store = readStore();
    const userId = store.passwordResetTokens[resetToken];
    if (!userId) throw new Error("Invalid or expired reset token");

    const user = store.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    user.password = newPassword;
    delete store.passwordResetTokens[resetToken];
    writeStore(store);
    return { ok: true };
  }

  async logout() {
    const store = readStore();
    store.currentUserId = "u1";
    store.authToken = "";
    writeStore(store);
  }

  async switchUser(role: "user" | "admin") {
    const store = readStore();
    const found = store.users.find((u) => u.role === role) ?? store.users[0];
    store.currentUserId = found.id;
    writeStore(store);
    return found;
  }

  async getMedia(query: MediaQuery = {}) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const store = readStore();
    const filtered = applyMediaFilter(store.media, query);
    return paginate(filtered, page, pageSize);
  }

  async getMediaById(id: string) {
    const store = readStore();
    return store.media.find((m) => m.id === id) ?? null;
  }

  async createMedia(input: MediaInput) {
    const store = readStore();
    const media: MediaItem = {
      id: `m_${Date.now()}`,
      ...input,
      avgRating: 0,
      totalReviews: 0,
    };
    store.media.unshift(media);
    writeStore(store);
    return media;
  }

  async updateMedia(id: string, input: Partial<MediaInput>) {
    const store = readStore();
    const media = store.media.find((m) => m.id === id);
    if (!media) throw new Error("Media not found");
    Object.assign(media, input);
    writeStore(store);
    return media;
  }

  async deleteMedia(id: string) {
    const store = readStore();
    store.media = store.media.filter((m) => m.id !== id);
    const reviewIds = store.reviews.filter((r) => r.mediaId === id).map((r) => r.id);
    store.reviews = store.reviews.filter((r) => r.mediaId !== id);
    store.comments = store.comments.filter((c) => !reviewIds.includes(c.reviewId));
    store.watchlist = store.watchlist.filter((w) => w.mediaId !== id);
    writeStore(store);
  }

  async getReviews(mediaId: string, includePending = false) {
    const store = readStore();
    return store.reviews.filter(
      (r) => r.mediaId === mediaId && (includePending ? true : r.isPublished),
    );
  }

  async createReview(input: CreateReviewInput) {
    const store = readStore();
    const user = getCurrentUser(store);
    const review: Review = {
      id: `r_${Date.now()}`,
      mediaId: input.mediaId,
      userId: user.id,
      userName: user.name,
      rating: input.rating,
      content: input.content,
      tags: input.tags,
      spoiler: input.spoiler,
      isPublished: false,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };
    store.reviews.unshift(review);
    writeStore(store);
    return review;
  }

  async updateOwnUnpublishedReview(reviewId: string, input: Omit<CreateReviewInput, "mediaId">) {
    const store = readStore();
    const user = getCurrentUser(store);
    const review = store.reviews.find((r) => r.id === reviewId && r.userId === user.id && !r.isPublished);
    if (!review) throw new Error("Unpublished own review not found");
    review.rating = input.rating;
    review.content = input.content;
    review.tags = input.tags;
    review.spoiler = input.spoiler;
    writeStore(store);
    return review;
  }

  async deleteOwnUnpublishedReview(reviewId: string) {
    const store = readStore();
    const user = getCurrentUser(store);
    store.reviews = store.reviews.filter((r) => !(r.id === reviewId && r.userId === user.id && !r.isPublished));
    writeStore(store);
  }

  async toggleReviewLike(reviewId: string) {
    const store = readStore();
    const user = getCurrentUser(store);
    const review = store.reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error("Review not found");
    const idx = review.likedBy.indexOf(user.id);
    if (idx >= 0) review.likedBy.splice(idx, 1);
    else review.likedBy.push(user.id);
    review.likes = review.likedBy.length;
    writeStore(store);
    return review;
  }

  async addComment(reviewId: string, content: string, parentCommentId?: string) {
    const store = readStore();
    const user = getCurrentUser(store);
    const comment = {
      id: `c_${Date.now()}`,
      reviewId,
      userId: user.id,
      userName: user.name,
      content,
      parentCommentId,
      isPublished: true,
      createdAt: new Date().toISOString(),
    };
    store.comments.unshift(comment);
    writeStore(store);
    return comment;
  }

  async getComments(reviewId: string) {
    const store = readStore();
    const user = getCurrentUser(store);
    return store.comments.filter((c) => c.reviewId === reviewId && (user.role === "admin" ? true : c.isPublished));
  }

  async getPendingComments() {
    const store = readStore();
    return store.comments.filter((c) => !c.isPublished);
  }

  async approveComment(commentId: string) {
    const store = readStore();
    const comment = store.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error("Comment not found");
    comment.isPublished = true;
    writeStore(store);
    return comment;
  }

  async unpublishComment(commentId: string) {
    const store = readStore();
    const comment = store.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error("Comment not found");
    comment.isPublished = false;
    writeStore(store);
    return comment;
  }

  async removeComment(commentId: string) {
    const store = readStore();
    store.comments = store.comments.filter((c) => c.id !== commentId);
    writeStore(store);
  }

  async toggleWatchlist(mediaId: string) {
    const store = readStore();
    const user = getCurrentUser(store);
    const index = store.watchlist.findIndex((w) => w.mediaId === mediaId && w.userId === user.id);
    let saved = false;
    if (index >= 0) {
      store.watchlist.splice(index, 1);
      saved = false;
    } else {
      store.watchlist.push({ userId: user.id, mediaId, addedAt: new Date().toISOString() });
      saved = true;
    }
    writeStore(store);
    return { saved };
  }

  async getWatchlist() {
    const store = readStore();
    const user = getCurrentUser(store);
    const ids = store.watchlist.filter((w) => w.userId === user.id).map((w) => w.mediaId);
    return store.media.filter((m) => ids.includes(m.id));
  }

  async createPurchase(type: PurchaseType, mediaId?: string, payment?: PaymentInput) {
    const store = readStore();
    const user = getCurrentUser(store);
    const now = Date.now();
    const isSub = type === "subscription";
    const selectedPlan = payment?.plan ?? "monthly";
    const record: PurchaseRecord = {
      id: `p_${now}`,
      userId: user.id,
      mediaId,
      type,
      plan: isSub ? selectedPlan : undefined,
      provider: payment?.provider,
      method: payment?.method,
      amount: type === "buy" ? 19.99 : type === "rent" ? 4.99 : selectedPlan === "yearly" ? 89.99 : 9.99,
      expiresAt:
        type === "rent"
          ? new Date(now + 1000 * 60 * 60 * 24 * 2).toISOString()
          : type === "subscription"
            ? new Date(now + (selectedPlan === "yearly" ? 1000 * 60 * 60 * 24 * 365 : 1000 * 60 * 60 * 24 * 30)).toISOString()
            : undefined,
      createdAt: new Date(now).toISOString(),
      status: "active",
    };
    store.purchases.unshift(record);
    writeStore(store);
    return record;
  }

  async getPurchaseHistory() {
    const store = readStore();
    const user = getCurrentUser(store);
    return store.purchases.filter((p) => p.userId === user.id);
  }

  async getAllPurchases() {
    const store = readStore();
    return store.purchases;
  }

  async revokePurchase(purchaseId: string) {
    const store = readStore();
    const purchase = store.purchases.find((p) => p.id === purchaseId);
    if (!purchase) throw new Error("Purchase not found");
    purchase.status = purchase.type === "buy" ? "refunded" : "revoked";
    writeStore(store);
    return purchase;
  }

  async getPendingReviews() {
    const store = readStore();
    return store.reviews.filter((r) => !r.isPublished);
  }

  async approveReview(reviewId: string) {
    const store = readStore();
    const review = store.reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error("Review not found");
    review.isPublished = true;
    writeStore(store);
    return review;
  }

  async unpublishReview(reviewId: string) {
    const store = readStore();
    const review = store.reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error("Review not found");
    review.isPublished = false;
    writeStore(store);
    return review;
  }

  async removeReview(reviewId: string) {
    const store = readStore();
    store.reviews = store.reviews.filter((r) => r.id !== reviewId);
    store.comments = store.comments.filter((c) => c.reviewId !== reviewId);
    writeStore(store);
  }

  async getAdminOverview() {
    const store = readStore();

    const totalRevenue = store.purchases.reduce((sum, p) => sum + p.amount, 0);
    const totalSales = store.purchases.filter((p) => p.type === "buy").length;
    const totalRentals = store.purchases.filter((p) => p.type === "rent").length;
    const activePurchases = store.purchases.filter((p) => p.status === "active").length;

    const reviewCountMap = new Map<string, number>();
    for (const r of store.reviews) {
      reviewCountMap.set(r.mediaId, (reviewCountMap.get(r.mediaId) ?? 0) + 1);
    }

    const mostReviewed: AdminOverview["mostReviewed"] = store.media
      .map((m) => ({
        mediaId: m.id,
        title: m.title,
        totalReviews: reviewCountMap.get(m.id) ?? 0,
        avgRating: m.avgRating,
      }))
      .sort((a, b) => b.totalReviews - a.totalReviews)
      .slice(0, 5);

    return {
      totalMedia: store.media.length,
      totalUsers: store.users.length,
      totalReviews: store.reviews.length,
      pendingReviews: store.reviews.filter((r) => !r.isPublished).length,
      totalComments: store.comments.length,
      hiddenComments: store.comments.filter((c) => !c.isPublished).length,
      activePurchases,
      totalRevenue,
      totalRentals,
      totalSales,
      mostReviewed,
    };
  }
}

export const mockPortalService = new MockPortalService();
