"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdSlot } from "@/src/components/AdSlot";
import { VideoCard } from "@/src/components/VideoCard";
import { Info, Play, TrendingUp, Loader, AlertCircle } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import type { MediaItem } from "@/src/lib/portal/types";
import { homeFetchers } from "@/src/lib/fetchers/core";

export default function Page() {
  const router = useRouter();
  const [featured, setFeatured] = useState<MediaItem | null>(null);
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [newReleases, setNewReleases] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log('media data ', featured?.id);

  // Refactored: Data loading logic in a separate function
  async function loadHomePageData() {
    try {
      setLoading(true);
      setError("");
      const [featuredData, trendingData, newReleasesData] = await Promise.all([
        homeFetchers.getFeatured(),
        homeFetchers.getTrending(),
        homeFetchers.getNewReleases(),
      ]);

      if (featuredData && featuredData.length > 0) {
        setFeatured(featuredData[0]);
      }
      setTrending(trendingData.slice(0, 6));
      setNewReleases(newReleasesData.slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHomePageData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-foreground text-xl">Failed to load content</h2>
          <p className="text-foreground/60 text-center">{error}</p>
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

  const isLoading = loading || !featured;

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header Ad */}
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <AdSlot type="header" />
      </div>

      {isLoading ? (
        <div className="relative h-[600px] mb-12 flex items-center justify-center">
          <Loader className="w-8 h-8 text-[#E50914] animate-spin" />
        </div>
      ) : featured ? (
        <>
          {/* Hero Banner */}
          <div className="relative h-[600px] mb-12">
            <div className="absolute inset-0">
              <img
                src={featured.poster}
                alt={featured.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="relative max-w-[1440px] mx-auto px-6 h-full flex items-center">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-[#E50914] px-3 py-1 rounded text-white text-sm">Featured</span>
                  <span className="text-foreground/60">
                    {featured.releaseYear} • {featured.genres.join(", ")} • {featured.duration}
                  </span>
                </div>
                <h1 className="text-foreground text-5xl mb-4">{featured.title}</h1>
                <p className="text-foreground/80 mb-6 text-lg">{featured.synopsis}</p>
                <div className="flex gap-4">
                  <Button
                    size="lg"
                    className="bg-[#E50914] hover:bg-[#B2070F] text-white"
                    onClick={() => router.push(`/watch/${featured.id}`)}
                  >
                    <Play className="w-5 h-5 mr-2 fill-white" />
                    Play Now
                  </Button>
                  <Button size="lg" variant="outline" className="bg-card/60 border-border text-foreground hover:bg-card/80">
                    <Info className="w-5 h-5 mr-2" />
                    More Info
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="max-w-[1440px] mx-auto px-6">
            {/* Trending Section */}
            {trending.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-[#E50914]" />
                  <h2 className="text-foreground text-2xl">Trending Now</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
              </div>
            )}

            {/* Category Tabs */}
            <Tabs defaultValue="movies" className="mb-12">
              <TabsList className="bg-card border border-border mb-6">
                <TabsTrigger value="movies" className="data-[state=active]:bg-[#E50914]">
                  Movies
                </TabsTrigger>
                <TabsTrigger value="new" className="data-[state=active]:bg-[#E50914]">
                  New Releases
                </TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-[#E50914]">
                  Trending
                </TabsTrigger>
              </TabsList>

              <TabsContent value="movies">
                {trending.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
                ) : (
                  <div className="text-center text-foreground/60 py-12">No movies available</div>
                )}
              </TabsContent>

              <TabsContent value="new">
                {newReleases.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {newReleases.map((media) => (
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
                ) : (
                  <div className="text-center text-foreground/60 py-12">No new releases available</div>
                )}
              </TabsContent>

              <TabsContent value="trending">
                {trending.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
                ) : (
                  <div className="text-center text-foreground/60 py-12">No trending content available</div>
                )}
              </TabsContent>
            </Tabs>

            {/* Latest Releases */}
            {newReleases.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 className="text-foreground text-2xl">Latest Releases</h2>
                  <Button
                    variant="outline"
                    className="bg-card/60 border-border text-foreground hover:bg-card/80"
                    onClick={() => router.push("/library")}
                  >
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {newReleases.map((media) => (
                    <VideoCard
                      key={`latest-${media.id}`}
                      id={media.id}
                      title={media.title}
                      thumbnail={media.poster}
                      duration={media.duration}
                      rating={media.avgRating}
                      year={String(media.releaseYear)}
                      category={media.genres[0] || "General"}
                      isNew
                      onClick={() => router.push(`/watch/${media.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

