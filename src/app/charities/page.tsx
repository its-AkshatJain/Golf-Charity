import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function CharitiesDirectory({ searchParams }: { searchParams: Promise<{ q?: string; featured?: string }> }) {
  const p = await searchParams;
  const q = p.q || "";
  const featuredOnly = p.featured === "true";

  const supabase = await createClient();

  let query = supabase.from("charities").select("id, name, description, featured, category, location").order("name");

  if (q) {
    query = query.ilike("name", `%${q}%`); 
  }
  if (featuredOnly) {
    query = query.eq("featured", true);
  }

  const { data: charities } = await query;

  return (
    <div className="min-h-screen bg-[#fcf9f2] font-[var(--font-inter)] pt-24 pb-24 px-6 md:px-12">
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

      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#111]">Verified Charities</h1>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto font-medium">Explore the causes supported by our platform and choose where your winnings go.</p>
        </div>

        {/* Filters */}
        <form className="mb-12 flex flex-col sm:flex-row gap-4 items-center justify-center max-w-3xl mx-auto brand-card p-4 shadow-sm animate-in fade-in duration-700">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              name="q" 
              defaultValue={q}
              placeholder="Search charities by name..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946] font-medium transition-all"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 px-2">
            <input type="checkbox" id="featured" name="featured" value="true" defaultChecked={featuredOnly} className="accent-[#e63946] w-4 h-4" />
            <label htmlFor="featured" className="text-sm font-black uppercase tracking-widest text-gray-500 cursor-pointer">Featured</label>
          </div>
          <button type="submit" className="w-full sm:w-auto bg-[#111] text-white px-8 py-2.5 rounded-xl text-sm font-black hover:bg-[#e63946] uppercase tracking-widest transition-all">Filter</button>
        </form>

        {/* Grid */}
        {charities && charities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
             {charities.map((c: any) => (
               <Link href={`/charities/${c.id}`} key={c.id} className="block group h-full">
                 <div className="brand-card p-6 h-full flex flex-col hover:border-[#111]/10 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
                   {c.featured && (
                     <span className="self-start bg-[#e63946]/10 text-[#e63946] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                       Featured Partner
                     </span>
                   )}
                   <h3 className="text-xl font-black text-[#111] tracking-tight group-hover:text-[#e63946] transition-colors">{c.name}</h3>
                   <p className="text-sm text-gray-500 mt-3 leading-relaxed line-clamp-3 font-medium flex-1">
                     {c.description}
                   </p>
                   {(c.category || c.location) && (
                     <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                       {c.category && <span>{c.category}</span>}
                       {c.category && c.location && <span>•</span>}
                       {c.location && <span>{c.location}</span>}
                     </div>
                   )}
                 </div>
               </Link>
             ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 backdrop-blur-sm animate-in fade-in">
            <p className="text-gray-400 font-bold text-lg">No charities found matching your search.</p>
            <Link href="/charities" className="text-[#e63946] text-xs font-black uppercase tracking-widest mt-4 inline-block bg-red-50 px-4 py-2 rounded-lg hover:bg-[#e63946] hover:text-white transition-colors">Clear filters</Link>
          </div>
        )}
      </div>
    </div>
  );
}
