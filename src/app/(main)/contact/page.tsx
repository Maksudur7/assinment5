"use client";

import { useState } from "react";
import { Mail, Phone } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1100px] mx-auto px-6 py-8 grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg bg-zinc-900 border border-white/10 p-8">
          <h1 className="text-white text-3xl mb-2">Contact Us</h1>
          <p className="text-white/60 mb-6">Questions, support, partnership, or feedback — we’d love to hear from you.</p>
          <div className="space-y-3 text-white/80 text-sm">
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#E50914]" /> support@ngv.local</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#E50914]" /> +880 1XXX-XXXXXX</p>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-900 border border-white/10 p-8 space-y-4">
          <Input className="bg-zinc-800 border-white/10 text-white" placeholder="Your name" />
          <Input className="bg-zinc-800 border-white/10 text-white" placeholder="Your email" type="email" />
          <Input className="bg-zinc-800 border-white/10 text-white" placeholder="Subject" />
          <Textarea className="bg-zinc-800 border-white/10 text-white min-h-[130px]" placeholder="Write your message..." />
          <Button className="bg-[#E50914] hover:bg-[#B2070F]" onClick={() => setSubmitted(true)}>Send Message</Button>
          {submitted && <p className="text-green-400 text-sm">Message queued. Backend API integration will deliver it in real-time.</p>}
        </div>
      </div>
    </div>
  );
}
