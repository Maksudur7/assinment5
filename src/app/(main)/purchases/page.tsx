import { redirect } from "next/navigation";

// NGV is completely free — no purchases.
export default function PurchasesPage() {
  redirect("/dashboard");
}
