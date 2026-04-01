import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [usersRes, charitiesRes, drawsRes, activeSubsRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("charities").select("*", { count: "exact", head: true }),
    supabase
      .from("draws")
      .select("*")
      .order("draw_date", { ascending: false })
      .limit(5),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const draws = drawsRes.data || [];
  const totalPool = draws.reduce((s, d) => s + (d.prize_pool || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-2">Administration</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">
          System Overview
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage users, charities, draws, and winner payouts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
          <p className="text-3xl font-black text-[#111]">{usersRes.count ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Subs</p>
          <p className="text-3xl font-black text-[#111]">{activeSubsRes.count ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Charities</p>
          <p className="text-3xl font-black text-[#111]">{charitiesRes.count ?? 0}</p>
        </div>
        <div className="stat-card bg-[#111]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Prize Pool</p>
          <p className="text-3xl font-black text-white">${totalPool.toFixed(0)}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/dashboard/admin/users", label: "Manage Users", icon: "👥" },
          { href: "/dashboard/admin/charities", label: "Charity CMS", icon: "🏥" },
          { href: "/dashboard/admin/draws", label: "Draw Engine", icon: "🎲" },
          { href: "/dashboard/admin/verification", label: "Verify Winners", icon: "✅" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="brand-card p-5 flex flex-col items-center justify-center gap-2 text-center hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer"
          >
            <span className="text-3xl">{a.icon}</span>
            <span className="text-sm font-black text-[#111] tracking-tight">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent draws */}
      <div className="brand-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-[#111] text-lg tracking-tight">Recent Draws</h2>
          <Link
            href="/dashboard/admin/draws"
            className="text-xs font-black text-[#e63946] uppercase tracking-widest hover:text-[#111] transition-colors"
          >
            Run Draw →
          </Link>
        </div>
        {draws.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {draws.map((d: any) => (
              <div key={d.id} className="flex justify-between items-center py-3">
                <span className="text-sm text-gray-500 font-medium">
                  {new Date(d.draw_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {d.status}
                </span>
                <span className="font-black text-[#111]">
                  ${d.prize_pool?.toFixed(2) ?? "—"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl">
            <p className="text-gray-400 text-sm">No draws yet.</p>
            <Link href="/dashboard/admin/draws" className="mt-2 text-xs font-black text-[#e63946] block">
              Run first draw →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
