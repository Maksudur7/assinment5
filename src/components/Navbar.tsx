"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, Search, User } from "lucide-react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { authClient } from "@/src/lib/auth-client";
import { useEffect, useState } from "react";
import { getStoredUser } from "@/src/lib/portal/storage";
import type { UserRole } from "@/src/lib/portal/types";


export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  // Local state for user from localStorage
  const [localUser, setLocalUser] = useState<{ id: string; name: string; email: string; role: UserRole } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        setLocalUser(getStoredUser());
      }, 0);
    }
  }, []);

  const currentUser = session?.user || localUser;
  const currentUserRole = currentUser?.email?.toLowerCase() === "admin@ngv.local" ? "admin" : "user";

  const isActive = (path: string) => pathname === path;

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-360 mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#E50914] px-4 py-2 rounded">
              <span className="text-white tracking-wider">NGV</span>
            </div>
            <span className="text-white/60 text-sm hidden md:block">
              Clean & Secure Streaming
            </span>
          </Link>

          {/* Navigation Links */}
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
              href="/library"
              className={`${
                isActive("/library") ? "text-white" : "text-white/60"
              } hover:text-white transition-colors`}
            >
              All Titles
            </Link>
            <Link
              href="/dashboard"
              className={`${
                isActive("/dashboard") ? "text-white" : "text-white/60"
              } hover:text-white transition-colors`}
            >
              Dashboard
            </Link>
            {currentUserRole === "admin" ? (
              <Link
                href="/admin"
                className={`${
                  isActive("/admin") ? "text-white" : "text-white/60"
                } hover:text-white transition-colors`}
              >
                Admin
              </Link>
            ) : null}
            <Link
              href="/subscription"
              className={`${
                isActive("/subscription") ? "text-white" : "text-white/60"
              } hover:text-white transition-colors`}
            >
              Plans
            </Link>
            <Link
              href="/card"
              className={`${
                isActive("/card") ? "text-white" : "text-white/60"
              } hover:text-white transition-colors`}
            >
              Checkout
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden lg:flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <Search className="w-4 h-4 text-white/60" />
              <Input
                type="text"
                placeholder="Search movies, series..."
                className="bg-transparent border-0 text-white placeholder:text-white/40 focus-visible:ring-0 h-auto p-0 w-50"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Bell className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/10 h-10 w-10 text-white">
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-white/10 text-white">
                <DropdownMenuItem className="text-white/70 pointer-events-none">
                  {currentUser?.name ?? "Guest"} • {currentUserRole}
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/purchases">Purchases</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/watchlist">Watchlist</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/card">Checkout</Link>
                </DropdownMenuItem>
                {currentUserRole === "admin" ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/admin">Admin Console</Link>
                  </DropdownMenuItem>
                ) : null}
                {!currentUser ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => void handleLogout()}>
                    Logout
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden text-white">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
