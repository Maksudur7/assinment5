import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read NGV Streaming's Terms of Service. By using NGV you agree to these terms covering usage, content, advertising, and account rules.",
  robots: { index: true, follow: false },
  alternates: { canonical: "https://ngv-streaming.vercel.app/terms" },
};


export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
          <FileText className="w-8 h-8 text-[#E50914]" />
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        </div>
        
        <div className="prose prose-invert max-w-none text-white/80 space-y-6">
          <p>
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the NGV platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you do not have permission to access the Service.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Use of Service</h2>
          <p>
            NGV provides a streaming and rating portal. You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Content and Copyright</h2>
          <p>
            NGV acts as a search engine and directory for media content. We do not host any copyrighted files on our servers. All video content is hosted by third-party services and embedded on our site. 
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Advertisements</h2>
          <p>
            During your use of the Service, you may enter into correspondence with or participate in promotions of advertisers or sponsors showing their goods or services through the Service. Any such activity, and any terms, conditions, warranties or representations associated with such activity, is solely between you and the applicable third-party.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
          </p>
        </div>
      </div>
    </div>
  );
}
