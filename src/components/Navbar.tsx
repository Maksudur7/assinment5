/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";

import {
  Menu,
  Search,
  User,
  Home,
  Film,
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
import { getStoredUser, clearStore, setStoredUser, setAuthToken } from "@/src/lib/portal/storage";
import { httpPortalService } from "@/src/lib/portal/httpService";
import { portalService } from "@/src/lib/portal";
import type { MediaItem } from "@/src/lib/portal/types";
import { cn } from "./ui/utils";
import { NotificationCenter } from "./NotificationCenter";
import { NGVLogo } from "./ui/NGVLoader";

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
            const results = await (portalService as any).searchMedia(val.trim());
            setLiveResults(results.slice(0, 5));
          } catch (error) {
            console.error(error);
          } finally {
            setIsSearching(false);
          }
        }, 400);
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

    if (session?.session?.token) {
      setAuthToken(session.session.token);
    }

    setLoadingUser(true);
    httpPortalService.getCurrentUser()
      .then((u) => {
        if (mountedLocal && u) {
          setUser(u);
          setStoredUser({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            image: u.image,
          });
          setLoadingUser(false);
        } else if (mountedLocal && session?.user) {
          const sessionRole = (session.user as any).role || getStoredUser()?.role || "user";
          setUser({
            ...session.user,
            role: sessionRole,
          });
          setLoadingUser(false);
        }
      })
      .catch(() => {
        if (mountedLocal) {
          const stored = getStoredUser();
          if (stored) {
            setUser(stored);
          } else if (session?.user) {
            const sessionRole = (session.user as any).role || "user";
            setUser({
              ...session.user,
              role: sessionRole,
            });
          } else {
            setUser(null);
          }
          setLoadingUser(false);
        }
      });

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
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(mounted && isAdmin ? [{ name: "Admin", href: "/admin", icon: Shield }] : []),
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 dark:bg-black/90 backdrop-blur-md border-b border-border/40 dark:border-white/10 transition-colors duration-300">
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
                <div className="absolute top-12 right-0 w-64 bg-background dark:bg-zinc-950 border border-border dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                  ) : liveResults.length > 0 ? (
                    <div className="py-2">
                      {liveResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/watch/${item.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex flex-col px-4 py-2 hover:bg-accent dark:hover:bg-white/5 transition-colors"
                        >
                          <span className="text-sm font-medium text-foreground dark:text-white truncate">{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.releaseYear} • {item.genres[0]}</span>
                        </Link>
                      ))}
                      <div className="border-t border-border dark:border-white/10 mt-2">
                        <Link 
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2 text-xs font-semibold text-center text-primary dark:text-red-500 hover:underline"
                        >
                          View All Results
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
                className="w-56 bg-background dark:bg-zinc-950 border-border dark:border-white/10 text-foreground dark:text-white p-2"
              >
                <div className="px-2 py-1.5 mb-2 border-b border-border dark:border-white/5">
                  <p className="text-xs text-muted-foreground dark:text-white/40 uppercase tracking-widest font-semibold">
                    Account
                  </p>
                  <p className="text-sm font-medium truncate">
                    {loadingUser ? "Loading..." : (currentUser?.name || "Guest")}
                  </p>
                </div>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/watchlist">Watchlist</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    asChild
                    className="text-red-500 focus:text-red-600 cursor-pointer font-semibold"
                  >
                    <Link href="/admin">Admin Console</Link>
                  </DropdownMenuItem>
                )}
                <div className="h-px bg-border dark:bg-white/10 my-1" />
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
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
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

      {/* Pixel-Perfect Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop with Blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding Glassmorphic Container */}
          <div className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-zinc-950/95 border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="space-y-6">
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <NGVLogo size="sm" />
                  <span className="text-white font-extrabold tracking-wider text-base">NGV</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-white rounded-full hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* User Profile Quick Card */}
              {currentUser ? (
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-900/50 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-white font-bold overflow-hidden">
                      {currentUser.image ? (
                        <img src={currentUser.image} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name?.charAt(0) || "U"
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-white font-bold text-sm truncate">{currentUser.name}</p>
                      <p className="text-zinc-400 text-xs truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
                    isAdmin ? "bg-red-500/20 text-red-400 border-red-500/40" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  )}>
                    {isAdmin ? "Admin" : "Member"}
                  </span>
                </div>
              ) : (
                <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 text-center space-y-3">
                  <p className="text-zinc-300 text-sm font-medium">Enjoy full access to NGV Streaming</p>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/30"
                  >
                    Sign In Now
                  </Link>
                </div>
              )}

              {/* Mobile Search Box */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-zinc-900/80 rounded-xl px-3.5 py-2 border border-white/10 focus-within:border-red-500 transition-all">
                  <Search className="w-4 h-4 text-zinc-400" />
                  <Input
                    placeholder="Search movies, shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchSubmit}
                    className="bg-transparent border-0 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-0 h-8 w-full p-0"
                  />
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-2 mb-2">Menu</p>
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                        isActive
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                          : "text-zinc-300 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-400")} />
                        {item.name}
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Theme Mode</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-xs text-white bg-white/5 hover:bg-white/10 rounded-xl px-3"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4 mr-1 text-amber-400" /> : <Moon className="w-4 h-4 mr-1 text-blue-400" />}
                  {theme === "dark" ? "Light" : "Dark"}
                </Button>
              </div>

              {currentUser && (
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start gap-3 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}