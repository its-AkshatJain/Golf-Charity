import { createClient } from "@/utils/supabase/server";
import ProofUploadClient from "./ProofUploadClient";

export default async function SubmitProofPage({
  params,
}: {
  params: Promise<{ winningId: string }>;
}) {
  const { winningId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: winning } = await supabase
    .from("winnings")
    .select("*, draws(draw_date)")
    .eq("id", winningId)
    .eq("user_id", user.id)
    .single();

  if (!winning) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <p className="text-gray-400 font-medium">Winning record not found or not yours.</p>
      </div>
    );
  }

  if (winning.status !== "pending") {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-3">
        <p className="text-2xl font-black text-[#111] capitalize">{winning.status}</p>
        <p className="text-gray-400 text-sm">
          This winning is already {winning.status}. No further action needed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-2">Winner Verification</p>
        <h1 className="text-3xl font-black tracking-tighter text-[#111]">
          Submit Proof of Score
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Upload a screenshot of your Stableford scorecard from the golf platform. This will be reviewed by an admin.
        </p>
      </div>

      {/* Winning details */}
      <div className="brand-card p-6 border-2 border-[#e63946]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prize</p>
            <p className="text-3xl font-black text-[#111] tracking-tight">${winning.amount?.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Match Type</p>
            <span className="bg-[#e63946] text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
              {winning.match_type}
            </span>
          </div>
        </div>
        {winning.draws?.draw_date && (
          <p className="text-xs text-gray-400 mt-4 font-medium">
            Draw date:{" "}
            {new Date(winning.draws.draw_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <ProofUploadClient winningId={winning.id} />
    </div>
  );
}
