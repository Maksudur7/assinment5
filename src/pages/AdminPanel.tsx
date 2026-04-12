export function AdminPanel() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-white text-3xl mb-2">Admin Panel</h1>
        <p className="text-white/60 mb-8">Manage content, analytics, and ad slots.</p>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg bg-zinc-900 p-4 border border-white/10 text-white">Total videos: 248</div>
          <div className="rounded-lg bg-zinc-900 p-4 border border-white/10 text-white">Active users: 5.2K</div>
          <div className="rounded-lg bg-zinc-900 p-4 border border-white/10 text-white">Views: 128K</div>
          <div className="rounded-lg bg-zinc-900 p-4 border border-white/10 text-white">Ad revenue: $942.50</div>
        </div>

        <div className="rounded-lg bg-zinc-900 p-6 border border-white/10">
          <h2 className="text-white text-xl mb-4">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="bg-[#E50914] hover:bg-[#B2070F] text-white px-4 py-2 rounded">Upload Content</button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded">View Analytics</button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
