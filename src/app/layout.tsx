import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import "plyr/dist/plyr.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { template: "%s | NGV Streaming", default: "NGV Streaming — Free Movies & Series" },
  description: "NGV is Bangladesh's premier free streaming platform. Watch movies, web series, and TV shows in HD — clean, secure, ad-supported.",
  keywords: ["NGV", "streaming", "movies", "Bangladesh", "free", "series", "watch online"],
  openGraph: {
    title: "NGV Streaming — Free Movies & Series",
    description: "Watch HD movies and web series for free on NGV, Bangladesh's top streaming platform.",
    type: "website",
    locale: "bn_BD",
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
          {/* Jodi Providers.tsx er bhitore ThemeProvider thake, tobe aikhane lagbe na */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
