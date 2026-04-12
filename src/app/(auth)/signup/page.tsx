"use client";

import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-zinc-900 rounded-lg p-8 border border-white/10">
        <h1 className="text-white text-2xl mb-2">Create Account</h1>
        <p className="text-white/60 mb-6">Join NGV and start watching today</p>

        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="text-white text-sm">Full Name</label>
            <input id="name" type="text" placeholder="Enter your full name" className="mt-1 w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded" />
          </div>
          <div>
            <label htmlFor="email" className="text-white text-sm">Email</label>
            <input id="email" type="email" placeholder="Enter your email" className="mt-1 w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded" />
          </div>
          <div>
            <label htmlFor="password" className="text-white text-sm">Password</label>
            <div className="mt-1 flex gap-2">
              <input id="password" type={showPassword ? "text" : "password"} placeholder="Create a password" className="w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="bg-white/10 text-white px-3 rounded">{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>
          <button className="w-full bg-[#E50914] hover:bg-[#B2070F] text-white py-2 rounded">Create Account</button>
        </form>

        <p className="text-center text-white/60 text-sm mt-6">
          Already have an account? <Link href="/login" className="text-[#E50914] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
