"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search, User } from "lucide-react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 py-4">
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

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden lg:flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <Search className="w-4 h-4 text-white/60" />
              <Input
                type="text"
                placeholder="Search movies, series..."
                className="bg-transparent border-0 text-white placeholder:text-white/40 focus-visible:ring-0 h-auto p-0 w-[200px]"
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
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/login">Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Logout</DropdownMenuItem>
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
