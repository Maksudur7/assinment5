"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { VideoCard } from "@/src/components/VideoCard";
import { portalService } from "@/src/lib/portal";
import type { MediaItem } from "@/src/lib/portal/types";

import { ProtectedRoute } from "@/src/components/ProtectedRoute";

function WatchlistContent() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const items = await portalService.getWatchlist();
        setItems(items as MediaItem[]);
      } catch {
        // Handled by API auth handler
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="rounded-xl bg-card border border-border p-6 mb-6">
          <h1 className="text-foreground text-3xl font-bold mb-2">My Watchlist</h1>
          <p className="text-muted-foreground text-sm">Saved titles you can watch later.</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl bg-card border border-dashed border-border p-12 text-center text-muted-foreground">
            No watchlist items yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {items.map((item) => (
              <VideoCard
                key={item.id}
                id={item.id}
                title={item.title}
                thumbnail={item.poster}
                duration={item.duration}
                rating={item.avgRating}
                year={String(item.releaseYear)}
                category={item.genres?.[0] || "Uncategorized"}
                onClick={() => router.push(`/watch/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <ProtectedRoute>
      <WatchlistContent />
    </ProtectedRoute>
  );
}

