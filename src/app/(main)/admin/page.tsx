"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart3, Clapperboard, DollarSign, EyeOff, Shield, Trash2, Upload, UserCheck, XCircle, Layers, Plus, CheckCircle2 } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Textarea } from "@/src/components/ui/textarea";
import { portalService } from "@/src/lib/portal";
import { getStoredUser } from "@/src/lib/portal/storage";
import { adminLandingFetchers } from "@/src/lib/fetchers/core";
import type { AdminOverview, MediaItem, PortalUser, Review, ReviewComment, LandingContent, LandingHighlight, LandingTestimonial, LandingFaq } from "@/src/lib/portal/types";
import { NGVActionOverlay } from "@/src/components/ui/NGVLoader";

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

function AdminPageInner() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "media";
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Landing CMS state
  const [highlights, setHighlights] = useState<LandingHighlight[]>([]);
  const [testimonials, setTestimonials] = useState<LandingTestimonial[]>([]);
  const [faqs, setFaqs] = useState<LandingFaq[]>([]);
  const [landingMessage, setLandingMessage] = useState("");

  // Landing Form states
  const [highlightForm, setHighlightForm] = useState({ title: "", text: "" });
  const [testimonialForm, setTestimonialForm] = useState({ name: "", quote: "" });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });

  // Dynamic categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [categoryIconInput, setCategoryIconInput] = useState("Film");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Users management state
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = allUsers.filter((u) => {
    if (!userSearch.trim()) return true;
    const query = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query))
    );
  });

  async function loadMedia(page = 1, search = "") {
    const result = await portalService.getMedia({ page, pageSize: MEDIA_PAGE_SIZE, search }) as any;
    setMedia(result.items || []);
    setMediaTotalPages(result.totalPages || 1);
  }

  async function load() {
    try {
      const me = await portalService.getCurrentUser().catch(() => null);
      const stored = getStoredUser();

      const currentUser = me || (stored ? {
        id: stored.id,
        name: stored.name,
        email: stored.email,
        role: stored.role,
        hasPassword: true,
      } : null);

      setUser(currentUser as PortalUser | null);

      const userRole = String(currentUser?.role || stored?.role || "").toLowerCase();

      if (userRole === "admin") {
        const [adminOverview, reviews, comments, landingRes, cats, usersList] = await Promise.all([
          portalService.getAdminOverview().catch(() => null) as Promise<AdminOverview>,
          portalService.getPendingReviews().catch(() => []) as Promise<Review[]>,
          portalService.getPendingComments().catch(() => []) as Promise<ReviewComment[]>,
          portalService.getLandingContent().catch(() => ({ success: false, data: { highlights: [], testimonials: [], faqs: [] } })) as Promise<any>,
          (portalService as any).getCategories().catch(() => []),
          (portalService as any).getAdminUsers().catch(() => []),
        ]);

        setOverview(adminOverview);
        setPendingReviews(reviews || []);
        setPendingComments(comments || []);
        setCategories(cats || []);
        setAllUsers(usersList || []);

        if (landingRes?.data) {
          setHighlights(landingRes.data.highlights || []);
          setTestimonials(landingRes.data.testimonials || []);
          setFaqs(landingRes.data.faqs || []);
        }
      }
    } catch (e) {
      console.error("Failed to load admin data:", e);
    }
  }

  async function handleAddCategory() {
    if (!categoryNameInput.trim()) return;
    setActionLoading("Creating category...");
    try {
      await (portalService as any).createCategory(categoryNameInput.trim(), categoryIconInput.trim());
      setCategoryNameInput("");
      const updatedCats = await (portalService as any).getCategories();
      setCategories(updatedCats || []);
      setLandingMessage("Category created successfully.");
    } catch (err) {
      setLandingMessage(err instanceof Error ? err.message : "Error creating category");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteCategory(id: string) {
    setActionLoading("Deleting category...");
    try {
      await (portalService as any).deleteCategory(id);
      const updatedCats = await (portalService as any).getCategories();
      setCategories(updatedCats || []);
      setLandingMessage("Category deleted successfully.");
    } catch (err) {
      setLandingMessage(err instanceof Error ? err.message : "Error deleting category");
    } finally {
      setActionLoading(null);
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
    const finalGenres = Array.from(new Set(
      selectedCategories.length > 0
        ? selectedCategories
        : form.genres.split(",").map((x) => x.trim()).filter(Boolean)
    ));

    const payload = {
      title: form.title.trim(),
      synopsis: form.synopsis.trim(),
      genres: finalGenres,
      releaseYear: Number(form.releaseYear),
      director: form.director.trim(),
      cast: form.cast.split(",").map((x) => x.trim()).filter(Boolean),
      platforms: form.platforms.split(",").map((x) => x.trim()).filter(Boolean),
      streamingUrl: form.streamingUrl.trim(),
      poster: form.poster.trim(),
      duration: form.duration.trim(),
    };

    setActionLoading(editingId ? "Updating media item..." : "Creating media item...");
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
      setSelectedCategories([]);
      await load();
      await loadMedia(mediaPage, mediaSearch);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save media");
    } finally {
      setActionLoading(null);
    }
  }

  async function editMedia(item: MediaItem) {
    setEditingId(item.id);
    const itemGenres = Array.isArray(item.genres) ? item.genres.map((g) => g.trim()).filter(Boolean) : [];
    setSelectedCategories(itemGenres);
    setForm({
      title: item.title,
      synopsis: item.synopsis,
      genres: itemGenres.join(", "),
      releaseYear: String(item.releaseYear),
      director: item.director,
      cast: item.cast.join(", "),
      platforms: item.platforms.join(", "),
      streamingUrl: item.streamingUrl,
      poster: item.poster,
      duration: item.duration,
    });
  }

  async function removeMedia(id: string) {
    setActionLoading("Deleting media item...");
    try {
      await portalService.deleteMedia(id);
      await load();
      await loadMedia(mediaPage, mediaSearch);
    } catch (err) {
      console.error("Error deleting media:", err);
    } finally {
      setActionLoading(null);
    }
  }

  async function approveReview(id: string) {
    setActionLoading("Approving review...");
    try {
      await portalService.approveReview(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function unpublishReview(id: string) {
    setActionLoading("Unpublishing review...");
    try {
      await portalService.unpublishReview(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function removeReview(id: string) {
    setActionLoading("Deleting review...");
    try {
      await portalService.removeReview(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function approveComment(id: string) {
    setActionLoading("Approving comment...");
    try {
      await portalService.approveComment(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function unpublishComment(id: string) {
    setActionLoading("Hiding comment...");
    try {
      await portalService.unpublishComment(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function removeComment(id: string) {
    setActionLoading("Deleting comment...");
    try {
      await portalService.removeComment(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  // Landing Page CMS Handlers
  async function handleAddHighlight() {
    if (!highlightForm.title || !highlightForm.text) return;
    setActionLoading("Creating highlight...");
    try {
      await adminLandingFetchers.createHighlight(highlightForm.title, highlightForm.text);
      setHighlightForm({ title: "", text: "" });
      await load();
      setLandingMessage("Highlight added.");
    } catch (err) {
      setLandingMessage(err instanceof Error ? err.message : "Error adding highlight");
    } finally {
      setActionLoading(null);
    }
  }
  async function handleDeleteHighlight(id: string) {
    setActionLoading("Deleting highlight...");
    try {
      await adminLandingFetchers.deleteHighlight(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddTestimonial() {
    if (!testimonialForm.name || !testimonialForm.quote) return;
    setActionLoading("Creating testimonial...");
    try {
      await adminLandingFetchers.createTestimonial(testimonialForm.name, testimonialForm.quote);
      setTestimonialForm({ name: "", quote: "" });
      await load();
      setLandingMessage("Testimonial added.");
    } catch (err) {
      setLandingMessage(err instanceof Error ? err.message : "Error adding testimonial");
    } finally {
      setActionLoading(null);
    }
  }
  async function handleDeleteTestimonial(id: string) {
    setActionLoading("Deleting testimonial...");
    try {
      await adminLandingFetchers.deleteTestimonial(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddFaq() {
    if (!faqForm.question || !faqForm.answer) return;
    setActionLoading("Creating FAQ...");
    try {
      await adminLandingFetchers.createFaq(faqForm.question, faqForm.answer);
      setFaqForm({ question: "", answer: "" });
      await load();
      setLandingMessage("FAQ added.");
    } catch (err) {
      setLandingMessage(err instanceof Error ? err.message : "Error adding FAQ");
    } finally {
      setActionLoading(null);
    }
  }
  async function handleDeleteFaq(id: string) {
    setActionLoading("Deleting FAQ...");
    try {
      await adminLandingFetchers.deleteFaq(id);
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleUserRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setActionLoading(`Updating user role to ${newRole}...`);
    try {
      await (portalService as any).updateUserRole(userId, newRole);
      const updatedUsers = await (portalService as any).getAdminUsers();
      setAllUsers(updatedUsers || []);
      const updatedOverview = await portalService.getAdminOverview().catch(() => null);
      setOverview(updatedOverview);
    } catch (err) {
      console.error("Failed to update user role:", err);
    } finally {
      setActionLoading(null);
    }
  }

  if (!user) {
    return <div className="min-h-screen bg-black pt-24 text-center text-white/70">Loading admin console...</div>;
  }

  const isAdminUser = String(user?.role || getStoredUser()?.role || "").toLowerCase() === "admin";

  if (!isAdminUser) {
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
    <div className="min-h-screen bg-background text-foreground pt-20 transition-colors duration-300 relative">
      {/* NGV Netflix-Style Action Overlay Loader */}
      {actionLoading && <NGVActionOverlay text={actionLoading} />}

      <div className="max-w-360 mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-white text-3xl mb-2">Admin Console</h1>
          <p className="text-white/60">Role-based media library management, moderation, reporting and user access controls.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#E50914]" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{overview?.totalUsers ?? allUsers.length}</p></CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-[#E50914]" />
                Total Media
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{overview?.totalMedia ?? 0}</p></CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#E50914]" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{overview?.pendingReviews ?? 0}</p></CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-[#E50914]" />
                Hidden Comments
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{overview?.hiddenComments ?? 0}</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="bg-zinc-900 border border-white/10 flex-wrap h-auto">
            <TabsTrigger value="media" className="data-[state=active]:bg-[#E50914] py-2"><Upload className="w-4 h-4 mr-2" />Media Library</TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-[#E50914] py-2"><Layers className="w-4 h-4 mr-2" />Categories</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#E50914] py-2"><UserCheck className="w-4 h-4 mr-2" />Users & Access</TabsTrigger>
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
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-white">Genres / Categories</Label>
                    {categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2 p-3 bg-zinc-800/40 rounded-lg border border-white/5">
                        {categories.map((cat) => {
                          const isChecked = selectedCategories.some((c) => c.toLowerCase() === cat.name.toLowerCase());
                          return (
                            <label key={cat.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors select-none ${isChecked ? "bg-[#E50914] text-white" : "bg-zinc-800 text-white/70 hover:bg-zinc-700"}`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const updated = isChecked
                                    ? selectedCategories.filter((c) => c.toLowerCase() !== cat.name.toLowerCase())
                                    : [...selectedCategories, cat.name];
                                  setSelectedCategories(updated);
                                  setForm((p) => ({ ...p, genres: updated.join(", ") }));
                                }}
                                className="accent-white h-3.5 w-3.5"
                              />
                              {cat.name}
                            </label>
                          );
                        })}
                      </div>
                    )}
                    <Input
                      className="bg-zinc-800 border-white/10 text-white placeholder:text-zinc-500"
                      placeholder="e.g. Action, Drama"
                      value={form.genres}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((p) => ({ ...p, genres: val }));
                        setSelectedCategories(val.split(",").map((x) => x.trim()).filter(Boolean));
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                  <Button onClick={saveMedia} className="bg-[#E50914] hover:bg-[#B2070F]" disabled={!!actionLoading}>
                    {editingId ? "Update" : "Create"}
                  </Button>
                  {editingId ? <Button variant="outline" className="bg-white/5 border-white/10 text-white" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setSelectedCategories([]); }}>Cancel Edit</Button> : null}
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
                           <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white" disabled={!!actionLoading} onClick={() => void editMedia(m)}>Edit</Button>
                           <Button size="sm" variant="outline" className="bg-red-900/20 border-red-700 text-red-300" disabled={!!actionLoading} onClick={() => void removeMedia(m.id)}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Review Moderation Queue
                  </CardTitle>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    {pendingReviews.length} Pending
                  </Badge>
                </div>
                <CardDescription>Approve, unpublish or permanently remove pending movie & series reviews</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-10 border border-white/5 rounded-lg bg-black/20">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2 opacity-80" />
                    <p className="text-white font-medium">All Clean!</p>
                    <p className="text-white/50 text-sm">No pending user reviews requiring moderation.</p>
                  </div>
                ) : (
                  pendingReviews.map((r) => (
                    <div key={r.id} className="border border-white/10 rounded-lg p-4 bg-black/40 space-y-3 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-sm">{r.userName}</span>
                          <span className="text-xs text-white/40">•</span>
                          <span className="text-xs text-red-400 font-bold">★ {r.rating}/10</span>
                        </div>
                        <span className="text-xs text-white/40">{r.mediaTitle || "Media Item"}</span>
                      </div>
                      <p className="text-white/80 text-sm italic bg-zinc-800/50 p-2.5 rounded border border-white/5">"{r.content}"</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs" disabled={!!actionLoading} onClick={() => void approveReview(r.id)}>
                          <UserCheck className="w-3.5 h-3.5 mr-1" /> Approve & Publish
                        </Button>
                        <Button size="sm" variant="outline" className="bg-amber-900/20 border-amber-700/60 text-amber-300 hover:bg-amber-900/40 text-xs" disabled={!!actionLoading} onClick={() => void unpublishReview(r.id)}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Unpublish
                        </Button>
                        <Button size="sm" variant="outline" className="bg-red-900/20 border-red-700/60 text-red-300 hover:bg-red-900/40 text-xs" disabled={!!actionLoading} onClick={() => void removeReview(r.id)}>
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-red-500" />
                    Comment Moderation Queue
                  </CardTitle>
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {pendingComments.length} Flagged
                  </Badge>
                </div>
                <CardDescription>Moderate reported or hidden comments on user reviews</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingComments.length === 0 ? (
                  <div className="text-center py-10 border border-white/5 rounded-lg bg-black/20">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2 opacity-80" />
                    <p className="text-white font-medium">Comments Moderated!</p>
                    <p className="text-white/50 text-sm">No flagged or hidden comments currently.</p>
                  </div>
                ) : (
                  pendingComments.map((c) => (
                    <div key={c.id} className="border border-white/10 rounded-lg p-4 bg-black/40 space-y-3 hover:border-white/20 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-sm">{c.userName}</span>
                        <span className="text-xs text-white/40">{c.reviewTitle ? `on "${c.reviewTitle}"` : "Comment"}</span>
                      </div>
                      <p className="text-white/80 text-sm bg-zinc-800/50 p-2.5 rounded border border-white/5">"{c.content}"</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs" disabled={!!actionLoading} onClick={() => void approveComment(c.id)}>
                          Approve Comment
                        </Button>
                        <Button size="sm" variant="outline" className="bg-amber-900/20 border-amber-700/60 text-amber-300 hover:bg-amber-900/40 text-xs" disabled={!!actionLoading} onClick={() => void unpublishComment(c.id)}>
                          Hide
                        </Button>
                        <Button size="sm" variant="outline" className="bg-red-900/20 border-red-700/60 text-red-300 hover:bg-red-900/40 text-xs" disabled={!!actionLoading} onClick={() => void removeComment(c.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-red-500" />
                      Content Analytics & Popular Titles
                    </CardTitle>
                    <CardDescription>Top rated movies & web series calculated from real user engagement</CardDescription>
                  </div>
                  <Badge className="bg-red-600 text-white">Live Platform Rankings</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(!overview?.mostReviewed || overview.mostReviewed.length === 0) ? (
                  <div className="text-center py-10 border border-white/5 rounded-lg bg-black/20">
                    <p className="text-white/60">No analytics data recorded yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white">Rank & Title</TableHead>
                        <TableHead className="text-white text-center">Total Reviews</TableHead>
                        <TableHead className="text-white text-right">Average Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.mostReviewed.map((row, index) => (
                        <TableRow key={row.mediaId} className="border-white/10 hover:bg-white/5 transition-colors">
                          <TableCell className="text-white font-semibold flex items-center gap-3">
                            <div className="w-7 h-7 rounded bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center font-bold text-xs">
                              #{index + 1}
                            </div>
                            <span>{row.title}</span>
                          </TableCell>
                          <TableCell className="text-center text-white/70">{row.totalReviews} user reviews</TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-red-600 text-white font-bold px-3 py-1">
                              ★ {row.avgRating.toFixed(1)} / 10
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
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
                      <Button className="w-full bg-[#E50914] hover:bg-[#B2070F]" disabled={!!actionLoading} onClick={handleAddHighlight}>Add Highlight</Button>
                    </div>
                    <div className="space-y-2 mt-4">
                      {highlights.map(h => (
                        <div key={h.id} className="border border-white/10 p-2 rounded bg-black/30 relative">
                          <p className="text-white text-sm font-medium pr-8">{h.title}</p>
                          <p className="text-white/60 text-xs mt-1">{h.text}</p>
                          <button disabled={!!actionLoading} onClick={() => handleDeleteHighlight(h.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
                      <Button className="w-full bg-[#E50914] hover:bg-[#B2070F]" disabled={!!actionLoading} onClick={handleAddTestimonial}>Add Testimonial</Button>
                    </div>
                    <div className="space-y-2 mt-4">
                      {testimonials.map(t => (
                        <div key={t.id} className="border border-white/10 p-2 rounded bg-black/30 relative">
                          <p className="text-white text-sm font-medium pr-8">{t.name}</p>
                          <p className="text-white/60 text-xs mt-1">{t.quote}</p>
                          <button disabled={!!actionLoading} onClick={() => handleDeleteTestimonial(t.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
                      <Button className="w-full bg-[#E50914] hover:bg-[#B2070F]" disabled={!!actionLoading} onClick={handleAddFaq}>Add FAQ</Button>
                    </div>
                    <div className="space-y-2 mt-4">
                      {faqs.map(f => (
                        <div key={f.id} className="border border-white/10 p-2 rounded bg-black/30 relative">
                          <p className="text-white text-sm font-medium pr-8">{f.question}</p>
                          <p className="text-white/60 text-xs mt-1">{f.answer}</p>
                          <button disabled={!!actionLoading} onClick={() => handleDeleteFaq(f.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Add New Category</CardTitle>
                  <CardDescription>Create a new dynamic category row for the home page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-white">Category Name</Label>
                    <Input
                      className="bg-zinc-800 border-white/10 text-white"
                      placeholder="e.g. Anime, K-Drama, Horror"
                      value={categoryNameInput}
                      onChange={(e) => setCategoryNameInput(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white">Icon Name (optional)</Label>
                    <Input
                      className="bg-zinc-800 border-white/10 text-white"
                      placeholder="e.g. Film, Sparkles, Heart"
                      value={categoryIconInput}
                      onChange={(e) => setCategoryIconInput(e.target.value)}
                    />
                  </div>
                  <Button className="bg-[#E50914] hover:bg-[#B2070F]" disabled={!!actionLoading} onClick={handleAddCategory}>
                    <Plus className="w-4 h-4 mr-1" />
                    Create Category
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Dynamic Categories</CardTitle>
                  <CardDescription>Manage active categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-white">Category Name</TableHead>
                        <TableHead className="text-white">Icon</TableHead>
                        <TableHead className="text-white">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.length === 0 ? (
                        <TableRow className="border-white/10">
                          <TableCell colSpan={3} className="text-white/60 text-center py-6">
                            No dynamic categories found. Create one on the left.
                          </TableCell>
                        </TableRow>
                      ) : (
                        categories.map((cat) => (
                          <TableRow key={cat.id} className="border-white/10">
                            <TableCell className="text-white font-semibold">{cat.name}</TableCell>
                            <TableCell className="text-white/70">{cat.icon}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-900/20 border-red-700 text-red-300 hover:bg-red-900/30"
                                disabled={!!actionLoading}
                                onClick={() => void handleDeleteCategory(cat.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-red-500" />
                      Registered Users & Access Control
                    </CardTitle>
                    <CardDescription>Manage user permissions, view registration details and assign admin access</CardDescription>
                  </div>
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="max-w-xs bg-zinc-800 border-white/10 text-white placeholder:text-zinc-500"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white">User</TableHead>
                      <TableHead className="text-white">Email Address</TableHead>
                      <TableHead className="text-white">Role</TableHead>
                      <TableHead className="text-white">Joined Date</TableHead>
                      <TableHead className="text-white text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow className="border-white/10">
                        <TableCell colSpan={5} className="text-white/60 text-center py-6">
                          No users found matching "{userSearch}".
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => {
                        const isUserAdmin = String(u.role).toLowerCase() === "admin";
                        return (
                          <TableRow key={u.id} className="border-white/10 hover:bg-white/5 transition-colors">
                            <TableCell className="text-white font-semibold flex items-center gap-2.5 py-3">
                              {u.image ? (
                                <img src={u.image} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center text-xs font-bold">
                                  {u.name?.[0]?.toUpperCase() || "U"}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold">{u.name}</p>
                                <p className="text-[10px] text-zinc-400 md:hidden">{u.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-white/70 text-sm">{u.email}</TableCell>
                            <TableCell>
                              <Badge className={isUserAdmin ? "bg-red-500/20 text-red-500 border-red-500/30 uppercase text-[10px] font-bold" : "bg-zinc-800 text-zinc-300 uppercase text-[10px]"}>
                                {isUserAdmin ? "Admin" : "Member"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white/60 text-xs">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className={isUserAdmin ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700" : "bg-red-900/20 border-red-700 text-red-300 hover:bg-red-900/40 font-semibold"}
                                disabled={!!actionLoading || u.id === user.id}
                                onClick={() => void handleToggleUserRole(u.id, u.role)}
                              >
                                {isUserAdmin ? "Demote to Member" : "Promote to Admin"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
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

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black pt-24 text-center text-white/70">Loading admin console...</div>}>
      <AdminPageInner />
    </Suspense>
  );
}
