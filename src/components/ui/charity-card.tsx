"use client";

import { useState } from "react";
import { selectCharity } from "@/app/dashboard/charities/actions";

export default function CharityCard({ charity, isSelected }: { charity: any, isSelected: boolean }) {
  const [isPending, setIsPending] = useState(false);

  async function handleSelect() {
    setIsPending(true);
    await selectCharity(charity.id);
    setIsPending(false);
  }

  return (
    <div className={`rounded-xl border ${isSelected ? 'border-[#ff3c00]' : 'border-gray-800'} bg-gray-900/50 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1`}>
      {charity.image_url ? (
        <div 
          className="w-full h-48 bg-cover bg-center opacity-80 grayscale hover:grayscale-0 transition-all duration-500" 
          style={{ backgroundImage: `url(${charity.image_url})` }}
        />
      ) : (
        <div className="w-full h-48 bg-gray-800 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500">
          <span className="text-gray-500 font-medium">No Image</span>
        </div>
      )}
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">{charity.name}</h3>
          {charity.featured && (
             <span className="bg-[#ff3c00]/20 text-[#ff3c00] text-xs px-2 py-1 rounded-full font-bold border border-[#ff3c00]/30">Featured</span>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">{charity.description || "A wonderful cause that impacts the community profoundly. Make a difference by selecting this initiative."}</p>
        
        <button 
          onClick={handleSelect}
          disabled={isSelected || isPending}
          className={`w-full py-3 rounded text-sm transition-all duration-300 tracking-wider font-medium ${
            isSelected 
              ? 'bg-[#ff3c00]/10 text-[#ff3c00] border border-[#ff3c00]/30' 
              : 'bg-white text-black hover:bg-[#ff3c00] hover:text-white'
          }`}
        >
          {isSelected ? 'CURRENTLY SUPPORTING' : (isPending ? 'SELECTING...' : 'SUPPORT CAUSE')}
        </button>
      </div>
    </div>
  );
}
