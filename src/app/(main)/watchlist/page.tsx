"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { VideoCard } from "@/src/components/VideoCard";
import { portalService } from "@/src/lib/portal";
import type { MediaItem } from "@/src/lib/portal/types";

export default function WatchlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    void portalService.getWatchlist().then(setItems);
  }, []);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="rounded-lg bg-zinc-900 border border-white/10 p-6 mb-6">
          <h1 className="text-white text-3xl mb-2">My Watchlist</h1>
          <p className="text-white/60">Saved titles you can watch later.</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg bg-zinc-900 border border-dashed border-white/15 p-12 text-center text-white/60">
            No watchlist items yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {items.map((item) => (
              <VideoCard
                key={item.id}
                id={item.id}
                title={item.title}
                thumbnail={item.poster}
                duration={item.duration}
                rating={item.avgRating}
                year={String(item.releaseYear)}
                category={item.genres[0]}
                onClick={() => router.push(`/watch/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
