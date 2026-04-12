"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { authFetchers } from "@/src/lib/fetchers/core";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const tokenValue = url.searchParams.get("token") ?? "";
    setToken(tokenValue);
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await authFetchers.resetPassword(token.trim(), newPassword);
      setMessage("Password updated successfully. You can login now.");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-zinc-900 rounded-lg p-8 border border-white/10">
        <h1 className="text-white text-2xl mb-2">Set New Password</h1>
        <p className="text-white/60 mb-6">Use your reset token to set a new password.</p>

        <form className="space-y-4" onSubmit={handleReset}>
          <div>
            <label htmlFor="token" className="text-white text-sm">Reset Token</label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste reset token"
              className="mt-1 w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-white text-sm">New Password</label>
            <input
              id="password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="mt-1 w-full bg-zinc-800 border border-white/10 text-white px-3 py-2 rounded"
              required
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {message ? <p className="text-sm text-green-400">{message}</p> : null}

          <button disabled={loading} className="w-full bg-[#E50914] hover:bg-[#B2070F] disabled:opacity-50 text-white py-2 rounded">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="text-center text-white/60 text-sm mt-6">
          Back to <Link href="/login" className="text-[#E50914] hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
