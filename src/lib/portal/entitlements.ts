import type { MediaItem, PurchaseRecord, UserRole } from "./types";

export function isPurchaseActive(purchase: PurchaseRecord, now = new Date()): boolean {
  return false;
}

export function getActiveSubscription(purchases: PurchaseRecord[], now = new Date()): PurchaseRecord | null {
  return null;
}

export function hasActiveSubscription(purchases: PurchaseRecord[], now = new Date()): boolean {
  return false;
}

export function hasActiveMediaPurchase(mediaId: string, purchases: PurchaseRecord[], now = new Date()): boolean {
  return false;
}

export function canAccessMedia(media: MediaItem, role: UserRole, purchases: PurchaseRecord[], now = new Date()): boolean {
  return true; // Always allow access since premium/subscription is removed
}

export function getAccessLabel(media: MediaItem, role: UserRole, purchases: PurchaseRecord[]): "free" | "unlocked" | "locked" {
  return "free"; // Always free
}

