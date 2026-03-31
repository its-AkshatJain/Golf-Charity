import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CharityCard from "@/components/ui/charity-card";
import { updateContribution } from "./actions";

export default async function CharitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("selected_charity_id, charity_contribution_percentage")
    .eq("id", user.id)
    .single();

  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("featured", { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col gap-2">
        <p className="text-[#ff3c00] font-mono text-sm tracking-widest">[ INITIATIVES ]</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter uppercase">Direct Impact</h1>
        <p className="text-gray-400 mt-2 max-w-2xl text-lg">Your subscription drives change. Select a verified cause below and we'll automatically route your designated contribution every month.</p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-black p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 w-full md:w-2/3">
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">Contribution Weight</h2>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">By default, 10% of your subscription pool is strictly routed to the charity of your choice. You have full control to amplify this impact. Adjust your personal weight below.</p>
        </div>
        
        <form action={updateContribution} className="flex gap-3 items-center relative z-10">
          <div className="relative">
            <input 
              type="number" 
              name="percentage" 
              defaultValue={profile?.charity_contribution_percentage || 10} 
              min="10" 
              max="100" 
              className="w-24 rounded border border-gray-700 bg-gray-900 px-4 py-3 text-lg text-white font-mono focus:border-[#ff3c00] focus:ring-1 focus:ring-[#ff3c00] focus:outline-none transition-all pl-10"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-lg">%</span>
          </div>
          <button type="submit" className="rounded bg-white text-black px-6 py-3 text-sm font-bold hover:bg-[#ff3c00] hover:text-white transition-colors duration-300 uppercase tracking-widest">
            Save
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
        {charities && charities.length > 0 ? (
          charities.map((charity) => (
            <CharityCard 
              key={charity.id} 
              charity={charity} 
              isSelected={profile?.selected_charity_id === charity.id} 
            />
          ))
        ) : (
          <div className="col-span-full border border-dashed border-gray-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 font-mono text-sm tracking-widest">[ SYSTEM UPDATE ]</p>
            <h3 className="text-white text-xl font-medium mt-2">No Active Causes Found</h3>
            <p className="text-gray-500 mt-2">The verified charity directory is currently being populated.</p>
          </div>
        )}
      </div>
    </div>
  );
}
