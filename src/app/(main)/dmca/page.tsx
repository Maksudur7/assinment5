import type { Metadata } from "next";
import { Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "DMCA & Copyright Policy",
  description:
    "NGV Streaming's DMCA Policy. NGV does not host any copyrighted video files. All content is embedded from third-party platforms. Submit takedown requests here.",
  robots: { index: true, follow: false },
  alternates: { canonical: "https://ngv-streaming.vercel.app/dmca" },
};


export default function DMCAPolicyPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
          <Scale className="w-8 h-8 text-[#E50914]" />
          <h1 className="text-3xl font-bold text-white">DMCA & Copyright Policy</h1>
        </div>
        
        <div className="prose prose-invert max-w-none text-white/80 space-y-6">
          <p>
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-lg text-white/90">
            <h2 className="text-xl font-bold mb-2">Important Legal Disclaimer</h2>
            <p>
              <strong>NGV does not host any video files, media files, or copyrighted material on its own servers.</strong> 
              Our platform operates exclusively as an indexer, embedding content that is already hosted on third-party public platforms (such as YouTube, Vimeo, DailyMotion, etc.). 
            </p>
          </div>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Copyright Infringement Notification</h2>
          <p>
            NGV respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (DMCA). Since we do not host any copyrighted files, we cannot delete files from third-party servers. 
          </p>
          <p>
            However, if you are a copyright owner or an authorized agent and believe that any content indexed or embedded on our site infringes upon your copyrights, you may submit a notification pursuant to the DMCA by providing our Copyright Agent with the following information in writing:
          </p>
          
          <ul className="list-decimal pl-6 space-y-2 mt-2">
            <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed (please provide the exact URL of the NGV page containing the embedded content).</li>
            <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and an email address.</li>
            <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Removal Process</h2>
          <p>
            Upon receipt of a valid and complete DMCA takedown notice, we will promptly remove or disable access to the embedded link or iframe pointing to the allegedly infringing content. Please note that this will only remove the embed from our site; the actual file will remain on the third-party host until you contact them directly.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Contact Information</h2>
          <p>
            Please send all DMCA takedown notices via our <a href="/contact" className="text-[#E50914] hover:underline">Contact Page</a>. Please allow 2-4 business days for a response and for the link to be removed.
          </p>
        </div>
      </div>
    </div>
  );
}
