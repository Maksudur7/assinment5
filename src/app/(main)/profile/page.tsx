"use client";

import { useEffect, useState } from "react";
import { User, Wallet } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { portalService } from "@/src/lib/portal";
import { setStoredUser } from "@/src/lib/portal/storage";
import type { PortalUser } from "@/src/lib/portal/types";


export default function ProfilePage() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [error, setError] = useState("");
  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setError("");
    try {
      const [u, w, p] = await Promise.all([
        portalService.getCurrentUser(),
        portalService.getWatchlist(),
        portalService.getPurchaseHistory(),
      ]);
      setUser(u);
      setEditableName(u?.name ?? "");
      setEditableEmail(u?.email ?? "");
      setWatchlistCount((w as import("@/src/lib/portal/types").MediaItem[]).length);
      setPurchaseCount((p as import("@/src/lib/portal/types").PurchaseRecord[]).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile data");
    }
  }

  useEffect(() => {
    async function fetchData() {
      await load();
    }
    fetchData();
  }, []);

  async function handleSaveProfile() {
    setError("");
    setSuccess("");

    if (!editableName.trim()) {
      setError("Name is required.");
      return;
    }

    if (!editableEmail.includes("@")) {
      setError("Valid email is required.");
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      const updated: PortalUser = {
        ...user,
        name: editableName.trim(),
        email: editableEmail.trim(),
      };
      setUser(updated);
      setStoredUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      });
      setSuccess("Profile updated successfully.");
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="min-h-screen bg-background text-foreground pt-20 transition-colors duration-300">
      <div className="max-w-250 mx-auto px-6 py-8 space-y-6">
        <div className="rounded-lg bg-card border border-border p-8 transition-colors duration-300">
          <h1 className="text-foreground text-3xl mb-2">User Profile</h1>
          <p className="text-muted-foreground">Manage account state, purchases and personalization.</p>
          {error ? <p className="text-destructive text-sm mt-2">{error}</p> : null}
          {success ? <p className="text-green-500 text-sm mt-2">{success}</p> : null}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card border-border md:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/80">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Name</p>
                <Input value={editableName} onChange={(e) => setEditableName(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <Input value={editableEmail} onChange={(e) => setEditableEmail(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <p><span className="text-muted-foreground">Role:</span> <Badge className="ml-2 bg-primary text-primary-foreground">{user?.role}</Badge></p>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => void handleSaveProfile()} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2"><Wallet className="w-5 h-5 text-primary" /> Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-foreground/80">
              <p>Watchlist: <span className="text-foreground">{watchlistCount}</span></p>
              <p>Purchases: <span className="text-foreground">{purchaseCount}</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
