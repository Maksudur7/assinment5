"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Lock, ServerCrash, X } from "lucide-react";
import { GlobalErrorDetail } from "@/src/lib/events";

export function GlobalErrorPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<GlobalErrorDetail | null>(null);

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent<GlobalErrorDetail>;
      setErrorDetails(customEvent.detail);
      setIsOpen(true);
    };

    window.addEventListener("ngv-api-error", handleApiError);
    return () => window.removeEventListener("ngv-api-error", handleApiError);
  }, []);

  if (!isOpen || !errorDetails) return null;

  const handleAction = () => {
    setIsOpen(false);
    if (errorDetails.action === "login") {
      window.location.href = "/login";
    } else if (errorDetails.action === "home") {
      window.location.href = "/";
    }
  };

  const getIcon = () => {
    if (errorDetails.action === "login") return <Lock className="w-8 h-8 text-red-500" />;
    if (errorDetails.action === "home") return <AlertCircle className="w-8 h-8 text-orange-500" />;
    return <ServerCrash className="w-8 h-8 text-red-500" />;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={() => setIsOpen(false)} 
      />
      
      {/* Modal */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(229,9,20,0.15)] animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col items-center text-center mt-2">
          <div className="bg-white/5 p-4 rounded-full mb-4 ring-1 ring-white/10 shadow-inner">
            {getIcon()}
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">{errorDetails.title}</h2>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed px-4">
            {errorDetails.message}
          </p>
          
          <div className="w-full flex gap-3">
            {errorDetails.action !== "dismiss" && (
              <button
                onClick={handleAction}
                className="flex-1 bg-[#E50914] hover:bg-[#B2070F] text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-red-500/20"
              >
                {errorDetails.action === "login" ? "Sign In" : "Go to Home"}
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
