"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthToken, getStoredUser } from "@/src/lib/portal/storage";
import { httpPortalService } from "@/src/lib/portal/httpService";
import { NGVFullLoader } from "./ui/NGVLoader";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Synchronously check on initial client render frame
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      const token = getAuthToken();
      const storedUser = getStoredUser();

      // 1. If no token/user in localStorage, immediately redirect to login
      if (!token && !storedUser) {
        if (isMounted) setIsAuthenticated(false);
        const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
        return;
      }

      // 2. Validate session with backend API
      try {
        const user = await httpPortalService.getCurrentUser();
        if (user && user.id) {
          if (isMounted) setIsAuthenticated(true);
        } else {
          if (isMounted) setIsAuthenticated(false);
          router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        }
      } catch {
        // Backend unauthorized (token expired / invalid)
        if (isMounted) setIsAuthenticated(false);
        router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  // If not authenticated or currently checking: NEVER render children, show full NGV loader
  if (!isAuthenticated) {
    return <NGVFullLoader />;
  }

  // Authenticated: Render protected private page
  return <>{children}</>;
}
