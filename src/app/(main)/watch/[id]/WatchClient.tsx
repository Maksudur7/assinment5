"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { MessageCircle, ShieldAlert, ThumbsUp, Eye, Users, PlayCircle, Loader2 } from "lucide-react";
import Hls from "hls.js";


import { ImageWithFallback } from "@/src/components/figma/ImageWithFallback";
import { VideoCard } from "@/src/components/VideoCard";
import { AdSlot } from "@/src/components/AdSlot";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { portalService } from "@/src/lib/portal";
import { reviewFetchers } from "@/src/lib/fetchers/core";
import type { MediaItem, PortalUser, Review, ReviewComment } from "@/src/lib/portal/types";


// Real-time view/user count API helpers
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function incrementView(id: string) {
  try {
    const res = await fetch(`${API_URL}/media/${id}/increment-view`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to increment view");
    return await res.json();
  } catch {
    return null;
  }
}
async function decrementViewer(id: string) {
  try {
    const res = await fetch(`${API_URL}/media/${id}/decrement-viewer`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to decrement viewer");
    return await res.json();
  } catch {
    return null;
  }
}
async function getViewStats(id: string) {
  try {
    const res = await fetch(`${API_URL}/media/${id}/view-stats`);
    if (!res.ok) throw new Error("Failed to get view stats");
    return await res.json();
  } catch {
    return null;
  }
}


import { Loader } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

export function WatchClient({ id }: { id: string }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Record<string, ReviewComment[]>>({});
  const [rating, setRating] = useState("8");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("underrated");
  const [spoiler, setSpoiler] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [replyTarget, setReplyTarget] = useState<Record<string, string | null>>({});
  const [watchSaved, setWatchSaved] = useState(false);
  // Real-time view/user count
  const [viewCount, setViewCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lastSavedTime, setLastSavedTime] = useState(0);

  const loadAll = useCallback(async (silent = false) => {

    if (!silent) setLoading(true);
    try {
      const [meRaw, itemRaw, listRaw] = await Promise.all([
        portalService.getCurrentUser(),
        portalService.getMediaById(id),
        portalService.getMedia({ page: 1, pageSize: 20 }),
      ]);

      // Type guards and assertions
      const me = (meRaw && typeof meRaw === "object" && "role" in meRaw) ? (meRaw as PortalUser) : null;
      setUser(me as PortalUser | null);

      const item = (itemRaw && typeof itemRaw === "object" && "id" in itemRaw) ? (itemRaw as MediaItem) : null;
      setMedia(item as MediaItem | null);

      const list = (listRaw && typeof listRaw === "object" && "items" in listRaw && Array.isArray((listRaw as { items?: unknown }).items)) ? (listRaw as { items: MediaItem[] }) : { items: [] };
      setAllMedia(list.items as MediaItem[]);

      if (item && me) {
        // getReviews now expects 2 arguments: mediaId and includePending
        const rRaw = await portalService.getReviews(item.id, true);
        const r = Array.isArray(rRaw) ? (rRaw as Review[]) : [];
        setReviews(r as Review[]);
        const cmts: Record<string, ReviewComment[]> = {};
        await Promise.all(
          (r as Review[]).map(async (rev: Review) => {
            if (rev && rev.id) {
              const cRaw = await portalService.getComments(rev.id);
              cmts[rev.id] = Array.isArray(cRaw) ? (cRaw as ReviewComment[]) : [];
            }
          }),
        );
        setComments(cmts);

        const watchlistRaw = await portalService.getWatchlist();
        const watchlist = Array.isArray(watchlistRaw) ? (watchlistRaw as MediaItem[]) : [];
        setWatchSaved((watchlist as MediaItem[]).some((w: MediaItem) => w && w.id === item.id));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  const hasIncremented = useRef(false);

  useEffect(() => {
    let mounted = true;
    
    if (!hasIncremented.current) {
      hasIncremented.current = true;
      incrementView(id).then((stats) => {
        if (stats && mounted) {
          setViewCount(stats.viewCount);
          setUserCount(stats.currentViewers);
        }
      });
      portalService.addToHistory(id).catch(console.error);
    }

    // Connect Server-Sent Events (SSE) for real-time stats
    const eventSource = new EventSource(`${API_URL}/media/${id}/viewers/stream`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (mounted) {
          setViewCount(data.viewCount);
          setUserCount(data.currentViewers);
        }
      } catch (e) {
        console.error("SSE parse error", e);
      }
    };

    const handleUnload = () => {
      navigator.sendBeacon(`${API_URL}/media/${id}/decrement-viewer`);
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      mounted = false;
      eventSource.close();
      window.removeEventListener("beforeunload", handleUnload);
      decrementViewer(id);
    };
  }, [id]);

  // Handle Video Player Setup & Progress
  useEffect(() => {
    if (!media || !videoRef.current) return;
    const video = videoRef.current;
    let hls: Hls | null = null;
    const isHls = media.streamingUrl.endsWith(".m3u8");

    // Load progress
    (portalService as any).getWatchProgress(media.id).then((progress: any) => {
      if (progress && progress.progressSeconds > 0) {
        video.currentTime = progress.progressSeconds;
      }
    }).catch(console.error);

    if (isHls && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(media.streamingUrl);
      hls.attachMedia(video);
    } else {
      video.src = media.streamingUrl;
    }

    const onTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime);
      if (currentTime > 0 && currentTime - lastSavedTime >= 10) {
        setLastSavedTime(currentTime);
        (portalService as any).updateWatchProgress(media.id, currentTime).catch(console.error);
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      if (hls) {
        hls.destroy();
      }
    };
  }, [media, lastSavedTime]);

  // Initial data load
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const related = useMemo(
    () => allMedia.filter((m) => m.id !== id).slice(0, 4),
    [allMedia, id],
  );



  async function submitReview() {
    if (!media || !content.trim()) return;
    if (editingReviewId) {
      await portalService.updateOwnUnpublishedReview(editingReviewId, {
        rating: Number(rating),
        content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        spoiler,
      });
    } else {
      await portalService.createReview({
        mediaId: media.id,
        rating: Number(rating),
        content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        spoiler,
      });
      toast.success("Review submitted successfully! It is now pending admin approval.");
    }
    setEditingReviewId(null);
    setContent("");
    await loadAll(true);
  }

  async function deleteOwnReview(reviewId: string) {
    await portalService.deleteOwnUnpublishedReview(reviewId);
    if (editingReviewId === reviewId) {
      setEditingReviewId(null);
      setContent("");
      setTags("underrated");
      setSpoiler(false);
      setRating("8");
    }
    toast.success("Review deleted successfully.");
    await loadAll(true);
  }

  function beginEditReview(review: Review) {
    setEditingReviewId(review.id);
    setContent(review.content);
    setTags(review.tags.join(","));
    setSpoiler(review.spoiler);
    setRating(String(review.rating));
  }

  async function likeReview(reviewId: string) {
    await reviewFetchers.toggleLike(reviewId);
    await loadAll(true);
  }

  async function addComment(reviewId: string) {
    const text = commentInput[reviewId]?.trim();
    if (!text) return;
    await reviewFetchers.comment(reviewId, text);
    setCommentInput((prev) => ({ ...prev, [reviewId]: "" }));
    setReplyTarget((prev) => ({ ...prev, [reviewId]: null }));
    toast.success("Comment added!");
    await loadAll(true);
  }

  async function toggleWatchlist() {
    if (!media) return;
    const resRaw = await portalService.toggleWatchlist(media.id);
    const res = resRaw as any;
    if (res && res.action) {
      setWatchSaved(res.action === "added");
      toast.success(res.action === "added" ? "Added to watchlist" : "Removed from watchlist");
    } else if (typeof res === "boolean") {
      setWatchSaved(res);
      toast.success(res ? "Added to watchlist" : "Removed from watchlist");
    } else if (res && res.saved !== undefined) {
      setWatchSaved(res.saved);
      toast.success(res.saved ? "Added to watchlist" : "Removed from watchlist");
    }
  }


  async function approveReview(reviewId: string) {
    await portalService.approveReview(reviewId);
    toast.success("Review approved.");
    await loadAll(true);
  }

  async function unpublishReview(reviewId: string) {
    await portalService.unpublishReview(reviewId);
    toast.success("Review unpublished.");
    await loadAll(true);
  }


  const popular = useMemo(() => {
    return [...allMedia].sort((a, b) => b.avgRating - a.avgRating).filter(m => m.id !== id).slice(0, 6);
  }, [allMedia, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Loader className="w-10 h-10 text-[#E50914] animate-spin" />
      </div>
    );
  }

  if (!media) {
    return <div className="min-h-screen bg-black pt-24 text-center text-white/70">Media not found.</div>;
  }

  // Helper to get privacy-enhanced YouTube embed URL (no-cookie domain)
  function getYouTubeEmbedUrl(url: string) {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (!ytMatch) return null;
    // Use youtube-nocookie.com for enhanced privacy (no tracking cookies)
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1&color=white`;
  }

  const youTubeEmbedUrl = getYouTubeEmbedUrl(media.streamingUrl);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-360 mx-auto px-0 lg:px-6 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="rounded-lg overflow-hidden  border border-white/10 bg-zinc-900">
            {/* Real-time stats */}
            <div className="flex items-center gap-6 px-5 pt-4 pb-2 border-b border-white/5">
              <span className="text-white/80 text-sm flex items-center gap-2"><Eye className="w-4 h-4" /> {viewCount} views</span>
              <span className="text-white/80 text-sm flex items-center gap-2 text-green-400"><Users className="w-4 h-4" /> {userCount} watching now</span>
            </div>
            {youTubeEmbedUrl ? (
              <div className="w-full aspect-video bg-black flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src={youTubeEmbedUrl}
                  title={media.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="w-full aspect-video bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  controls
                  poster={media.poster}
                  className="w-full h-full object-contain outline-none"
                  crossOrigin="anonymous"
                  playsInline
                />
              </div>
            )}
            <div className="p-5">
              <h1 className="text-white text-3xl mb-2">{media.title}</h1>
              <p className="text-white/70 mb-2">{media.releaseYear} • {media.genres.join(" • ")} • {media.duration}</p>
              <p className="text-white/70 mb-4">Director: {media.director} • Cast: {media.cast.join(", ")}</p>
              <p className="text-white/80 mb-4">{media.synopsis}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {media.platforms.map((p) => <Badge key={p} variant="outline" className="border-white/20 text-white">{p}</Badge>)}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="bg-white/5 border-white/10 text-white" onClick={toggleWatchlist}>
                  {watchSaved ? "Remove from Watchlist" : "Add to Watchlist"}
                </Button>
              </div>
            </div>
          </div>

          {/* Below-Player Advertisement */}
          <AdSlot type="below-player" />

          <div className="rounded-lg border border-white/10 bg-zinc-900 p-6 space-y-4">
            <h2 className="text-white text-xl">Write a Review</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger className="bg-zinc-800 border-white/10 text-white">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-white/10 text-white">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} / 10</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} className="bg-zinc-800 border-white/10 text-white" placeholder="tags: classic, family-friendly" />
              <label className="inline-flex items-center gap-2 text-white/80 text-sm px-3">
                <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} />
                Spoiler warning
              </label>
            </div>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="bg-zinc-800 border-white/10 text-white" placeholder="Share your review..." />
            <p className="text-white/50 text-xs">Reviews are saved as pending and require admin approval before public listing.</p>
            <div className="flex items-center gap-2">
              <Button className="bg-[#E50914] hover:bg-[#B2070F]" onClick={submitReview}>{editingReviewId ? "Update Review" : "Submit Review"}</Button>
              {editingReviewId ? (
                <Button variant="outline" className="bg-white/5 border-white/10 text-white" onClick={() => { setEditingReviewId(null); setContent(""); setTags("underrated"); setSpoiler(false); setRating("8"); }}>
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-zinc-900 p-6 space-y-5">
            <h2 className="text-white text-xl">Reviews</h2>
            {reviews.length === 0 ? <p className="text-white/60">No reviews yet.</p> : reviews.map((review) => (
              <div key={review.id} className="rounded-md border border-white/10 bg-black/30 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-white/20">
                      <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${review.userName}`} alt={review.userName} />
                      <AvatarFallback className="bg-zinc-800 text-white">{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{review.userName} <span className="text-white/60 font-normal ml-1">• {review.rating}/10</span></p>
                      <p className="text-white/50 text-xs mt-0.5">{new Date(review.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!review.isPublished && <Badge className="bg-yellow-600">Pending</Badge>}
                    {review.spoiler && <Badge variant="outline" className="border-red-400 text-red-300"><ShieldAlert className="w-3 h-3 mr-1" />Spoiler</Badge>}
                  </div>
                </div>
                <p className="text-white/90">{review.content}</p>
                <div className="flex flex-wrap gap-2">
                  {review.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="bg-white/5 border-white/10 text-white" onClick={() => likeReview(review.id)}>
                    <ThumbsUp className="w-3 h-3 mr-1" /> {review.likes}
                  </Button>
                  <Input value={commentInput[review.id] ?? ""} onChange={(e) => setCommentInput((p) => ({ ...p, [review.id]: e.target.value }))} className="bg-zinc-800 border-white/10 text-white max-w-sm h-8" placeholder="Add comment" />
                  <Button size="sm" onClick={() => addComment(review.id)} className="bg-[#E50914] hover:bg-[#B2070F]"><MessageCircle className="w-3 h-3 mr-1" />{replyTarget[review.id] ? "Reply" : "Comment"}</Button>
                  {user?.role === "admin" && (
                    <>
                      {!review.isPublished ? (
                        <Button size="sm" variant="outline" className="bg-green-700/30 border-green-600 text-green-300" onClick={() => approveReview(review.id)}>Approve</Button>
                      ) : (
                        <Button size="sm" variant="outline" className="bg-yellow-700/20 border-yellow-600 text-yellow-300" onClick={() => unpublishReview(review.id)}>Unpublish</Button>
                      )}
                    </>
                  )}
                  {user?.id === review.userId && !review.isPublished ? (
                    <>
                      <Button size="sm" variant="outline" className="bg-blue-900/20 border-blue-700 text-blue-300" onClick={() => beginEditReview(review)}>Edit</Button>
                      <Button size="sm" variant="outline" className="bg-red-900/20 border-red-700 text-red-300" onClick={() => deleteOwnReview(review.id)}>Delete</Button>
                    </>
                  ) : null}
                </div>
                {(comments[review.id] ?? []).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    {(comments[review.id] ?? []).map((comment) => (
                      <div key={comment.id} className={`text-sm text-white/80 ${comment.parentCommentId ? "pl-4 border-l border-white/20" : ""}`}>
                        <span className="text-white">{comment.userName}:</span> {comment.content}
                        <button
                          className="ml-2 text-xs text-[#E50914] hover:underline"
                          onClick={() => setReplyTarget((prev) => ({ ...prev, [review.id]: comment.id }))}
                        >
                          Reply
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          {/* Advertisement Slot */}
          <AdSlot type="sidebar-rectangle" />

          <div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
            <Tabs defaultValue="related" className="w-full">
              <TabsList className="w-full bg-black/50 border border-white/5 p-1 mb-4 h-auto rounded-lg">
                <TabsTrigger value="related" className="flex-1 rounded-md text-sm py-1.5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-white/60">Up Next</TabsTrigger>
                <TabsTrigger value="popular" className="flex-1 rounded-md text-sm py-1.5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-white/60">Popular</TabsTrigger>
              </TabsList>
              
              <TabsContent value="related" className="mt-0 outline-none">
                <div className="grid gap-3">
                  {related.length === 0 ? (
                    <p className="text-white/50 text-sm text-center py-4">No related titles found.</p>
                  ) : (
                    related.map((item) => (
                      <Link key={item.id} href={`/watch/${item.id}`} className="flex gap-3 group rounded-md p-2 -mx-2 hover:bg-white/5 transition-colors">
                        <div className="w-28 h-16 rounded overflow-hidden shrink-0 relative bg-black">
                          <ImageWithFallback src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-[10px] text-white rounded">
                            {item.duration}
                          </div>
                        </div>
                        <div className="flex flex-col py-0.5 justify-between flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium leading-tight line-clamp-2 group-hover:text-[#E50914] transition-colors">{item.title}</h4>
                          <div className="flex items-center text-xs text-white/50 gap-2">
                            <span>{item.releaseYear}</span>
                            <span>•</span>
                            <span className="flex items-center"><ThumbsUp className="w-3 h-3 mr-1" /> {item.avgRating}/10</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="popular" className="mt-0 outline-none">
                <div className="grid gap-3">
                  {popular.length === 0 ? (
                    <p className="text-white/50 text-sm text-center py-4">No popular titles found.</p>
                  ) : (
                    popular.map((item) => (
                      <Link key={item.id} href={`/watch/${item.id}`} className="flex gap-3 group rounded-md p-2 -mx-2 hover:bg-white/5 transition-colors">
                        <div className="w-28 h-16 rounded overflow-hidden shrink-0 relative bg-black">
                          <ImageWithFallback src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-[10px] text-white rounded">
                            {item.duration}
                          </div>
                        </div>
                        <div className="flex flex-col py-0.5 justify-between flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium leading-tight line-clamp-2 group-hover:text-[#E50914] transition-colors">{item.title}</h4>
                          <div className="flex items-center text-xs text-white/50 gap-2">
                            <span className="truncate">{item.genres?.[0] || "Featured"}</span>
                            <span>•</span>
                            <span className="flex items-center"><ThumbsUp className="w-3 h-3 mr-1 text-[#E50914]" /> {item.avgRating}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </aside>

      </div>
    </div>
  );
}
