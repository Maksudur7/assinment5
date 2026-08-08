"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Film,
  History,
  Loader,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { ImageWithFallback } from "@/src/components/figma/ImageWithFallback";
import { HistoryItemSkeleton } from "@/src/components/ui/skeleton-card";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ngv-backend.vercel.app/api";

interface HistoryItem {
  mediaId: string;
  title: string;
  poster: string;
  synopsis: string;
  duration: string;
  genres: string[];
  releaseYear: number;
  progressSeconds: number;
  watchedAt: string;
}

function getProgressPct(progressSeconds: number, duration: string): number {
  const match = duration?.match(/(\d+)h?\s*(\d+)?m?/);
  if (!match) return 0;
  const hrs = parseInt(match[1] || "0");
  const mins = parseInt(match[2] || "0");
  const total = (hrs * 60 + mins) * 60;
  if (!total) return 0;
  return Math.min(100, Math.round((progressSeconds / total) * 100));
}

function formatWatchedAt(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatSeconds(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m watched`;
  return `${m}m watched`;
}

import { ProtectedRoute } from "@/src/components/ProtectedRoute";

function WatchHistoryContent() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchHistory() {
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("ngv_auth_token") || ""
        : "";
      const res = await fetch(`${API_URL}/users/me/watch-history?limit=50`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not load watch history. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group history by date label
  const grouped = history.reduce<Record<string, HistoryItem[]>>((acc, item) => {
    const label = formatWatchedAt(item.watchedAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center">
                <History className="w-5 h-5 text-[#E50914]" />
              </div>
              <h1 className="text-foreground text-3xl font-black">Watch History</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-13">
              {history.length} title{history.length !== 1 ? "s" : ""} watched
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-card border-border gap-2"
            onClick={fetchHistory}
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <HistoryItemSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-24">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchHistory} className="bg-[#E50914] hover:bg-[#B2070F] text-white">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && history.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-6">
              <Film className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-foreground text-xl font-semibold mb-2">No Watch History Yet</h2>
            <p className="text-muted-foreground mb-6">Start watching movies and they'll appear here.</p>
            <Button
              className="bg-[#E50914] hover:bg-[#B2070F] text-white"
              onClick={() => router.push("/library")}
            >
              Browse Library
            </Button>
          </div>
        )}

        {/* History Groups */}
        {!loading && !error && Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="mb-10">
            {/* Group Header */}
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-4 h-4 text-[#E50914]" />
              <h2 className="text-foreground text-base font-bold uppercase tracking-wider">{label}</h2>
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted-foreground text-xs">{items.length} title{items.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => {
                const pct = getProgressPct(item.progressSeconds, item.duration);
                return (
                  <div
                    key={`${item.mediaId}-${item.watchedAt}`}
                    className="group flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-[#E50914]/40 hover:bg-card/80 transition-all cursor-pointer"
                    onClick={() => router.push(`/watch/${item.mediaId}`)}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                      <ImageWithFallback
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#E50914] flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white text-white translate-x-[1px]" />
                        </div>
                      </div>
                      {/* Progress bar at bottom */}
                      {pct > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div
                            className="h-full bg-[#E50914]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="text-foreground font-bold text-sm sm:text-base leading-tight line-clamp-1 group-hover:text-[#E50914] transition-colors mb-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-muted-foreground text-xs">{item.releaseYear}</span>
                        {item.genres?.[0] && (
                          <>
                            <span className="text-muted-foreground text-xs">•</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              {item.genres[0]}
                            </Badge>
                          </>
                        )}
                        {item.duration && (
                          <>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-muted-foreground text-xs">{item.duration}</span>
                          </>
                        )}
                      </div>

                      {/* Progress info */}
                      {item.progressSeconds > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs">
                              {formatSeconds(item.progressSeconds)}
                            </span>
                            <span className="text-[#E50914] text-xs font-semibold">{pct}%</span>
                          </div>
                          <div className="h-1 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#E50914] rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resume button */}
                    <div className="flex items-center shrink-0 pl-2">
                      <Button
                        size="sm"
                        className="bg-[#E50914] hover:bg-[#B2070F] text-white text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/watch/${item.mediaId}`);
                        }}
                      >
                        <Play className="w-3 h-3 fill-white" />
                        Resume
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WatchHistoryPage() {
  return (
    <ProtectedRoute>
      <WatchHistoryContent />
    </ProtectedRoute>
  );
}


