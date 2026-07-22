"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bookmark,
  Film,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { portalService } from "@/src/lib/portal";
import type { AdminOverview, PortalUser, PurchaseRecord } from "@/src/lib/portal/types";
import { authClient } from "@/src/lib/auth-client";

const TABLE_PAGE_SIZE = 6;

export default function DashboardPage() {
  const { data: currentSessionData } = authClient.useSession();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const me = await portalService.getCurrentUser();
      const sessionUser = currentSessionData?.user;
      
      const currentUser: PortalUser | null = me || (sessionUser ? {
        id: sessionUser.id,
        name: sessionUser.name || "User",
        email: sessionUser.email || "",
        role: (sessionUser as any).role || "user",
        image: sessionUser.image || undefined,
        hasPassword: true,
      } : null);

      setUser(currentUser);

      const [watchlist, overview] = await Promise.all([
        portalService.getWatchlist().catch(() => []),
        currentUser?.role === "admin" ? portalService.getAdminOverview().catch(() => null) : Promise.resolve(null),
      ]);

      const validWatchlist = Array.isArray(watchlist) ? watchlist : [];
      setWatchlistCount(validWatchlist.length);
      setAdminOverview(overview as AdminOverview | null);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setAdminOverview(null);
    }
  }

  useEffect(() => {
    async function fetchData() {
      await load();
    }
    fetchData();
  }, [currentSessionData?.user?.id]);

  const metricCards = useMemo(
    () => [
      { label: "Watchlist", value: watchlistCount, icon: Bookmark },
      { label: "Role Access", value: user?.role === "admin" ? 100 : 60, icon: Star },
      { label: "Catalog", value: adminOverview?.totalMedia ?? 0, icon: Film },
    ],
    [watchlistCount, user?.role, adminOverview?.totalMedia],
  );

  const sidebarItems = useMemo(() => {
    const base = [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/watchlist", label: "Watchlist", icon: Bookmark },
      { href: "/profile", label: "Profile", icon: User },
    ];
    if (user?.role === "admin") {
      return [
        ...base,
        { href: "/admin", label: "Admin Console", icon: Shield },
        { href: "/api-spec", label: "Reports", icon: BarChart3 },
      ];
    }
    return base;
  }, [user?.role]);

  async function handleLogout() {
    await portalService.logout();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 transition-colors duration-300">
      <div className="max-w-350 mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <aside className="rounded-lg border border-border bg-card p-4 h-fit">
            <p className="text-sm text-muted-foreground mb-3">Dashboard Menu</p>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <section className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-foreground text-3xl mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.name ?? "Viewer"}</p>
                {error ? <p className="text-destructive text-sm mt-2">{error}</p> : null}
                <div className="mt-3">
                  <Badge className="bg-primary text-primary-foreground uppercase">{user?.role ?? "user"}</Badge>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-card border-border">
                    <User className="w-4 h-4 mr-2" />
                    {user?.name ?? "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                  <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>

                  <DropdownMenuItem onClick={() => void handleLogout()} className="text-red-500">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              {metricCards.map((item) => (
                <Card key={item.label} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground text-base flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-primary" />
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-foreground text-3xl">{item.value}</p></CardContent>
                </Card>
              ))}
            </div>



            {user?.role === "admin" ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" />Admin Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-3 text-sm">
                    <div className="rounded-md bg-background border border-border p-3"><p className="text-muted-foreground">Total Media</p><p className="text-foreground text-xl">{adminOverview?.totalMedia ?? 0}</p></div>
                    <div className="rounded-md bg-background border border-border p-3"><p className="text-muted-foreground">Pending Reviews</p><p className="text-foreground text-xl">{adminOverview?.pendingReviews ?? 0}</p></div>

                    <div className="rounded-md bg-background border border-border p-3"><p className="text-muted-foreground">Hidden Comments</p><p className="text-foreground text-xl">{adminOverview?.hiddenComments ?? 0}</p></div>
                  </div>
                  <Button asChild variant="outline" className="bg-card border-border"><Link href="/admin"><BarChart3 className="w-4 h-4 mr-2" />Open Admin Console</Link></Button>
                </CardContent>
              </Card>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
