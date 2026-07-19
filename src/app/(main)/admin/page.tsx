"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Clapperboard, DollarSign, EyeOff, Shield, Trash2, Upload, UserCheck, XCircle } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Textarea } from "@/src/components/ui/textarea";
import { portalService } from "@/src/lib/portal";
import { adminLandingFetchers } from "@/src/lib/fetchers/core";
import type { AdminOverview, MediaItem, PortalUser, Review, ReviewComment, LandingContent, LandingHighlight, LandingTestimonial, LandingFaq } from "@/src/lib/portal/types";

const EMPTY_FORM = {
  title: "",
  synopsis: "",
  genres: "Action,Drama",
  releaseYear: String(new Date().getFullYear()),
  director: "",
  cast: "",
  platforms: "NGV",
  streamingUrl: "",
  poster: "",
  duration: "2h 00m",
};

const MEDIA_PAGE_SIZE = 8;

export default function AdminPage() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [pendingComments, setPendingComments] = useState<ReviewComment[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaTotalPages, setMediaTotalPages] = useState(1);

  // Landing CMS state
  const [highlights, setHighlights] = useState<LandingHighlight[]>([]);
  const [testimonials, setTestimonials] = useState<LandingTestimonial[]>([]);
  const [faqs, setFaqs] = useState<LandingFaq[]>([]);
  const [landingMessage, setLandingMessage] = useState("");
  
  // Landing Form states
  const [highlightForm, setHighlightForm] = useState({ title: "", text: "" });
  const [testimonialForm, setTestimonialForm] = useState({ name: "", quote: "" });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });

  async function loadMedia(page = 1, search = "") {
    const result = await portalService.getMedia({ page, pageSize: MEDIA_PAGE_SIZE, search }) as any;
    setMedia(result.items || []);
    setMediaTotalPages(result.totalPages || 1);
  }

  async function load() {
    const [me, adminOverview, reviews, comments, landingRes] = await Promise.all([
      portalService.getCurrentUser(),
      portalService.getAdminOverview() as Promise<AdminOverview>,
      portalService.getPendingReviews() as Promise<Review[]>,
      portalService.getPendingComments() as Promise<ReviewComment[]>,
      portalService.getLandingContent().catch(() => ({ success: false, data: { highlights: [], testimonials: [], faqs: [] } })) as Promise<any>,
    ]);

    setUser(me);
    setOverview(adminOverview);
    setPendingReviews(reviews);
    setPendingComments(comments);
    
    if (landingRes?.data) {
      setHighlights(landingRes.data.highlights || []);
      setTestimonials(landingRes.data.testimonials || []);
      setFaqs(landingRes.data.faqs || []);
    }
  }

  useEffect(() => {
    async function fetchData() {
      await load();
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (user && user.role === "admin") {
      void loadMedia(mediaPage, mediaSearch);
    }
  }, [mediaPage, mediaSearch, user]);

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
      streamingUrl: form.streamingUrl.trim(),
      poster: form.poster.trim(),
      duration: form.duration.trim(),
    };

    try {
      if (editingId) {
        await portalService.updateMedia(editingId, payload as any);
        setMessage("Media updated successfully.");
      } else {
        await portalService.createMedia(payload as any);
        setMessage("Media created successfully.");
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
      await loadMedia(mediaPage, mediaSearch);
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
      streamingUrl: item.streamingUrl,
      poster: item.poster,
      duration: item.duration,
    });
  }

  async function removeMedia(id: string) {
    await portalService.deleteMedia(id);
    await load();
    await loadMedia(mediaPage, mediaSearch);
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

  // Landing Page CMS Handlers
  async function handleAddHighlight() {
    if (!highlightForm.title || !highlightForm.text) return;
    try {
      await adminLandingFetchers.createHighlight(highlightForm.title, highlightForm.text);
      setHighlightForm({ title: "", text: "" });
      await load();
      setLandingMessage("Highlight added.");
    } catch (err) {
      setLandingMessage(err instanceof Error ? err.message : "Error adding highlight");
    }
  }
  async function handleDeleteHighlight(id: string) {
    await adminLandingFetchers.deleteHighlight(id);
    await load();
  }

  async function handleAddTestimonial() {
    if (!testimonialForm.name || !testimonialForm.quote) return;
    try {
      await adminLandingFetchers.createTestimonial(testimonialForm.name, testimonialForm.quote);
      setTestimonialForm({ name: "", quote: "" });
      await load();
      setLandingMessage("Testimonial added.");
    } catch (err) {
      setLandingMessage(err instanceof Error ? err.message : "Error adding testimonial");
    }
  }
  async function handleDeleteTestimonial(id: string) {
    await adminLandingFetchers.deleteTestimonial(id);
    await load();
  }

  async function handleAddFaq() {
    if (!faqForm.question || !faqForm.answer) return;
    try {
      await adminLandingFetchers.createFaq(faqForm.question, faqForm.answer);
      setFaqForm({ question: "", answer: "" });
      await load();
      setLandingMessage("FAQ added.");
    } catch (err) {
      setLandingMessage(err instanceof Error ? err.message : "Error adding FAQ");
    }
  }
  async function handleDeleteFaq(id: string) {
    await adminLandingFetchers.deleteFaq(id);
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
    <div className="min-h-screen bg-background text-foreground pt-20 transition-colors duration-300">
      <div className="max-w-360 mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-white text-3xl mb-2">Admin Console</h1>
          <p className="text-white/60">Role-based media library management, moderation, reporting and revenue controls.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-[#E50914]" />
                Total Media
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl text-foreground">{overview?.totalMedia ?? 0}</p></CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#E50914]" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl text-foreground">{overview?.pendingReviews ?? 0}</p></CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-[#E50914]" />
                Hidden Comments
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl text-foreground">{overview?.hiddenComments ?? 0}</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="media" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-white/10 flex-wrap h-auto">
            <TabsTrigger value="media" className="data-[state=active]:bg-[#E50914] py-2"><Upload className="w-4 h-4 mr-2" />Media Library</TabsTrigger>
            <TabsTrigger value="moderation" className="data-[state=active]:bg-[#E50914] py-2"><Shield className="w-4 h-4 mr-2" />Moderation</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#E50914] py-2"><BarChart3 className="w-4 h-4 mr-2" />Reports</TabsTrigger>
            <TabsTrigger value="landing" className="data-[state=active]:bg-[#E50914] py-2"><Upload className="w-4 h-4 mr-2" />Landing Page</TabsTrigger>
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
                  <div><Label className="text-white">Release Year</Label><Input type="number" className="bg-zinc-800 border-white/10 text-white" value={form.releaseYear} onChange={(e) => setForm((p) => ({ ...p, releaseYear: e.target.value }))} /></div>
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
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Input
                    value={mediaSearch}
                    onChange={(e) => {
                      setMediaSearch(e.target.value);
                      setMediaPage(1);
                    }}
                    placeholder="Filter by title or year"
                    className="max-w-xs bg-zinc-800 border-white/10 text-white"
                  />
                  <p className="text-white/60 text-sm">Page {mediaPage} of {mediaTotalPages}</p>
                </div>
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
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white"
                    disabled={mediaPage <= 1}
                    onClick={() => setMediaPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white"
                    disabled={mediaPage >= mediaTotalPages}
                    onClick={() => setMediaPage((p) => Math.min(mediaTotalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
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


          <TabsContent value="landing">
            <div className="space-y-6">
              {landingMessage && <p className="text-white/70 bg-black/30 p-2 rounded">{landingMessage}</p>}
              
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Highlights CMS */}
                <Card className="bg-zinc-900 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Highlights</CardTitle>
                    <CardDescription>Platform features and descriptions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Input className="bg-zinc-800 border-white/10 text-white" placeholder="Title" value={highlightForm.title} onChange={e => setHighlightForm(p => ({...p, title: e.target.value}))} />
                      <Textarea className="bg-zinc-800 border-white/10 text-white" placeholder="Description" value={highlightForm.text} onChange={e => setHighlightForm(p => ({...p, text: e.target.value}))} />
                      <Button className="w-full bg-[#E50914] hover:bg-[#B2070F]" onClick={handleAddHighlight}>Add Highlight</Button>
                    </div>
                    <div className="space-y-2 mt-4">
                      {highlights.map(h => (
                        <div key={h.id} className="border border-white/10 p-2 rounded bg-black/30 relative">
                          <p className="text-white text-sm font-medium pr-8">{h.title}</p>
                          <p className="text-white/60 text-xs mt-1">{h.text}</p>
                          <button onClick={() => handleDeleteHighlight(h.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Testimonials CMS */}
                <Card className="bg-zinc-900 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Testimonials</CardTitle>
                    <CardDescription>Viewer reviews and feedback</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Input className="bg-zinc-800 border-white/10 text-white" placeholder="Name & Location" value={testimonialForm.name} onChange={e => setTestimonialForm(p => ({...p, name: e.target.value}))} />
                      <Textarea className="bg-zinc-800 border-white/10 text-white" placeholder="Quote" value={testimonialForm.quote} onChange={e => setTestimonialForm(p => ({...p, quote: e.target.value}))} />
                      <Button className="w-full bg-[#E50914] hover:bg-[#B2070F]" onClick={handleAddTestimonial}>Add Testimonial</Button>
                    </div>
                    <div className="space-y-2 mt-4">
                      {testimonials.map(t => (
                        <div key={t.id} className="border border-white/10 p-2 rounded bg-black/30 relative">
                          <p className="text-white text-sm font-medium pr-8">{t.name}</p>
                          <p className="text-white/60 text-xs mt-1">{t.quote}</p>
                          <button onClick={() => handleDeleteTestimonial(t.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* FAQs CMS */}
                <Card className="bg-zinc-900 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">FAQs</CardTitle>
                    <CardDescription>Common questions and answers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Input className="bg-zinc-800 border-white/10 text-white" placeholder="Question" value={faqForm.question} onChange={e => setFaqForm(p => ({...p, question: e.target.value}))} />
                      <Textarea className="bg-zinc-800 border-white/10 text-white" placeholder="Answer" value={faqForm.answer} onChange={e => setFaqForm(p => ({...p, answer: e.target.value}))} />
                      <Button className="w-full bg-[#E50914] hover:bg-[#B2070F]" onClick={handleAddFaq}>Add FAQ</Button>
                    </div>
                    <div className="space-y-2 mt-4">
                      {faqs.map(f => (
                        <div key={f.id} className="border border-white/10 p-2 rounded bg-black/30 relative">
                          <p className="text-white text-sm font-medium pr-8">{f.question}</p>
                          <p className="text-white/60 text-xs mt-1">{f.answer}</p>
                          <button onClick={() => handleDeleteFaq(f.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
