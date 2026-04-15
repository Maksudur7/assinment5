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
      
      window.location.href = "/"; 
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Social signup failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-zinc-900 rounded-lg p-8 border border-white/10 shadow-2xl">
        <h1 className="text-white text-2xl mb-2 font-bold">Create Account</h1>
        <p className="text-white/60 mb-6">Join NGV and start watching today</p>

        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label htmlFor="name" className="text-white text-sm">Full Name</label>
            <input 
              required
              id="name" 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Jhon Doe" 
              className="mt-1 w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-[#E50914] transition" 
            />
          </div>
          <div>
            <label htmlFor="email" className="text-white text-sm">Email Address</label>
            <input 
              required
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com" 
              className="mt-1 w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-[#E50914] transition" 
            />
          </div>
          <div>
            <label htmlFor="password" className="text-white text-sm">Password</label>
            <div className="mt-1 flex gap-2">
              <input 
                required
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Create a strong password" 
                className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded focus:outline-none focus:border-[#E50914] transition" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword((v) => !v)} 
                className="bg-white/10 text-white px-3 rounded hover:bg-white/20 transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button 
            disabled={loading} 
            className="w-full bg-[#E50914] hover:bg-[#B2070F] disabled:opacity-50 text-white py-2 rounded font-bold transition"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-zinc-900 text-white/60">Or sign up with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button disabled={loading} onClick={() => void handleSocial("google")} className="bg-white/5 hover:bg-white/10 text-white py-2 rounded text-sm font-medium border border-white/10 transition">Google</button>
          <button disabled={loading} onClick={() => void handleSocial("github")} className="bg-white/5 hover:bg-white/10 text-white py-2 rounded text-sm font-medium border border-white/10 transition">GitHub</button>
          <button disabled={loading} onClick={() => void handleSocial("facebook")} className="bg-white/5 hover:bg-white/10 text-white py-2 rounded text-sm font-medium border border-white/10 transition">Facebook</button>
        </div>

        <p className="text-center text-white/60 text-sm mt-8">
          Already have an account? <Link href="/login" className="text-[#E50914] hover:underline font-medium">Login here</Link>
        </p>
      </div>
    </div>
  );
}