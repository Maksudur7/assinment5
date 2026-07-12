import { AlertCircle } from "lucide-react";
import { HomeClient } from "./HomeClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
    const [featuredData, trendingData, newReleasesData, landingContent] = await Promise.all([
      fetchFromAPI("/media?sort=highest-rated&pageSize=6").then((r) => r.items || []),
      fetchFromAPI("/media?sort=most-reviewed&pageSize=12").then((r) => r.items || []),
      fetchFromAPI("/media?sort=latest&pageSize=12").then((r) => r.items || []),
      fetchFromAPI("/landing").then((r) => r.data || null).catch(() => null),
    ]);

    const featured = featuredData.length > 0 ? featuredData[0] : null;
    const trending = trendingData.slice(0, 6);
    const newReleases = newReleasesData.slice(0, 6);
    const highlights = landingContent?.highlights || [];
    const testimonials = landingContent?.testimonials || [];
    const faqs = landingContent?.faqs || [];

    return (
      <HomeClient
        featured={featured}
        trending={trending}
        newReleases={newReleases}
        highlights={highlights}
        testimonials={testimonials}
        faqs={faqs}
      />
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


