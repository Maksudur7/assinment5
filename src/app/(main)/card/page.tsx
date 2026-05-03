import { Suspense } from "react";

import { CardCheckoutPage } from "../../../components/payment/CardCheckoutPage";

function CardPageFallback() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-20 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-8 text-white/70">Loading checkout...</div>
    </div>
  );
}

export default function CardPage() {
  return (
    <Suspense fallback={<CardPageFallback />}>
      <CardCheckoutPage />
    </Suspense>
  );
}