"use client";

import React from "react";
import { cn } from "./utils";

interface NGVLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

/**
 * High-Contrast Left-to-Right Letter Light Sweep Animation for "NGV"
 * One letter lights up in vibrant Netflix red with glow while others dim into theme background color.
 */
export function NGVTextAnimated({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const letters = ["N", "G", "V"];

  const textSizeClasses = {
    sm: "text-xl font-black tracking-tight",
    md: "text-2xl sm:text-3xl font-black tracking-tight",
    lg: "text-3xl sm:text-4xl font-black tracking-tight",
    xl: "text-4xl sm:text-5xl font-black tracking-tight",
  };

  return (
    <div className={cn("inline-flex items-center justify-center select-none", className)}>
      <style>{`
        @keyframes ngvLetterSweep {
          0%, 100% {
            color: rgba(113, 113, 122, 0.3);
            text-shadow: none;
            filter: brightness(0.4);
          }
          35% {
            color: #E50914;
            text-shadow: 0 0 15px rgba(229, 9, 20, 0.9), 0 0 25px rgba(229, 9, 20, 0.6);
            filter: brightness(1.2);
          }
        }
      `}</style>
      <div className={cn("flex items-center gap-0.5", textSizeClasses[size])}>
        {letters.map((char, index) => (
          <span
            key={index}
            className="inline-block transition-all duration-300 font-extrabold"
            style={{
              animation: "ngvLetterSweep 1.5s ease-in-out infinite",
              animationDelay: `${index * 0.3}s`,
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact NGV Logo for Navbar and Badges
 */
export function NGVLogo({ size = "md", className }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizeMap = {
    sm: "text-lg font-black tracking-tight",
    md: "text-xl font-black tracking-tight",
    lg: "text-2xl font-black tracking-tight",
    xl: "text-3xl font-black tracking-tight",
  };

  return (
    <div className={cn("inline-flex items-center group select-none", className)}>
      <span className={cn(
        "bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent font-black tracking-tight group-hover:scale-105 transition-transform duration-300",
        sizeMap[size]
      )}>
        NGV
      </span>
    </div>
  );
}

/**
 * Fullscreen Page Loader
 */
export function NGVFullLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
      <NGVTextAnimated size="lg" />
    </div>
  );
}

/**
 * Action Overlay Loader
 */
export function NGVActionOverlay() {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950/90 border border-white/10 px-6 py-4 rounded-2xl shadow-xl flex items-center justify-center">
        <NGVTextAnimated size="md" />
      </div>
    </div>
  );
}

/**
 * Compact Inline Spinner
 */
export function NGVSpinner({ className }: NGVLoaderProps) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <NGVTextAnimated size="sm" />
    </div>
  );
}
