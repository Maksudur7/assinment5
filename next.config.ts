import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_API_URL
  ? process.env.BACKEND_API_URL.replace(/\/api$/, "")
  : "http://localhost:4000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
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
