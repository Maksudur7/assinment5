export type UserRole = "user" | "admin";

export type PortalUser = {
  user: any;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
};

export type SocialProvider = "google" | "facebook" | "github";

export type MediaItem = {
  id: string;
  title: string;
  synopsis: string;
  genres: string[];
  releaseYear: number;
  director: string;
  cast: string[];
  platforms: string[];
  pricing: "free" | "premium";
  streamingUrl: string;
  poster: string;
  duration: string;
  avgRating: number;
  totalReviews: number;
};

export type Review = {
  id: string;
  mediaId: string;
  userId: string;
  userName: string;
  rating: number;
  content: string;
  tags: string[];
  spoiler: boolean;
  isPublished: boolean;
  likes: number;
  likedBy: string[];
  createdAt: string;
};

export type ReviewComment = {
  id: string;
  reviewId: string;
  userId: string;
  userName: string;
  content: string;
  parentCommentId?: string;
  isPublished: boolean;
  createdAt: string;
};

export type WatchlistItem = {
  userId: string;
  mediaId: string;
  addedAt: string;
};

export type PurchaseType = "rent" | "buy" | "subscription";

export type PaymentProvider = "stripe" | "paypal" | "razorpay";

export type PaymentInput = {
  provider: PaymentProvider;
  plan?: "monthly" | "yearly";
  method: "card" | "wallet";
  cardLast4?: string;
  walletNumber?: string;
  sendConfirmationEmail?: boolean;
};

export type PurchaseRecord = {
  id: string;
  userId: string;
  mediaId?: string;
  type: PurchaseType;
  plan?: "monthly" | "yearly";
  provider?: PaymentProvider;
  method?: "card" | "wallet";
  amount: number;
  expiresAt?: string;
  createdAt: string;
  status: "active" | "expired" | "revoked" | "refunded";
};

export type MediaInput = {
  title: string;
  synopsis: string;
  genres: string[];
  releaseYear: number;
  director: string;
  cast: string[];
  platforms: string[];
  pricing: "free" | "premium";
  streamingUrl: string;
  poster: string;
  duration: string;
};

export type AdminOverview = {
  totalMedia: number;
  totalUsers: number;
  totalReviews: number;
  pendingReviews: number;
  totalComments: number;
  hiddenComments: number;
  activePurchases: number;
  totalRevenue: number;
  totalRentals: number;
  totalSales: number;
  mostReviewed: Array<{ mediaId: string; title: string; totalReviews: number; avgRating: number }>;
};

export type MediaQuery = {
  search?: string;
  genre?: string;
  platform?: string;
  releaseYear?: number;
  minRating?: number;
  maxRating?: number;
  minPopularity?: number;
  sort?: "latest" | "highest-rated" | "most-reviewed";
  page?: number;
  pageSize?: number;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
