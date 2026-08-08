import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Movies & Series — Browse Library",
  description:
    "Browse the full NGV Streaming library. Watch thousands of movies and web series for free in HD. Filter by genre, year, language, and rating.",
  alternates: { canonical: "https://ngv-streaming.vercel.app/library" },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
