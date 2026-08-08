"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdSlot } from "@/src/components/AdSlot";
import { VideoCard } from "@/src/components/VideoCard";
import { MediaCarousel } from "@/src/components/MediaCarousel";
import { ImageWithFallback } from "@/src/components/figma/ImageWithFallback";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Film,
  Info,
  Mail,
  Play,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

import type { MediaItem, LandingHighlight, LandingTestimonial, LandingFaq } from "@/src/lib/portal/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ngv-backend.vercel.app/api";

interface ContinueWatchingItem {
  mediaId: string;
  progressSeconds: number;
  media: MediaItem;
}

interface HomeClientProps {
  featured: MediaItem | null;
  trending: MediaItem[];
  newReleases: MediaItem[];
  highlights: LandingHighlight[];
  testimonials: LandingTestimonial[];
  faqs: LandingFaq[];
  categories?: any[];
}

export function HomeClient({
  featured,
  trending,
  newReleases,
  highlights,
  testimonials,
  faqs,
  categories = [],
}: HomeClientProps) {
  const router = useRouter();
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [loadingContinue, setLoadingContinue] = useState(true);

  // Fetch continue watching data
  useEffect(() => {
    async function fetchContinueWatching() {
      try {
        const token = typeof window !== "undefined"
          ? localStorage.getItem("ngv_auth_token") || ""
          : "";
        const res = await fetch(`${API_URL}/users/me/continue-watching`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setContinueWatching(Array.isArray(data) ? data.slice(0, 10) : []);
        }
      } catch {
        // Not logged in or API unavailable — silently ignore
      } finally {
        setLoadingContinue(false);
      }
    }
    fetchContinueWatching();
  }, []);

  const aiPicks = useMemo(() => {
    const combined = [...trending, ...newReleases];
    const unique = new Map<string, MediaItem>();
    combined.forEach((item) => {
      if (!unique.has(item.id)) unique.set(item.id, item);
    });
    return Array.from(unique.values())
      .sort((a, b) => (b.avgRating * 2 + b.totalReviews) - (a.avgRating * 2 + a.totalReviews))
      .slice(0, 8);
  }, [trending, newReleases]);

  const topGenres = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories.map((cat: any) => ({
        name: cat.name || cat.label,
        count: Array.isArray(cat.videos) ? cat.videos.length : (cat.mediaCount || cat._count?.media || 0),
      }));
    }

    const freq = new Map<string, number>();
    [...trending, ...newReleases].forEach((item) => {
      item.genres?.forEach((genre) => {
        freq.set(genre, (freq.get(genre) ?? 0) + 1);
      });
    });

    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));
  }, [categories, trending, newReleases]);

  const handleCategoryClick = useCallback((categoryName: string) => {
    const slug = String(categoryName || "").toLowerCase().trim().replace(/\s+/g, "-");
    const element = document.getElementById(`category-${slug}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(`/categories?category=${encodeURIComponent(categoryName)}`);
    }
  }, [router]);

  // Helper to get progress percentage for a media item
  function getProgressPct(progressSeconds: number, media: MediaItem): number {
    const durationMatch = media.duration?.match(/(\d+)h?\s*(\d+)?m?/);
    let totalSeconds = 0;
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || "0");
      const mins = parseInt(durationMatch[2] || "0");
      totalSeconds = (hours * 60 + mins) * 60;
    }
    if (totalSeconds === 0) return 0;
    return Math.min(100, Math.round((progressSeconds / totalSeconds) * 100));
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header Ad */}
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <AdSlot type="header" />
      </div>

      {/* ─── Hero Banner ─── */}
      {featured ? (
        <div className="relative h-[65vh] min-h-[480px] mb-12">
          <div className="absolute inset-0">
            <ImageWithFallback
              src={featured.poster}
              alt={featured.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="relative max-w-screen-2xl mx-auto px-6 h-full flex items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-[#E50914] px-3 py-1 rounded text-white text-sm font-semibold">Featured</span>
                <span className="text-foreground/60 text-sm">
                  {featured.releaseYear} • {featured.genres?.join(", ") || "General"} • {featured.duration}
                </span>
              </div>
              <h1 className="text-foreground text-4xl md:text-5xl font-black mb-4 leading-tight">{featured.title}</h1>
              <p className="text-foreground/80 mb-6 text-lg line-clamp-3">{featured.synopsis}</p>
              <div className="flex gap-4 flex-wrap">
                <Button
                  size="lg"
                  className="bg-[#E50914] hover:bg-[#B2070F] text-white shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02]"
                  onClick={() => router.push(`/watch/${featured.id}`)}
                >
                  <Play className="w-5 h-5 mr-2 fill-white" />
                  Play Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-card/60 border-border text-foreground hover:bg-card/80 backdrop-blur-sm"
                  onClick={() => router.push("/library")}
                >
                  <Info className="w-5 h-5 mr-2" />
                  Browse All
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Fallback Hero when no featured content */
        <div className="relative h-[50vh] min-h-[380px] mb-12 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/20 flex items-center">
          <div className="max-w-screen-2xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <PlayCircle className="w-10 h-10 text-[#E50914]" />
              </div>
              <h1 className="text-foreground text-4xl md:text-5xl font-black mb-4">Welcome to NGV</h1>
              <p className="text-foreground/70 mb-6 text-lg">Clean & secure streaming for Bangladesh 🇧🇩</p>
              <Button
                size="lg"
                className="bg-[#E50914] hover:bg-[#B2070F] text-white"
                onClick={() => router.push("/library")}
              >
                Browse Library
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="max-w-screen-2xl mx-auto px-6 space-y-12">

        {/* ─── Continue Watching ─── */}
        {!loadingContinue && continueWatching.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-[#E50914]" />
              <h2 className="text-foreground text-2xl font-bold">Continue Watching</h2>
            </div>
            <MediaCarousel>
              {continueWatching.map(({ mediaId, progressSeconds, media }) => {
                const pct = getProgressPct(progressSeconds, media);
                return (
                  <div key={mediaId} className="relative">
                    <VideoCard
                      id={mediaId}
                      title={media.title}
                      description={media.synopsis}
                      thumbnail={media.poster}
                      duration={media.duration}
                      rating={media.avgRating}
                      year={String(media.releaseYear)}
                      category={media.genres?.[0] || "General"}
                      onClick={() => router.push(`/watch/${mediaId}`)}
                    />
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-xl overflow-hidden z-30">
                      <div
                        className="h-full bg-[#E50914] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </MediaCarousel>
          </section>
        )}

        {/* ─── Trending Now ─── */}
        {trending.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#E50914]" />
                <h2 className="text-foreground text-2xl font-bold">Trending Now</h2>
              </div>
              <Button
                variant="link"
                className="text-[#E50914] p-0 h-auto font-semibold text-sm flex items-center gap-1"
                onClick={() => router.push("/library?sort=most-reviewed")}
              >
                See All <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <MediaCarousel>
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
                  category={media.genres?.[0] || "General"}
                  onClick={() => router.push(`/watch/${media.id}`)}
                />
              ))}
            </MediaCarousel>
          </section>
        )}

        {/* ─── Top Categories Grid ─── */}
        {topGenres.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-2xl font-bold">Top Categories</h2>
              <Button
                variant="link"
                className="text-[#E50914] p-0 h-auto font-semibold text-sm flex items-center gap-1"
                onClick={() => router.push("/categories")}
              >
                View All ({topGenres.length}) <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {topGenres.map((genre) => (
                <div
                  key={genre.name}
                  onClick={() => handleCategoryClick(genre.name)}
                  className="rounded-xl border border-border bg-card p-4 text-center cursor-pointer hover:border-[#E50914] hover:bg-card/80 hover:scale-[1.03] transition-all group shadow-sm"
                >
                  <p className="text-foreground font-semibold group-hover:text-[#E50914] transition-colors truncate">{genre.name}</p>
                  <p className="text-muted-foreground text-xs mt-1">{genre.count} titles</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Category Tabs (Movies / New / Trending) ─── */}
        <section>
          <Tabs defaultValue="movies" className="w-full">
            <TabsList className="bg-card border border-border mb-6 h-auto p-1">
              <TabsTrigger value="movies" className="data-[state=active]:bg-[#E50914] data-[state=active]:text-white rounded-md px-5 py-2 text-sm font-semibold transition-all">
                Movies
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-[#E50914] data-[state=active]:text-white rounded-md px-5 py-2 text-sm font-semibold transition-all">
                New Releases
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-[#E50914] data-[state=active]:text-white rounded-md px-5 py-2 text-sm font-semibold transition-all">
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value="movies">
              {trending.length > 0 ? (
                <MediaCarousel>
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
                      category={media.genres?.[0] || "General"}
                      onClick={() => router.push(`/watch/${media.id}`)}
                    />
                  ))}
                </MediaCarousel>
              ) : (
                <div className="text-center text-foreground/60 py-12">No movies available</div>
              )}
            </TabsContent>

            <TabsContent value="new">
              {newReleases.length > 0 ? (
                <MediaCarousel>
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
                      category={media.genres?.[0] || "General"}
                      isNew
                      onClick={() => router.push(`/watch/${media.id}`)}
                    />
                  ))}
                </MediaCarousel>
              ) : (
                <div className="text-center text-foreground/60 py-12">No new releases available</div>
              )}
            </TabsContent>

            <TabsContent value="trending">
              {trending.length > 0 ? (
                <MediaCarousel>
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
                      category={media.genres?.[0] || "General"}
                      onClick={() => router.push(`/watch/${media.id}`)}
                    />
                  ))}
                </MediaCarousel>
              ) : (
                <div className="text-center text-foreground/60 py-12">No trending content</div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* ─── Latest Releases ─── */}
        {newReleases.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-2xl font-bold">Latest Releases</h2>
              <Button
                variant="outline"
                className="bg-card/60 border-border text-foreground hover:bg-card/80 flex items-center gap-1"
                onClick={() => router.push("/library")}
              >
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <MediaCarousel>
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
                  category={media.genres?.[0] || "General"}
                  isNew
                  onClick={() => router.push(`/watch/${media.id}`)}
                />
              ))}
            </MediaCarousel>
          </section>
        )}

        {/* ─── Dynamic Category Rows (Netflix-style) ─── */}
        {categories.map((cat: any) => {
          const catName = cat.name || cat.label || "";
          const catSlug = catName.toLowerCase().trim().replace(/\s+/g, "-");
          if (!cat.videos || cat.videos.length === 0) return null;
          return (
            <section key={cat.id || catSlug} id={`category-${catSlug}`} className="scroll-mt-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Film className="w-6 h-6 text-[#E50914]" />
                  <h2 className="text-foreground text-2xl font-bold">{catName}</h2>
                </div>
                <Button
                  variant="link"
                  className="text-[#E50914] p-0 h-auto font-semibold text-sm flex items-center gap-1"
                  onClick={() => router.push(`/categories?category=${encodeURIComponent(catName)}`)}
                >
                  See All <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <MediaCarousel>
                {cat.videos.map((media: any) => (
                  <VideoCard
                    key={`cat-row-${cat.id || catSlug}-${media.id}`}
                    id={media.id}
                    title={media.title}
                    description={media.synopsis}
                    thumbnail={media.poster}
                    duration={media.duration}
                    rating={media.avgRating}
                    year={String(media.releaseYear)}
                    category={media.genres?.[0] || "General"}
                    onClick={() => router.push(`/watch/${media.id}`)}
                  />
                ))}
              </MediaCarousel>
            </section>
          );
        })}

        {/* ─── AI / Smart Picks ─── */}
        {aiPicks.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#E50914]" />
              <h2 className="text-foreground text-2xl font-bold">Smart Picks For You</h2>
            </div>
            <MediaCarousel>
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
                  category={media.genres?.[0] || "General"}
                  onClick={() => router.push(`/watch/${media.id}`)}
                />
              ))}
            </MediaCarousel>
          </section>
        )}

        {/* ─── Platform Highlights ─── */}
        {highlights.length > 0 && (
          <section>
            <h2 className="text-foreground text-2xl font-bold mb-6">Platform Highlights</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {highlights.map((feature) => (
                <div key={feature.id} className="rounded-xl border border-border bg-card p-5 hover:border-[#E50914]/40 transition-colors">
                  <h3 className="text-foreground text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── In-Feed Advertisement ─── */}
        <div>
          <AdSlot type="in-feed" />
        </div>

        {/* ─── Live Platform Stats ─── */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-foreground text-2xl font-bold mb-6">Live Platform Stats</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Featured Titles", value: featured ? 1 : 0, icon: Film },
              { label: "Trending Items", value: trending.length, icon: TrendingUp },
              { label: "New Releases", value: newReleases.length, icon: Sparkles },
              { label: "Active Categories", value: topGenres.length, icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-border bg-background p-4 hover:border-[#E50914]/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-[#E50914]" />
                  <p className="text-muted-foreground text-sm">{label}</p>
                </div>
                <p className="text-foreground text-3xl font-black">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        {testimonials.length > 0 && (
          <section>
            <h2 className="text-foreground text-2xl font-bold mb-6">What Viewers Say</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {testimonials.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-5">
                  <Users className="w-5 h-5 text-[#E50914] mb-3" />
                  <p className="text-foreground text-sm mb-3 italic leading-relaxed">"{item.quote}"</p>
                  <p className="text-muted-foreground text-xs font-semibold">— {item.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── FAQ Preview ─── */}
        {faqs.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-foreground text-2xl font-bold mb-4">Quick Answers</h2>
            <div className="space-y-3">
              {faqs.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-foreground font-semibold flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E50914] mt-0.5 shrink-0" />
                    {item.question}
                  </p>
                  <p className="text-muted-foreground text-sm mt-2 ml-6 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Newsletter CTA ─── */}
        <section className="rounded-2xl border border-border bg-gradient-to-br from-card to-red-950/10 p-8 text-center">
          <Mail className="w-8 h-8 text-[#E50914] mx-auto mb-3" />
          <h2 className="text-foreground text-2xl font-bold mb-2">Stay Updated</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get weekly releases, personalized picks, and exclusive platform updates.
          </p>
          <Button
            className="bg-[#E50914] hover:bg-[#B2070F] text-white px-8 shadow-lg shadow-red-600/30 hover:scale-[1.02] transition-all"
            onClick={() => router.push("/contact")}
          >
            Get In Touch
          </Button>
        </section>

        {/* bottom spacing */}
        <div className="h-4" />
      </div>
    </div>
  );
}
