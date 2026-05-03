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

const TABLE_PAGE_SIZE = 6;

export default function DashboardPage() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PurchaseRecord["status"]>("all");
  const [tablePage, setTablePage] = useState(1);

  async function load() {
    setError("");
    try {
      const me = await portalService.getCurrentUser();
      const [watchlist, purchaseHistory, overview] = await Promise.all([
        portalService.getWatchlist(),
        me.role === "admin" ? portalService.getAllPurchases() : portalService.getPurchaseHistory(),
        me.role === "admin" ? portalService.getAdminOverview() : Promise.resolve(null),
      ]);
      setUser(me);
      setWatchlistCount(watchlist.length);
      setPurchaseCount(purchaseHistory.length);
      setPurchases(purchaseHistory);
      setAdminOverview(overview as AdminOverview | null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      setAdminOverview(null);
    }
  }

  useEffect(() => {
    async function fetchData() {
      await load();
    }
    fetchData();
  }, []);

  const filteredPurchases = useMemo(() => {
    if (statusFilter === "all") return purchases;
    return purchases.filter((item) => item.status === statusFilter);
  }, [purchases, statusFilter]);

  const totalPurchasePages = useMemo(
    () => Math.max(1, Math.ceil(filteredPurchases.length / TABLE_PAGE_SIZE)),
    [filteredPurchases.length],
  );

  const paginatedPurchases = useMemo(() => {
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return filteredPurchases.slice(start, start + TABLE_PAGE_SIZE);
  }, [filteredPurchases, tablePage]);

  const metricCards = useMemo(
    () => [
      { label: "Watchlist", value: watchlistCount, icon: Bookmark },
      { label: "Purchases", value: purchaseCount, icon: ShoppingBag },
      { label: "Role Access", value: user?.role === "admin" ? 100 : 60, icon: Star },
      { label: "Catalog", value: adminOverview?.totalMedia ?? 0, icon: Film },
    ],
    [watchlistCount, purchaseCount, user?.role, adminOverview?.totalMedia],
  );

  const lineData = useMemo(() => {
    const monthlyTotals = new Map<string, number>();
    purchases.forEach((item) => {
      const month = new Date(item.createdAt).toLocaleString("en-US", { month: "short" });
      monthlyTotals.set(month, (monthlyTotals.get(month) ?? 0) + item.amount);
    });

    if (monthlyTotals.size === 0) {
      return [
        { month: "Jan", amount: 0 },
        { month: "Feb", amount: 0 },
        { month: "Mar", amount: 0 },
      ];
    }

    return Array.from(monthlyTotals.entries()).map(([month, amount]) => ({ month, amount }));
  }, [purchases]);

  const sidebarItems = useMemo(() => {
    const base = [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/watchlist", label: "Watchlist", icon: Bookmark },
      { href: "/purchases", label: "Purchases", icon: ShoppingBag },
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
                  <DropdownMenuItem asChild><Link href="/purchases">Purchases</Link></DropdownMenuItem>
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

            <div className="grid xl:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-foreground">Revenue Trend</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#E50914" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-foreground">Platform Activity</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metricCards.map((m) => ({ name: m.label, value: m.value }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#E50914" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-foreground">Purchase Records</CardTitle>
                <Select
                  value={statusFilter}
                  onValueChange={(value: "all" | PurchaseRecord["status"]) => {
                    setStatusFilter(value);
                    setTablePage(1);
                  }}
                >
                  <SelectTrigger className="w-44 bg-card border-border text-foreground">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPurchases.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="uppercase">{item.type}</TableCell>
                        <TableCell>${item.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize border-border">{item.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {paginatedPurchases.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No records found for this filter.</p>
                ) : null}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="bg-card border-border"
                    disabled={tablePage <= 1}
                    onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-card border-border"
                    disabled={tablePage >= totalPurchasePages}
                    onClick={() => setTablePage((p) => Math.min(totalPurchasePages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            {user?.role === "admin" ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" />Admin Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-3 text-sm">
                    <div className="rounded-md bg-background border border-border p-3"><p className="text-muted-foreground">Total Media</p><p className="text-foreground text-xl">{adminOverview?.totalMedia ?? 0}</p></div>
                    <div className="rounded-md bg-background border border-border p-3"><p className="text-muted-foreground">Pending Reviews</p><p className="text-foreground text-xl">{adminOverview?.pendingReviews ?? 0}</p></div>
                    <div className="rounded-md bg-background border border-border p-3"><p className="text-muted-foreground">Revenue</p><p className="text-foreground text-xl">${(adminOverview?.totalRevenue ?? 0).toFixed(2)}</p></div>
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
