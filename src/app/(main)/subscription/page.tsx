"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Crown, ShieldCheck } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { paymentFetchers } from "@/src/lib/fetchers/core";
import { portalService } from "@/src/lib/portal";
import { getActiveSubscription, hasActiveSubscription } from "@/src/lib/portal/entitlements";
import type { PortalUser, PurchaseRecord } from "@/src/lib/portal/types";

export default function SubscriptionPage() {
  const [error, setError] = useState("");
  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  const [user, setUser] = useState<PortalUser | null>(null);

  async function loadRealtimeData() {
    try {
      const [me, purchases] = await Promise.all([
        portalService.getCurrentUser(),
        paymentFetchers.history(),
      ]);
      setUser(me);
      setHistory(purchases as PurchaseRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription status.");
    }
  }

  useEffect(() => {
    async function fetchData() {
      await loadRealtimeData();
    }
    fetchData();
    const timer = window.setInterval(() => {
      void loadRealtimeData();
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  const activeSub = useMemo(() => getActiveSubscription(history), [history]);
  const premiumEnabled = useMemo(() => hasActiveSubscription(history), [history]);

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 transition-colors duration-300">
      <div className="max-w-300 mx-auto px-6 py-8 space-y-6">
        <div className="rounded-lg bg-zinc-900 border border-white/10 p-8">
          <h1 className="text-white text-3xl mb-2">Subscription Plans</h1>
          <p className="text-white/60">Free users can watch basic titles. Subscribe to instantly unlock all premium movies and series.</p>
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <Badge className={premiumEnabled ? "bg-green-600" : "bg-zinc-700"}>
              {premiumEnabled ? "Premium Active" : "Free Plan"}
            </Badge>
            {activeSub?.expiresAt ? (
              <span className="text-xs text-white/60">
                Active until {new Date(activeSub.expiresAt).toLocaleDateString()}
              </span>
            ) : null}
            <span className="text-xs text-white/40">Live status refreshes every 4 seconds</span>
          </div>
          <p className="text-xs text-white/50 mt-3">
            Checkout methods on the next page: Visa, Debit Card, Credit Card, bKash, Nagad, Rocket.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader><CardTitle className="text-white">Free</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl text-white">$0</p>
              <ul className="text-white/70 text-sm space-y-2">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Limited titles</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Community reviews</li>
              </ul>
              <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white">Current Plan</Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-[#E50914]">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Crown className="w-5 h-5 text-[#E50914]" /> Monthly Premium</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl text-white">$9.99</p>
              <ul className="text-white/70 text-sm space-y-2">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Unlimited premium titles</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Priority streaming links</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Ad reduced experience</li>
              </ul>
              <Button asChild className="w-full bg-[#E50914] hover:bg-[#B2070F]"><Link href="/card?plan=monthly">Buy Monthly</Link></Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader><CardTitle className="text-white">Yearly Premium</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl text-white">$89.99</p>
              <ul className="text-white/70 text-sm space-y-2">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> All monthly benefits</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> 25% savings</li>
              </ul>
              <Button asChild className="w-full bg-[#E50914] hover:bg-[#B2070F]"><Link href="/card?plan=yearly">Buy Yearly</Link></Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500" />Subscription Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/80">
            <p><span className="text-white/50">User:</span> {user?.name ?? "Viewer"}</p>
            <p><span className="text-white/50">Plan:</span> {activeSub ? `${activeSub.plan ?? "monthly"} premium` : "Free"}</p>
            <p><span className="text-white/50">Next Renewal:</span> {activeSub?.expiresAt ? new Date(activeSub.expiresAt).toLocaleString() : "N/A"}</p>
            <p><span className="text-white/50">Provider:</span> {activeSub?.provider?.toUpperCase() ?? "Connected gateway required"}</p>
          </CardContent>
        </Card>

        {error && <div className="rounded-md border border-red-600/40 bg-red-900/20 p-3 text-red-300 text-sm">{error}</div>}
      </div>
    </div>
  );
}
