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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-lg bg-card border border-border p-6 transition-colors duration-300">
          <h1 className="text-foreground text-3xl mb-2">Subscription Checkout</h1>
          <p className="text-muted-foreground">Complete payment with Visa, Debit Card, Credit Card, bKash, Nagad, or Rocket.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">Plan: {selectedPlan === "yearly" ? "Yearly" : "Monthly"}</Badge>
            <Badge className="bg-muted text-foreground">Amount: ${PLAN_PRICE[selectedPlan].toFixed(2)}</Badge>
            <Badge className="bg-muted text-foreground">Real-time status enabled</Badge>
          </div>
          <div className="mt-4">
            <Link href="/subscription" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">Back to subscription plans</Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader><CardTitle className="text-foreground">Payment Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(methodLabels).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMethod(value as PaymentMethod)}
                    className={`rounded-lg border px-4 py-3 text-left transition ${method === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-foreground hover:bg-muted/80"}`}
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
                  <label className="text-sm text-foreground">Wallet Number</label>
                  <Input value={walletNumber} onChange={(e) => setWalletNumber(e.target.value)} className="bg-input border-border text-foreground" placeholder="01XXXXXXXXX" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Card Number</label>
                    <Input value={cardNumber} onChange={(e) => setCardNumber(maskCard(e.target.value))} className="bg-input border-border text-foreground" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Card Holder Name</label>
                    <Input value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} className="bg-input border-border text-foreground" placeholder="Name on card" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm text-foreground">Expiry (MM/YY)</label>
                      <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-input border-border text-foreground" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-foreground">CVV</label>
                      <Input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} className="bg-input border-border text-foreground" placeholder="***" />
                    </div>
                  </div>
                </div>
              )}

              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={emailReceipt} onChange={(e) => setEmailReceipt(e.target.checked)} />
                Send receipt by email
              </label>

              <Button onClick={handleCheckout} disabled={submitting} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground">
                {submitting ? <span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing payment...</span> : "Pay and activate subscription"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-foreground">Checkout Status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><span className="text-muted-foreground">Checkout ID:</span> {checkout?.checkoutId ?? "Not started"}</p>
              <p><span className="text-muted-foreground">Status:</span> {status ?? "N/A"}</p>
              <p><span className="text-muted-foreground">Transaction:</span> {statusInfo?.transactionId ?? checkout?.transactionId ?? "N/A"}</p>
              {statusInfo?.paidAt ? <p><span className="text-muted-foreground">Paid At:</span> {new Date(statusInfo.paidAt).toLocaleString()}</p> : null}

              <Button type="button" variant="outline" className="w-full bg-input border-border text-foreground" disabled={!checkout?.checkoutId || loadingStatus} onClick={() => checkout?.checkoutId && void pollStatus(checkout.checkoutId)}>
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

        {error ? <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
      </div>
    </div>
  );
}
