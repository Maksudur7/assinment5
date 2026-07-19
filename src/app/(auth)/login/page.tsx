"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Film, User, ShieldCheck } from "lucide-react";
import { authFetchers } from "@/src/lib/fetchers/core";
import { triggerGlobalError } from "@/src/lib/events";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState(""); 

  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [demoMenuOpen, setDemoMenuOpen] = useState(false);


  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSuccess("");

    if (!email.includes("@")) {
      triggerGlobalError({ title: "Invalid Email", message: "Please enter a valid email address.", action: "dismiss" });
      return;
    }

    if (password.length < 8) {
      triggerGlobalError({ title: "Weak Password", message: "Password must be at least 8 characters.", action: "dismiss" });
      return;
    }

    setLoading(true);
    try {
      await authFetchers.login(email, password);
      setSuccess("Login successful. Redirecting...");
      window.location.href = "/";
    } catch (err) {
      triggerGlobalError({ 
        title: "Login Failed", 
        message: err instanceof Error ? err.message : "An error occurred during login.", 
        action: "dismiss" 
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(provider: "google" | "facebook" | "github") {
    setSuccess("");
    setLoading(true);
    try {
      await authFetchers.socialLogin(provider);
    } catch (err) {
      triggerGlobalError({ 
        title: "Social Login Failed", 
        message: err instanceof Error ? err.message : "Social login failed.", 
        action: "dismiss" 
      });
      setLoading(false);
    }
  }

  function applyDemoCredentials(type: "user" | "admin") {
    if (type === "admin") {
      setEmail("admin@ngv.local");
      setPassword("admin12345");
    } else {
      setEmail("user@ngv.local");
      setPassword("user12345");
    }
    setDemoMenuOpen(false);
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
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight mb-1">Welcome Back</h1>
              <p className="text-zinc-400 text-sm">Sign in to continue watching</p>
            </div>

            {/* Discreet Demo Login Menu */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="text-xs font-medium text-zinc-500 hover:text-white transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1.5 rounded-md border border-white/5"
              >
                Demo Login
              </button>
              {demoMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-20">
                  <button onClick={() => applyDemoCredentials("user")} className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors">
                    <User className="w-3 h-3" /> Demo User
                  </button>
                  <button onClick={() => applyDemoCredentials("admin")} className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors border-t border-white/5">
                    <ShieldCheck className="w-3 h-3" /> Demo Admin
                  </button>
                </div>
              )}
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email Field */}
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-zinc-300 text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-[#E50914] text-xs font-medium hover:underline hover:text-[#B2070F] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#E50914] transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  required
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
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
            </div>
            
            {/* Success State */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            <button 
              disabled={loading} 
              className="w-full bg-[#E50914] hover:bg-[#B2070F] disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-zinc-900 text-zinc-500 text-xs uppercase tracking-wider font-semibold">Or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              disabled={loading} 
              onClick={() => void handleSocial("google")} 
              className="flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              {/* Simple Google SVG Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button 
              disabled={loading} 
              onClick={() => void handleSocial("facebook")} 
              className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white py-2.5 rounded-xl text-sm font-bold border border-white/10 transition-colors shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              Facebook
            </button>
          </div>

          <p className="text-center text-zinc-400 text-sm mt-8">
            New to NGV? <Link href="/signup" className="text-white hover:text-[#E50914] font-semibold transition-colors">Sign up now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}