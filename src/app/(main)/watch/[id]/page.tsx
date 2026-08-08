import type { Metadata } from "next";
import { WatchClient } from "./WatchClient";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { JsonLd } from "@/src/components/JsonLd";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ngv-backend.vercel.app/api";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ngv-streaming.vercel.app";

type WatchRoutePageProps = {
  params: Promise<{ id: string }>;
};

async function getMedia(id: string) {
  try {
    const res = await fetch(`${API_URL}/media/${id}`, {
      next: { revalidate: 3600 }, // cache for 1 hour
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * generateMetadata — Dynamic SEO per video.
 * Called by Next.js AUTOMATICALLY for every watch page.
 * When you upload a new video, this function generates unique SEO
 * metadata from that video's title, synopsis, genres, poster, etc.
 * You never need to touch any code manually.
 */
export async function generateMetadata({
  params,
}: WatchRoutePageProps): Promise<Metadata> {
  const { id } = await params;
  const media = await getMedia(id);

  // Fallback metadata if API is down
  if (!media) {
    return {
      title: "Watch Now | NGV Streaming",
      description: "Stream movies and series for free on NGV.",
    };
  }

  const title = media.title as string;
  const synopsis = (media.synopsis || "") as string;
  const genres = (media.genres || []) as string[];
  const director = (media.director || "") as string;
  const cast = (media.cast || []) as string[];
  const releaseYear = media.releaseYear as number;
  const poster = media.poster as string;
  const avgRating = media.avgRating as number;
  const totalReviews = media.totalReviews as number;

  // Build rich description: synopsis + meta info
  const shortSynopsis = synopsis.slice(0, 155);
  const genreStr = genres.join(", ");
  const metaDescription = `${shortSynopsis}${shortSynopsis.length === 155 ? "…" : ""} | ${genreStr} · ${releaseYear} · Watch free on NGV.`;

  // Keywords built from video data automatically
  const keywords = [
    title,
    ...genres,
    director,
    `${title} watch online`,
    `${title} free streaming`,
    `${title} ${releaseYear}`,
    `watch ${title} Bangladesh`,
    "NGV streaming",
    "free movies online",
  ].filter(Boolean);

  const pageUrl = `${SITE_URL}/watch/${id}`;

  return {
    title: `${title} (${releaseYear})`,
    description: metaDescription,
    keywords,
    authors: director ? [{ name: director }] : undefined,
    openGraph: {
      title: `${title} (${releaseYear}) | NGV Streaming`,
      description: metaDescription,
      type: "video.movie",
      url: pageUrl,
      siteName: "NGV Streaming",
      images: poster
        ? [
            {
              url: poster,
              width: 800,
              height: 450,
              alt: `${title} — Watch on NGV Streaming`,
            },
          ]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: "NGV Streaming" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} (${releaseYear}) — Watch Free on NGV`,
      description: metaDescription,
      images: poster ? [poster] : ["/og-image.png"],
    },
    alternates: {
      canonical: pageUrl,
    },
    // Structured data hints for Google
    other: {
      "og:video:actor": cast.slice(0, 3).join(", "),
      "og:video:director": director,
      "og:video:release_date": String(releaseYear),
      "og:video:tag": genres.join(", "),
    },
  };
}

export default async function Page({ params }: WatchRoutePageProps) {
  const { id } = await params;
  const media = await getMedia(id);

  return (
    <>
      {/* JSON-LD Structured Data — Google Rich Results (star ratings etc.) */}
      {media && (
        <JsonLd
          schema={[
            {
              type: "Movie",
              name: media.title,
              description: media.synopsis || "",
              image: media.poster || "",
              datePublished: media.releaseYear
                ? `${media.releaseYear}-01-01`
                : undefined,
              director: media.director || undefined,
              actors: media.cast || [],
              genre: media.genres || [],
              url: `${SITE_URL}/watch/${id}`,
              aggregateRating:
                media.avgRating && media.totalReviews > 0
                  ? {
                      ratingValue: parseFloat(media.avgRating.toFixed(1)),
                      reviewCount: media.totalReviews,
                      bestRating: 10,
                      worstRating: 1,
                    }
                  : undefined,
            },
            {
              type: "BreadcrumbList",
              items: [
                { name: "Home", url: SITE_URL },
                { name: "Library", url: `${SITE_URL}/library` },
                { name: media.title, url: `${SITE_URL}/watch/${id}` },
              ],
            },
          ]}
        />
      )}
      <ProtectedRoute>
        <WatchClient id={id} />
      </ProtectedRoute>
    </>
  );
}
