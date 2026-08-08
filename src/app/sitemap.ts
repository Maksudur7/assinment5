import type { MetadataRoute } from "next";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ngv-backend.vercel.app/api";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ngv-streaming.vercel.app";

async function fetchAllMedia(): Promise<{ id: string; updatedAt?: string }[]> {
  try {
    // Fetch all media items — increase pageSize to get all
    const res = await fetch(`${API_URL}/media?pageSize=500&page=1`, {
      next: { revalidate: 3600 }, // refresh sitemap every hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

async function fetchAllCategories(): Promise<{ name: string }[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [mediaItems, categories] = await Promise.all([
    fetchAllMedia(),
    fetchAllCategories(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/library`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/dmca`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic media/watch pages — auto-generated for every video
  const mediaSitemapEntries: MetadataRoute.Sitemap = mediaItems.map((item) => ({
    url: `${SITE_URL}/watch/${item.id}`,
    lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Category pages
  const categorySitemapEntries: MetadataRoute.Sitemap = categories.map(
    (cat) => ({
      url: `${SITE_URL}/categories/${encodeURIComponent(cat.name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  return [...staticPages, ...mediaSitemapEntries, ...categorySitemapEntries];
}
