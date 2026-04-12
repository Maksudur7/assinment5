"use client";

import { useState } from "react";
import { CheckCircle2, Crown } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { paymentFetchers } from "@/src/lib/fetchers/core";
import type { PaymentProvider } from "@/src/lib/portal/types";

export default function SubscriptionPage() {
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState<PaymentProvider>("stripe");
  const [method, setMethod] = useState<"card" | "wallet">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  async function subscribe(plan: "monthly" | "yearly") {
    const record = await paymentFetchers.create("subscription", undefined, {
      provider,
      plan,
      method,
      cardLast4: method === "card" ? cardNumber.slice(-4) : undefined,
      walletNumber: method === "wallet" ? walletNumber : undefined,
      sendConfirmationEmail: sendEmail,
    });
    setMessage(`Subscription confirmed (${plan}) via ${provider.toUpperCase()} • Order ${record.id}`);
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-300 mx-auto px-6 py-8 space-y-6">
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

        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <select className="bg-zinc-800 border border-white/10 text-white rounded px-3 py-2" value={provider} onChange={(e) => setProvider(e.target.value as PaymentProvider)}>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="razorpay">Razorpay</option>
              </select>
              <select className="bg-zinc-800 border border-white/10 text-white rounded px-3 py-2" value={method} onChange={(e) => setMethod(e.target.value as "card" | "wallet")}>
                <option value="card">Card</option>
                <option value="wallet">MFS Wallet</option>
              </select>
              <label className="inline-flex items-center gap-2 text-white/80 text-sm px-3 py-2 border border-white/10 rounded bg-zinc-800">
                <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} /> Send confirmation email
              </label>
            </div>

            {method === "card" ? (
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Card number (demo)"
                className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded"
              />
            ) : (
              <input
                value={walletNumber}
                onChange={(e) => setWalletNumber(e.target.value)}
                placeholder="Wallet number"
                className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded"
              />
            )}
          </CardContent>
        </Card>

        {message && <div className="rounded-md border border-green-600/40 bg-green-900/20 p-3 text-green-300 text-sm">{message}</div>}
      </div>
    </div>
  );
}
