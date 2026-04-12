"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authFetchers } from "@/src/lib/fetchers/core";

export default function Page() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("user@ngv.local");
  const [password, setPassword] = useState("user123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authFetchers.login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(provider: "google" | "facebook" | "github") {
    setError("");
    setLoading(true);
    try {
      await authFetchers.socialLogin(provider);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Social login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 rounded-lg p-8 border border-white/10">
        <h1 className="text-white text-2xl mb-2">Welcome Back</h1>
        <p className="text-white/60 mb-6">Login to continue watching</p>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="text-white text-sm">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="mt-1 w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded" />
          </div>
          <div>
            <label htmlFor="password" className="text-white text-sm">Password</label>
            <div className="mt-1 flex gap-2">
              <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="bg-white/10 text-white px-3 rounded">{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>
          {error ? <p className="text-red-400 text-sm">{error}</p> : null}
          <button disabled={loading} className="w-full bg-[#E50914] hover:bg-[#B2070F] disabled:opacity-50 text-white py-2 rounded">{loading ? "Please wait..." : "Login"}</button>
        </form>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <button disabled={loading} onClick={() => void handleSocial("google")} className="bg-white/10 text-white py-2 rounded text-sm disabled:opacity-50">Google</button>
          <button disabled={loading} onClick={() => void handleSocial("facebook")} className="bg-white/10 text-white py-2 rounded text-sm disabled:opacity-50">Facebook</button>
          <button disabled={loading} onClick={() => void handleSocial("github")} className="bg-white/10 text-white py-2 rounded text-sm disabled:opacity-50">GitHub</button>
        </div>

        <p className="text-white/50 text-xs mt-4">Demo user: user@ngv.local / user123 • Demo admin: admin@ngv.local / admin123</p>

        <p className="text-right mt-2">
          <Link href="/forgot-password" className="text-[#E50914] text-sm hover:underline">Forgot password?</Link>
        </p>

        <p className="text-center text-white/60 text-sm mt-6">
          Don&apos;t have an account? <Link href="/signup" className="text-[#E50914] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
