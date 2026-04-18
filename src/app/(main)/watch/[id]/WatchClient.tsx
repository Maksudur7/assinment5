"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, ShieldAlert, ShoppingCart, ThumbsUp } from "lucide-react";

import { ImageWithFallback } from "@/src/components/figma/ImageWithFallback";
import { VideoCard } from "@/src/components/VideoCard";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { portalService } from "@/src/lib/portal";
import { canAccessMedia, getActiveSubscription } from "@/src/lib/portal/entitlements";
import { reviewFetchers } from "@/src/lib/fetchers/core";
import type { MediaItem, PortalUser, PurchaseRecord, Review, ReviewComment } from "@/src/lib/portal/types";


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
  const [myPurchases, setMyPurchases] = useState(0);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  // Real-time view/user count
  const [viewCount, setViewCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  console.log('media', media)

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [meRaw, itemRaw, listRaw, purchaseHistoryRaw] = await Promise.all([
        portalService.getCurrentUser(),
        portalService.getMediaById(id),
        portalService.getMedia({ page: 1, pageSize: 20 }),
        portalService.getPurchaseHistory(),
      ]);

      // Type guards and assertions
      const me = (meRaw && typeof meRaw === "object" && "role" in meRaw) ? (meRaw as PortalUser) : null;
      setUser(me as PortalUser | null);

      const item = (itemRaw && typeof itemRaw === "object" && "id" in itemRaw) ? (itemRaw as MediaItem) : null;
      setMedia(item as MediaItem | null);

      const list = (listRaw && typeof listRaw === "object" && "items" in listRaw && Array.isArray((listRaw as { items?: unknown }).items)) ? (listRaw as { items: MediaItem[] }) : { items: [] };
      setAllMedia(list.items as MediaItem[]);

      const purchaseHistory = Array.isArray(purchaseHistoryRaw) ? (purchaseHistoryRaw as PurchaseRecord[]) : [];
      setMyPurchases((purchaseHistory as PurchaseRecord[]).length);
      setPurchaseHistory(purchaseHistory as PurchaseRecord[]);

      if (item && me) {
        // getReviews now expects only 1 argument (mediaId)
        const rRaw = await portalService.getReviews(item.id);
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
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;
    // On mount: increment view count and start polling
    incrementView(id).then((stats) => {
      if (stats && mounted) {
        setViewCount(stats.viewCount);
        setUserCount(stats.currentViewers);
      }
    });
    // Poll for real-time stats
    const poll = async () => {
      const stats = await getViewStats(id);
      if (stats && mounted) {
        setViewCount(stats.viewCount);
        setUserCount(stats.currentViewers);
      }
    };
    const interval = setInterval(poll, 5000);
    // On unmount: decrement viewer count
    return () => {
      mounted = false;
      clearInterval(interval);
      decrementViewer(id);
    };
  }, [id]);

  // Initial data load
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const related = useMemo(
    () => allMedia.filter((m) => m.id !== id).slice(0, 4),
    [allMedia, id],
  );

  const canStreamCurrent = useMemo(() => {
    if (!media || !user) return false;
    return canAccessMedia(media, user.role, purchaseHistory);
  }, [media, user, purchaseHistory]);

  const activeSubscription = useMemo(() => getActiveSubscription(purchaseHistory), [purchaseHistory]);

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
    }
    setEditingReviewId(null);
    setContent("");
    await loadAll();
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
    await loadAll();
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
    await loadAll();
  }

  async function addComment(reviewId: string) {
    const text = commentInput[reviewId]?.trim();
    if (!text) return;
    await reviewFetchers.comment(reviewId, text);
    setCommentInput((prev) => ({ ...prev, [reviewId]: "" }));
    setReplyTarget((prev) => ({ ...prev, [reviewId]: null }));
    await loadAll();
  }

  async function toggleWatchlist() {
    if (!media) return;
    const nextRaw = await portalService.toggleWatchlist(media.id);
    // Defensive: nextRaw may be boolean or object
    if (typeof nextRaw === "object" && nextRaw !== null && "saved" in nextRaw) {
      setWatchSaved((nextRaw as { saved: boolean }).saved);
    } else if (typeof nextRaw === "boolean") {
      setWatchSaved(nextRaw);
    }
  }

  async function purchase(type: "rent" | "buy" | "subscription") {
    if (!media) return;
    await portalService.createPurchase(type, media.id, {} as Record<string, unknown>);
    await loadAll();
  }

  async function approveReview(reviewId: string) {
    await portalService.approveReview(reviewId);
    await loadAll();
  }

  async function unpublishReview(reviewId: string) {
    await portalService.unpublishReview(reviewId);
    await loadAll();
  }


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

  // Helper to check if the streamingUrl is a YouTube link
  function getYouTubeEmbedUrl(url: string) {
    // Accepts both youtu.be and youtube.com links
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
  }

  const youTubeEmbedUrl = getYouTubeEmbedUrl(media.streamingUrl);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-360 mx-auto px-6 py-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="rounded-lg overflow-hidden border border-white/10 bg-zinc-900">
            {/* Real-time stats */}
            <div className="flex items-center gap-6 px-5 pt-4 pb-2">
              <span className="text-white/80 text-sm">👁️ {viewCount} views</span>
              <span className="text-white/80 text-sm">🟢 {userCount} watching now</span>
            </div>
            {canStreamCurrent && youTubeEmbedUrl ? (
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
              <ImageWithFallback src={media.poster} alt={media.title} className="w-full aspect-video object-cover" />
            )}
            <div className="p-5">
              <h1 className="text-white text-3xl mb-2">{media.title}</h1>
              <p className="text-white/70 mb-2">{media.releaseYear} • {media.genres.join(" • ")} • {media.duration}</p>
              <p className="text-white/70 mb-4">Director: {media.director} • Cast: {media.cast.join(", ")}</p>
              <p className="text-white/80 mb-4">{media.synopsis}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-[#E50914]">{media.pricing.toUpperCase()}</Badge>
                {media.platforms.map((p) => <Badge key={p} variant="outline" className="border-white/20 text-white">{p}</Badge>)}
                {media.pricing === "premium" ? (
                  <Badge className={canStreamCurrent ? "bg-green-600" : "bg-yellow-600"}>
                    {canStreamCurrent ? "UNLOCKED" : "PREMIUM LOCKED"}
                  </Badge>
                ) : null}
              </div>

              {media.pricing === "premium" && !canStreamCurrent ? (
                <div className="mb-4 rounded-md border border-yellow-600/40 bg-yellow-900/10 p-3 text-sm text-yellow-200">
                  This is a premium title. Subscribe, rent, or buy to start watching instantly.
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {canStreamCurrent && !youTubeEmbedUrl ? (
                  <Button className="bg-[#E50914] hover:bg-[#B2070F]" asChild>
                    <a href={media.streamingUrl} target="_blank" rel="noreferrer">Stream Now</a>
                  </Button>
                ) : null}
                {!canStreamCurrent ? (
                  <Button className="bg-[#E50914] hover:bg-[#B2070F]" asChild>
                    <Link href="/subscription">Unlock Premium</Link>
                  </Button>
                ) : null}
                <Button variant="outline" className="bg-white/5 border-white/10 text-white" onClick={toggleWatchlist}>
                  {watchSaved ? "Remove from Watchlist" : "Add to Watchlist"}
                </Button>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white" onClick={() => purchase("rent")}> 
                  Rent
                </Button>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white" onClick={() => purchase("buy")}> 
                  Buy
                </Button>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white" onClick={() => purchase("subscription")}> 
                  Monthly Subscription
                </Button>
              </div>
            </div>
          </div>

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
                  <div>
                    <p className="text-white">{review.userName} <span className="text-white/60">• {review.rating}/10</span></p>
                    <p className="text-white/70 text-sm">{new Date(review.createdAt).toLocaleString()}</p>
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
          <div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
            <h3 className="text-white mb-2">Your Account</h3>
            <p className="text-white/70 text-sm">Role: {user?.role}</p>
            <p className="text-white/70 text-sm">Purchases: {myPurchases}</p>
            <p className="text-white/70 text-sm">Plan: {activeSubscription ? `${activeSubscription.plan ?? "monthly"} premium` : "Free"}</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
            <h3 className="text-white mb-3">Related Titles</h3>
            <div className="grid gap-3">
              {related.map((item) => (
                <Link key={item.id} href={`/watch/${item.id}`}>
                  <VideoCard
                    id={item.id}
                    title={item.title}
                    thumbnail={item.poster}
                    duration={item.duration}
                    rating={item.avgRating}
                    year={String(item.releaseYear)}
                    category={item.genres[0]}
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
            <h3 className="text-white mb-2 flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Integration Ready</h3>
            <p className="text-white/60 text-sm">
              This page uses a service abstraction; switch to real backend by setting NEXT_PUBLIC_USE_REMOTE_API=true and implementing API endpoints.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
