"use client";

import { useEffect, useMemo, useState } from "react";
import { Film, Layers, Search, SlidersHorizontal, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdSlot } from "@/src/components/AdSlot";
import { VideoCard } from "@/src/components/VideoCard";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  fetchCategories,
  fetchCategoryHighlights,
  fetchCategoryVideos,
  type CategoryItem,
  type CategorySort,
} from "@/src/lib/fetchers/categories";
import type { CatalogVideo } from "@/src/lib/data/catalog";

const DEFAULT_SORT: CategorySort = "trending";

export default function CategoriesPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [language, setLanguage] = useState("all");
  const [sort, setSort] = useState<CategorySort>(DEFAULT_SORT);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [videos, setVideos] = useState<CatalogVideo[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<CatalogVideo[]>([]);
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalCategories: 0,
    topCategory: "N/A",
  });

  useEffect(() => {
    async function bootstrap() {
      const [categoryItems, highlights, initialVideos] = await Promise.all([
        fetchCategories(),
        fetchCategoryHighlights(),
        fetchCategoryVideos({ sort: DEFAULT_SORT }),
      ]);

      setCategories(categoryItems);
      setFeaturedVideos(highlights.featured);
      setStats({
        totalTitles: highlights.totalTitles,
        totalCategories: highlights.totalCategories,
        topCategory: highlights.topCategory,
      });
      setVideos(initialVideos);
      setIsLoading(false);
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    async function refresh() {
      const filtered = await fetchCategoryVideos({
        query,
        category,
        language,
        sort,
      });
      setVideos(filtered);
    }

    if (!isLoading) {
      void refresh();
    }
  }, [category, isLoading, language, query, sort]);

  const emptyStateMessage = useMemo(() => {
    if (query.trim().length > 0) {
      return "No titles matched your search. Try a different keyword.";
    }
    return "No titles found for this filter combination.";
  }, [query]);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <AdSlot type="header" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-8">
        <section className="rounded-lg bg-zinc-900 border border-white/10 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3 rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white/70">
                <Film className="h-4 w-4 text-[#E50914]" />
                NGV Categories
              </div>
              <h1 className="text-3xl lg:text-4xl text-white mb-2">
                Browse by Category
              </h1>
              <p className="text-white/60 max-w-2xl">
                Discover curated movies and series by genre, language, and popularity — tailored for the NGV streaming experience.
              </p>
            </div>

            <Button
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setLanguage("all");
                setSort(DEFAULT_SORT);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Film className="w-5 h-5 text-[#E50914]" />
                Total Titles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-white mb-1">{stats.totalTitles}</p>
              <p className="text-white/60 text-sm">Available in catalog</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Layers className="w-5 h-5 text-[#E50914]" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-white mb-1">{stats.totalCategories}</p>
              <p className="text-white/60 text-sm">Genre collections</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-[#E50914]" />
                Top Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-white mb-1">{stats.topCategory}</p>
              <p className="text-white/60 text-sm">Most listed right now</p>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-lg bg-zinc-900 border border-white/10 p-4 lg:p-6 space-y-4">
          <div className="flex items-center gap-2 text-white mb-1">
            <SlidersHorizontal className="w-4 h-4 text-[#E50914]" />
            <h2 className="text-lg">Filter & Sort</h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 bg-zinc-800 border-white/10 text-white"
                placeholder="Search by title or genre..."
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-zinc-800 border-white/10 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-white/10 text-white">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((item) => (
                  <SelectItem key={item.slug} value={item.label}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-zinc-800 border-white/10 text-white">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-white/10 text-white">
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="Bangla">Bangla</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(value) => setSort(value as CategorySort)}
            >
              <SelectTrigger className="bg-zinc-800 border-white/10 text-white">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-white/10 text-white">
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="popular">Most Viewed</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === "all" ? "default" : "outline"}
              className={
                category === "all"
                  ? "bg-[#E50914] hover:bg-[#B2070F]"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }
              onClick={() => setCategory("all")}
            >
              All
            </Button>
            {categories.map((item) => (
              <Button
                key={item.slug}
                variant={category === item.label ? "default" : "outline"}
                className={
                  category === item.label
                    ? "bg-[#E50914] hover:bg-[#B2070F]"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }
                onClick={() => setCategory(item.label)}
              >
                {item.label}
                <Badge variant="secondary" className="ml-2 bg-white/10 text-white">
                  {item.count}
                </Badge>
              </Button>
            ))}
          </div>
        </section>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-white/10">
            <TabsTrigger value="browse" className="data-[state=active]:bg-[#E50914]">
              <Film className="w-4 h-4 mr-2" />
              Browse Results
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-[#E50914]">
              <Sparkles className="w-4 h-4 mr-2" />
              Featured Picks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            {isLoading ? (
              <div className="text-white/70 py-10 text-center">Loading categories...</div>
            ) : videos.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/15 bg-zinc-900 p-10 text-center text-white/70">
                {emptyStateMessage}
              </div>
            ) : (
              <div className="bg-zinc-900 rounded-lg p-6 border border-white/10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white text-xl">Category Results</h3>
                  <Badge className="bg-[#E50914] text-white">{videos.length} titles</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      {...video}
                      onClick={() => router.push(`/watch/${video.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured">
            <div className="mb-4 flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-[#E50914]" />
              Handpicked titles based on popularity and freshness.
            </div>
            <div className="bg-zinc-900 rounded-lg p-6 border border-white/10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {featuredVideos.map((video) => (
                  <VideoCard
                    key={`featured-${video.id}`}
                    {...video}
                    onClick={() => router.push(`/watch/${video.id}`)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
