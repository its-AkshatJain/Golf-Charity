import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileRes, scoresRes, winningsRes, subRes] = await Promise.all([
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
      .select("amount, status, match_type")
      .eq("user_id", user.id),
    supabase
      .from("subscriptions")
      .select("status, plan, renewal_date")
      .eq("user_id", user.id)
      .single(),
  ]);

  const profile = profileRes.data;
  const scores = scoresRes.data || [];
  const winnings = winningsRes.data || [];
  const subscription = subRes.data;

  const totalWon = winnings.reduce((s, w) => s + (w.amount || 0), 0);
  const pendingWinnings = winnings.filter((w) => w.status === "pending");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* ─── PAGE HEADER ─── */}
      <div>
        <p className="section-label mb-2">Overview</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">
          Welcome back
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Your performance and charity impact at a glance.
        </p>
      </div>

      {/* ─── PENDING WIN ALERT ─── */}
      {pendingWinnings.length > 0 && (
        <div className="rounded-2xl border-2 border-[#e63946] bg-red-50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="font-black text-[#111] text-lg">🎉 Action Required</p>
            <p className="text-gray-600 text-sm mt-1">
              You have {pendingWinnings.length} pending draw win
              {pendingWinnings.length > 1 ? "s" : ""}. Upload your Stableford
              proof to release the funds.
            </p>
          </div>
          <Link
            href="/dashboard/scores"
            className="shrink-0 bg-[#e63946] text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#111] transition-all"
          >
            Submit Proof →
          </Link>
        </div>
      )}

      {/* ─── STAT CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Subscription
          </p>
          <p className="text-2xl font-black text-[#111] capitalize tracking-tight">
            {subscription?.status ?? "—"}
          </p>
          {subscription?.plan && (
            <p className="text-xs text-[#e63946] font-bold uppercase">
              {subscription.plan} plan
            </p>
          )}
        </div>

        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Charity
          </p>
          <p className="text-2xl font-black text-[#111] tracking-tight">
            {(profile?.charities as any)?.name ?? "None"}
          </p>
          <p className="text-xs text-[#e63946] font-bold">
            {profile?.charity_contribution_percentage ?? 10}% contribution
          </p>
        </div>

        <div className="stat-card">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Scores Logged
          </p>
          <p className="text-2xl font-black text-[#111] tracking-tight">
            {scores.length} / 5
          </p>
          <p className="text-xs text-gray-400 font-medium">Stableford rounds</p>
        </div>

        <div className="stat-card bg-[#111]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Total Winnings
          </p>
          <p className="text-2xl font-black text-white tracking-tight">
            ${totalWon.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 font-medium">From all draws</p>
        </div>
      </div>

      {/* ─── RECENT SCORES ─── */}
      <div className="brand-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-[#111] text-lg tracking-tight">
            Recent Scores
          </h2>
          <Link
            href="/dashboard/scores"
            className="text-xs font-black text-[#e63946] uppercase tracking-widest hover:text-[#111] bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            + Add Score
          </Link>
        </div>

        {scores.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {scores.map((score: any) => (
              <div
                key={score.id}
                className="flex justify-between items-center py-3"
              >
                <span className="text-sm text-gray-500 font-medium">
                  {new Date(score.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-full px-3 py-0.5 text-xs font-bold text-gray-400 uppercase">
                    Stableford
                  </div>
                  <span className="font-black text-xl text-[#111]">
                    {score.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
            <p className="text-gray-400 font-medium text-sm">
              No scores yet. Add your first round to enter the draw.
            </p>
            <Link
              href="/dashboard/scores"
              className="mt-4 text-xs font-black text-[#e63946] uppercase tracking-widest"
            >
              Record a Score →
            </Link>
          </div>
        )}
      </div>

      {/* ─── WINNINGS HISTORY ─── */}
      {winnings.length > 0 && (
        <div className="brand-card p-6">
          <h2 className="font-black text-[#111] text-lg tracking-tight mb-6">
            Draw Winnings
          </h2>
          <div className="divide-y divide-gray-50">
            {winnings.map((w: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div>
                  <p className="font-bold text-[#111] text-sm">{w.match_type}</p>
                  <p className="text-xs text-gray-400 capitalize">{w.status}</p>
                </div>
                <span className="font-black text-lg text-[#e63946]">
                  ${w.amount?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
