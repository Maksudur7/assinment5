"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Film, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { authClient } from "@/src/lib/auth-client";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided in the URL.");
      return;
    }

    async function verify() {
      try {
        const res: any = await authClient.verifyEmail({ query: { token: token! } });
        if (res?.error) {
          setStatus("error");
          setMessage(res.error.message || "Failed to verify email.");
        } else {
          setStatus("success");
          setMessage("Your email has been successfully verified!");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An unexpected error occurred during verification.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden bg-black">
      {/* Cinematic Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(229,9,20,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_rgba(255,255,255,0.03),transparent_40%)] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 text-center">
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
          
          {status === "loading" && (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="w-12 h-12 text-[#E50914] animate-spin mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Verifying Email</h2>
              <p className="text-zinc-400 text-sm">Please wait while we verify your account...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center py-6">
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-zinc-400 text-sm mb-6">{message}</p>
              <Link 
                href="/login" 
                className="inline-block w-full bg-[#E50914] hover:bg-[#B2070F] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-red-500/20"
              >
                Continue to Login
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center py-6">
              <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-zinc-400 text-sm mb-6">{message}</p>
              <Link 
                href="/login" 
                className="inline-block w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-colors border border-white/10"
              >
                Back to Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
