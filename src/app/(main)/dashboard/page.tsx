import { Heart, LogOut, Settings, User, Clock } from "lucide-react";

import { VideoCard } from "@/src/components/VideoCard";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

export default function Page() {
  const watchHistory = [
    {
      id: "1",
      title: "The Dark Knight Returns",
      thumbnail: "https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBtb3ZpZSUyMHBvc3RlcnxlbnwxfHx8fDE3NjA5OTU2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "2h 45m",
      rating: 8.9,
      year: "2024",
      category: "Action",
      progress: 45,
    },
    {
      id: "2",
      title: "Mystery at Midnight",
      thumbnail: "https://images.unsplash.com/photo-1595171694538-beb81da39d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aHJpbGxlciUyMG1vdmllJTIwZGFya3xlbnwxfHx8fDE3NjEwMTg3NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "1h 58m",
      rating: 8.5,
      year: "2024",
      category: "Thriller",
      progress: 78,
    },
  ];

  const favorites = [
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
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-zinc-900 rounded-lg p-8 mb-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-[#E50914] text-white text-2xl">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-white text-3xl mb-2">John Doe</h1>
              <p className="text-white/60">john.doe@example.com</p>
              <p className="text-white/60 text-sm mt-2">Member since January 2024</p>
            </div>
            <Button className="bg-[#E50914] hover:bg-[#B2070F] text-white">
              <Settings className="w-4 h-4 mr-2" />
              Manage Account
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E50914]" />
                Watch Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-white mb-1">24h 32m</p>
              <CardDescription>Total hours watched</CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#E50914]" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-white mb-1">12</p>
              <CardDescription>Movies & series saved</CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#E50914]" />
                Account Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-white mb-1">Free</p>
              <CardDescription>Ad-supported access</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="history" className="mb-8">
          <TabsList className="bg-zinc-900 border border-white/10">
            <TabsTrigger value="history" className="data-[state=active]:bg-[#E50914]">
              <Clock className="w-4 h-4 mr-2" />
              Watch History
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-[#E50914]">
              <Heart className="w-4 h-4 mr-2" />
              My Favorites
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#E50914]">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-6">
            <div className="bg-zinc-900 rounded-lg p-6">
              <h2 className="text-white text-xl mb-6">Continue Watching</h2>
              <div className="space-y-4">
                {watchHistory.map((video) => (
                  <div key={video.id} className="flex gap-4 group cursor-pointer">
                    <div className="relative w-48 aspect-video rounded overflow-hidden flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                          className="h-full bg-[#E50914]"
                          style={{ width: `${video.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white text-lg mb-2">{video.title}</h3>
                      <p className="text-white/60 text-sm mb-1">
                        {video.year} • {video.category} • {video.duration}
                      </p>
                      <p className="text-white/60 text-sm">⭐ {video.rating}</p>
                      <p className="text-white/40 text-sm mt-2">{video.progress}% completed</p>
                    </div>
                    <Button className="bg-[#E50914] hover:bg-[#B2070F] text-white self-center">
                      Continue
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <div className="bg-zinc-900 rounded-lg p-6">
              <h2 className="text-white text-xl mb-6">Your Favorite Content</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {favorites.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Profile Settings</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Full Name</Label>
                    <Input
                      id="name"
                      defaultValue="John Doe"
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>
                  <Button className="bg-[#E50914] hover:bg-[#B2070F] text-white w-full">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Account Actions</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10">
                    Privacy Settings
                  </Button>
                  <Separator className="bg-white/10" />
                  <Button variant="destructive" className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
