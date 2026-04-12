"use client";

import { useRouter } from "next/navigation";
import { AdSlot } from "../components/AdSlot";
import { VideoCard } from "../components/VideoCard";

const trendingMovies = [
  { id: "1", title: "The Dark Knight Returns", thumbnail: "https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", duration: "2h 45m", rating: 8.9, year: "2024", category: "Action", isNew: true },
  { id: "2", title: "Mystery at Midnight", thumbnail: "https://images.unsplash.com/photo-1595171694538-beb81da39d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", duration: "1h 58m", rating: 8.5, year: "2024", category: "Thriller", isNew: true },
  { id: "3", title: "Cinema Paradiso", thumbnail: "https://images.unsplash.com/photo-1616527546362-bf6b7f80a751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", duration: "2h 15m", rating: 9.2, year: "2024", category: "Drama" },
  { id: "4", title: "Portrait of Shadows", thumbnail: "https://images.unsplash.com/photo-1590707642683-8a2e8d713c60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", duration: "1h 42m", rating: 8.1, year: "2023", category: "Mystery" },
];

export function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <AdSlot type="header" />
      </div>

      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="rounded-xl overflow-hidden border border-white/10 bg-zinc-900">
          <img
            src="https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Featured"
            className="w-full h-[380px] object-cover"
          />
          <div className="p-6">
            <h1 className="text-white text-3xl mb-2">The Dark Knight Returns</h1>
            <p className="text-white/70 mb-4">When evil rises, a hero must answer.</p>
            <button
              onClick={() => router.push("/watch/1")}
              className="bg-[#E50914] hover:bg-[#B2070F] text-white px-4 py-2 rounded"
            >
              Play Now
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-12">
        <h2 className="text-white text-2xl mb-6">Trending Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trendingMovies.map((movie) => (
            <VideoCard key={movie.id} {...movie} onClick={() => router.push(`/watch/${movie.id}`)} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
