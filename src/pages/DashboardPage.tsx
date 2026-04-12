import { VideoCard } from "../components/VideoCard";

const favorites = [
  { id: "3", title: "Cinema Paradiso", thumbnail: "https://images.unsplash.com/photo-1616527546362-bf6b7f80a751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", duration: "2h 15m", rating: 9.2, year: "2024", category: "Drama" },
  { id: "4", title: "Portrait of Shadows", thumbnail: "https://images.unsplash.com/photo-1590707642683-8a2e8d713c60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", duration: "1h 42m", rating: 8.1, year: "2023", category: "Mystery" },
];

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-white text-3xl mb-2">Dashboard</h1>
        <p className="text-white/60 mb-8">Manage profile, watch history, and preferences.</p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg bg-zinc-900 p-4 border border-white/10 text-white">Watch time: 24h 32m</div>
          <div className="rounded-lg bg-zinc-900 p-4 border border-white/10 text-white">Favorites: 12</div>
          <div className="rounded-lg bg-zinc-900 p-4 border border-white/10 text-white">Plan: Free</div>
        </div>

        <h2 className="text-white text-2xl mb-4">Favorites</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
