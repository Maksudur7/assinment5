"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authFetchers } from "@/src/lib/fetchers/core";

export default function Page() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await authFetchers.register(name.trim(), email.trim(), password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
      setError(err instanceof Error ? err.message : "Social signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-zinc-900 rounded-lg p-8 border border-white/10">
        <h1 className="text-white text-2xl mb-2">Create Account</h1>
        <p className="text-white/60 mb-6">Join NGV and start watching today</p>

        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label htmlFor="name" className="text-white text-sm">Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="mt-1 w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded" />
          </div>
          <div>
            <label htmlFor="email" className="text-white text-sm">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="mt-1 w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded" />
          </div>
          <div>
            <label htmlFor="password" className="text-white text-sm">Password</label>
            <div className="mt-1 flex gap-2">
              <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="bg-white/10 text-white px-3 rounded">{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>
          {error ? <p className="text-red-400 text-sm">{error}</p> : null}
          <button disabled={loading} className="w-full bg-[#E50914] hover:bg-[#B2070F] disabled:opacity-50 text-white py-2 rounded">{loading ? "Creating..." : "Create Account"}</button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-white/60">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button disabled={loading} onClick={() => void handleSocial("google")} className="bg-white/10 hover:bg-white/20 text-white py-2 rounded text-sm font-medium disabled:opacity-50 transition">Google</button>
          <button disabled={loading} onClick={() => void handleSocial("github")} className="bg-white/10 hover:bg-white/20 text-white py-2 rounded text-sm font-medium disabled:opacity-50 transition">GitHub</button>
          <button disabled={loading} onClick={() => void handleSocial("facebook")} className="bg-white/10 hover:bg-white/20 text-white py-2 rounded text-sm font-medium disabled:opacity-50 transition">Facebook</button>
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          Already have an account? <Link href="/login" className="text-[#E50914] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
