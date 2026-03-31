import { createClient } from "@/utils/supabase/server";

export default async function AdminOverview() {
  const supabase = await createClient();

  const { count: usersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
  const { count: charitiesCount } = await supabase.from("charities").select("*", { count: 'exact', head: true });
  const { data: draws } = await supabase.from("draws").select("*").order("draw_date", { ascending: false }).limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Control</h1>
        <p className="text-gray-400 mt-1">Manage users, draws, and charity configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
          <p className="text-3xl text-white font-bold">{usersCount || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-sm font-medium text-gray-400">Active Subscriptions</h3>
          <p className="text-3xl text-white font-bold">0</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-sm font-medium text-gray-400">Listed Charities</h3>
          <p className="text-3xl text-white font-bold">{charitiesCount || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 border-t-4 border-t-[#ff3c00]">
          <h3 className="text-sm font-medium text-gray-400">Prize Pool Size</h3>
          <p className="text-3xl text-white font-bold">$0.00</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Draws</h2>
          <button className="text-sm font-medium bg-white text-black px-4 py-2 rounded">Execute Draw Simulation</button>
        </div>
        
        {draws && draws.length > 0 ? (
          <div className="space-y-4">
            {draws.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center border-b border-gray-800 pb-4">
                <span className="text-gray-300">{new Date(d.draw_date).toLocaleDateString()}</span>
                <span className="font-bold text-white">{d.status}</span>
                <span className="text-[#ff3c00] font-mono">${d.prize_pool}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 py-4 text-center">No draws executed yet.</p>
        )}
      </div>
    </div>
  );
}
