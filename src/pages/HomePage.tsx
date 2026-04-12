"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdSlot } from "../components/AdSlot";
import { VideoCard } from "../components/VideoCard";
import { Loader, AlertCircle } from "lucide-react";
import type { MediaItem } from "@/src/lib/portal/types";
import { homeFetchers } from "@/src/lib/fetchers/core";

export function HomePage() {
  const router = useRouter();
  const [featured, setFeatured] = useState<MediaItem | null>(null);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [featuredData, trendingData] = await Promise.all([
          homeFetchers.getFeatured(),
          homeFetchers.getTrending(),
        ]);
        
        if (featuredData && featuredData.length > 0) {
          setFeatured(featuredData[0]);
        }
        setTrending(trendingData.slice(0, 4));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
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
          <h2 className="text-white text-xl">Failed to load content</h2>
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

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <AdSlot type="header" />
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-6 py-20 flex justify-center">
          <Loader className="w-8 h-8 text-[#E50914] animate-spin" />
        </div>
      ) : (
        <>
          {featured && (
            <section className="max-w-7xl mx-auto px-6 py-8">
              <div className="rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
                <img
                  src={featured.poster}
                  alt={featured.title}
                  className="w-full h-[380px] object-cover"
                />
                <div className="p-6">
                  <h1 className="text-white text-3xl mb-2">{featured.title}</h1>
                  <p className="text-white/70 mb-4">{featured.synopsis}</p>
                  <button
                    onClick={() => router.push(`/watch/${featured.id}`)}
                    className="bg-[#E50914] hover:bg-[#B2070F] text-white px-4 py-2 rounded"
                  >
                    Play Now
                  </button>
                </div>
              </div>
            </section>
          )}

          {trending.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 pb-12">
              <h2 className="text-white text-2xl mb-6">Trending Now</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {trending.map((media) => (
                  <VideoCard
                    key={media.id}
                    id={media.id}
                    title={media.title}
                    thumbnail={media.poster}
                    duration={media.duration}
                    rating={media.avgRating}
                    year={String(media.releaseYear)}
                    category={media.genres[0] || "General"}
                    onClick={() => router.push(`/watch/${media.id}`)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

    </div>
  );
}

export default HomePage;
