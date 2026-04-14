import type { MediaItem, PurchaseRecord, UserRole } from "./types";

export function isPurchaseActive(purchase: PurchaseRecord, now = new Date()): boolean {
  if (purchase.status !== "active") return false;
  if (!purchase.expiresAt) return true;
  return new Date(purchase.expiresAt).getTime() > now.getTime();
}

export function getActiveSubscription(purchases: PurchaseRecord[], now = new Date()): PurchaseRecord | null {
  const activeSubscriptions = purchases
    .filter((p) => p.type === "subscription")
    .filter((p) => isPurchaseActive(p, now))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return activeSubscriptions[0] ?? null;
}

export function hasActiveSubscription(purchases: PurchaseRecord[], now = new Date()): boolean {
  return Boolean(getActiveSubscription(purchases, now));
}

export function hasActiveMediaPurchase(mediaId: string, purchases: PurchaseRecord[], now = new Date()): boolean {
  return purchases.some((p) => p.mediaId === mediaId && p.type !== "subscription" && isPurchaseActive(p, now));
}

export function canAccessMedia(media: MediaItem, role: UserRole, purchases: PurchaseRecord[], now = new Date()): boolean {
  if (role === "admin") return true;
  if (media.pricing === "free") return true;
  if (hasActiveSubscription(purchases, now)) return true;
  return hasActiveMediaPurchase(media.id, purchases, now);
}

export function getAccessLabel(media: MediaItem, role: UserRole, purchases: PurchaseRecord[]): "free" | "unlocked" | "locked" {
  if (role === "admin") return "unlocked";
  if (media.pricing === "free") return "free";
  return canAccessMedia(media, role, purchases) ? "unlocked" : "locked";
}
