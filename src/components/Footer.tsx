import Link from "next/link";
import { Eye, Lock, Shield } from "lucide-react";

import { Badge } from "./ui/badge";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-20 transition-colors duration-300">
      {/* Footer Ad Slot */}
      <div className="max-w-360 mx-auto px-6 py-6">
        <div className="bg-card border border-border rounded-lg p-8 text-center transition-colors duration-300">
          <p className="text-muted-foreground text-sm">Advertisement</p>
          <div className="mt-2 text-muted-foreground/60">728 × 90 Footer Ad Slot</div>
        </div>
      </div>

      <div className="max-w-360 mx-auto px-6 py-12">
        {/* Brand & Security Info */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary px-4 py-2 rounded">
                <span className="text-primary-foreground tracking-wider">NGV</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-4">
              A Clean & Secure Streaming Platform for Bangladesh 🇧🇩
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-border text-foreground">
                <Shield className="w-3 h-3 mr-1" />
                GeoIP Secured
              </Badge>
              <Badge variant="outline" className="border-border text-foreground">
                <Lock className="w-3 h-3 mr-1" />
                No VPN Access
              </Badge>
              <Badge variant="outline" className="border-border text-foreground">
                <Eye className="w-3 h-3 mr-1" />
                Watermark Protected
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><a href="/library" className="hover:text-foreground transition-colors">All Titles</a></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/watchlist" className="hover:text-foreground transition-colors">Watchlist</Link></li>
              <li><Link href="/profile" className="hover:text-foreground transition-colors">Profile</Link></li>
              <li><Link href="/purchases" className="hover:text-foreground transition-colors">Purchase History</Link></li>
              <li><a href="/about" className="hover:text-foreground transition-colors">About NGV</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground mb-4">Help & Plans</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/subscription" className="hover:text-foreground transition-colors">Subscription Plans</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link href="/api-spec" className="hover:text-foreground transition-colors">API Contract</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>© 2025 NGV. All rights reserved. Free Ad-Supported Streaming Platform.</p>
          <p className="mt-2">
            This platform is restricted to Bangladesh users only. Access from outside Bangladesh is not permitted.
          </p>
        </div>
      </div>
    </footer>
  );
}
