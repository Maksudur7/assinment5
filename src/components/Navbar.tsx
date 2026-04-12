"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#E50914] px-4 py-2 rounded">
              <span className="text-white tracking-wider">NGV</span>
            </div>
            <span className="text-white/60 text-sm hidden md:block">
              Clean & Secure Streaming
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`${
                isActive("/") ? "text-white" : "text-white/60"
              } hover:text-white transition-colors`}
            >
              Home
            </Link>
            <Link
              href="/categories"
              className={`${
                isActive("/categories") ? "text-white" : "text-white/60"
              } hover:text-white transition-colors`}
            >
              Categories
            </Link>
            <Link
              href="/dashboard"
              className={`${
                isActive("/dashboard") ? "text-white" : "text-white/60"
              } hover:text-white transition-colors`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className={`${
                isActive("/admin") ? "text-white" : "text-white/60"
              } hover:text-white transition-colors`}
            >
              Admin
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-white/80 hover:text-white text-sm">Login</Link>
            <Link href="/signup" className="bg-[#E50914] hover:bg-[#B2070F] text-white px-3 py-2 rounded text-sm">Sign up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
