import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { HomeClient } from "./HomeClient";
import { JsonLd } from "@/src/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ngv-streaming.vercel.app";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://ngv-backend.vercel.app/api";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};


async function fetchFromAPI(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return res.json();
}

export default async function Page() {
  try {
    const [categories, featuredData, trendingData, newReleasesData, landingContent] = await Promise.all([
      fetchFromAPI("/categories").catch(() => []),
      fetchFromAPI("/media?sort=highest-rated&pageSize=6").then((r) => r.items || []),
      fetchFromAPI("/media?sort=most-reviewed&pageSize=12").then((r) => r.items || []),
      fetchFromAPI("/media?sort=latest&pageSize=12").then((r) => r.items || []),
      fetchFromAPI("/landing").then((r) => r.data || null).catch(() => null),
    ]);

    const categoriesWithVideos = await Promise.all(
      (categories || []).map(async (cat: any) => {
        try {
          const videos = await fetchFromAPI(`/categories/${encodeURIComponent(cat.name)}/videos`);
          return { ...cat, videos: Array.isArray(videos) ? videos : [] };
        } catch (e) {
          return { ...cat, videos: [] };
        }
      })
    );

    const featured = featuredData.length > 0 ? featuredData[0] : null;
    const trending = trendingData.slice(0, 6);
    const newReleases = newReleasesData.slice(0, 6);
    const highlights = landingContent?.highlights || [];
    const testimonials = landingContent?.testimonials || [];
    const faqs = landingContent?.faqs || [];

    return (
      <>
        <JsonLd
          schema={{
            type: "WebSite",
            name: "NGV Streaming",
            url: SITE_URL,
            description: "Bangladesh's premier free streaming platform — movies, series, and TV shows in HD.",
            potentialAction: {
              target: `${SITE_URL}/search?q={search_term_string}`,
              queryInput: "required name=search_term_string",
            },
          }}
        />
        <HomeClient
          featured={featured}
          trending={trending}
          newReleases={newReleases}
          highlights={highlights}
          testimonials={testimonials}
          faqs={faqs}
          categories={categoriesWithVideos}
        />
      </>
    );

  } catch (error) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-foreground text-xl">Failed to load content</h2>
          <p className="text-foreground/60 text-center">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
}


