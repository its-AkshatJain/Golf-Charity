import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [usersRes, charitiesRes, allDrawsRes, activeSubsRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("charities").select("*", { count: "exact", head: true }),
    supabase
      .from("draws")
      .select("id, draw_date, status, prize_pool, draw_type, winnings(match_type)")
      .order("draw_date", { ascending: true }),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  let currentRollover = 0;
  const enrichedDraws = (allDrawsRes.data || []).map((d: any) => {
    const totalAvailablePool = d.prize_pool + currentRollover;
    if (d.status === "published") {
      const has5Match = d.winnings?.some((w: any) => w.match_type === "5-match");
      if (has5Match) {
        currentRollover = 0;
      } else {
        currentRollover += d.prize_pool * 0.40;
      }
    }
    return { ...d, _totalAvailablePool: totalAvailablePool };
  });

  const displayDraws = [...enrichedDraws].reverse().slice(0, 5);
  const totalPool = (allDrawsRes.data || []).reduce((s: number, d: any) => s + (d.prize_pool || 0), 0);

  return (
    <div className="space-y-8 animate-fade-up pb-12">
      {/* Header */}
      <div>
        <p className="section-label mb-1.5">Administration</p>
        <h1 className="page-title">System Overview</h1>
        <p className="page-subtitle">
          Manage users, charities, draws, and winner payouts from one place.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Registered Users",  value: usersRes.count ?? 0,       suffix: "",  accent: false },
          { label: "Active Subscribers",value: activeSubsRes.count ?? 0,  suffix: "",  accent: false },
          { label: "Charities Listed",  value: charitiesRes.count ?? 0,   suffix: "",  accent: false },
          { label: "Total Prize Pool",  value: `$${totalPool.toFixed(0)}`, suffix: "", accent: true  },
        ].map((s) => (
          <div key={s.label} className={`rounded-[1.25rem] p-5 border ${s.accent ? "bg-[#e63946] border-[#e63946]" : "bg-white border-[#ebebeb]"}`}
            style={{ boxShadow: s.accent ? "0 4px 20px rgba(230,57,70,0.25)" : "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${s.accent ? "text-red-200" : "text-gray-400"}`}>{s.label}</p>
            <p className={`text-3xl font-black mt-2 tracking-tight ${s.accent ? "text-white" : "text-[#0d0d0d]"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/dashboard/admin/users",        label: "Manage Users",   emoji: "👥", desc: "Edit roles & profiles" },
            { href: "/dashboard/admin/charities",    label: "Charity CMS",    emoji: "♡",  desc: "Add, edit, delete listings" },
            { href: "/dashboard/admin/draws",        label: "Draw Engine",    emoji: "⬡",  desc: "Run & publish draws" },
            { href: "/dashboard/admin/verification", label: "Verify Winners", emoji: "✓",  desc: "Review proof & pay out" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="brand-card hoverable p-5 flex flex-col gap-3 group"
            >
              <span className="text-3xl">{a.emoji}</span>
              <div>
                <p className="text-sm font-black text-[#0d0d0d] tracking-tight group-hover:text-[#e63946] transition-colors">{a.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent draws */}
      <div className="brand-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-[#0d0d0d] text-base tracking-tight">Recent Draws</h2>
          <Link href="/dashboard/admin/draws"
            className="text-xs font-black text-[#e63946] uppercase tracking-widest hover:text-[#0d0d0d] transition-colors">
            Run Draw →
          </Link>
        </div>
        {displayDraws.length > 0 ? (
          <table className="w-full brand-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Prize Pool</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayDraws.map((d: any) => (
                <tr key={d.id}>
                  <td className="font-semibold">
                    {new Date(d.draw_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="capitalize text-gray-400">{d.draw_type}</td>
                  <td className="font-black text-[#0d0d0d]">${d._totalAvailablePool?.toFixed(2) ?? "0.00"}</td>
                  <td>
                    <span className={d.status === "published" ? "badge-green" : "badge-amber"}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-14 text-center border-2 border-dashed border-[#ebebeb] rounded-2xl">
            <p className="text-gray-400 text-sm font-medium">No draws yet.</p>
            <Link href="/dashboard/admin/draws" className="mt-2 text-xs font-black text-[#e63946] block uppercase tracking-widest">
              Run first draw →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
