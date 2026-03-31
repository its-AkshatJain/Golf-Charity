"use client";

import { useState } from "react";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(planName);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      alert("Failed to initiate checkout.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col gap-2">
        <p className="text-[#e63946] font-mono text-sm tracking-widest">[ MEMBERSHIP ]</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter uppercase">Join the Movement</h1>
        <p className="text-gray-400 mt-2 max-w-2xl text-lg">A portion of your subscription fuels the charity pool. Secure your spot in the monthly performance draws.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 max-w-4xl">
        {/* Monthly Plan */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 flex flex-col relative overflow-hidden transition-all hover:border-[#e63946]/50">
          <div className="mb-6 border-b border-gray-800 pb-6">
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Monthly Tier</h3>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-white">
              $15<span className="ml-1 text-xl font-medium text-gray-400 tracking-normal">/mo</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-gray-300">
            <li className="flex items-center gap-3"><span className="text-[#e63946]">✔</span> Access to Monthly Draws</li>
            <li className="flex items-center gap-3"><span className="text-[#e63946]">✔</span> Verified Charity Routing</li>
            <li className="flex items-center gap-3"><span className="text-[#e63946]">✔</span> Advanced Score Analytics</li>
          </ul>
          <button
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || "price_monthly_mock", "monthly")}
            disabled={!!loading}
            className="w-full bg-white text-black py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-[#e63946] hover:text-white transition-colors"
          >
            {loading === "monthly" ? "Processing..." : "Subscribe Monthly"}
          </button>
        </div>

        {/* Yearly Plan */}
        <div className="rounded-2xl border-2 border-[#e63946] bg-black p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-red-900/20 transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-[#e63946] text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-bl-lg">
            Best Value
          </div>
          <div className="mb-6 border-b border-gray-800 pb-6">
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider">Annual Tier</h3>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-white">
              $150<span className="ml-1 text-xl font-medium text-gray-400 tracking-normal">/yr</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-gray-300">
            <li className="flex items-center gap-3"><span className="text-[#e63946]">✔</span> All Monthly Benefits</li>
            <li className="flex items-center gap-3"><span className="text-[#e63946]">✔</span> 2 Months Free</li>
            <li className="flex items-center gap-3"><span className="text-[#e63946]">✔</span> Premium Support & Early Access</li>
          </ul>
          <button
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || "price_yearly_mock", "yearly")}
            disabled={!!loading}
            className="w-full bg-[#111] border border-gray-700 py-4 rounded-lg font-bold text-white uppercase tracking-wider hover:bg-[#e63946] hover:border-[#e63946] transition-all"
          >
            {loading === "yearly" ? "Processing..." : "Subscribe Annually"}
          </button>
        </div>
      </div>
    </div>
  );
}
