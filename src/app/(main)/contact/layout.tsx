import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the NGV Streaming team. Submit feedback, DMCA takedown requests, or general inquiries through our contact form.",
  alternates: { canonical: "https://ngv-streaming.vercel.app/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
