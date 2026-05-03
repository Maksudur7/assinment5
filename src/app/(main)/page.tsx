"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdSlot } from "@/src/components/AdSlot";
import { VideoCard } from "@/src/components/VideoCard";
import { ImageWithFallback } from "@/src/components/figma/ImageWithFallback";
import { AlertCircle, CheckCircle2, Info, Loader, Mail, Play, Sparkles, TrendingUp, Users } from "lucide-react";

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

  const isLoading = loading || !featured;
  const aiPicks = useMemo(() => {
    const combined = [...trending, ...newReleases];
    const unique = new Map<string, MediaItem>();
    combined.forEach((item) => {
      if (!unique.has(item.id)) unique.set(item.id, item);
    });
    return Array.from(unique.values())
      .sort((a, b) => (b.avgRating * 2 + b.totalReviews) - (a.avgRating * 2 + a.totalReviews))
      .slice(0, 4);
  }, [trending, newReleases]);

  const topGenres = useMemo(() => {
    const freq = new Map<string, number>();
    [...trending, ...newReleases].forEach((item) => {
      item.genres.forEach((genre) => {
        freq.set(genre, (freq.get(genre) ?? 0) + 1);
      });
    });

    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [trending, newReleases]);

  const featureBlocks = [
    { title: "Adaptive Discovery", text: "Trending and recommendation blocks auto-refresh from user interactions and ratings." },
    { title: "Secure Streaming", text: "Role access, entitlement checks, and protected playback routing keep content control strict." },
    { title: "Cross-device UX", text: "Optimized browsing and watch workflows for mobile, tablet and desktop screens." },
  ];

  const testimonials = [
    { name: "Rafi, Dhaka", quote: "Library filter ta onek smooth. Ami genre + rating diye instant bhalo recommendation pai." },
    { name: "Nabila, Chattogram", quote: "Dark mode + watchlist flow khub clean. Mobile e use korte khub comfortable." },
    { name: "Shuvo, Rajshahi", quote: "Review moderation system clear, tai platform er quality maintain thake." },
  ];

  const faqPreview = [
    { q: "How do recommendations work?", a: "We prioritize high ratings, review activity, and recent engagement trends." },
    { q: "Can I watch premium instantly?", a: "Yes, with subscription, rent, or buy access based on entitlement checks." },
    { q: "Is my profile editable?", a: "Yes, profile details can be updated from the dashboard profile section." },
  ];

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

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header Ad */}
      <div className="max-w-360 mx-auto px-6 py-4">
        <AdSlot type="header" />
      </div>

      {isLoading ? (
        <div className="relative h-[65vh] min-h-120 mb-12 flex items-center justify-center">
          <Loader className="w-8 h-8 text-[#E50914] animate-spin" />
        </div>
      ) : featured ? (
        <>
          {/* Hero Banner */}
          <div className="relative h-[65vh] min-h-120 mb-12">
            <div className="absolute inset-0">
              <ImageWithFallback
                src={featured.poster}
                alt={featured.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-background via-background/80 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
            </div>

            <div className="relative max-w-360 mx-auto px-6 h-full flex items-center">
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
                  <Button size="lg" variant="outline" className="bg-card/60 border-border text-foreground hover:bg-card/80" onClick={() => router.push("/library")}>
                    <Info className="w-5 h-5 mr-2" />
                    More Info
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="max-w-360 mx-auto px-6">
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
                      description={media.synopsis}
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
                        description={media.synopsis}
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
                        description={media.synopsis}
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
                        description={media.synopsis}
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
                      description={media.synopsis}
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

            {/* AI Recommendations */}
            {aiPicks.length > 0 && (
              <div className="mb-12 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-[#E50914]" />
                  <h2 className="text-foreground text-2xl">Smart Picks For You</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {aiPicks.map((media) => (
                    <VideoCard
                      key={`smart-${media.id}`}
                      id={media.id}
                      title={media.title}
                      description={media.synopsis}
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

            {/* Highlights */}
            <div className="mb-12">
              <h2 className="text-foreground text-2xl mb-6">Platform Highlights</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {featureBlocks.map((feature) => (
                  <div key={feature.title} className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-foreground text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div className="mb-12">
              <h2 className="text-foreground text-2xl mb-6">Top Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {topGenres.map((genre) => (
                  <div key={genre.name} className="rounded-lg border border-border bg-card p-4 text-center">
                    <p className="text-foreground font-medium">{genre.name}</p>
                    <p className="text-muted-foreground text-xs mt-1">{genre.count} titles</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="mb-12 rounded-xl border border-border bg-card p-6">
              <h2 className="text-foreground text-2xl mb-6">Live Platform Stats</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-lg border border-border bg-background p-4"><p className="text-muted-foreground text-sm">Featured Titles</p><p className="text-foreground text-2xl">{featured ? 1 : 0}</p></div>
                <div className="rounded-lg border border-border bg-background p-4"><p className="text-muted-foreground text-sm">Trending Items</p><p className="text-foreground text-2xl">{trending.length}</p></div>
                <div className="rounded-lg border border-border bg-background p-4"><p className="text-muted-foreground text-sm">New Releases</p><p className="text-foreground text-2xl">{newReleases.length}</p></div>
                <div className="rounded-lg border border-border bg-background p-4"><p className="text-muted-foreground text-sm">Active Categories</p><p className="text-foreground text-2xl">{topGenres.length}</p></div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mb-12">
              <h2 className="text-foreground text-2xl mb-6">What Viewers Say</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {testimonials.map((item) => (
                  <div key={item.name} className="rounded-xl border border-border bg-card p-5">
                    <Users className="w-5 h-5 text-[#E50914] mb-3" />
                    <p className="text-foreground text-sm mb-3">“{item.quote}”</p>
                    <p className="text-muted-foreground text-xs">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Preview */}
            <div className="mb-12 rounded-xl border border-border bg-card p-6">
              <h2 className="text-foreground text-2xl mb-4">Quick Answers</h2>
              <div className="space-y-3">
                {faqPreview.map((item) => (
                  <div key={item.q} className="rounded-lg border border-border bg-background p-4">
                    <p className="text-foreground font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#E50914]" />{item.q}</p>
                    <p className="text-muted-foreground text-sm mt-1">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="mb-12 rounded-xl border border-border bg-card p-6 text-center">
              <Mail className="w-6 h-6 text-[#E50914] mx-auto mb-3" />
              <h2 className="text-foreground text-2xl mb-2">Stay Updated</h2>
              <p className="text-muted-foreground mb-4">Get weekly releases, personalized picks, and exclusive platform updates.</p>
              <Button className="bg-[#E50914] hover:bg-[#B2070F] text-white" onClick={() => router.push("/contact")}>Subscribe & Contact</Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

