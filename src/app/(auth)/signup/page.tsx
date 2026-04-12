"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { portalService } from "@/src/lib/portal";

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
      await portalService.register(name.trim(), email.trim(), password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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

        <p className="text-center text-white/60 text-sm mt-6">
          Already have an account? <Link href="/login" className="text-[#E50914] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
