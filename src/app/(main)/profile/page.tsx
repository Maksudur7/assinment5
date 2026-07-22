"use client";

import { useEffect, useMemo, useState } from "react";
import { User, Wallet, History, Camera, Lock, Shield, Laptop, Smartphone } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/src/components/ui/badge";
import { ImageWithFallback } from "@/src/components/figma/ImageWithFallback";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { portalService } from "@/src/lib/portal";
import { setStoredUser, getAuthToken } from "@/src/lib/portal/storage";
import type { PortalUser } from "@/src/lib/portal/types";
import { authClient } from "@/src/lib/auth-client";

function parseDeviceName(userAgent?: string): string {
  if (!userAgent) return "Unknown Device";
  const ua = userAgent.toLowerCase();

  let browser = "Browser";
  if (ua.includes("edg/")) browser = "Microsoft Edge";
  else if (ua.includes("chrome") || ua.includes("crios")) browser = "Google Chrome";
  else if (ua.includes("firefox") || ua.includes("fxios")) browser = "Mozilla Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Apple Safari";
  else if (ua.includes("opera") || ua.includes("opr/")) browser = "Opera";

  let os = "PC";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone")) os = "iPhone";
  else if (ua.includes("ipad")) os = "iPad";
  else if (ua.includes("mac os") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";

  return `${browser} on ${os}`;
}

export default function ProfilePage() {
  const { data: currentSessionData } = authClient.useSession();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Active Sessions States
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);

  async function load() {
    setError("");
    try {
      const [u, w, h] = await Promise.all([
        portalService.getCurrentUser().catch(() => null),
        portalService.getWatchlist().catch(() => []),
        portalService.getWatchHistory().catch(() => []),
      ]);

      const sessionUser = currentSessionData?.user;
      const currentUser: PortalUser | null = u || (sessionUser ? {
        id: sessionUser.id,
        name: sessionUser.name || "User",
        email: sessionUser.email || "",
        role: (sessionUser as any).role || "user",
        image: sessionUser.image || undefined,
        hasPassword: true,
      } : null);

      setUser(currentUser);
      setEditableName(currentUser?.name ?? "");
      setEditableEmail(currentUser?.email ?? "");
      
      const validWatchlist = Array.isArray(w) ? w : [];
      setWatchlistCount(validWatchlist.length);
      setWatchHistory(Array.isArray(h) ? h : []);
    } catch (err) {
      console.error("Profile load error:", err);
    }
  }

  async function loadSessions() {
    setLoadingSessions(true);
    try {
      const [sessionsRes, currRes] = await Promise.all([
        authClient.listSessions(),
        authClient.getSession(),
      ]);

      const activeSessions = (sessionsRes as any)?.data || (sessionsRes as any) || [];
      setSessions(Array.isArray(activeSessions) ? activeSessions : []);
      setCurrentSession((currRes as any)?.data || currRes || null);
    } catch (e) {
      console.error("Failed to load sessions", e);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }

  const uniqueDevices = useMemo(() => {
    const currentToken = currentSession?.session?.token || currentSession?.token;
    const currentId = currentSession?.session?.id || currentSession?.id;

    const deviceMap = new Map<string, {
      id: string;
      token: string;
      deviceName: string;
      rawUserAgent: string;
      ipAddress: string;
      updatedAt: string | Date;
      isCurrent: boolean;
      allTokens: string[];
    }>();

    for (const sessionItem of sessions) {
      const isCurrent =
        (sessionItem.token && sessionItem.token === currentToken) ||
        (sessionItem.id && sessionItem.id === currentId);

      const deviceName = parseDeviceName(sessionItem.userAgent);
      const ip = sessionItem.ipAddress || "127.0.0.1";
      const key = `${deviceName}_${ip}`;

      const existing = deviceMap.get(key);
      if (!existing) {
        deviceMap.set(key, {
          id: sessionItem.id,
          token: sessionItem.token || sessionItem.id,
          deviceName,
          rawUserAgent: sessionItem.userAgent || "",
          ipAddress: ip,
          updatedAt: sessionItem.updatedAt || new Date(),
          isCurrent,
          allTokens: [sessionItem.token || sessionItem.id],
        });
      } else {
        existing.allTokens.push(sessionItem.token || sessionItem.id);
        if (isCurrent) {
          existing.isCurrent = true;
          existing.id = sessionItem.id;
          existing.token = sessionItem.token || sessionItem.id;
        }
        if (new Date(sessionItem.updatedAt) > new Date(existing.updatedAt)) {
          existing.updatedAt = sessionItem.updatedAt;
        }
      }
    }

    return Array.from(deviceMap.values()).sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0));
  }, [sessions, currentSession]);

  async function handleRevokeDevice(tokens: string[]) {
    try {
      await Promise.all(tokens.map((t) => authClient.revokeSession({ token: t })));
      await loadSessions();
    } catch (e) {
      console.error("Failed to revoke device", e);
    }
  }

  async function handleRevokeAllSessions() {
    try {
      await authClient.revokeOtherSessions();
      await loadSessions();
    } catch (e) {
      console.error("Failed to revoke all sessions", e);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!user) return;

    if (!user.hasPassword) {
      if (!newPassword || !confirmPassword) {
        setPasswordError("All password fields are required.");
        return;
      }

      if (newPassword.length < 8) {
        setPasswordError("New password must be at least 8 characters.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        return;
      }

      setUpdatingPassword(true);
      try {
        await (authClient as any).setPassword({
          newPassword,
        });
        setPasswordSuccess("Password set successfully. You can now sign in using email & password.");
        setUser({
          ...user,
          hasPassword: true,
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err: any) {
        setPasswordError(err?.message || "Failed to set password.");
      } finally {
        setUpdatingPassword(false);
      }
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to change password. Please check your current password.");
    } finally {
      setUpdatingPassword(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      await Promise.all([load(), loadSessions()]);
    }
    fetchData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      let finalImageUrl = user.image;

      // 1. Upload Base64 image to backend first to get a short URL
      if (previewImage) {
        const uploadResult = await (portalService as any).uploadAvatar(previewImage);
        if (uploadResult?.image) {
          finalImageUrl = uploadResult.image;
        }
      }

      // 2. Call Better Auth to update user details with short URL
      await authClient.updateUser({
        name: editableName.trim(),
        image: finalImageUrl || undefined,
      });

      // 3. Call backend updateProfile to persist name and email changes
      await (portalService as any).updateProfile(
        editableName.trim(),
        editableEmail.trim()
      );

      const updated: PortalUser = {
        ...user,
        name: editableName.trim(),
        email: editableEmail.trim(),
        image: finalImageUrl,
      };
      setUser(updated);
      setStoredUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        image: finalImageUrl,
      });

      // Update local storage store
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem("ngv-portal-store-v2");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            parsed.user = {
              ...parsed.user,
              name: updated.name,
              email: updated.email,
              image: updated.image,
            };
            window.localStorage.setItem("ngv-portal-store-v2", JSON.stringify(parsed));
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      setError(err?.message || "Failed to update profile.");
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
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-foreground/80">
              {/* Profile Image Upload section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/40">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-primary shadow-lg shrink-0">
                  {previewImage || user?.image ? (
                    <img
                      src={previewImage || user?.image}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300"
                  >
                    <Camera className="w-5 h-5 text-white mb-0.5" />
                    <span className="text-[10px] text-white font-semibold">Change</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <h3 className="text-white font-bold text-lg leading-none">{editableName || "Guest User"}</h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {user?.role === "admin" ? (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold flex items-center gap-1 shadow-md border-0">
                        👑 Admin
                      </Badge>
                    ) : (
                      <Badge className="bg-zinc-800 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold flex items-center gap-1">
                        🎬 Viewer
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{editableEmail}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Name</p>
                <Input value={editableName} onChange={(e) => setEditableName(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <Input value={editableEmail} onChange={(e) => setEditableEmail(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-[1.01]" onClick={() => void handleSaveProfile()} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> Security & Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && <p className="text-destructive text-sm font-semibold">{passwordError}</p>}
                {passwordSuccess && <p className="text-green-500 text-sm font-semibold">{passwordSuccess}</p>}
                {user?.hasPassword && (
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Current Password</label>
                    <Input 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="bg-input border-border text-foreground" 
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{user?.hasPassword ? "New Password" : "Create Password"}</label>
                  <Input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="bg-input border-border text-foreground" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Confirm New Password</label>
                  <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="bg-input border-border text-foreground" 
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#E50914] hover:bg-[#B2070F] text-white font-bold" 
                  disabled={updatingPassword}
                >
                  {updatingPassword ? "Updating..." : (user?.hasPassword ? "Change Password" : "Set Password")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Active Devices & Sessions Section */}
        <Card className="bg-card border-border mt-6">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Active Devices & Sessions
            </CardTitle>
            {uniqueDevices.length > 1 && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleRevokeAllSessions}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Log out all other devices
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loadingSessions ? (
              <p className="text-muted-foreground text-sm">Loading active sessions...</p>
            ) : uniqueDevices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active sessions found.</p>
            ) : (
              <div className="divide-y divide-border/40">
                {uniqueDevices.map((device) => {
                  return (
                    <div key={`${device.deviceName}_${device.ipAddress}`} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                          <Laptop className="w-4 h-4 text-primary" />
                          {device.deviceName}
                          {device.isCurrent && (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold">
                              Current Device
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          IP: <span className="font-mono text-zinc-300">{device.ipAddress}</span> • Last accessed: {new Date(device.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      {!device.isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeDevice(device.allTokens)}
                          className="border-border hover:bg-white/5 text-xs font-semibold text-red-400 hover:text-red-300"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border mt-6">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Watch History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {watchHistory.length === 0 ? (
              <p className="text-muted-foreground">No watch history available.</p>
            ) : (
              <div className="space-y-4">
                {watchHistory.map((item) => (
                  <Link key={item.mediaId} href={`/watch/${item.mediaId}`} className="flex gap-4 group p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10">
                    <div className="w-40 h-24 shrink-0 rounded overflow-hidden relative bg-black">
                      <ImageWithFallback src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col justify-start flex-1 py-1">
                      <h4 className="text-foreground text-lg font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Watched on {new Date(item.watchedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
