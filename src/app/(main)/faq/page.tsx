import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";

const faqs = [
  {
    q: "How does review approval work?",
    a: "User reviews are submitted as pending. Admin can approve or unpublish based on moderation policy.",
  },
  {
    q: "Can I rent and buy titles?",
    a: "Yes. Frontend flows for rent/buy/subscription are already present and ready for payment API integration.",
  },
  {
    q: "Is watchlist synced in real-time?",
    a: "Currently local mock state is used. Switching to backend API makes it real-time and persistent across devices.",
  },
  {
    q: "How to enable real backend mode?",
    a: "Set NEXT_PUBLIC_USE_REMOTE_API=true and point NEXT_PUBLIC_API_URL to your backend API.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <div className="rounded-lg bg-zinc-900 border border-white/10 p-8">
          <h1 className="text-white text-3xl mb-2">Frequently Asked Questions</h1>
          <p className="text-white/60 mb-6">Everything about ratings, streaming, watchlist, payments, and moderation.</p>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item) => (
              <AccordionItem value={item.q} key={item.q} className="border-white/10">
                <AccordionTrigger className="text-white hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="text-white/70">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
