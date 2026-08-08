/**
 * JsonLd — Reusable JSON-LD Structured Data component
 * Google uses this to display Rich Snippets in search results
 * (star ratings, movie posters, director info, etc.)
 */

interface VideoObjectSchema {
  type: "VideoObject";
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate?: string;
  duration?: string; // ISO 8601 e.g. "PT2H3M"
  contentUrl?: string;
  embedUrl?: string;
  director?: string;
  actors?: string[];
  genre?: string[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

interface MovieSchema {
  type: "Movie";
  name: string;
  description: string;
  image: string;
  datePublished?: string;
  director?: string;
  actors?: string[];
  genre?: string[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  url?: string;
}

interface WebSiteSchema {
  type: "WebSite";
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

interface BreadcrumbSchema {
  type: "BreadcrumbList";
  items: Array<{ name: string; url: string }>;
}

type JsonLdSchema = VideoObjectSchema | MovieSchema | WebSiteSchema | BreadcrumbSchema;

function buildJsonLd(schema: JsonLdSchema): Record<string, unknown> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ngv-streaming.vercel.app";

  switch (schema.type) {
    case "VideoObject":
      return {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: schema.name,
        description: schema.description,
        thumbnailUrl: schema.thumbnailUrl,
        uploadDate: schema.uploadDate,
        duration: schema.duration,
        contentUrl: schema.contentUrl,
        embedUrl: schema.embedUrl,
        director: schema.director
          ? { "@type": "Person", name: schema.director }
          : undefined,
        actor: schema.actors?.map((a) => ({ "@type": "Person", name: a })),
        genre: schema.genre,
        aggregateRating: schema.aggregateRating
          ? {
              "@type": "AggregateRating",
              ratingValue: schema.aggregateRating.ratingValue,
              reviewCount: schema.aggregateRating.reviewCount,
              bestRating: schema.aggregateRating.bestRating ?? 10,
              worstRating: schema.aggregateRating.worstRating ?? 1,
            }
          : undefined,
      };

    case "Movie":
      return {
        "@context": "https://schema.org",
        "@type": "Movie",
        name: schema.name,
        description: schema.description,
        image: schema.image,
        datePublished: schema.datePublished,
        url: schema.url ?? siteUrl,
        director: schema.director
          ? { "@type": "Person", name: schema.director }
          : undefined,
        actor: schema.actors?.map((a) => ({ "@type": "Person", name: a })),
        genre: schema.genre,
        aggregateRating: schema.aggregateRating
          ? {
              "@type": "AggregateRating",
              ratingValue: schema.aggregateRating.ratingValue,
              reviewCount: schema.aggregateRating.reviewCount,
              bestRating: schema.aggregateRating.bestRating ?? 10,
              worstRating: schema.aggregateRating.worstRating ?? 1,
            }
          : undefined,
      };

    case "WebSite":
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: schema.name,
        url: schema.url,
        description: schema.description,
        potentialAction: schema.potentialAction
          ? {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: schema.potentialAction.target,
              },
              "query-input": schema.potentialAction.queryInput,
            }
          : undefined,
      };

    case "BreadcrumbList":
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: schema.items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };

    default:
      return {};
  }
}

interface JsonLdProps {
  schema: JsonLdSchema | JsonLdSchema[];
}

export function JsonLd({ schema }: JsonLdProps) {
  const schemas = Array.isArray(schema) ? schema : [schema];
  const jsonLdData = schemas.map(buildJsonLd);

  return (
    <>
      {jsonLdData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  );
}
