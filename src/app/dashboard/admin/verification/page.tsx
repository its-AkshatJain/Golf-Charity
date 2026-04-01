import { createClient } from "@/utils/supabase/server";
import { updateWinningStatus } from "../actions";

async function handleWinningStatus(formData: FormData) {
  "use server";
  await updateWinningStatus(formData);
}

export default async function VerificationPage() {
  const supabase = await createClient();

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
          <div className="py-16 text-center">
            <p className="text-gray-400 font-medium text-sm">No winnings records yet. Run a draw first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["User ID", "Draw Date", "Match Type", "Prize Amount", "Proof", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(winnings || []).map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {w.user_id?.substring(0, 12)}...
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
                    <td className="px-4 py-3 font-black text-[#111]">
                      ${w.amount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {w.proof_url ? (
                        <a href={w.proof_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e63946] hover:text-[#111] transition-colors border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg">
                          <span>📷</span> View Proof
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300 font-medium">Not submitted</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold capitalize ${
                        w.status === "paid" ? "text-green-600"
                        : w.status === "verified" ? "text-blue-600"
                        : w.status === "rejected" ? "text-red-500"
                        : "text-orange-500"
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {w.status === "pending" && (
                        <div className="flex gap-2">
                          <form action={handleWinningStatus}>
                            <input type="hidden" name="winning_id" value={w.id} />
                            <button name="action" value="verify" type="submit"
                              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-black hover:bg-green-700 transition-colors uppercase tracking-wider">
                              Verify
                            </button>
                          </form>
                          <form action={handleWinningStatus}>
                            <input type="hidden" name="winning_id" value={w.id} />
                            <button name="action" value="reject" type="submit"
                              className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-black hover:bg-red-100 transition-colors uppercase tracking-wider">
                              Reject
                            </button>
                          </form>
                        </div>
                      )}
                      {w.status === "verified" && (
                        <form action={handleWinningStatus}>
                          <input type="hidden" name="winning_id" value={w.id} />
                          <button name="action" value="pay" type="submit"
                            className="text-xs bg-[#111] text-white px-3 py-1.5 rounded-lg font-black hover:bg-[#e63946] transition-colors uppercase tracking-wider">
                            Mark Paid
                          </button>
                        </form>
                      )}
                      {(w.status === "paid" || w.status === "rejected") && (
                        <span className="text-xs text-gray-300 font-medium">—</span>
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
