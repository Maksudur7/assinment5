"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, Bookmark, Film, MessageSquare, ShieldCheck, ShoppingBag, Star } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { portalService } from "@/src/lib/portal";
import type { AdminOverview, PortalUser } from "@/src/lib/portal/types";

export default function DashboardPage() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const [me, watchlist, purchases] = await Promise.all([
        portalService.getCurrentUser(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        portalService.getWatchlist() as Promise<any[]>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        portalService.getPurchaseHistory() as Promise<any[]>,
      ]);

      setUser(me);
      setWatchlistCount(watchlist.length);
      setPurchaseCount(purchases.length);

      if (me && me.role === "admin") {
        const data = await portalService.getAdminOverview() as AdminOverview;
        setAdminOverview(data);
      } else {
        setAdminOverview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      setAdminOverview(null);
    }
  }

  useEffect(() => {
    async function fetchData() {
      await load();
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-300 mx-auto px-6 py-8 space-y-6">
        <div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
          <h1 className="text-white text-3xl mb-2">Dashboard</h1>
          <p className="text-white/60">Welcome back, {user?.name ?? "Viewer"}</p>
          {error ? <p className="text-red-400 text-sm mt-2">{error}</p> : null}
          <div className="mt-3">
            <Badge className="bg-[#E50914] uppercase">{user?.role ?? "user"}</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-white/10"><CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Bookmark className="w-4 h-4 text-[#E50914]" />Watchlist</CardTitle></CardHeader><CardContent><p className="text-white text-3xl">{watchlistCount}</p></CardContent></Card>
          <Card className="bg-zinc-900 border-white/10"><CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-[#E50914]" />Purchases</CardTitle></CardHeader><CardContent><p className="text-white text-3xl">{purchaseCount}</p></CardContent></Card>
          <Card className="bg-zinc-900 border-white/10"><CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Star className="w-4 h-4 text-[#E50914]" />Role Access</CardTitle></CardHeader><CardContent><p className="text-white text-3xl">{user?.role === "admin" ? "Full" : "User"}</p></CardContent></Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button asChild className="bg-[#E50914] hover:bg-[#B2070F]"><Link href="/library"><Film className="w-4 h-4 mr-2" />Browse Media</Link></Button>
          <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white"><Link href="/watchlist"><Bookmark className="w-4 h-4 mr-2" />My Watchlist</Link></Button>
          <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white"><Link href="/purchases"><ShoppingBag className="w-4 h-4 mr-2" />Purchase History</Link></Button>
          <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white"><Link href="/profile"><MessageSquare className="w-4 h-4 mr-2" />Profile</Link></Button>
        </div>

        {user?.role === "admin" ? (
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#E50914]" />Admin Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-md bg-black/30 border border-white/10 p-3"><p className="text-white/60">Total Media</p><p className="text-white text-xl">{adminOverview?.totalMedia ?? 0}</p></div>
                <div className="rounded-md bg-black/30 border border-white/10 p-3"><p className="text-white/60">Pending Reviews</p><p className="text-white text-xl">{adminOverview?.pendingReviews ?? 0}</p></div>
                <div className="rounded-md bg-black/30 border border-white/10 p-3"><p className="text-white/60">Revenue</p><p className="text-white text-xl">${(adminOverview?.totalRevenue ?? 0).toFixed(2)}</p></div>
                <div className="rounded-md bg-black/30 border border-white/10 p-3"><p className="text-white/60">Hidden Comments</p><p className="text-white text-xl">{adminOverview?.hiddenComments ?? 0}</p></div>
              </div>
              <Button asChild variant="outline" className="bg-white/5 border-white/10 text-white"><Link href="/admin"><BarChart3 className="w-4 h-4 mr-2" />Open Admin Console</Link></Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
