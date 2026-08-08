import { redirect } from "next/navigation";

// Old placeholder page — redirect to admin reports tab
export default function ApiSpecPage() {
  redirect("/admin?tab=reports");
}
