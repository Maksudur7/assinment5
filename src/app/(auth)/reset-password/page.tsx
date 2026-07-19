"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Lock, Film, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";
import { authFetchers } from "@/src/lib/fetchers/core";
import { triggerGlobalError } from "@/src/lib/events";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const tokenValue = url.searchParams.get("token") ?? "";
    setToken(tokenValue);
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);

    if (!token.trim()) {
      triggerGlobalError({ title: "Missing Token", message: "Reset token is required.", action: "dismiss" });
      return;
    }

    if (newPassword.length < 8) {
      triggerGlobalError({ title: "Weak Password", message: "Password must be at least 8 characters.", action: "dismiss" });
      return;
    }

    setLoading(true);
    try {
      await authFetchers.resetPassword(token.trim(), newPassword);
      setSuccess(true);
      setNewPassword("");
    } catch (err) {
      triggerGlobalError({ 
        title: "Reset Failed", 
        message: err instanceof Error ? err.message : "Failed to reset password.", 
        action: "dismiss" 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden bg-black">
      {/* Cinematic Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(229,9,20,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_rgba(255,255,255,0.03),transparent_40%)] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#E50914] p-2.5 rounded-lg group-hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(229,9,20,0.4)]">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-white">NGV</span>
          </Link>
        </div>

        {/* Glassmorphic Auth Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          
          <div className="mb-8">
            <h1 className="text-white text-2xl font-bold tracking-tight mb-1">Set New Password</h1>
            <p className="text-zinc-400 text-sm">Create a secure new password for your account.</p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Updated</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Your password has been changed successfully. You can now use your new password to sign in.
              </p>
              <Link 
                href="/login" 
                className="inline-block w-full bg-[#E50914] hover:bg-[#B2070F] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/20"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleReset}>
              
              {/* Token Field (Only shown if missing from URL, or as a read-only visual if present) */}
              <div className="space-y-1.5">
                <label htmlFor="token" className="text-zinc-300 text-sm font-medium">Reset Token</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#E50914] transition-colors">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your reset token"
                    className="w-full bg-black/40 border border-white/10 text-white pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all placeholder:text-zinc-600 font-mono text-sm"
                    required
                  />
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-zinc-300 text-sm font-medium">New Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#E50914] transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    required
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Create a strong password" 
                    className="w-full bg-black/40 border border-white/10 text-white pl-11 pr-11 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all placeholder:text-zinc-600" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword((v) => !v)} 
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 pt-1">Must be at least 8 characters long.</p>
              </div>
              
              <button 
                disabled={loading} 
                className="w-full bg-[#E50914] hover:bg-[#B2070F] disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
