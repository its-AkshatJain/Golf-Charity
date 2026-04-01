import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, scoresRes, winningsRes, subRes, drawsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, charity_contribution_percentage, charities(name)")
      .eq("id", user.id)
      .single(),
    supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(5),
    supabase
      .from("winnings")
      .select("id, amount, status, match_type, draws(draw_date)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("status, plan, renewal_date")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("draws")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  const profile = profileRes.data;
  const scores = scoresRes.data || [];
  const winnings = winningsRes.data || [];
  const subscription = subRes.data;
  const totalDraws = drawsRes.count ?? 0;
  const isAdmin = profile?.role === "admin";

  const totalWon = winnings.reduce((s, w) => s + (w.amount || 0), 0);
  const pendingWinnings = winnings.filter((w) => w.status === "pending");
  const hasActiveSub = subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      {/* ─── PAGE HEADER ─── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label mb-1.5">Overview</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">
            {user.email}
            {isAdmin && (
              <span className="ml-2 bg-[#e63946] text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </p>
        </div>
        {!hasActiveSub && !isAdmin && (
          <Link
            href="/dashboard/subscription"
            className="shrink-0 bg-[#e63946] text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#111] transition-all"
          >
            Subscribe →
          </Link>
        )}
      </div>

      {/* ─── PENDING WIN ALERT ─── */}
      {pendingWinnings.length > 0 && (
        <div className="brand-card p-5 border-2 border-[#e63946] bg-red-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-black text-[#111] text-base">You won a draw!</p>
              <p className="text-gray-500 text-sm mt-0.5">
                Upload your scorecard proof to claim your{" "}
                <span className="font-black text-[#e63946]">
                  ${pendingWinnings.reduce((s, w) => s + (w.amount || 0), 0).toFixed(2)}
                </span>{" "}
                prize.
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/winnings/${pendingWinnings[0].id}`}
            className="shrink-0 bg-[#e63946] text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#111] transition-all whitespace-nowrap"
          >
            Submit Proof →
          </Link>
        </div>
      )}

      {/* ─── STAT CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Subscription */}
        <div className="brand-card p-5 flex flex-col gap-1.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscription</p>
          <p className={`text-xl font-black tracking-tight capitalize ${hasActiveSub ? "text-green-600" : subscription ? "text-orange-500" : "text-gray-300"}`}>
            {subscription?.status ?? "None"}
          </p>
          {subscription?.plan && (
            <p className="text-xs text-gray-400 font-semibold capitalize">{subscription.plan} plan</p>
          )}
          {subscription?.renewal_date && (
            <p className="text-[10px] text-gray-400 font-medium mt-auto pt-1">
              Renews {new Date(subscription.renewal_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </p>
          )}
        </div>

        {/* Charity */}
        <div className="brand-card p-5 flex flex-col gap-1.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Charity</p>
          <p className="text-base font-black text-[#111] tracking-tight leading-snug">
            {(profile?.charities as any)?.name ?? "Not selected"}
          </p>
          <p className="text-xs font-semibold text-[#e63946] mt-auto pt-1">
            {profile?.charity_contribution_percentage ?? 10}% allocated
          </p>
        </div>

        {/* Scores */}
        <div className="brand-card p-5 flex flex-col gap-1.5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scores</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-[#111] tracking-tight">{scores.length}</p>
            <p className="text-sm text-gray-400 font-semibold">/ 5</p>
          </div>
          <p className="text-xs text-gray-400 font-medium">Stableford rounds</p>
          <Link href="/dashboard/scores" className="text-[10px] font-black text-[#e63946] uppercase tracking-widest mt-auto hover:text-[#111] transition-colors">
            + Add round →
          </Link>
        </div>

        {/* Winnings */}
        <div className="brand-card p-5 flex flex-col gap-1.5 bg-[#111]">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Winnings</p>
          <p className="text-2xl font-black text-white tracking-tight">${totalWon.toFixed(2)}</p>
          <p className="text-xs text-gray-500 font-medium">
            {winnings.length} draw{winnings.length !== 1 ? "s" : ""} entered
          </p>
          <p className="text-[10px] font-bold text-gray-600 mt-auto pt-1">
            {totalDraws} total draws published
          </p>
        </div>
      </div>

      {/* ─── PARTICIPATION SUMMARY ─── */}
      <div className="brand-card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-[#111] text-base tracking-tight uppercase">Participation Summary</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            {
              label: "Draws Entered",
              value: winnings.length,
              sub: "total",
            },
            {
              label: "Wins",
              value: winnings.filter((w) => w.status !== "pending" || w.amount > 0).length,
              sub: "from all draws",
            },
            {
              label: "Pending Proof",
              value: pendingWinnings.length,
              sub: "awaiting review",
              accent: pendingWinnings.length > 0,
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-gray-50 p-4">
              <p className={`text-2xl font-black ${s.accent ? "text-[#e63946]" : "text-[#111]"}`}>{s.value}</p>
              <p className="text-xs font-black text-[#111] mt-1">{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ─── RECENT SCORES ─── */}
        <div className="brand-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-[#111] text-base tracking-tight uppercase">Last 5 Scores</h2>
            <Link
              href="/dashboard/scores"
              className="text-xs font-black text-[#e63946] uppercase tracking-widest hover:text-[#111] transition-colors bg-red-50 px-3 py-1.5 rounded-lg"
            >
              Manage →
            </Link>
          </div>

          {scores.length > 0 ? (
            <div className="space-y-2">
              {scores.map((score: any, idx: number) => (
                <div key={score.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      {new Date(score.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full">
                      Stableford
                    </span>
                    <span className="font-black text-xl text-[#111] w-10 text-right">{score.score}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
              <p className="text-gray-400 text-sm font-medium">No scores yet.</p>
              <Link href="/dashboard/scores" className="mt-2 text-xs font-black text-[#e63946] block uppercase tracking-widest">
                Record first round →
              </Link>
            </div>
          )}
        </div>

        {/* ─── WINNINGS HISTORY ─── */}
        <div className="brand-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-[#111] text-base tracking-tight uppercase">Winnings</h2>
            <span className="text-xs font-black text-white bg-[#111] px-3 py-1.5 rounded-lg">
              ${totalWon.toFixed(2)} total
            </span>
          </div>

          {winnings.length > 0 ? (
            <div className="space-y-2">
              {winnings.map((w: any) => (
                <div key={w.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      w.match_type === "5-match" ? "bg-[#e63946] text-white"
                      : w.match_type === "4-match" ? "bg-[#111] text-white"
                      : "bg-gray-100 text-gray-600"
                    }`}>
                      {w.match_type}
                    </span>
                    <span className={`text-[10px] font-bold capitalize ${
                      w.status === "paid" ? "text-green-600"
                      : w.status === "verified" ? "text-blue-500"
                      : w.status === "rejected" ? "text-red-400"
                      : "text-orange-500"
                    }`}>
                      {w.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#111] text-lg">${w.amount?.toFixed(2)}</span>
                    {w.status === "pending" && (
                      <Link
                        href={`/dashboard/winnings/${w.id}`}
                        className="text-[10px] bg-[#e63946] text-white font-black uppercase tracking-widest px-2 py-1 rounded-lg hover:bg-[#111] transition-colors"
                      >
                        Proof
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
              <p className="text-gray-400 text-sm font-medium">No draw winnings yet.</p>
              <p className="text-xs text-gray-300 mt-1">Enter scores & subscribe to participate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
