"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, Film, Info, Bookmark, CheckCheck, Trash2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "./ui/utils";

// ─── Types ──────────────────────────────────────────────────
interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ngv-backend.vercel.app/api";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("ngv_auth_token") || "";
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getCategoryIcon(type: string) {
  switch (type) {
    case "review_approved":
      return <Info className="w-4 h-4 text-blue-500" />;
    case "watchlist":
      return <Bookmark className="w-4 h-4 text-amber-500" />;
    case "new_release":
      return <Film className="w-4 h-4 text-red-500" />;
    default:
      return <Bell className="w-4 h-4 text-zinc-400" />;
  }
}

// ─── Component ──────────────────────────────────────────────
export function NotificationCenter({ className }: { className?: string }) {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return; // Not logged in
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/notifications?limit=20`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // Silently fail — not logged in or server down
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on open
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // Poll every 60 seconds for new notifications
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 60000);
    fetchNotifications(); // initial load
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    const token = getToken();
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch { }
  };

  const markAllAsRead = async () => {
    const token = getToken();
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative text-foreground/70 dark:text-white/70 hover:text-foreground dark:hover:text-white hover:bg-accent dark:hover:bg-white/10 rounded-full transition-colors",
            className
          )}
          aria-label="Notifications"
          id="notification-bell"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 bg-zinc-950/95 backdrop-blur-2xl border border-white/10 text-white p-0 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-white tracking-wide">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={fetchNotifications}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-zinc-400", loading && "animate-spin")} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-green-400" />
                <span className="hidden sm:inline">Read all</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
          {loading && notifications.length === 0 ? (
            <div className="p-6 text-center">
              <RefreshCw className="w-5 h-5 text-zinc-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-zinc-500">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Bell className="w-8 h-8 text-zinc-600 mx-auto opacity-50" />
              <p className="text-sm text-zinc-400 font-medium">No notifications yet</p>
              <p className="text-xs text-zinc-600">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={cn(
                  "p-3.5 flex gap-3 items-start transition-colors cursor-pointer group hover:bg-white/5",
                  !item.isRead ? "bg-red-500/5 border-l-2 border-red-500" : "opacity-80 hover:opacity-100"
                )}
              >
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                  {getCategoryIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn("text-xs font-semibold truncate", !item.isRead ? "text-white" : "text-zinc-300")}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-zinc-500 shrink-0">{timeAgo(item.createdAt)}</span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>

                  {item.link && (
                    <Link
                      href={item.link}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] text-red-400 font-medium mt-1.5 hover:underline"
                    >
                      View details →
                    </Link>
                  )}
                </div>

                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
