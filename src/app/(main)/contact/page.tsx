"use client";

import { useState } from "react";
import { Mail, Phone, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_AUTH_URL 
        ? process.env.NEXT_PUBLIC_AUTH_URL.replace("/api/auth", "/api")
        : "https://ngv-backend.vercel.app/api";

      const response = await fetch(`${baseUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully!");
        reset();
      } else {
        toast.error(result.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="rounded-lg bg-zinc-900 border border-white/10 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input 
                className="bg-zinc-800 border-white/10 text-white" 
                placeholder="Your name" 
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            
            <div>
              <Input 
                className="bg-zinc-800 border-white/10 text-white" 
                placeholder="Your email" 
                type="email" 
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Input 
                className="bg-zinc-800 border-white/10 text-white" 
                placeholder="Subject" 
                {...register("subject", { required: "Subject is required" })}
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <Textarea 
                className="bg-zinc-800 border-white/10 text-white min-h-[130px]" 
                placeholder="Write your message..." 
                {...register("message", { required: "Message is required" })}
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="bg-[#E50914] hover:bg-[#B2070F] w-full lg:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
