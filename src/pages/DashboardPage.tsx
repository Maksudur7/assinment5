"use client";

import { useEffect, useState } from "react";
import { VideoCard } from "../components/VideoCard";
import { Loader, AlertCircle } from "lucide-react";
import type { MediaItem } from "@/src/lib/portal/types";
import type { WatchlistItem } from "@/src/lib/portal/types";
import { dashboardFetchers, authFetchers } from "@/src/lib/fetchers/core";

interface DashboardStats {
  watchTime: string;
  favoriteCount: number;
  currentPlan: string;
}

export function DashboardPage() {
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    watchTime: "0h 0m",
    favoriteCount: 0,
    currentPlan: "Loading...",
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        
        const [currentUser, dashboardStats, favList] = await Promise.all([
          authFetchers.me(),
          dashboardFetchers.getStats(),
          dashboardFetchers.getFavorites(),
        ]);

        setUser(currentUser);
        setStats({
          watchTime: dashboardStats.totalWatchTime || "0h 0m",
          favoriteCount: favList.length,
          currentPlan: dashboardStats.currentPlan || "Free",
        });
        setFavorites(favList.slice(0, 8));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-white text-xl">Failed to load dashboard</h2>
          <p className="text-white/60 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#E50914] hover:bg-[#B2070F] text-white px-4 py-2 rounded"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <Loader className="w-8 h-8 text-[#E50914] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-white text-3xl mb-2">Dashboard</h1>
          <p className="text-white/60">Welcome back, {user?.name}! Manage your profile and preferences.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg bg-zinc-900 p-4 border border-white/10 text-white">
            <p className="text-white/60 text-sm mb-1">Watch time</p>
            <p className="text-2xl font-bold">{stats.watchTime}</p>
          </div>
          <div className="rounded-lg bg-zinc-900 p-4 border border-white/10 text-white">
            <p className="text-white/60 text-sm mb-1">Favorites</p>
            <p className="text-2xl font-bold">{stats.favoriteCount}</p>
          </div>
          <div className="rounded-lg bg-zinc-900 p-4 border border-white/10 text-white">
            <p className="text-white/60 text-sm mb-1">Current Plan</p>
            <p className="text-2xl font-bold">{stats.currentPlan}</p>
          </div>
        </div>

        {favorites.length > 0 && (
          <>
            <h2 className="text-white text-2xl mb-4">Your Favorites</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((media) => (
                <VideoCard
                  key={media.id}
                  id={media.id}
                  title={media.title}
                  thumbnail={media.poster}
                  duration={media.duration}
                  rating={media.avgRating}
                  year={String(media.releaseYear)}
                  category={media.genres[0] || "General"}
                />
              ))}
            </div>
          </>
        )}

        {favorites.length === 0 && (
          <div className="rounded-lg bg-zinc-900 border border-white/10 p-12 text-center">
            <p className="text-white/60">No favorites yet. Start adding your favorite movies and series!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
