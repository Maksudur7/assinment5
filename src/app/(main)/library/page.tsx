"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { VideoCard } from "@/src/components/VideoCard";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { mediaFetchers } from "@/src/lib/fetchers/core";
import { portalService } from "@/src/lib/portal";
import { canAccessMedia } from "@/src/lib/portal/entitlements";
import type { MediaItem, PurchaseRecord, UserRole } from "@/src/lib/portal/types";

const PAGE_SIZE = 8;

export default function LibraryPage() {
  const router = useRouter();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [releaseYear, setReleaseYear] = useState("all");
  const [minRating, setMinRating] = useState("all");
  const [maxRating, setMaxRating] = useState("all");
  const [popularity, setPopularity] = useState("all");
  const [sort, setSort] = useState<"latest" | "highest-rated" | "most-reviewed">("latest");
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);

  async function load() {
    const [result, me, purchases] = await Promise.all([
      mediaFetchers.list({
        page,
        pageSize: PAGE_SIZE,
        search,
        genre: genre === "all" ? undefined : genre,
        platform: platform === "all" ? undefined : platform,
        releaseYear: releaseYear === "all" ? undefined : Number(releaseYear),
        minRating: minRating === "all" ? undefined : Number(minRating),
        maxRating: maxRating === "all" ? undefined : Number(maxRating),
        minPopularity: popularity === "all" ? undefined : Number(popularity),
        sort,
      }),
      portalService.getCurrentUser(),
      portalService.getPurchaseHistory(),
    ]);
    setItems(result.items);
    setTotal(result.total);
    setUserRole(me.role);
    setPurchaseHistory(purchases);
  }

  useEffect(() => {
    void load();
  }, [page, search, genre, platform, releaseYear, minRating, maxRating, popularity, sort]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-360 mx-auto px-6 py-8 space-y-6">
        <div className="rounded-lg bg-zinc-900 border border-white/10 p-6">
          <h1 className="text-white text-3xl mb-2">All Movies & Series</h1>
          <p className="text-white/60">Search, filter and sort published media catalog.</p>
        </div>

        <div className="rounded-lg bg-zinc-900 border border-white/10 p-4 grid gap-3 lg:grid-cols-[1fr_140px_140px_120px_120px_140px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input className="pl-9 bg-zinc-800 border-white/10 text-white" placeholder="Search title, director, cast" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={genre} onValueChange={(v) => { setGenre(v); setPage(1); }}>
            <SelectTrigger className="bg-zinc-800 border-white/10 text-white"><SelectValue placeholder="Genre" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10 text-white">
              <SelectItem value="all">All Genre</SelectItem>
              <SelectItem value="Action">Action</SelectItem>
              <SelectItem value="Drama">Drama</SelectItem>
              <SelectItem value="Thriller">Thriller</SelectItem>
              <SelectItem value="Mystery">Mystery</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platform} onValueChange={(v) => { setPlatform(v); setPage(1); }}>
            <SelectTrigger className="bg-zinc-800 border-white/10 text-white"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10 text-white">
              <SelectItem value="all">All Platform</SelectItem>
              <SelectItem value="NGV">NGV</SelectItem>
              <SelectItem value="Netflix">Netflix</SelectItem>
              <SelectItem value="Prime Video">Prime Video</SelectItem>
              <SelectItem value="Disney+">Disney+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={releaseYear} onValueChange={(v) => { setReleaseYear(v); setPage(1); }}>
            <SelectTrigger className="bg-zinc-800 border-white/10 text-white"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10 text-white">
              <SelectItem value="all">All Year</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Select value={minRating} onValueChange={(v) => { setMinRating(v); setPage(1); }}>
            <SelectTrigger className="bg-zinc-800 border-white/10 text-white"><SelectValue placeholder="Min Rating" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10 text-white">
              <SelectItem value="all">Any Rating</SelectItem>
              <SelectItem value="7">7+</SelectItem>
              <SelectItem value="8">8+</SelectItem>
              <SelectItem value="9">9+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={maxRating} onValueChange={(v) => { setMaxRating(v); setPage(1); }}>
            <SelectTrigger className="bg-zinc-800 border-white/10 text-white"><SelectValue placeholder="Max Rating" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10 text-white">
              <SelectItem value="all">No Max</SelectItem>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="7">7</SelectItem>
            </SelectContent>
          </Select>
          <Select value={popularity} onValueChange={(v) => { setPopularity(v); setPage(1); }}>
            <SelectTrigger className="bg-zinc-800 border-white/10 text-white"><SelectValue placeholder="Popularity" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10 text-white">
              <SelectItem value="all">Any Popularity</SelectItem>
              <SelectItem value="50">50+ Reviews</SelectItem>
              <SelectItem value="100">100+ Reviews</SelectItem>
              <SelectItem value="150">150+ Reviews</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => { setSort(v as typeof sort); setPage(1); }}>
            <SelectTrigger className="bg-zinc-800 border-white/10 text-white"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10 text-white">
              <SelectItem value="latest">Recent</SelectItem>
              <SelectItem value="highest-rated">Top Rated</SelectItem>
              <SelectItem value="most-reviewed">Most Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Badge className="bg-[#E50914]">{total} titles</Badge>
          <p className="text-white/60 text-sm">Page {page} of {totalPages}</p>
        </div>

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
              pricing={item.pricing}
              isLocked={item.pricing === "premium" ? !canAccessMedia(item, userRole, purchaseHistory) : false}
              onClick={() => router.push(`/watch/${item.id}`)}
            />
          ))}
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            className="px-4 py-2 rounded bg-white/10 text-white disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 rounded bg-white/10 text-white disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
