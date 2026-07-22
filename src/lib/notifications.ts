export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: "release" | "system" | "watchlist" | "review";
  actionUrl?: string;
}

const STORAGE_KEY = "ngv_notifications_v1";

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New 4K Release Available",
    message: "Watch 'Inception' now in Ultra HD 4K with Dolby Atmos.",
    timestamp: "10 mins ago",
    read: false,
    category: "release",
    actionUrl: "/library",
  },
  {
    id: "notif-2",
    title: "Welcome to NGV Streaming 🎬",
    message: "Explore hundreds of clean, curated movies and TV shows.",
    timestamp: "1 hour ago",
    read: false,
    category: "system",
    actionUrl: "/",
  },
  {
    id: "notif-3",
    title: "Watchlist Update",
    message: "New episodes available for titles in your watchlist.",
    timestamp: "1 day ago",
    read: true,
    category: "watchlist",
    actionUrl: "/watchlist",
  },
];

type NotificationListener = (notifications: NotificationItem[]) => void;
const listeners: Set<NotificationListener> = new Set();

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading notifications:", e);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(items: NotificationItem[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Error saving notifications:", e);
    }
  }
  listeners.forEach((fn) => fn(items));
}

export function subscribeNotifications(fn: NotificationListener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function markNotificationAsRead(id: string) {
  const current = getStoredNotifications();
  const updated = current.map((item) =>
    item.id === id ? { ...item, read: true } : item
  );
  saveNotifications(updated);
}

export function markAllNotificationsAsRead() {
  const current = getStoredNotifications();
  const updated = current.map((item) => ({ ...item, read: true }));
  saveNotifications(updated);
}

export function clearAllNotifications() {
  saveNotifications([]);
}

export function addNotification(
  notif: Omit<NotificationItem, "id" | "timestamp" | "read">
) {
  const current = getStoredNotifications();
  const newItem: NotificationItem = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: "Just now",
    read: false,
  };
  saveNotifications([newItem, ...current]);
}
