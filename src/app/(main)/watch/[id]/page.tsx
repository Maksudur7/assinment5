import { AdSlot } from "@/src/components/AdSlot";
import { VideoCard } from "@/src/components/VideoCard";

type WatchRoutePageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: WatchRoutePageProps) {
  const { id } = await params;

  const relatedVideos = [
    { id: "2", title: "Mystery at Midnight", thumbnail: "https://images.unsplash.com/photo-1595171694538-beb81da39d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", duration: "1h 58m", rating: 8.5, year: "2024", category: "Thriller" },
    { id: "3", title: "Cinema Paradiso", thumbnail: "https://images.unsplash.com/photo-1616527546362-bf6b7f80a751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", duration: "2h 15m", rating: 9.2, year: "2024", category: "Drama" },
    { id: "4", title: "Portrait of Shadows", thumbnail: "https://images.unsplash.com/photo-1590707642683-8a2e8d713c60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", duration: "1h 42m", rating: 8.1, year: "2023", category: "Mystery" },
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <div className="rounded-lg overflow-hidden border border-white/10 bg-zinc-900 mb-6">
            <img
              src="https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Video"
              className="w-full aspect-video object-cover"
            />
            <div className="p-4">
              <h1 className="text-white text-2xl mb-2">The Dark Knight Returns {id ? `#${id}` : ""}</h1>
              <p className="text-white/70">2024 • Action • 2h 45m • ⭐ 8.9</p>
            </div>
          </div>

          <AdSlot type="below-player" className="mb-6" />

          <div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
            <h2 className="text-white text-xl mb-2">Description</h2>
            <p className="text-white/70">A gripping action thriller that keeps you on the edge of your seat.</p>
          </div>
        </div>

        <aside className="space-y-6">
          <AdSlot type="sidebar" />
          <div>
            <h3 className="text-white text-xl mb-4">Related Videos</h3>
            <div className="grid gap-4">
              {relatedVideos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
