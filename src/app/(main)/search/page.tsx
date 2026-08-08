"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, Loader, Search, SlidersHorizontal, X } from "lucide-react";
import { AdSlot } from "@/src/components/AdSlot";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { VideoCard } from "@/src/components/VideoCard";
import { VideoCardSkeleton } from "@/src/components/ui/skeleton-card";
import type { MediaItem } from "@/src/lib/portal/types";
import { useDebounce } from "@/src/hooks/use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ngv-backend.vercel.app/api";

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi",
  "Thriller", "Western", "Family", "History",
];

const SORT_OPTIONS = [
  { value: "latest", label: "Newest First" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "most-reviewed", label: "Most Reviewed" },
];

async function fetchSearch(params: {
  q: string;
  genre?: string;
  minRating?: string;
  sort?: string;
  yearFrom?: string;
  yearTo?: string;
}): Promise<MediaItem[]> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.genre && params.genre !== "all") qs.set("genre", params.genre);
  if (params.minRating && params.minRating !== "0") qs.set("minRating", params.minRating);
  if (params.sort && params.sort !== "latest") qs.set("sort", params.sort);
  if (params.yearFrom) qs.set("yearFrom", params.yearFrom);
  if (params.yearTo) qs.set("yearTo", params.yearTo);

  const url = params.q
    ? `${API_URL}/media/search?${qs.toString()}`
    : `${API_URL}/media?${qs.toString()}&pageSize=40`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  // Search returns array; media list returns { items: [] }
  return Array.isArray(data) ? data : (data.items || []);
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [query, setQuery] = useState(q);
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("latest");
  const [minRating, setMinRating] = useState("0");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSearch({
        q: debouncedQuery.trim(),
        genre,
        minRating,
        sort,
        yearFrom,
        yearTo,
      });
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, genre, minRating, sort, yearFrom, yearTo]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  // Active filter count for badge
  const activeFilters = [
    genre !== "all" ? genre : null,
    minRating !== "0" ? `★${minRating}+` : null,
    sort !== "latest" ? sort : null,
    yearFrom ? `From ${yearFrom}` : null,
    yearTo ? `To ${yearTo}` : null,
  ].filter(Boolean);

  function clearFilters() {
    setGenre("all");
    setMinRating("0");
    setSort("latest");
    setYearFrom("");
    setYearTo("");
  }

  return (
    <div className="min-h-screen bg-background pt-24 px-4 sm:px-6 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* ─── Header ─── */}
        <div className="mb-8">
          <h1 className="text-foreground text-4xl font-black mb-1">Search</h1>
          <p className="text-muted-foreground">Find movies, series, directors and more</p>
        </div>

        {/* ─── Search Bar ─── */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3 focus-within:border-[#E50914] transition-all shadow-sm">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              id="search-input"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }
              }}
              placeholder="Search titles, directors, genres..."
              className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-base p-0 h-auto"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            className={`bg-card border-border gap-2 relative ${showFilters ? "border-[#E50914] text-[#E50914]" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
            id="filter-toggle-btn"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E50914] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>

        {/* ─── Filters Panel ─── */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#E50914]" />
                Filter Results
              </h3>
              {activeFilters.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-[#E50914] transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {/* Genre */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Genre</label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-background border-border text-foreground h-9 text-sm" id="genre-select">
                    <SelectValue placeholder="All genres" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border text-foreground">
                    <SelectItem value="all">All Genres</SelectItem>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Min Rating</label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger className="bg-background border-border text-foreground h-9 text-sm" id="rating-select">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border text-foreground">
                    <SelectItem value="0">Any Rating</SelectItem>
                    {[5, 6, 7, 8, 9].map((r) => (
                      <SelectItem key={r} value={String(r)}>★ {r}+ / 10</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Sort By</label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="bg-background border-border text-foreground h-9 text-sm" id="sort-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border text-foreground">
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year From */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Year From</label>
                <Input
                  id="year-from"
                  type="number"
                  min={1950}
                  max={2026}
                  placeholder="e.g. 2015"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="bg-background border-border text-foreground h-9 text-sm"
                />
              </div>

              {/* Year To */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Year To</label>
                <Input
                  id="year-to"
                  type="number"
                  min={1950}
                  max={2026}
                  placeholder="e.g. 2024"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  className="bg-background border-border text-foreground h-9 text-sm"
                />
              </div>
            </div>

            {/* Active Filter Tags */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((f, i) => (
                  <Badge key={i} variant="secondary" className="text-xs gap-1">
                    {f}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Ad Banner ─── */}
        <div className="mb-8">
          <AdSlot type="banner-horizontal" />
        </div>

        {/* ─── Results ─── */}
        {loading ? (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Loader className="w-4 h-4 text-[#E50914] animate-spin" />
              <span className="text-muted-foreground text-sm">Searching...</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : results.length > 0 ? (
          <div>
            <p className="text-muted-foreground text-sm mb-6">
              <span className="text-foreground font-bold text-lg">{results.length}</span>{" "}
              result{results.length !== 1 ? "s" : ""}{query ? ` for "${query}"` : ""}
              {activeFilters.length > 0 && (
                <span className="ml-2 text-[#E50914]">• Filtered</span>
              )}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
              {results.map((item) => (
                <VideoCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.synopsis}
                  thumbnail={item.poster}
                  duration={item.duration}
                  rating={item.avgRating}
                  year={String(item.releaseYear)}
                  category={item.genres?.[0] || "General"}
                  onClick={() => router.push(`/watch/${item.id}`)}
                />
              ))}
            </div>
          </div>
        ) : query || activeFilters.length > 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-foreground text-xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground mb-4">
              {query ? `No titles matched "${query}"` : "No titles match the selected filters"}
            </p>
            <Button variant="outline" onClick={clearFilters} className="bg-card border-border">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-foreground text-xl font-semibold mb-2">What are you looking for?</h2>
            <p className="text-muted-foreground">Type something above or use filters to browse the NGV library.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pt-24 px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse h-10 w-32 bg-muted rounded mb-4" />
          <div className="animate-pulse h-14 bg-muted rounded-xl mb-6" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse aspect-[2/3] bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
