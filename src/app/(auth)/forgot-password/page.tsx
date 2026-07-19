"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Film, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authFetchers } from "@/src/lib/fetchers/core";
import { triggerGlobalError } from "@/src/lib/events";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);

    if (!email.includes("@")) {
      triggerGlobalError({ title: "Invalid Email", message: "Please enter a valid email address.", action: "dismiss" });
      return;
    }

    setLoading(true);
    try {
      await authFetchers.requestPasswordReset(email.trim());
      setSuccess(true);
    } catch (err) {
      triggerGlobalError({ 
        title: "Request Failed", 
        message: err instanceof Error ? err.message : "Failed to request reset link.", 
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

        {/* Glassmorphic Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          
          <div className="mb-8">
            <h1 className="text-white text-2xl font-bold tracking-tight mb-1">Reset Password</h1>
            <p className="text-zinc-400 text-sm">Enter your email to receive a reset link.</p>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                If an account exists for <span className="text-white font-medium">{email}</span>, 
                we have sent a password reset link.
              </p>
              <Link 
                href="/login" 
                className="inline-block w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-colors border border-white/10"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleRequest}>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-zinc-300 text-sm font-medium">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#E50914] transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    required
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@example.com" 
                    className="w-full bg-black/40 border border-white/10 text-white pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-all placeholder:text-zinc-600" 
                  />
                </div>
              </div>
              <button 
                disabled={loading} 
                className="w-full bg-[#E50914] hover:bg-[#B2070F] disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
