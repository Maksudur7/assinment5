import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read NGV Streaming's Privacy Policy — how we collect and use your data, our use of Google AdSense cookies, and your rights to opt out of personalized advertising.",
  robots: { index: true, follow: false },
  alternates: { canonical: "https://ngv-streaming.vercel.app/privacy" },
};


export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
          <ShieldCheck className="w-8 h-8 text-[#E50914]" />
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        </div>
        
        <div className="prose prose-invert max-w-none text-white/80 space-y-6">
          <p>
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>
            When you visit NGV, we may collect certain information about your device, your interaction with our site, and information necessary to process any requests (such as creating an account). This includes your IP address, browser type, and operating system.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Google AdSense and DART Cookies</h2>
          <p>
            NGV uses Google AdSense to serve advertisements. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on previous visits to our site and other sites on the Internet.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
            <li>Users may opt-out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#E50914] hover:underline">Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-[#E50914] hover:underline">www.aboutads.info</a>.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. How We Use Your Data</h2>
          <p>
            The information we collect is used in various ways, including to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Find and prevent fraud</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us via our <a href="/contact" className="text-[#E50914] hover:underline">Contact Page</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
