"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";
import { Button } from "./ui/button";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem("ngv_cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ngv_cookie_consent", "accepted");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] max-w-sm w-full animate-in slide-in-from-bottom-8 fade-in duration-500 ease-out">
      <div className="relative overflow-hidden rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/5 p-6">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#E50914]/20 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E50914]/10 rounded-lg border border-[#E50914]/20">
                <Cookie className="w-5 h-5 text-[#E50914]" />
              </div>
              <h3 className="font-semibold text-white tracking-tight">Cookie Preferences</h3>
            </div>
            <button 
              onClick={() => setShow(false)}
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <p className="text-white/70 text-sm leading-relaxed">
              We use cookies to enhance your streaming experience, serve personalized ads, and analyze our traffic.
            </p>
            <Link 
              href="/privacy" 
              className="inline-block text-xs font-medium text-[#E50914] hover:text-[#ff1a26] hover:underline underline-offset-2 transition-colors"
            >
              Read our Privacy Policy &rarr;
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button 
              onClick={handleAccept}
              variant="outline"
              className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
            >
              Decline Optional
            </Button>
            <Button 
              onClick={handleAccept}
              className="flex-1 bg-[#E50914] text-white hover:bg-[#b80710] shadow-[0_0_15px_rgba(229,9,20,0.4)]"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
