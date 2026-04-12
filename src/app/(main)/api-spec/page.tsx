import Link from "next/link";

export default function ApiSpecPage() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
        <div className="rounded-lg bg-zinc-900 border border-white/10 p-8">
          <h1 className="text-white text-3xl mb-2">API Contract</h1>
          <p className="text-white/60">
            Frontend integration spec is documented in <code className="text-white">docs/API_CONTRACT.md</code>.
          </p>
          <p className="text-white/60 mt-2">
            Use <code className="text-white">NEXT_PUBLIC_USE_REMOTE_API=true</code> to switch from mock service to real backend APIs.
          </p>
          <div className="mt-4">
            <Link href="/library" className="text-[#E50914] hover:underline">Back to Library</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
