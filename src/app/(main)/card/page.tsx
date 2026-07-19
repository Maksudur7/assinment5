import { redirect } from "next/navigation";

// Payment/checkout is not available — NGV is completely free.
export default function CardPage() {
  redirect("/");
}