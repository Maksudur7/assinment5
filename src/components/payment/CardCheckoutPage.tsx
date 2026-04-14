"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Loader2, Wallet } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

type PlanType = "monthly" | "yearly";
type PaymentMethod = "visa" | "debit_card" | "credit_card" | "bKash" | "nagad" | "rocket";

type CheckoutResponse = {
  checkoutId: string;
  status: "pending" | "processing" | "paid" | "failed";
  transactionId?: string;
  paymentUrl?: string;
};

type CheckoutStatusResponse = {
  checkoutId: string;
  status: "pending" | "processing" | "paid" | "failed";
  transactionId?: string;
  paidAt?: string;
};

const PLAN_PRICE: Record<PlanType, number> = {
  monthly: 9.99,
  yearly: 89.99,
};

const WALLET_METHODS: PaymentMethod[] = ["bKash", "nagad", "rocket"];

const methodLabels: Record<PaymentMethod, string> = {
  visa: "Visa Card",
  debit_card: "Debit Card",
  credit_card: "Credit Card",
  bKash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
};

function maskCard(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function CardCheckoutPage() {
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan");
  const selectedPlan: PlanType = planFromUrl === "yearly" ? "yearly" : "monthly";

  const apiBase = process.env.NEXT_PUBLIC_PAYMENT_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  const [method, setMethod] = useState<PaymentMethod>("visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const [emailReceipt, setEmailReceipt] = useState(true);

  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [statusInfo, setStatusInfo] = useState<CheckoutStatusResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState("");

  const isWalletMethod = useMemo(() => WALLET_METHODS.includes(method), [method]);
  const status = statusInfo?.status ?? checkout?.status;
  const isPaid = status === "paid";

  const pollStatus = useCallback(async (checkoutId: string) => {
    if (!apiBase) return;

    setLoadingStatus(true);
    try {
      const response = await fetch(`${apiBase}/payments/checkout/${checkoutId}/status`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Could not fetch checkout status (${response.status})`);
      }

      const payload = (await response.json()) as CheckoutStatusResponse;
      setStatusInfo(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payment status.");
    } finally {
      setLoadingStatus(false);
    }
  }, [apiBase]);

  useEffect(() => {
    if (!checkout?.checkoutId || isPaid || !apiBase) return;
    const timer = window.setInterval(() => {
      void pollStatus(checkout.checkoutId);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [apiBase, checkout?.checkoutId, isPaid, pollStatus]);

  async function handleCheckout() {
    setError("");

    if (!apiBase) {
      setError("NEXT_PUBLIC_PAYMENT_API_URL or NEXT_PUBLIC_API_URL is missing in .env.");
      return;
    }

    if (isWalletMethod && walletNumber.trim().length < 10) {
      setError("Please enter a valid wallet number.");
      return;
    }

    if (!isWalletMethod) {
      if (cardNumber.replace(/\D/g, "").length < 13) {
        setError("Please enter a valid card number.");
        return;
      }
      if (cardHolder.trim().length < 3) {
        setError("Please enter the card holder name.");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        setError("Expiry must be in MM/YY format.");
        return;
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        setError("Please enter a valid CVV.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        type: "subscription",
        plan: selectedPlan,
        amount: PLAN_PRICE[selectedPlan],
        currency: "USD",
        paymentMethod: method,
        emailReceipt,
        card: isWalletMethod
          ? undefined
          : {
              number: cardNumber.replace(/\s+/g, ""),
              holder: cardHolder,
              expiry,
              cvv,
            },
        wallet: isWalletMethod
          ? {
              provider: method,
              number: walletNumber,
            }
          : undefined,
      };

      const response = await fetch(`${apiBase}/payments/checkout/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as CheckoutResponse;
      setCheckout(data);

      if (data.checkoutId) {
        void pollStatus(data.checkoutId);
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-lg bg-zinc-900 border border-white/10 p-6">
          <h1 className="text-white text-3xl mb-2">Subscription Checkout</h1>
          <p className="text-white/60">Complete payment with Visa, Debit Card, Credit Card, bKash, Nagad, or Rocket.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-[#E50914]">Plan: {selectedPlan === "yearly" ? "Yearly" : "Monthly"}</Badge>
            <Badge className="bg-zinc-700">Amount: ${PLAN_PRICE[selectedPlan].toFixed(2)}</Badge>
            <Badge className="bg-zinc-700">Real-time status enabled</Badge>
          </div>
          <div className="mt-4">
            <Link href="/subscription" className="text-sm text-white/70 hover:text-white underline underline-offset-4">Back to subscription plans</Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-zinc-900 border-white/10">
            <CardHeader><CardTitle className="text-white">Payment Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(methodLabels).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMethod(value as PaymentMethod)}
                    className={`rounded-lg border px-4 py-3 text-left transition ${method === value ? "border-[#E50914] bg-[#E50914]/10 text-white" : "border-white/10 bg-zinc-800 text-white/80 hover:bg-zinc-700"}`}
                  >
                    <span className="flex items-center gap-2">
                      {WALLET_METHODS.includes(value as PaymentMethod) ? <Wallet className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {isWalletMethod ? (
                <div className="space-y-2">
                  <label className="text-sm text-white/80">Wallet Number</label>
                  <Input value={walletNumber} onChange={(e) => setWalletNumber(e.target.value)} className="bg-zinc-800 border-white/10 text-white" placeholder="01XXXXXXXXX" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Card Number</label>
                    <Input value={cardNumber} onChange={(e) => setCardNumber(maskCard(e.target.value))} className="bg-zinc-800 border-white/10 text-white" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Card Holder Name</label>
                    <Input value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} className="bg-zinc-800 border-white/10 text-white" placeholder="Name on card" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm text-white/80">Expiry (MM/YY)</label>
                      <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-zinc-800 border-white/10 text-white" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/80">CVV</label>
                      <Input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} className="bg-zinc-800 border-white/10 text-white" placeholder="***" />
                    </div>
                  </div>
                </div>
              )}

              <label className="inline-flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={emailReceipt} onChange={(e) => setEmailReceipt(e.target.checked)} />
                Send receipt by email
              </label>

              <Button onClick={handleCheckout} disabled={submitting} className="w-full bg-[#E50914] hover:bg-[#B2070F]">
                {submitting ? <span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing payment...</span> : "Pay and activate subscription"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader><CardTitle className="text-white">Checkout Status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-white/80">
              <p><span className="text-white/50">Checkout ID:</span> {checkout?.checkoutId ?? "Not started"}</p>
              <p><span className="text-white/50">Status:</span> {status ?? "N/A"}</p>
              <p><span className="text-white/50">Transaction:</span> {statusInfo?.transactionId ?? checkout?.transactionId ?? "N/A"}</p>
              {statusInfo?.paidAt ? <p><span className="text-white/50">Paid At:</span> {new Date(statusInfo.paidAt).toLocaleString()}</p> : null}

              <Button type="button" variant="outline" className="w-full bg-zinc-800 border-white/10 text-white" disabled={!checkout?.checkoutId || loadingStatus} onClick={() => checkout?.checkoutId && void pollStatus(checkout.checkoutId)}>
                {loadingStatus ? "Refreshing..." : "Refresh status now"}
              </Button>

              {isPaid ? (
                <div className="rounded-md border border-green-500/40 bg-green-900/20 p-3 text-green-300 inline-flex items-center gap-2 w-full">
                  <CheckCircle2 className="w-4 h-4" />
                  Subscription is active.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {error ? <div className="rounded-md border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-300">{error}</div> : null}
      </div>
    </div>
  );
}
