import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export default async function DrawVerificationPage() {
  const supabase = await createClient();

  // Fetch pending winner entries with profile details
  const { data: pendingEntries } = await supabase
    .from("draw_entries")
    .select("*, profiles(id), draws(draw_date)")
    .eq("status", "pending")
    .eq("is_winner", true);

  async function verifyWinner(formData: FormData) {
    "use server";
    const supabaseServer = await createClient();
    const entryId = formData.get("entry_id") as string;
    const action = formData.get("action") as string;
    const status = action === "approve" ? "verified" : "rejected";

    await supabaseServer
      .from("draw_entries")
      .update({ status })
      .eq("id", entryId);
      
    revalidatePath("/admin/draws");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 pt-8">
      <div>
        <h1 className="text-4xl font-extrabold text-[#111] tracking-tighter uppercase">Winner Verification</h1>
        <p className="text-gray-500 mt-1 max-w-lg leading-relaxed">Review and verify proof of performance for monthly winners.</p>
      </div>

      <div className="rounded-2xl border border-red-900/10 bg-white p-8 shadow-xl shadow-red-900/5">
        <h2 className="text-xl font-extrabold text-[#111] tracking-wide uppercase mb-6 border-b border-gray-100 pb-6">Pending Verifications</h2>
        
        {pendingEntries && pendingEntries.length > 0 ? (
          <div className="space-y-4">
            {pendingEntries.map((entry: any) => (
              <div key={entry.id} className="flex justify-between items-center border border-gray-100 bg-gray-50 p-6 rounded-xl">
                <div>
                  <p className="font-bold text-[#111]">User ID: <span className="text-gray-500 text-sm font-mono">{entry.user_id.substring(0,8)}...</span></p>
                  <p className="text-sm text-gray-500 mt-1">Draw Date: {new Date(entry.draws?.draw_date).toLocaleDateString()}</p>
                  <p className="text-[#e63946] font-bold text-lg mt-2 font-mono">Prize: ${entry.prize_amount}</p>
                </div>
                
                <form action={verifyWinner} className="flex gap-4">
                  <input type="hidden" name="entry_id" value={entry.id} />
                  <button name="action" value="approve" type="submit" className="bg-[#111] text-white px-6 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-green-600 transition-colors">
                    Approve
                  </button>
                  <button name="action" value="reject" type="submit" className="bg-white border border-gray-200 text-red-600 px-6 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-colors">
                    Reject
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
             <p className="text-gray-400 font-medium">No pending verifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
