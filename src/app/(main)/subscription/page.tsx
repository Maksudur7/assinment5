"use client";

import { useState } from "react";
import { CheckCircle2, Crown } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { portalService } from "@/src/lib/portal";

export default function SubscriptionPage() {
  const [message, setMessage] = useState("");

  async function subscribe(plan: "monthly" | "yearly") {
    const record = await portalService.createPurchase("subscription");
    setMessage(`Subscription request created (${plan}) • Order ${record.id}`);
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
        <div className="rounded-lg bg-zinc-900 border border-white/10 p-8">
          <h1 className="text-white text-3xl mb-2">Subscription Plans</h1>
          <p className="text-white/60">Choose a plan and unlock premium streaming, early access and ad-free experience.</p>
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
              <Button className="w-full bg-[#E50914] hover:bg-[#B2070F]" onClick={() => subscribe("monthly")}>Choose Monthly</Button>
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
              <Button className="w-full bg-[#E50914] hover:bg-[#B2070F]" onClick={() => subscribe("yearly")}>Choose Yearly</Button>
            </CardContent>
          </Card>
        </div>

        {message && <div className="rounded-md border border-green-600/40 bg-green-900/20 p-3 text-green-300 text-sm">{message}</div>}
      </div>
    </div>
  );
}
