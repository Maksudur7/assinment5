import { commentSeed, demoUsers, mediaSeed, reviewSeed } from "./mockData";
import type { PortalUser, PurchaseRecord, Review, ReviewComment, WatchlistItem } from "./types";

type Store = {
  users: PortalUser[];
  currentUserId: string;
  authToken: string;
  passwordResetTokens: Record<string, string>;
  media: typeof mediaSeed;
  reviews: Review[];
  comments: ReviewComment[];
  watchlist: WatchlistItem[];
  purchases: PurchaseRecord[];
};

const KEY = "ngv-portal-store-v1";

function defaultStore(): Store {
  return {
    users: demoUsers,
    currentUserId: "u1",
    authToken: "",
    passwordResetTokens: {},
    media: mediaSeed,
    reviews: reviewSeed,
    comments: commentSeed,
    watchlist: [],
    purchases: [],
  };
}

export function readStore(): Store {
  if (typeof window === "undefined") return defaultStore();
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return defaultStore();
  try {
    return JSON.parse(raw) as Store;
  } catch {
    return defaultStore();
  }
}

export function writeStore(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
}

export function getCurrentUser(store: Store): PortalUser {
  return store.users.find((u) => u.id === store.currentUserId) ?? demoUsers[0];
}

export function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return readStore().authToken;
}

export type PortalStore = Store;
