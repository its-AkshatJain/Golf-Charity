import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { updateWinningStatus } from "../actions";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Camera, CheckCircle2, XCircle, CreditCard, ExternalLink } from "lucide-react";

async function handleWinningStatus(formData: FormData) {
  "use server";
  await updateWinningStatus(formData);
}

export default async function VerificationPage() {
  const supabase = await createClient();
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all users to create an email mapping
  const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
  const emailMap = Object.fromEntries((userData?.users || []).map((u) => [u.id, u.email]));

  const { data: winnings } = await supabase
    .from("winnings")
    .select("*, draws(draw_date)")
    .order("created_at", { ascending: false });

  const pending = (winnings || []).filter((w) => w.status === "pending");
  const verified = (winnings || []).filter((w) => w.status === "verified");
  const paid = (winnings || []).filter((w) => w.status === "paid");
  const rejected = (winnings || []).filter((w) => w.status === "rejected");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <p className="section-label mb-2">Admin · Verification</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111]">
          Winner Verification
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Review draw winners and approve or reject proof of performance.
          Approved winners move from Pending → Verified → Paid.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", count: pending.length, color: "text-orange-500" },
          { label: "Verified", count: verified.length, color: "text-blue-500" },
          { label: "Paid", count: paid.length, color: "text-green-500" },
          { label: "Rejected", count: rejected.length, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Winnings table */}
      <div className="brand-card overflow-hidden">
        {(winnings || []).length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-400 font-bold text-sm">No winnings records yet. Run a draw first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="brand-table">
              <thead>
                <tr>
                  {["Winner Email", "Draw Date", "Match Type", "Prize Amount", "Proof", "Status", "Actions"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(winnings || []).map((w: any) => (
                  <tr key={w.id}>
                    <td className="font-black text-[#111]">
                      {emailMap[w.user_id] || "Unknown User"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                      {w.draws?.draw_date
                        ? new Date(w.draws.draw_date).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                        w.match_type === "5-match"
                          ? "bg-[#e63946] text-white"
                          : w.match_type === "4-match"
                          ? "bg-[#111] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {w.match_type}
                      </span>
                    </td>
                    <td className="font-black text-[#e63946]">
                      ${w.amount?.toFixed(2)}
                    </td>
                    <td>
                      {w.proof_url ? (
                        <a href={w.proof_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider">
                          <Camera className="w-3.5 h-3.5" /> View Proof <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">No Proof</span>
                      )}
                    </td>
                    <td>
                      <span className={
                        w.status === "paid" ? "badge-green"
                        : w.status === "verified" ? "badge-red"
                        : w.status === "rejected" ? "badge-gray line-through"
                        : "badge-amber"
                      }>
                        {w.status}
                      </span>
                    </td>
                    <td>
                      {w.status === "pending" && (
                        <div className="flex gap-2">
                          <form action={handleWinningStatus}>
                            <input type="hidden" name="winning_id" value={w.id} />
                            <LoadingButton name="action" value="verify" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                            </LoadingButton>
                          </form>
                          <form action={handleWinningStatus}>
                            <input type="hidden" name="winning_id" value={w.id} />
                            <LoadingButton name="action" value="reject" className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </LoadingButton>
                          </form>
                        </div>
                      )}
                      {w.status === "verified" && (
                        <form action={handleWinningStatus}>
                          <input type="hidden" name="winning_id" value={w.id} />
                          <LoadingButton name="action" value="pay" className="bg-[#111] hover:bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" /> Mark Paid
                          </LoadingButton>
                        </form>
                      )}
                      {(w.status === "paid" || w.status === "rejected") && (
                        <span className="text-[10px] text-gray-300 font-black uppercase">Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
