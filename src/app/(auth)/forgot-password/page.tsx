"use client";

import Link from "next/link";
import { useState } from "react";

import { authFetchers } from "@/src/lib/fetchers/core";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const result = await authFetchers.requestPasswordReset(email.trim());
      if (result.resetToken) {
        setMessage(`Reset link token generated (demo): ${result.resetToken}`);
      } else {
        setMessage("If this email exists, a reset link has been sent.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 rounded-lg p-8 border border-white/10">
        <h1 className="text-white text-2xl mb-2">Reset Password</h1>
        <p className="text-white/60 mb-6">Enter your account email to request a reset link.</p>

        <form className="space-y-4" onSubmit={handleRequest}>
          <div>
            <label htmlFor="email" className="text-white text-sm">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-1 w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded"
              required
            />
          </div>
          <button disabled={loading} className="w-full bg-[#E50914] hover:bg-[#B2070F] disabled:opacity-50 text-white py-2 rounded">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-green-400 break-all">{message}</p> : null}

        <p className="text-center text-white/60 text-sm mt-6">
          Back to <Link href="/login" className="text-[#E50914] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
