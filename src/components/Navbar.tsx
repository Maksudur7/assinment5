/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";

import {
  Bell,
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
import type { UserRole, MediaItem } from "@/src/lib/portal/types";
import { cn } from "./ui/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme(); // Added
  const [mounted, setMounted] = useState(false); // Added
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


  // Mount logic for hydration safety
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(() => true);
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
            <div className="bg-red-600 px-3 py-1.5 rounded shadow-lg group-hover:bg-red-700 transition-colors">
              <span className="text-white font-bold tracking-tighter text-xl">
                NGV
              </span>
            </div>
            <span className="text-foreground/50 dark:text-white/50 text-xs hidden lg:block leading-tight uppercase tracking-widest">
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
                    ? "bg-primary text-primary-foreground dark:bg-white/10 dark:text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
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

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 dark:text-white/70 hover:text-foreground dark:hover:text-white hover:bg-accent dark:hover:bg-white/10 rounded-full"
            >
              <Bell className="w-5 h-5" />
            </Button>

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
                    className="text-red-500 focus:text-red-600 cursor-pointer"
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
              className="md:hidden text-foreground/70 dark:text-white/70"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-72 bg-background dark:bg-zinc-950 p-6 border-l border-border dark:border-white/10 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8 text-foreground dark:text-white">
              <span className="font-bold text-xl">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <nav className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-accent dark:bg-white/5 rounded-xl px-4 py-2 border border-border dark:border-white/10 mb-4">
                <Search className="w-5 h-5 text-muted-foreground dark:text-white/40" />
                <Input
                  placeholder="Search titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  className="bg-transparent border-0 text-base text-foreground dark:text-white placeholder:text-muted-foreground focus-visible:ring-0 h-10 w-full p-0"
                />
              </div>

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl text-lg font-medium transition-colors",
                    pathname === item.href
                      ? "bg-red-600 text-white"
                      : "text-muted-foreground dark:text-white/60 hover:bg-accent dark:hover:bg-white/5",
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