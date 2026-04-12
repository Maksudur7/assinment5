import { ShieldCheck, Tv, Users } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-6">
        <div className="rounded-lg bg-zinc-900 border border-white/10 p-8">
          <h1 className="text-white text-3xl mb-2">About NGV</h1>
          <p className="text-white/60 max-w-3xl">
            NGV is a movie and series rating + streaming portal designed for high performance, clean user experience, and secure engagement.
            This frontend is built to be API-integration ready for real-time backend workflows.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="border-white/20 text-white">Next.js</Badge>
            <Badge variant="outline" className="border-white/20 text-white">Tailwind CSS</Badge>
            <Badge variant="outline" className="border-white/20 text-white">Integration-ready architecture</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Tv className="w-5 h-5 text-[#E50914]" /> Rich Media Library</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 text-sm">Browse by genre, platform, year and rating with reusable query filters and pagination.</CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Users className="w-5 h-5 text-[#E50914]" /> Community Reviews</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 text-sm">Users can submit ratings, spoiler-tagged reviews, likes and comments with moderation support.</CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#E50914]" /> Admin Moderation</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 text-sm">Approve/unpublish reviews, monitor content and prepare analytics-ready workflows.</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
