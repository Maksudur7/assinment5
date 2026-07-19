// providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { GlobalErrorPopup } from "@/src/components/GlobalErrorPopup";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange
    >
      {children}
      <Toaster position="bottom-right" theme="system" />
      <GlobalErrorPopup />
    </ThemeProvider>
  );
}