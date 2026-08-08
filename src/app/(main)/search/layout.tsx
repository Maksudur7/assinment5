import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Movies & Series",
  description:
    "Search thousands of movies and series on NGV Streaming. Filter by genre, year, rating, platform, and more. Find your next watch for free.",
  alternates: { canonical: "https://ngv-streaming.vercel.app/search" },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
