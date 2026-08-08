import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import "plyr/dist/plyr.css";
import { Providers } from "./providers";
import { CookieConsent } from "@/src/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://ngv-streaming.vercel.app"
  ),
  title: {
    template: "%s | NGV Streaming",
    default: "NGV Streaming — Free Movies & Series Online",
  },
  description:
    "NGV is Bangladesh's premier free streaming platform. Watch movies, web series, and TV shows in HD — clean, secure, ad-supported. No subscription required.",
  keywords: [
    "NGV",
    "streaming",
    "free movies",
    "Bangladesh streaming",
    "watch online",
    "web series",
    "HD movies",
    "Bangla movies",
    "free series",
    "online streaming Bangladesh",
  ],
  authors: [{ name: "NGV Streaming", url: "https://ngv-streaming.vercel.app" }],
  creator: "NGV Streaming",
  publisher: "NGV Streaming",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "NGV Streaming — Free Movies & Series Online",
    description:
      "Watch HD movies and web series for free on NGV — Bangladesh's top streaming platform. No subscription needed.",
    type: "website",
    locale: "en_US",
    url: "https://ngv-streaming.vercel.app",
    siteName: "NGV Streaming",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NGV Streaming — Free Movies & Series",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NGV Streaming — Free Movies & Series Online",
    description:
      "Watch HD movies and web series for free on NGV — Bangladesh's top streaming platform.",
    images: ["/og-image.png"],
    creator: "@ngvstreaming",
  },
  verification: {
    // Paste your Google Search Console verification code here when ready:
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
  alternates: {
    canonical: "https://ngv-streaming.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
