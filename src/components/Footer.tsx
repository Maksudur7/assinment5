import Link from "next/link";
import { Eye, Lock, Shield } from "lucide-react";

import { Badge } from "./ui/badge";

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 mt-20">
      {/* Footer Ad Slot */}
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="bg-zinc-900 border border-white/5 rounded-lg p-8 text-center">
          <p className="text-white/40 text-sm">Advertisement</p>
          <div className="mt-2 text-white/20">728 × 90 Footer Ad Slot</div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Brand & Security Info */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#E50914] px-4 py-2 rounded">
                <span className="text-white tracking-wider">NGV</span>
              </div>
            </div>
            <p className="text-white/60 mb-4">
              A Clean & Secure Streaming Platform for Bangladesh 🇧🇩
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/20 text-white/80">
                <Shield className="w-3 h-3 mr-1" />
                GeoIP Secured
              </Badge>
              <Badge variant="outline" className="border-white/20 text-white/80">
                <Lock className="w-3 h-3 mr-1" />
                No VPN Access
              </Badge>
              <Badge variant="outline" className="border-white/20 text-white/80">
                <Eye className="w-3 h-3 mr-1" />
                Watermark Protected
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white/60">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><a href="/library" className="hover:text-white transition-colors">All Titles</a></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/watchlist" className="hover:text-white transition-colors">Watchlist</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Profile</Link></li>
              <li><Link href="/purchases" className="hover:text-white transition-colors">Purchase History</Link></li>
              <li><a href="/about" className="hover:text-white transition-colors">About NGV</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">Help & Plans</h3>
            <ul className="space-y-2 text-white/60">
              <li><Link href="/subscription" className="hover:text-white transition-colors">Subscription Plans</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/api-spec" className="hover:text-white transition-colors">API Contract</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>© 2025 NGV. All rights reserved. Free Ad-Supported Streaming Platform.</p>
          <p className="mt-2">
            This platform is restricted to Bangladesh users only. Access from outside Bangladesh is not permitted.
          </p>
        </div>
      </div>
    </footer>
  );
}
