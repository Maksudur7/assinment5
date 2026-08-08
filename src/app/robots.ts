import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ngv-streaming.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/library", "/search", "/categories", "/watch/", "/about", "/contact", "/faq", "/privacy", "/terms", "/dmca"],
        disallow: [
          "/admin",
          "/dashboard",
          "/profile",
          "/watchlist",
          "/history",
          "/purchases",
          "/subscription",
          "/api/",
          "/_next/",
        ],
      },
      {
        // Allow Googlebot full access to public pages
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
