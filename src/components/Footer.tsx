import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-zinc-900 border border-white/5 rounded-lg p-8 text-center">
          <p className="text-white/40 text-sm">Advertisement</p>
          <div className="mt-2 text-white/20">728 × 90 Footer Ad Slot</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
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
            <p className="text-white/50 text-sm">GeoIP secured • No VPN access • Watermark protected</p>
          </div>

          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white/60">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Create account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-white/60">
              <li><a className="hover:text-white transition-colors">Disclaimer</a></li>
              <li><a className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

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
