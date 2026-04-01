import { createClient } from "@/utils/supabase/server";
import ScoresClient from "./ScoresClient";

export default async function ScoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: scores } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-1.5">Performance</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">My Scores</h1>
        <p className="text-gray-400 mt-1 text-sm max-w-md">
          Submit Stableford scores (1–45). Only your latest <strong className="text-[#111]">5 rounds</strong> are retained — a new score automatically replaces the oldest.
        </p>
      </div>

      <ScoresClient initialScores={scores || []} />
    </div>
  );
}
