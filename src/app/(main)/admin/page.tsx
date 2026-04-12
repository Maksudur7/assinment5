"use client";

import { useEffect, useState } from "react";
import { BarChart3, DollarSign, Shield, Trash2, Upload, UserCheck, XCircle } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Textarea } from "@/src/components/ui/textarea";
import { portalService } from "@/src/lib/portal";
import type { AdminOverview, MediaItem, PortalUser, Review, ReviewComment } from "@/src/lib/portal/types";

const EMPTY_FORM = {
  title: "",
  synopsis: "",
  genres: "Action,Drama",
  releaseYear: String(new Date().getFullYear()),
  director: "",
  cast: "",
  platforms: "NGV",
  pricing: "premium" as "free" | "premium",
  streamingUrl: "",
  poster: "",
  duration: "2h 00m",
};

export default function AdminPage() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [pendingComments, setPendingComments] = useState<ReviewComment[]>([]);
  const [purchases, setPurchases] = useState<Array<{ id: string; type: string; amount: number; status: string; createdAt: string }>>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const [me, adminOverview, mediaResult, reviews, comments, purchaseHistory] = await Promise.all([
      portalService.getCurrentUser(),
      portalService.getAdminOverview(),
      portalService.getMedia({ page: 1, pageSize: 100 }),
      portalService.getPendingReviews(),
      portalService.getPendingComments(),
      portalService.getAllPurchases(),
    ]);

    setUser(me);
    setOverview(adminOverview);
    setMedia(mediaResult.items);
    setPendingReviews(reviews);
    setPendingComments(comments);
    setPurchases(
      purchaseHistory.map((p) => ({
        id: p.id,
        type: p.type,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
      })),
    );
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveMedia() {
    setMessage("");
    const payload = {
      title: form.title.trim(),
      synopsis: form.synopsis.trim(),
      genres: form.genres.split(",").map((x) => x.trim()).filter(Boolean),
      releaseYear: Number(form.releaseYear),
      director: form.director.trim(),
      cast: form.cast.split(",").map((x) => x.trim()).filter(Boolean),
      platforms: form.platforms.split(",").map((x) => x.trim()).filter(Boolean),
      pricing: form.pricing,
      streamingUrl: form.streamingUrl.trim(),
      poster: form.poster.trim(),
      duration: form.duration.trim(),
    };

    try {
      if (editingId) {
        await portalService.updateMedia(editingId, payload);
        setMessage("Media updated successfully.");
      } else {
        await portalService.createMedia(payload);
        setMessage("Media created successfully.");
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save media");
    }
  }

  async function editMedia(item: MediaItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      synopsis: item.synopsis,
      genres: item.genres.join(","),
      releaseYear: String(item.releaseYear),
      director: item.director,
      cast: item.cast.join(","),
      platforms: item.platforms.join(","),
      pricing: item.pricing,
      streamingUrl: item.streamingUrl,
      poster: item.poster,
      duration: item.duration,
    });
  }

  async function removeMedia(id: string) {
    await portalService.deleteMedia(id);
    await load();
  }

  async function approveReview(id: string) {
    await portalService.approveReview(id);
    await load();
  }

  async function unpublishReview(id: string) {
    await portalService.unpublishReview(id);
    await load();
  }

  async function removeReview(id: string) {
    await portalService.removeReview(id);
    await load();
  }

  async function approveComment(id: string) {
    await portalService.approveComment(id);
    await load();
  }

  async function unpublishComment(id: string) {
    await portalService.unpublishComment(id);
    await load();
  }

  async function removeComment(id: string) {
    await portalService.removeComment(id);
    await load();
  }

  async function revokePurchase(id: string) {
    await portalService.revokePurchase(id);
    await load();
  }

  if (!user) {
    return <div className="min-h-screen bg-black pt-24 text-center text-white/70">Loading admin console...</div>;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-black pt-24 px-6">
        <div className="max-w-2xl mx-auto bg-zinc-900 border border-white/10 rounded-lg p-8 text-center">
          <h1 className="text-white text-3xl mb-2">Admin Access Required</h1>
          <p className="text-white/70 mb-6">You are currently logged in as <span className="text-white">{user.email}</span>.</p>
          <p className="text-white/60">Please login with an admin account to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-white text-3xl mb-2">Admin Console</h1>
          <p className="text-white/60">Role-based media library management, moderation, reporting and revenue controls.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-white/10"><CardHeader className="pb-3"><CardTitle className="text-white text-base">Total Media</CardTitle></CardHeader><CardContent><p className="text-3xl text-white">{overview?.totalMedia ?? 0}</p></CardContent></Card>
          <Card className="bg-zinc-900 border-white/10"><CardHeader className="pb-3"><CardTitle className="text-white text-base">Pending Reviews</CardTitle></CardHeader><CardContent><p className="text-3xl text-white">{overview?.pendingReviews ?? 0}</p></CardContent></Card>
          <Card className="bg-zinc-900 border-white/10"><CardHeader className="pb-3"><CardTitle className="text-white text-base">Hidden Comments</CardTitle></CardHeader><CardContent><p className="text-3xl text-white">{overview?.hiddenComments ?? 0}</p></CardContent></Card>
          <Card className="bg-zinc-900 border-white/10"><CardHeader className="pb-3"><CardTitle className="text-white text-base">Revenue</CardTitle></CardHeader><CardContent><p className="text-3xl text-white">${(overview?.totalRevenue ?? 0).toFixed(2)}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="media" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-white/10">
            <TabsTrigger value="media" className="data-[state=active]:bg-[#E50914]"><Upload className="w-4 h-4 mr-2" />Media Library</TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-[#E50914]"><Shield className="w-4 h-4 mr-2" />Moderation</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#E50914]"><BarChart3 className="w-4 h-4 mr-2" />Reports</TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-[#E50914]"><DollarSign className="w-4 h-4 mr-2" />Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">{editingId ? "Edit Media" : "Add New Media"}</CardTitle>
                <CardDescription>Title, metadata, platform and streaming source</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div><Label className="text-white">Title</Label><Input className="bg-zinc-800 border-white/10 text-white" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
                <div><Label className="text-white">Synopsis</Label><Textarea className="bg-zinc-800 border-white/10 text-white" value={form.synopsis} onChange={(e) => setForm((p) => ({ ...p, synopsis: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-white">Genres (comma)</Label><Input className="bg-zinc-800 border-white/10 text-white" value={form.genres} onChange={(e) => setForm((p) => ({ ...p, genres: e.target.value }))} /></div>
                  <div><Label className="text-white">Release Year</Label><Input className="bg-zinc-800 border-white/10 text-white" value={form.releaseYear} onChange={(e) => setForm((p) => ({ ...p, releaseYear: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-white">Director</Label><Input className="bg-zinc-800 border-white/10 text-white" value={form.director} onChange={(e) => setForm((p) => ({ ...p, director: e.target.value }))} /></div>
                  <div><Label className="text-white">Cast (comma)</Label><Input className="bg-zinc-800 border-white/10 text-white" value={form.cast} onChange={(e) => setForm((p) => ({ ...p, cast: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-white">Platforms (comma)</Label><Input className="bg-zinc-800 border-white/10 text-white" value={form.platforms} onChange={(e) => setForm((p) => ({ ...p, platforms: e.target.value }))} /></div>
                  <div><Label className="text-white">Duration</Label><Input className="bg-zinc-800 border-white/10 text-white" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-white">Streaming URL</Label><Input className="bg-zinc-800 border-white/10 text-white" value={form.streamingUrl} onChange={(e) => setForm((p) => ({ ...p, streamingUrl: e.target.value }))} /></div>
                  <div><Label className="text-white">Poster URL</Label><Input className="bg-zinc-800 border-white/10 text-white" value={form.poster} onChange={(e) => setForm((p) => ({ ...p, poster: e.target.value }))} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={saveMedia} className="bg-[#E50914] hover:bg-[#B2070F]">{editingId ? "Update" : "Create"}</Button>
                  {editingId ? <Button variant="outline" className="bg-white/5 border-white/10 text-white" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}>Cancel Edit</Button> : null}
                </div>
                {message ? <p className="text-sm text-white/70">{message}</p> : null}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Current Media Library</CardTitle>
                <CardDescription>Update or remove titles from catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10"><TableHead className="text-white">Title</TableHead><TableHead className="text-white">Year</TableHead><TableHead className="text-white">Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {media.map((m) => (
                      <TableRow key={m.id} className="border-white/10">
                        <TableCell className="text-white">{m.title}</TableCell>
                        <TableCell className="text-white/70">{m.releaseYear}</TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white" onClick={() => void editMedia(m)}>Edit</Button>
                          <Button size="sm" variant="outline" className="bg-red-900/20 border-red-700 text-red-300" onClick={() => void removeMedia(m.id)}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader><CardTitle className="text-white">Review Moderation</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pendingReviews.length === 0 ? <p className="text-white/60">No pending reviews.</p> : pendingReviews.map((r) => (
                  <div key={r.id} className="border border-white/10 rounded-md p-3 bg-black/30">
                    <p className="text-white">{r.userName} • {r.rating}/10</p>
                    <p className="text-white/70 text-sm">{r.content}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="bg-green-700 hover:bg-green-600" onClick={() => void approveReview(r.id)}><UserCheck className="w-3 h-3 mr-1" />Approve</Button>
                      <Button size="sm" variant="outline" className="bg-yellow-900/20 border-yellow-700 text-yellow-300" onClick={() => void unpublishReview(r.id)}><XCircle className="w-3 h-3 mr-1" />Unpublish</Button>
                      <Button size="sm" variant="outline" className="bg-red-900/20 border-red-700 text-red-300" onClick={() => void removeReview(r.id)}><Trash2 className="w-3 h-3 mr-1" />Remove</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
              <CardHeader><CardTitle className="text-white">Comment Moderation</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pendingComments.length === 0 ? <p className="text-white/60">No hidden comments currently.</p> : pendingComments.map((c) => (
                  <div key={c.id} className="border border-white/10 rounded-md p-3 bg-black/30">
                    <p className="text-white">{c.userName}</p>
                    <p className="text-white/70 text-sm">{c.content}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="bg-green-700 hover:bg-green-600" onClick={() => void approveComment(c.id)}>Approve</Button>
                      <Button size="sm" variant="outline" className="bg-yellow-900/20 border-yellow-700 text-yellow-300" onClick={() => void unpublishComment(c.id)}>Hide</Button>
                      <Button size="sm" variant="outline" className="bg-red-900/20 border-red-700 text-red-300" onClick={() => void removeComment(c.id)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Aggregated Ratings & Most Reviewed</CardTitle>
                <CardDescription>High-level insights for editorial and moderation decisions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(overview?.mostReviewed ?? []).map((row) => (
                  <div key={row.mediaId} className="flex items-center justify-between border border-white/10 rounded-md p-3 bg-black/30">
                    <div>
                      <p className="text-white">{row.title}</p>
                      <p className="text-white/60 text-sm">Reviews: {row.totalReviews}</p>
                    </div>
                    <Badge className="bg-[#E50914]">Avg {row.avgRating.toFixed(1)}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Sales / Rental Analytics</CardTitle>
                <CardDescription>Optional refunds & access revocation controls included</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <div className="rounded-md bg-black/30 border border-white/10 p-3"><p className="text-white/60 text-sm">Total Sales</p><p className="text-white text-2xl">{overview?.totalSales ?? 0}</p></div>
                  <div className="rounded-md bg-black/30 border border-white/10 p-3"><p className="text-white/60 text-sm">Total Rentals</p><p className="text-white text-2xl">{overview?.totalRentals ?? 0}</p></div>
                  <div className="rounded-md bg-black/30 border border-white/10 p-3"><p className="text-white/60 text-sm">Active Purchases</p><p className="text-white text-2xl">{overview?.activePurchases ?? 0}</p></div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10"><TableHead className="text-white">Type</TableHead><TableHead className="text-white">Amount</TableHead><TableHead className="text-white">Status</TableHead><TableHead className="text-white">Date</TableHead><TableHead className="text-white">Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((p) => (
                      <TableRow key={p.id} className="border-white/10">
                        <TableCell className="text-white uppercase">{p.type}</TableCell>
                        <TableCell className="text-white">${p.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-white/70">{p.status}</TableCell>
                        <TableCell className="text-white/70">{new Date(p.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          {p.status === "active" ? (
                            <Button size="sm" variant="outline" className="bg-yellow-900/20 border-yellow-700 text-yellow-300" onClick={() => void revokePurchase(p.id)}>Revoke/Refund</Button>
                          ) : (
                            <Badge variant="outline" className="border-white/20 text-white/70">Closed</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
