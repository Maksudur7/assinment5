import type { CatalogVideo } from "@/src/lib/data/catalog";

export type CategoryItem = {
  slug: string;
  label: string;
  count: number;
};

export type CategorySort = "trending" | "rating" | "newest" | "popular";

export type CategoryFilters = {
  query?: string;
  category?: string;
  language?: string;
  sort?: CategorySort;
};

function sortVideos(
  videos: CatalogVideo[],
  sort: CategorySort,
): CatalogVideo[] {
  const copied = [...videos];

  switch (sort) {
    case "rating":
      return copied.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copied.sort((a, b) => Number(b.year) - Number(a.year));
    case "popular":
      return copied.sort((a, b) => b.views - a.views);
    case "trending":
    default:
      return copied.sort(
        (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.views - a.views,
      );
  }
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  const res = await fetch(`${apiUrl}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  // Assuming backend returns [{ name: string, ... }]
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((cat: any) => ({
    slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
    label: cat.name,
    count: cat._count?.media || cat.mediaCount || 0,
  }));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function fetchCategoryVideos(
  filters: CategoryFilters = {},
): Promise<CatalogVideo[]> {
  const {
    query = "",
    category = "all",
    language = "all",
    sort = "trending",
  } = filters;

  let videos: CatalogVideo[] = [];

  if (category !== "all") {
    // Full path logic
    const url = `${API_URL}/categories/${encodeURIComponent(category)}/videos`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed");
    videos = await res.json();
  } else {
    // API_URL e already /api ache, tai ekhane extra /api hobe na
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    if (language !== "all") params.append("language", language);
    if (sort) params.append("sort", sort);

    const res = await fetch(`${API_URL}/media?${params.toString()}`);
    const data = await res.json();
    videos = data.items || [];
  }

  return sortVideos(videos, sort as CategorySort);
}

export async function fetchCategoryHighlights() {
  const categories = await fetchCategories();
  // Use /api/media?sort=popular for featured
  const res = await fetch(`${API_URL}/media?sort=popular&pageSize=6`);
  if (!res.ok) throw new Error("Failed to fetch highlights");
  const data = await res.json();
  return {
    totalTitles: data.total || 0,
    totalCategories: categories.length,
    topCategory: categories[0]?.label ?? "N/A",
    featured: data.items || [],
  };
}
