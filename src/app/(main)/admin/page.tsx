import { BarChart3, DollarSign, Eye, Upload, Users, Video } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Textarea } from "@/src/components/ui/textarea";

export default function Page() {
  const recentUploads = [
    { id: 1, title: "The Dark Knight Returns", status: "Published", views: "12.5K", date: "2024-10-15" },
    { id: 2, title: "Mystery at Midnight", status: "Published", views: "8.3K", date: "2024-10-14" },
    { id: 3, title: "Cinema Paradiso", status: "Draft", views: "0", date: "2024-10-13" },
  ];

  const adStats = [
    { slot: "Header Banner", impressions: "45.2K", revenue: "$256.80", ctr: "2.3%" },
    { slot: "Sidebar", impressions: "38.1K", revenue: "$198.40", ctr: "1.8%" },
    { slot: "Below Player", impressions: "52.7K", revenue: "$342.10", ctr: "3.1%" },
    { slot: "Footer", impressions: "28.9K", revenue: "$145.20", ctr: "1.5%" },
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-3xl mb-2">Admin Panel</h1>
          <p className="text-white/60">Manage content, monitor analytics, and control ad placements</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Video className="w-5 h-5 text-[#E50914]" />
                Total Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-white mb-1">248</p>
              <p className="text-white/60 text-sm">+12 this week</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Users className="w-5 h-5 text-[#E50914]" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-white mb-1">5.2K</p>
              <p className="text-white/60 text-sm">+342 today</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Eye className="w-5 h-5 text-[#E50914]" />
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-white mb-1">128K</p>
              <p className="text-white/60 text-sm">+8.4K this week</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5 text-[#E50914]" />
                Ad Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-white mb-1">$942.50</p>
              <p className="text-white/60 text-sm">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-white/10">
            <TabsTrigger value="upload" className="data-[state=active]:bg-[#E50914]">
              <Upload className="w-4 h-4 mr-2" />
              Upload Content
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#E50914]">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-[#E50914]">
              <DollarSign className="w-4 h-4 mr-2" />
              Ad Management
            </TabsTrigger>
          </TabsList>

          {/* Upload Content Tab */}
          <TabsContent value="upload">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Upload New Content</CardTitle>
                  <CardDescription>Add movies, series, or live content to the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter video title"
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter video description"
                      className="bg-zinc-800 border-white/10 text-white min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-white">Category</Label>
                      <Select>
                        <SelectTrigger className="bg-zinc-800 border-white/10 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-white/10 text-white">
                          <SelectItem value="action">Action</SelectItem>
                          <SelectItem value="drama">Drama</SelectItem>
                          <SelectItem value="thriller">Thriller</SelectItem>
                          <SelectItem value="comedy">Comedy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="year" className="text-white">Year</Label>
                      <Input
                        id="year"
                        placeholder="2024"
                        className="bg-zinc-800 border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="videoUrl" className="text-white">Video URL</Label>
                    <Input
                      id="videoUrl"
                      placeholder="https://example.com/video.mp4"
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="thumbnail" className="text-white">Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      placeholder="https://example.com/thumbnail.jpg"
                      className="bg-zinc-800 border-white/10 text-white"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button className="bg-[#E50914] hover:bg-[#B2070F] text-white flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Publish
                    </Button>
                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                      Save as Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Recent Uploads</CardTitle>
                  <CardDescription>Latest content added to the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white">Title</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Views</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentUploads.map((upload) => (
                        <TableRow key={upload.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white">{upload.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant={upload.status === "Published" ? "default" : "secondary"}
                              className={upload.status === "Published" ? "bg-green-600" : ""}
                            >
                              {upload.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">{upload.views}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Platform Analytics</CardTitle>
                  <CardDescription>Overview of platform performance and user engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border border-white/10 rounded-lg">
                    <p className="text-white/40">Analytics Chart Placeholder</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <p className="text-white/60 text-sm mb-1">Avg. Watch Time</p>
                      <p className="text-white text-2xl">32m 15s</p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <p className="text-white/60 text-sm mb-1">Completion Rate</p>
                      <p className="text-white text-2xl">68%</p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <p className="text-white/60 text-sm mb-1">Bounce Rate</p>
                      <p className="text-white text-2xl">22%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Top Performing Content</CardTitle>
                  <CardDescription>Most viewed videos this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-white">Rank</TableHead>
                        <TableHead className="text-white">Title</TableHead>
                        <TableHead className="text-white">Views</TableHead>
                        <TableHead className="text-white">Avg. Time</TableHead>
                        <TableHead className="text-white">Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">1</TableCell>
                        <TableCell className="text-white">The Dark Knight Returns</TableCell>
                        <TableCell className="text-white">12.5K</TableCell>
                        <TableCell className="text-white">45m</TableCell>
                        <TableCell className="text-white">8.9</TableCell>
                      </TableRow>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">2</TableCell>
                        <TableCell className="text-white">Mystery at Midnight</TableCell>
                        <TableCell className="text-white">8.3K</TableCell>
                        <TableCell className="text-white">38m</TableCell>
                        <TableCell className="text-white">8.5</TableCell>
                      </TableRow>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">3</TableCell>
                        <TableCell className="text-white">Cinema Paradiso</TableCell>
                        <TableCell className="text-white">7.2K</TableCell>
                        <TableCell className="text-white">42m</TableCell>
                        <TableCell className="text-white">9.2</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ad Management Tab */}
          <TabsContent value="ads">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Advertisement Performance</CardTitle>
                <CardDescription>Monitor ad slots performance and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white">Ad Slot</TableHead>
                      <TableHead className="text-white">Impressions</TableHead>
                      <TableHead className="text-white">Revenue</TableHead>
                      <TableHead className="text-white">CTR</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adStats.map((stat, index) => (
                      <TableRow key={index} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">{stat.slot}</TableCell>
                        <TableCell className="text-white">{stat.impressions}</TableCell>
                        <TableCell className="text-white">{stat.revenue}</TableCell>
                        <TableCell className="text-white">{stat.ctr}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-600">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white mb-1">Total Monthly Revenue</h3>
                      <p className="text-3xl text-white">$942.50</p>
                    </div>
                    <Button className="bg-[#E50914] hover:bg-[#B2070F] text-white">
                      Generate Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
