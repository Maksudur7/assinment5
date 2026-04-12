"use client";

import { useEffect, useState } from "react";
import { User, Wallet } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { portalService } from "@/src/lib/portal";
import type { PortalUser } from "@/src/lib/portal/types";

export default function ProfilePage() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);

  async function load() {
    const [u, w, p] = await Promise.all([
      portalService.getCurrentUser(),
      portalService.getWatchlist(),
      portalService.getPurchaseHistory(),
    ]);
    setUser(u);
    setWatchlistCount(w.length);
    setPurchaseCount(p.length);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-250 mx-auto px-6 py-8 space-y-6">
        <div className="rounded-lg bg-zinc-900 border border-white/10 p-8">
          <h1 className="text-white text-3xl mb-2">User Profile</h1>
          <p className="text-white/60">Manage account state, purchases and personalization.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><User className="w-5 h-5 text-[#E50914]" /> Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-white/80">
              <p><span className="text-white/60">Name:</span> {user?.name}</p>
              <p><span className="text-white/60">Email:</span> {user?.email}</p>
              <p><span className="text-white/60">Role:</span> <Badge className="ml-2 bg-[#E50914]">{user?.role}</Badge></p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Wallet className="w-5 h-5 text-[#E50914]" /> Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-white/80">
              <p>Watchlist: <span className="text-white">{watchlistCount}</span></p>
              <p>Purchases: <span className="text-white">{purchaseCount}</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
