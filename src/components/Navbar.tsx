"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Menu,
  Search,
  User,
  Home,
  Film,
  LayoutDashboard,
  BadgeDollarSign,
  CreditCard,
  Shield,
  X,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";


import { authClient } from "@/src/lib/auth-client";
import { getStoredUser, clearStore } from "@/src/lib/portal/storage";
import { httpPortalService } from "@/src/lib/portal/httpService";
import type { UserRole } from "@/src/lib/portal/types";
import { cn } from "./ui/utils";


export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Robust user state: always try backend, fallback to session/localStorage
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoadingUser(true);
    httpPortalService.getCurrentUser()
      .then((u) => {
        if (mounted) {
          setUser(u);
          setLoadingUser(false);
        }
      })
      .catch(() => {
        // fallback: session or localStorage
        if (mounted) {
          setUser(session?.user || getStoredUser() || null);
          setLoadingUser(false);
        }
      });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user]);

  const currentUser = user;
  const currentUserRole: UserRole = currentUser?.role || "user";
  const isAdmin = currentUserRole === "admin";


  const handleLogout = async () => {
    clearStore();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setUser(null);
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  // Navigation Config
  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "All Titles", href: "/library", icon: Film },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: Shield }] : []),
    { name: "Plans", href: "/subscription", icon: BadgeDollarSign },
    { name: "Checkout", href: "/card", icon: CreditCard },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-red-600 px-3 py-1.5 rounded shadow-lg group-hover:bg-red-700 transition-colors">
              <span className="text-white font-bold tracking-tighter text-xl">
                NGV
              </span>
            </div>
            <span className="text-white/50 text-xs hidden lg:block leading-tight uppercase tracking-widest">
              Clean & Secure
              <br />
              Streaming
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Bar */}
            <div className="hidden lg:flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 border border-white/10 focus-within:border-white/30 transition-all">
              <Search className="w-4 h-4 text-white/40" />
              <Input
                placeholder="Search..."
                className="bg-transparent border-0 text-sm text-white placeholder:text-white/40 focus-visible:ring-0 h-8 w-40 p-0"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            >
              <Bell className="w-5 h-5" />
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  <User className="w-5 h-5 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-zinc-950 border-white/10 text-white p-2"
              >
                <div className="px-2 py-1.5 mb-2 border-b border-white/5">
                  <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                    Account
                  </p>
                  <p className="text-sm font-medium truncate">
                    {loadingUser ? "Loading..." : (currentUser?.name || "Guest")}
                  </p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/purchases">Purchases</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/watchlist">Watchlist</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    asChild
                    className="text-red-400 focus:text-red-400"
                  >
                    <Link href="/admin">Admin Console</Link>
                  </DropdownMenuItem>
                )}
                <div className="h-px bg-white/10 my-1" />
                {currentUser ? (
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 focus:bg-red-500/10 cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                ) : loadingUser ? (
                  <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/70"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z- md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-70 bg-zinc-950 p-6 border-l border-white/10 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-xl">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-6 h-6 text-white" />
              </Button>
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl text-lg font-medium transition-colors",
                    pathname === item.href
                      ? "bg-red-600 text-white"
                      : "text-white/60 hover:bg-white/5",
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
}
