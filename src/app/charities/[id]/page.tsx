import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default async function CharityProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: charity } = await supabase
    .from("charities")
    .select("*")
    .eq("id", id)
    .single();

  if (!charity) notFound();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("charity_id", id)
    .order("date", { ascending: true })
    .limit(5);

  return (
    <div className="min-h-screen bg-[#fcf9f2] font-[var(--font-inter)] pt-24 pb-12 px-6">
      <div className="fixed top-0 inset-x-0 z-50 bg-[#fcf9f2]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-xl tracking-tighter text-[#e63946] select-none">
            PLAY FOR PURPOSE
          </Link>
          <Link href="/dashboard" className="bg-[#111] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#e63946] transition-all">
            Dashboard →
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link href="/charities" className="inline-flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#e63946] transition-colors py-2 px-4 bg-white rounded-lg shadow-sm border border-black/5">
          ← Back to directory
        </Link>

        {/* Profile Card */}
        <div className="brand-card p-10 md:p-14 border-t-8 border-t-[#e63946] shadow-xl shadow-black/5">
          {charity.featured && (
            <span className="inline-block bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6">
              Verified Partner
            </span>
          )}
          <h1 className="text-4xl md:text-6xl font-black text-[#111] tracking-tighter mb-6 leading-tight">{charity.name}</h1>
          
          {(charity.category || charity.location) && (
            <div className="flex gap-4 mb-8 text-xs font-black uppercase tracking-widest text-[#e63946] bg-red-50 p-3 rounded-xl inline-flex flex-wrap">
              {charity.category && <span>{charity.category}</span>}
              {charity.location && <span>• {charity.location}</span>}
            </div>
          )}
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              {charity.description}
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
             <Link href="/dashboard" className="bg-[#111] text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#e63946] transition-all inline-block shadow-lg hover:shadow-red-900/20">
               Select as my charity via Dashboard
             </Link>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="brand-card p-8 md:p-10 shadow-lg shadow-black/5">
           <h2 className="text-2xl font-black tracking-tight text-[#111] mb-8 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
               <Calendar className="w-5 h-5 text-[#e63946]" /> 
             </div>
             Upcoming Events
           </h2>
           {events && events.length > 0 ? (
             <div className="space-y-4">
               {events.map((e: any) => (
                 <div key={e.id} className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4 group hover:bg-white hover:border-[#e63946]/30 transition-all">
                   <div>
                     <p className="font-black text-[#111] text-lg group-hover:text-[#e63946] transition-colors">{e.title}</p>
                     {e.description && <p className="text-sm text-gray-500 mt-1 font-medium">{e.description}</p>}
                   </div>
                   <div className="md:text-right shrink-0">
                     <p className="text-sm font-black text-[#e63946] uppercase tracking-widest bg-red-50 px-4 py-2 rounded-xl inline-block">
                       {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="py-10 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
               <p className="text-gray-400 text-sm font-medium">No upcoming events scheduled at this time.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
