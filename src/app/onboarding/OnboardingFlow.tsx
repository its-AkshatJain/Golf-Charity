"use client";

import { useState } from "react";
import { saveOnboardingPreferences } from "./actions";
import { Heart, HandCoins, Calendar, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Charity = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  featured: boolean;
};

export default function OnboardingFlow({ charities }: { charities: Charity[] }) {
  const [step, setStep] = useState(1);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [percentage, setPercentage] = useState(10);
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [skipping, setSkiping] = useState(false);

  const handleSkip = async () => {
    setSkiping(true);
    const { skipOnboarding } = await import("./actions");
    await skipOnboarding();
    window.location.href = "/dashboard";
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCheckout = async () => {
    if (!selectedCharity) return;
    setLoading(true);

    try {
      // 1. Save preferences
      const res = await saveOnboardingPreferences(selectedCharity, percentage);
      if (res.error) {
        alert(res.error);
        setLoading(false);
        return;
      }

      // 2. Fetch Stripe Session
      const priceId = plan === "monthly" 
        ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const { url, error } = await checkoutRes.json();
      
      if (error) {
        alert(error);
        setLoading(false);
        return;
      }

      if (url) {
        window.location.href = url;
      }

    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-12">
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Getting Started</p>
          <h1 className="text-2xl font-black text-[#111] tracking-tight">Onboarding</h1>
        </div>
        <button
          onClick={handleSkip}
          disabled={skipping}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-[#e63946] hover:text-white transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {skipping ? "Redirecting..." : "Skip →"}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-12 px-2">
        {[
          { id: 1, label: "Impact", icon: Heart },
          { id: 2, label: "Allocation", icon: HandCoins },
          { id: 3, label: "Membership", icon: Calendar },
        ].map((s, i) => (
          <div key={s.id} className="flex flex-col items-center relative z-10 flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                step >= s.id
                  ? "bg-[#111] text-white shadow-lg shadow-[#111]/20"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <s.icon className="w-4 h-4" />
            </div>
            <p className={`mt-3 text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${step >= s.id ? "text-[#111]" : "text-gray-400"}`}>
              {s.label}
            </p>
            {/* Connecting lines */}
            {i !== 2 && (
              <div className="absolute top-5 left-[50%] w-full h-[2px] -z-10 bg-gray-100">
                <div 
                  className="h-full bg-[#111] transition-all duration-700 ease-in-out" 
                  style={{ width: step > s.id ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="animate-in slide-in-from-right-4 fade-in duration-500">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tighter">Choose your cause.</h2>
              <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                Select the charity that resonates with you. Your performance directly drives support to them.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {charities.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCharity(c.id)}
                  className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 relative overflow-hidden group ${
                    selectedCharity === c.id
                      ? "border-[#e63946] bg-red-50 shadow-md shadow-red-900/5 ring-4 ring-[#e63946]/10"
                      : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {selectedCharity === c.id && (
                    <div className="absolute top-4 right-4 text-[#e63946]">
                      <CheckCircle2 className="w-6 h-6 fill-red-100" />
                    </div>
                  )}
                  <h3 className={`text-lg font-bold ${selectedCharity === c.id ? "text-[#e63946]" : "text-[#111]"}`}>{c.name}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{c.description}</p>
                </div>
              ))}
              {charities.length === 0 && (
                <div className="col-span-full py-8 text-center text-gray-400 font-medium border-2 border-dashed rounded-xl">
                  No charities found. Please add them via Admin.
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold tracking-tighter">Set your impact.</h2>
              <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                Decide what percentage of your monthly winnings goes to your chosen charity.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-end justify-center mb-8">
                <span className="text-7xl font-extrabold tracking-tighter text-[#111]">{percentage}</span>
                <span className="text-3xl font-bold text-gray-300 mb-2 ml-1">%</span>
              </div>
              
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#e63946]"
              />
              
              <div className="flex justify-between text-xs font-bold text-gray-400 mt-3 uppercase tracking-wider">
                <span>10% Min</span>
                <span>100% Max</span>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm font-medium text-gray-600">
                  <span className="text-gray-900 font-bold">{100 - percentage}%</span> of winnings return to you.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold tracking-tighter">Finalize subscription.</h2>
              <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                Unlock access to performance tracking and the monthly prize draw.
              </p>
            </div>

            <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-6">
              {/* Monthly Card */}
              <div
                onClick={() => setPlan("monthly")}
                className={`flex-1 cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 relative flex flex-col justify-between ${
                  plan === "monthly"
                    ? "border-[#111] bg-[#111] text-white shadow-xl"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {plan === "monthly" && (
                  <div className="absolute top-4 right-4 text-white">
                    <CheckCircle2 className="w-6 h-6 opacity-80" />
                  </div>
                )}
                <div>
                  <h3 className={`text-xl font-bold ${plan === "monthly" ? "text-white" : "text-[#111]"}`}>Monthly</h3>
                  <p className={`text-sm mt-1 mb-8 ${plan === "monthly" ? "text-gray-400" : "text-gray-500"}`}>Flexible access.</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold tracking-tighter ${plan === "monthly" ? "text-white" : "text-[#111]"}`}>$15</span>
                    <span className={`text-sm font-bold uppercase tracking-widest ${plan === "monthly" ? "text-gray-500" : "text-gray-400"}`}>/mo</span>
                  </div>
                </div>
              </div>

              {/* Annual Card - Fixed to always be Dark as requested */}
              <div
                onClick={() => setPlan("yearly")}
                className={`flex-1 cursor-pointer rounded-3xl border-2 p-6 transition-all duration-300 relative flex flex-col justify-between bg-[#111] text-white ${
                  plan === "yearly"
                    ? "border-[#e63946] shadow-xl shadow-red-900/20 scale-105 z-10"
                    : "border-gray-800 scale-100 opacity-90"
                }`}
              >
                <div className="absolute -top-3 inset-x-0 w-full flex justify-center">
                  <span className="bg-[#e63946] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Save 2 Months
                  </span>
                </div>
                {plan === "yearly" && (
                  <div className="absolute top-4 right-4 text-[#e63946]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">Annual</h3>
                  <p className={`text-sm mt-1 mb-8 ${plan === "yearly" ? "text-red-400 font-bold" : "text-gray-400 font-medium"}`}>
                    Best value.
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tighter !text-white">$150</span>
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-500">/yr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-8">
        <button
          onClick={handleBack}
          className={`font-bold text-sm tracking-wide uppercase px-6 py-3 rounded-lg transition-colors ${
            step === 1 ? "opacity-0 pointer-events-none" : "text-gray-500 hover:bg-gray-100 hover:text-[#111]"
          }`}
        >
          Back
        </button>

        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={step === 1 && !selectedCharity}
            className="flex items-center gap-2 bg-[#111] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-[#e63946] transition-all hover:shadow-lg hover:shadow-[#e63946]/20 disabled:opacity-50 disabled:pointer-events-none group"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={loading || !selectedCharity}
            className="flex items-center gap-2 bg-[#e63946] text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-black transition-all hover:shadow-lg hover:shadow-black/20 disabled:opacity-50 disabled:pointer-events-none group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <>
                Subscribe & Play
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        )}
      </div>


    </div>
  );
}
