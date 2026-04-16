import { createClient } from "@/utils/supabase/server";
import DrawClient from "./DrawClient";
import PublishDrawButton from "./PublishDrawButton";

export default async function AdminDrawsPage() {
  const supabase = await createClient();

  const [activeSubsRes, allDrawsRes] = await Promise.all([
    supabase.from("subscriptions").select("user_id", { count: "exact" }).eq("status", "active"),
    supabase
      .from("draws")
      .select("*, winnings(id, match_type, amount, status)")
      .order("draw_date", { ascending: true }),
  ]);

  const activeSubs = activeSubsRes.count ?? 0;
  const estimatedPool = activeSubs * 15 * 0.6;

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

  const displayDraws = enrichedDraws.reverse().slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-2">Admin · Draw Engine</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">
          Monthly Draw
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Execute draws, view results, and track prize pool allocation. The
          system matches Stableford scores against 5 drawn numbers.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Subscribers</p>
          <p className="text-3xl font-black text-[#0d0d0d]">{activeSubs}</p>
        </div>
        <div className="stat-card">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estimated Base Pool</p>
          <p className="text-3xl font-black text-[#0d0d0d]">${estimatedPool.toFixed(0)}</p>
          <p className="text-[11px] text-gray-400 font-medium">$15/sub × 60%</p>
        </div>
        <div className="rounded-[1.25rem] p-5 border border-[#e63946] bg-[#fff5f5] flex flex-col gap-2">
          <p className="text-[10px] font-black text-[#e63946] uppercase tracking-widest">Draws Run</p>
          <p className="text-3xl font-black text-[#e63946]">{allDrawsRes.data?.length ?? 0}</p>
        </div>
      </div>

      {/* Prize breakdown */}
      <div className="brand-card p-6">
        <h2 className="font-black text-[#111] text-base uppercase tracking-tight mb-4">
          Prize Distribution
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { match: "5-Number Match", pct: "40%", note: "Jackpot + Rollover", color: "bg-[#e63946] text-white" },
            { match: "4-Number Match", pct: "35%", note: "Major Prize", color: "bg-[#111] text-white" },
            { match: "3-Number Match", pct: "25%", note: "Entry Prize", color: "bg-gray-100 text-[#111]" },
          ].map((tier) => (
            <div key={tier.match} className={`${tier.color} rounded-2xl p-4 text-center`}>
              <p className="text-2xl font-black">{tier.pct}</p>
              <p className="text-xs font-black uppercase tracking-widest mt-1 opacity-70">{tier.match}</p>
              <p className="text-[10px] mt-1 opacity-60">{tier.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Run draw */}
      <DrawClient />

      {/* Past draws */}
      {displayDraws.length > 0 && (
        <div className="brand-card p-6">
          <h2 className="font-black text-[#111] text-base uppercase tracking-tight mb-4">
            Draw History
          </h2>
          <div className="overflow-x-auto">
            <div className="divide-y divide-gray-50 min-w-[600px]">
              {displayDraws.map((d: any) => (
                <div key={d.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#111] text-sm">
                      {new Date(d.draw_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{d.draw_type} draw</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#111]">${d._totalAvailablePool?.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{d.winnings?.length ?? 0} winner(s)</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md whitespace-nowrap ${
                      d.status === "published" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
                    }`}>
                      {d.status}
                    </span>
                    {d.status === "simulated" && <PublishDrawButton drawId={d.id} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
