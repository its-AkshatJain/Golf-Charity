import { createClient } from "@/utils/supabase/server";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, charities (name)")
    .eq("id", user.id)
    .single();

  const { data: scores } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
        <p className="text-gray-400 mt-1">Here is your performance and charity impact overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-sm font-medium text-gray-400">Subscription Status</h3>
          <p className="text-2xl font-bold text-white mt-2 capitalize">{subscription?.status || "No Active Plan"}</p>
          {subscription?.plan && <p className="text-sm text-gray-400 mt-1">{subscription.plan} plan</p>}
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-sm font-medium text-gray-400">Selected Charity</h3>
          <p className="text-2xl font-bold text-white mt-2">{profile?.charities?.name || "None Selected"}</p>
          <p className="text-sm text-[#ff3c00] mt-1 font-medium">{profile?.charity_contribution_percentage}% contribution</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-sm font-medium text-gray-400">Total Winnings</h3>
          <p className="text-2xl font-bold text-white mt-2">$0.00</p>
          <p className="text-sm text-gray-400 mt-1">0 upcoming draws</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Scores</h2>
          <a href="/dashboard/scores" className="text-sm font-medium text-[#ff3c00] hover:underline">Add Score</a>
        </div>
        
        {scores && scores.length > 0 ? (
          <div className="space-y-4">
            {scores.map((score: any) => (
              <div key={score.id} className="flex justify-between items-center border-b border-gray-800 pb-4">
                <span className="text-gray-300">{new Date(score.date).toLocaleDateString()}</span>
                <span className="font-bold text-lg text-white">{score.score} pts</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 py-4 text-center">No scores recorded yet. The system stores up to your latest 5 rounds.</p>
        )}
      </div>
    </div>
  );
}
