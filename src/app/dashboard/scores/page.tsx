import { createClient } from "@/utils/supabase/server";
import ScoresClient from "./ScoresClient";

export default async function ScoresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: scores } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-2">Performance</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">
          My Scores
        </h1>
        <p className="text-gray-500 mt-1 text-sm max-w-md">
          Submit your Stableford score (1–45). The system keeps your latest 5
          rounds on a rolling basis — newest replaces oldest automatically.
        </p>
      </div>

      {/* Current scores */}
      <div className="brand-card p-6">
        <h2 className="font-black text-[#111] text-base tracking-tight mb-4 uppercase">
          Last 5 Rounds
        </h2>
        {scores && scores.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {scores.map((s: any, idx: number) => (
              <div key={s.id} className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {new Date(s.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span className="font-black text-2xl text-[#111]">
                  {s.score}
                  <span className="text-sm text-gray-400 font-semibold ml-1">
                    pts
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
            <p className="text-gray-400 text-sm font-medium">
              No rounds recorded yet. Enter your first score below.
            </p>
          </div>
        )}
      </div>

      {/* Add score form */}
      <ScoresClient />
    </div>
  );
}
