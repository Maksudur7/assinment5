"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Loader } from "lucide-react";

import { Input } from "@/src/components/ui/input";
import { VideoCard } from "@/src/components/VideoCard";
import type { MediaItem } from "@/src/lib/portal/types";
import { useDebounce } from "@/src/hooks/use-debounce";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function fetchSearch(q: string): Promise<MediaItem[]> {
  const res = await fetch(`${API_URL}/media/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  return res.json();
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const [query, setQuery] = useState(q);
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchSearch(term.trim());
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run search when debounced query changes
  useEffect(() => {
    doSearch(debouncedQuery);
  }, [debouncedQuery, doSearch]);

  return (
    <div className="min-h-screen bg-background pt-24 px-6 pb-16">
      <div className="max-w-5xl mx-auto">
        {/* Search Header */}
        <div className="mb-10">
          <h1 className="text-foreground text-4xl font-bold mb-2">Search</h1>
          <p className="text-muted-foreground mb-6">Find movies, series, directors and more</p>
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3 max-w-xl focus-within:border-primary transition-all">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search titles, directors, genres..."
              className="bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-base p-0 h-auto"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div>
            <p className="text-muted-foreground text-sm mb-6">
              {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
              <span className="text-foreground font-medium">&quot;{q}&quot;</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((item) => (
                <Link key={item.id} href={`/watch/${item.id}`}>
                  <VideoCard
                    id={item.id}
                    title={item.title}
                    description={item.synopsis}
                    thumbnail={item.poster}
                    duration={item.duration}
                    rating={item.avgRating}
                    year={String(item.releaseYear)}
                    category={item.genres?.[0] || "General"}
                  />
                </Link>
              ))}
            </div>
          </div>
        ) : q ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-foreground text-xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground">
              No titles matched <span className="text-foreground">&quot;{q}&quot;</span>. Try different keywords.
            </p>
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-foreground text-xl font-semibold mb-2">What are you looking for?</h2>
            <p className="text-muted-foreground">Type something above to search the NGV library.</p>
          </div>
        )}
      </div>
    </div>
  );
}
