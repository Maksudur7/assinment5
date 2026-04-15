import type { UserRole } from "./types";

type Store = {
  authToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
};

const KEY = "ngv-portal-store-v2";

function defaultStore(): Store {
  return {
    authToken: "",
    user: null,
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

export function setAuthToken(token: string) {
  const store = readStore();
  store.authToken = token;
  writeStore(store);
}

export function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  const store = readStore();
  return store.authToken;
}

export function setStoredUser(user: Store["user"]) {
  const store = readStore();
  store.user = user;
  writeStore(store);
}

export function getStoredUser(): Store["user"] {
  const store = readStore();
  return store.user;
}

export function clearStore() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export type PortalStore = Store;
