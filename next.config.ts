import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_API_URL
  ? process.env.BACKEND_API_URL.replace(/\/api$/, "")
  : "https://ngv-backend.vercel.app";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
