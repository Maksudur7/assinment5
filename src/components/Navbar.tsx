/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";

import {
  Menu,
  Search,
  User,
  Home,
  Film,
  History,
  LayoutDashboard,
  Shield,
  X,
  Sun,
  Moon,
  LogOut,
  LogIn,
  ChevronRight,
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
import { getStoredUser, getAuthToken, clearStore, setStoredUser, setAuthToken } from "@/src/lib/portal/storage";
import { httpPortalService } from "@/src/lib/portal/httpService";
import { portalService } from "@/src/lib/portal";
import type { MediaItem } from "@/src/lib/portal/types";
import { cn } from "./ui/utils";
import { NotificationCenter } from "./NotificationCenter";
import { NGVLogo } from "./ui/NGVLoader";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState<MediaItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchQuery(val);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

      if (val.trim().length >= 2) {
        setShowDropdown(true);
        setIsSearching(true);
        searchDebounceRef.current = setTimeout(async () => {
          try {
            const results = await httpPortalService.searchMedia(val.trim());
            setLiveResults(results.slice(0, 6));
          } catch (error) {
            console.error("Search error:", error);
          } finally {
            setIsSearching(false);
          }
        }, 300);
      } else {
        setShowDropdown(false);
        setLiveResults([]);
      }
    },
    [],
  );

  const handleSearchSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && searchQuery.trim()) {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        setShowDropdown(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [router, searchQuery, mobileMenuOpen],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let mountedLocal = true;

    // Fast initial check from storage
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setLoadingUser(false);
    } else {
      setLoadingUser(false);
    }

    const token = getAuthToken();
    if (token || session?.session?.token) {
      httpPortalService.getCurrentUser()
        .then((u) => {
          if (mountedLocal && u && u.id) {
            setUser(u);
            setStoredUser({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              image: u.image,
            });
          }
        })
        .catch(() => {
          if (mountedLocal) {
            setUser(null);
          }
        })
        .finally(() => {
          if (mountedLocal) setLoadingUser(false);
        });
    } else {
      if (mountedLocal) {
        setUser(null);
        setLoadingUser(false);
      }
    }

    return () => {
      mountedLocal = false;
    };
  }, [session]);

  const currentUser = user;
  const currentUserRole = String(currentUser?.role || getStoredUser()?.role || "user").toLowerCase();
  const isAdmin = currentUserRole === "admin";

  const handleLogout = async () => {
    clearStore();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setUser(null);
          setMobileMenuOpen(false);
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "All Titles", href: "/library", icon: Film },
    { name: "History", href: "/history", icon: History },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(mounted && isAdmin ? [{ name: "Admin", href: "/admin", icon: Shield }] : []),
  ];

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 bg-background/80 dark:bg-black/90 backdrop-blur-md border-b border-border/40 dark:border-white/10 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group">
              <NGVLogo size="sm" />
              <span className="text-foreground/50 dark:text-white/50 text-xs hidden lg:block leading-tight uppercase tracking-widest font-medium">
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
                      ? "bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Dynamic Notification Center */}
              <NotificationCenter />

              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/70 dark:text-white/70 hover:text-foreground dark:hover:text-white hover:bg-accent dark:hover:bg-white/10 rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
              </Button>

              {/* Search Bar */}
              <div className="hidden lg:flex relative">
                <div className="flex items-center gap-2 bg-accent dark:bg-white/5 rounded-full px-4 py-1.5 border border-border dark:border-white/10 focus-within:border-primary dark:focus-within:border-white/30 transition-all">
                  <Search className="w-4 h-4 text-muted-foreground dark:text-white/40" />
                  <Input
                    placeholder="Search titles..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchSubmit}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    onFocus={() => { if (searchQuery.length >= 2) setShowDropdown(true); }}
                    className="bg-transparent border-0 text-sm text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/40 focus-visible:ring-0 h-8 w-40 p-0"
                  />
                </div>

                {/* Live Search Dropdown */}
                {showDropdown && (
                  <div className="absolute top-12 right-0 w-80 sm:w-96 bg-background dark:bg-zinc-950 border border-border dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-200">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                    ) : liveResults.length > 0 ? (
                      <div className="py-2 divide-y divide-border/50 dark:divide-white/5">
                        {liveResults.map((item) => (
                          <Link
                            key={item.id}
                            href={`/watch/${item.id}`}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent dark:hover:bg-white/5 transition-colors group"
                          >
                            {/* Thumbnail / Poster Image */}
                            <div className="w-10 h-14 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-border dark:border-white/10 relative">
                              <ImageWithFallback
                                src={item.poster}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-foreground dark:text-white truncate group-hover:text-primary dark:group-hover:text-red-500 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-xs text-muted-foreground dark:text-zinc-400 truncate mt-0.5">
                                {item.releaseYear} • {item.genres?.[0] || "General"}
                              </p>
                              {item.duration && (
                                <span className="text-[10px] text-zinc-500 block mt-0.5">{item.duration}</span>
                              )}
                            </div>
                          </Link>
                        ))}
                        <div className="pt-2 px-2">
                          <Link
                            href={`/search?q=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setShowDropdown(false)}
                            className="block py-2 text-xs font-bold text-center text-primary dark:text-red-500 hover:underline bg-primary/5 dark:bg-red-500/10 rounded-xl transition-colors"
                          >
                            View All Results ({liveResults.length}+)
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0 overflow-hidden bg-accent dark:bg-white/5 border border-border dark:border-white/10 hover:bg-accent/80 dark:hover:bg-white/10"
                  >
                    {currentUser?.image ? (
                      <img
                        src={currentUser.image}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-foreground dark:text-white" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-background dark:bg-zinc-950 border-border dark:border-white/10 text-foreground dark:text-white p-3 rounded-2xl shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 duration-200"
                >
                  {currentUser ? (
                    <>
                      <div className="px-2 py-2 mb-2 border-b border-border dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-foreground dark:text-white truncate">
                            {currentUser.name}
                          </p>
                          <span className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                            isAdmin ? "bg-red-500/20 text-red-500 border-red-500/30" : "bg-accent text-muted-foreground border-border"
                          )}>
                            {isAdmin ? "Admin" : "Member"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-zinc-400 truncate mt-0.5">
                          {currentUser.email}
                        </p>
                      </div>

                      <DropdownMenuItem asChild className="cursor-pointer rounded-xl font-medium">
                        <Link href="/profile" className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>Profile & Settings</span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="cursor-pointer rounded-xl font-medium">
                        <Link href="/watchlist" className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-muted-foreground" />
                          <span>My Watchlist</span>
                        </Link>
                      </DropdownMenuItem>

                      {isAdmin && (
                        <DropdownMenuItem
                          asChild
                          className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer rounded-xl font-bold"
                        >
                          <Link href="/admin" className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-red-500" />
                            <span>Admin Console</span>
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <div className="h-px bg-border dark:bg-white/10 my-2" />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-500 focus:bg-red-500/10 cursor-pointer rounded-xl font-bold flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <div className="p-2 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-1">
                        <User className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground dark:text-white">Welcome to NGV</h4>
                        <p className="text-xs text-muted-foreground dark:text-zinc-400 mt-0.5">
                          Sign in to watch movies, series & save watchlist
                        </p>
                      </div>
                      <Link
                        href="/login"
                        className="block w-full bg-[#E50914] hover:bg-[#B2070F] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/30"
                      >
                        Sign In Now
                      </Link>
                      <Link
                        href="/signup"
                        className="block text-xs font-semibold text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors"
                      >
                        Don't have an account? <span className="text-red-500 underline">Sign Up</span>
                      </Link>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground/70 dark:text-white/70 hover:bg-white/10 rounded-full"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

      </nav>

      {/* Mobile Menu Portal — renders at document.body to escape nav stacking context */}
      {mobileMenuOpen && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] md:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer — slides in from right */}
          <div className="absolute right-0 top-0 h-full w-[300px] max-w-[90vw] bg-[#0a0a0a] border-l border-white/8 flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 group">
                <NGVLogo size="sm" />
                <span className="text-white/50 text-xs leading-tight uppercase tracking-widest font-medium">
                  Clean &amp; Secure
                  <br />
                  Streaming
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4 space-y-4">

                {/* User Card */}
                {currentUser ? (
                  <div className="bg-zinc-900/60 border border-white/8 rounded-xl p-3.5 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                      {currentUser.image ? (
                        <img src={currentUser.image} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{currentUser.name?.charAt(0)?.toUpperCase() || "U"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-white font-bold text-sm truncate leading-tight">{currentUser.name}</p>
                      <p className="text-zinc-500 text-[11px] truncate leading-tight mt-0.5">{currentUser.email}</p>
                    </div>
                    <span className={cn(
                      "shrink-0 text-[9px] uppercase font-black px-2 py-1 rounded-lg border tracking-wider",
                      isAdmin
                        ? "bg-[#E50914]/15 text-[#E50914] border-[#E50914]/30"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    )}>
                      {isAdmin ? "Admin" : "Member"}
                    </span>
                  </div>
                ) : (
                  <div className="bg-zinc-900/60 border border-white/8 rounded-xl p-4 text-center space-y-3">
                    <p className="text-zinc-300 text-sm font-medium">Sign in to enjoy NGV</p>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full bg-[#E50914] hover:bg-[#c5070f] text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                    >
                      Sign In Now
                    </Link>
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <div className="flex items-center gap-2.5 bg-zinc-900/60 rounded-xl px-3.5 py-2.5 border border-white/8 focus-within:border-[#E50914]/50 transition-all">
                    <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                    <Input
                      placeholder="Search movies, shows..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchSubmit}
                      className="bg-transparent border-0 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-0 h-auto w-full p-0 leading-none"
                    />
                  </div>
                  {showDropdown && liveResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                      {liveResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/watch/${item.id}`}
                          onClick={() => { setShowDropdown(false); setMobileMenuOpen(false); }}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          <div className="w-8 h-11 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                            <ImageWithFallback src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-white truncate block">{item.title}</span>
                            <span className="text-[10px] text-zinc-500 block mt-0.5">{item.releaseYear}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.15em] px-1 mb-2">Navigation</p>
                  <div className="space-y-0.5">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all w-full min-w-0",
                            isActive
                              ? "bg-[#E50914] text-white"
                              : "text-zinc-300 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <item.icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-white" : "text-zinc-500")} />
                          <span className="flex-1 truncate">{item.name}</span>
                          <ChevronRight className={cn("w-4 h-4 shrink-0", isActive ? "text-white/70" : "text-zinc-700")} />
                        </Link>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-4 border-t border-white/8 space-y-2 shrink-0">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-zinc-500 font-medium">Appearance</span>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/8 transition-all"
                >
                  {theme === "dark"
                    ? <><Sun className="w-3.5 h-3.5 text-amber-400" /> Light</>
                    : <><Moon className="w-3.5 h-3.5 text-blue-400" /> Dark</>}
                </button>
              </div>
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-all"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}