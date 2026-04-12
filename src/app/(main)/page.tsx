"use client";

import { useRouter } from "next/navigation";
import { AdSlot } from "@/src/components/AdSlot";
import { VideoCard } from "@/src/components/VideoCard";
import { Info, Play, TrendingUp } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

export default function Page() {
  const router = useRouter();

  const trendingMovies = [
    {
      id: "1",
      title: "The Dark Knight Returns",
      thumbnail: "https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NjA5OTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "2h 45m",
      rating: 8.9,
      year: "2024",
      category: "Action",
      isNew: true,
    },
    {
      id: "2",
      title: "Mystery at Midnight",
      thumbnail: "https://images.unsplash.com/photo-1595171694538-beb81da39d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJpbGxlciUyMG1vdmllJTIwZGFya3xlbnwxfHx8fDE3NjEwMTg3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "1h 58m",
      rating: 8.5,
      year: "2024",
      category: "Thriller",
      isNew: true,
    },
    {
      id: "3",
      title: "Cinema Paradiso",
      thumbnail: "https://images.unsplash.com/photo-1616527546362-bf6b7f80a751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBmaWxtJTIwcHJvZHVjdGlvbnxlbnwxfHx8fDE3NjEwNzM5Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "2h 15m",
      rating: 9.2,
      year: "2024",
      category: "Drama",
    },
    {
      id: "4",
      title: "Portrait of Shadows",
      thumbnail: "https://images.unsplash.com/photo-1590707642683-8a2e8d713c60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFtYXRpYyUyMHBvcnRyYWl0JTIwY2luZW1hdGljfGVufDF8fHx8MTc2MTA3MzkyOXww&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "1h 42m",
      rating: 8.1,
      year: "2023",
      category: "Mystery",
    },
    {
      id: "5",
      title: "The Last Mission",
      thumbnail: "https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NjA5OTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "2h 20m",
      rating: 8.7,
      year: "2024",
      category: "Action",
      isNew: true,
    },
    {
      id: "6",
      title: "Night Whispers",
      thumbnail: "https://images.unsplash.com/photo-1595171694538-beb81da39d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJpbGxlciUyMG1vdmllJTIwZGFya3xlbnwxfHx8fDE3NjEwMTg3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "1h 55m",
      rating: 7.9,
      year: "2023",
      category: "Horror",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header Ad */}
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <AdSlot type="header" />
      </div>

      {/* Hero Banner */}
      <div className="relative h-[600px] mb-12">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NjA5OTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Featured"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#E50914] px-3 py-1 rounded text-white text-sm">Featured</span>
              <span className="text-foreground/60">2024 • Action • 2h 45m</span>
            </div>
            <h1 className="text-foreground text-5xl mb-4">The Dark Knight Returns</h1>
            <p className="text-foreground/80 mb-6 text-lg">
              When evil rises, a hero must answer. Experience the ultimate showdown in this gripping action thriller that will keep you on the edge of your seat.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-[#E50914] hover:bg-[#B2070F] text-white"
                onClick={() => router.push("/watch/1")}
              >
                <Play className="w-5 h-5 mr-2 fill-white" />
                Play Now
              </Button>
              <Button size="lg" variant="outline" className="bg-card/60 border-border text-foreground hover:bg-card/80">
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Trending Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-[#E50914]" />
            <h2 className="text-foreground text-2xl">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trendingMovies.map((movie) => (
              <VideoCard
                key={movie.id}
                {...movie}
                onClick={() => router.push(`/watch/${movie.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="movies" className="mb-12">
          <TabsList className="bg-card border border-border mb-6">
            <TabsTrigger value="movies" className="data-[state=active]:bg-[#E50914]">
              Movies
            </TabsTrigger>
            <TabsTrigger value="series" className="data-[state=active]:bg-[#E50914]">
              Series
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-[#E50914]">
              Live TV
            </TabsTrigger>
            <TabsTrigger value="documentaries" className="data-[state=active]:bg-[#E50914]">
              Documentaries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {trendingMovies.map((movie) => (
                <VideoCard
                  key={movie.id}
                  {...movie}
                  onClick={() => router.push(`/watch/${movie.id}`)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="series">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {trendingMovies.slice(0, 4).map((movie) => (
                <VideoCard
                  key={movie.id}
                  {...movie}
                  category="Series"
                  onClick={() => router.push(`/watch/${movie.id}`)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live">
            <div className="text-center text-foreground/60 py-12">
              <p>Live TV content coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="documentaries">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {trendingMovies.slice(0, 3).map((movie) => (
                <VideoCard
                  key={movie.id}
                  {...movie}
                  category="Documentary"
                  onClick={() => router.push(`/watch/${movie.id}`)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Latest Releases */}
        <div className="mb-12">
          <h2 className="text-foreground text-2xl mb-6">Latest Releases</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trendingMovies.map((movie) => (
              <VideoCard
                key={`latest-${movie.id}`}
                {...movie}
                onClick={() => router.push(`/watch/${movie.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
