"use client";

import { useEffect, useState } from "react";
import { AdSlot } from "../components/AdSlot";
import { VideoCard } from "../components/VideoCard";
import { useRouter } from "next/navigation";
import { Loader, AlertCircle, Play } from "lucide-react";
import type { MediaItem } from "@/src/lib/portal/types";
import { mediaFetchers, reviewFetchers } from "@/src/lib/fetchers/core";
import type { Review } from "@/src/lib/portal/types";

interface WatchPageProps {
  id?: string;
}

export function WatchPage({ id }: WatchPageProps) {
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [related, setRelated] = useState<MediaItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        setError("");
        const [mediaData, reviewsData] = await Promise.all([
          mediaFetchers.byId(id),
          reviewFetchers.list(id, false),
        ]);
        
        setMedia(mediaData);
        setReviews(reviewsData.slice(0, 5));
        
        // In a real app, filter by genre/category for related
        const allMedia = await mediaFetchers.list({ pageSize: 100 });
        setRelated(allMedia.items.filter(m => m.id !== id).slice(0, 4));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-white text-xl">Failed to load video</h2>
          <p className="text-white/60 text-center">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-[#E50914] hover:bg-[#B2070F] text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading || !media) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <Loader className="w-8 h-8 text-[#E50914] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <div className="rounded-lg overflow-hidden border border-white/10 bg-zinc-900 mb-6 relative group">
            <img
              src={media.poster}
              alt={media.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
              <Play className="w-16 h-16 text-white/80 group-hover:text-white transition" fill="white" />
            </div>
            <div className="p-4">
              <h1 className="text-white text-2xl mb-2">{media.title}</h1>
              <p className="text-white/70">
                {media.releaseYear} • {media.genres.join(", ")} • {media.duration} • ⭐ {media.avgRating}
              </p>
            </div>
          </div>

          <AdSlot type="below-player" className="mb-6" />

          <div className="rounded-lg border border-white/10 bg-zinc-900 p-6 mb-6">
            <h2 className="text-white text-xl mb-2">Description</h2>
            <p className="text-white/70">{media.synopsis}</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-zinc-900 p-6 mb-6">
            <h2 className="text-white text-xl mb-4">Director & Cast</h2>
            <div className="space-y-2 text-white/70">
              <p><strong>Director:</strong> {media.director}</p>
              <p><strong>Cast:</strong> {media.cast.join(", ")}</p>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
              <h2 className="text-white text-xl mb-4">Recent Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-white">{review.userName}</strong>
                      <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                    </div>
                    <p className="text-white/70">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <AdSlot type="sidebar" />
          {related.length > 0 && (
            <div>
              <h3 className="text-white text-xl mb-4">Related Videos</h3>
              <div className="grid gap-4">
                {related.map((video) => (
                  <div
                    key={video.id}
                    className="cursor-pointer group"
                    onClick={() => router.push(`/watch/${video.id}`)}
                  >
                    <img
                      src={video.poster}
                      alt={video.title}
                      className="w-full aspect-video object-cover rounded-lg mb-2 group-hover:opacity-80 transition"
                    />
                    <p className="text-white text-sm font-medium truncate">{video.title}</p>
                    <p className="text-white/60 text-xs">⭐ {video.avgRating}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default WatchPage;
