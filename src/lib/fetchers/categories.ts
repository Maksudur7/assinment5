import { catalogVideos, type CatalogVideo } from "@/src/lib/data/catalog";

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

function sortVideos(videos: CatalogVideo[], sort: CategorySort): CatalogVideo[] {
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
      return copied.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.views - a.views);
  }
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const counts = new Map<string, number>();

  for (const video of catalogVideos) {
    counts.set(video.category, (counts.get(video.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({
      slug: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export async function fetchCategoryVideos(
  filters: CategoryFilters = {},
): Promise<CatalogVideo[]> {
  const {
    query = "",
    category = "all",
    language = "all",
    sort = "trending",
  } = filters;

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = catalogVideos.filter((video) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      video.title.toLowerCase().includes(normalizedQuery) ||
      video.category.toLowerCase().includes(normalizedQuery);
    const matchesCategory = category === "all" || video.category === category;
    const matchesLanguage = language === "all" || video.language === language;

    return matchesQuery && matchesCategory && matchesLanguage;
  });

  return sortVideos(filtered, sort);
}

export async function fetchCategoryHighlights() {
  const categories = await fetchCategories();
  const videos = await fetchCategoryVideos({ sort: "popular" });

  return {
    totalTitles: catalogVideos.length,
    totalCategories: categories.length,
    topCategory: categories[0]?.label ?? "N/A",
    featured: videos.slice(0, 6),
  };
}
