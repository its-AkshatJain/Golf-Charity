"use client";

import { useState, useTransition } from "react";
import { selectCharity, updateContribution } from "./actions";

type Charity = {
  id: string;
  name: string;
  description: string;
  featured: boolean;
};

type Props = {
  charities: Charity[];
  selectedCharityId: string | null;
  contributionPct: number;
};

export default function CharitiesClient({
  charities,
  selectedCharityId,
  contributionPct,
}: Props) {
  const [selected, setSelected] = useState(selectedCharityId);
  const [pct, setPct] = useState(contributionPct);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (id: string) => {
    setSelected(id);
    startTransition(async () => {
      await selectCharity(id);
    });
  };

  // wrapped to return void for form action compatibility
  const handleContribution = async (formData: FormData) => {
    await updateContribution(formData);
  };

  return (
    <div className="space-y-8">
      {/* Contribution slider */}
      <div className="brand-card p-6">
        <h2 className="font-black text-[#111] text-base uppercase tracking-tight mb-1">
          Contribution Allocation
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          Set what percentage of your winnings goes to your chosen charity.
          Minimum 10%.
        </p>
        <form action={handleContribution} className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                <span>10% min</span>
                <span className="text-2xl font-black text-[#111] normal-case tracking-tight">
                  {pct}%
                </span>
                <span>100% max</span>
              </div>
              <input
                type="range"
                name="percentage"
                min="10"
                max="100"
                step="5"
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none accent-[#e63946] cursor-pointer"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <p className="text-sm text-gray-500">
              <span className="font-black text-[#111]">{100 - pct}%</span> returns to you
            </p>
            <button
              type="submit"
              className="bg-[#111] text-white px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#e63946] transition-all"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Charity grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {charities.length > 0 ? (
          charities.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              disabled={isPending}
              className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-0.5 ${
                selected === c.id
                  ? "border-[#e63946] bg-red-50 shadow-lg shadow-red-900/10"
                  : "border-transparent bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:border-gray-200"
              }`}
            >
              {c.featured && (
                <span className="inline-block bg-[#e63946] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-3">
                  Featured
                </span>
              )}
              {selected === c.id && (
                <span className="inline-block bg-green-100 text-green-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 ml-2">
                  ✓ Selected
                </span>
              )}
              <h3
                className={`font-black text-base tracking-tight ${
                  selected === c.id ? "text-[#e63946]" : "text-[#111]"
                }`}
              >
                {c.name}
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">
                {c.description}
              </p>
            </button>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
            <p className="text-gray-400 font-medium text-sm">
              No charities available yet. An admin will add them shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
