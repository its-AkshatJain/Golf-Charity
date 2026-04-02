"use client";

import { useActionState, useState, useTransition } from "react";
import { runDraw, simulateWin } from "../actions";
import { Dices, Loader2 } from "lucide-react";

export default function DrawClient() {
  const [mode, setMode] = useState<"random" | "algorithmic">("random");
  const [state, formAction, isPending] = useActionState(runDraw, null);
  const [isSimulating, startSimulation] = useTransition();
  const [simMessage, setSimMessage] = useState<string | null>(null);

  const handleSimulate = () => {
    startSimulation(async () => {
      const res = await simulateWin();
      if (res.success) {
        setSimMessage(res.message || "Win simulated! Check your dashboard.");
      } else {
        alert(res.error || "Simulation failed.");
      }
    });
  };

  return (
    <div className="brand-card p-6 border-2 border-[#111]">
      <h2 className="font-black text-[#111] text-base uppercase tracking-tight mb-6">
        Execute Draw
      </h2>

      <form action={formAction} className="space-y-6">
        {/* Mode selector */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Draw Mode</p>
          <div className="grid grid-cols-2 gap-3">
            {(["random", "algorithmic"] as const).map((m) => (
              <label
                key={m}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === m
                    ? "border-[#111] bg-[#111] text-white"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={mode === m}
                  onChange={() => setMode(m)}
                  className="sr-only"
                />
                <div>
                  <p className="font-black text-sm uppercase tracking-wide capitalize">{m}</p>
                  <p className={`text-xs mt-0.5 ${mode === m ? "text-gray-400" : "text-gray-400"}`}>
                    {m === "random"
                      ? "Pure random number draw"
                      : "Weighted by score frequency"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Result */}
        {state?.error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
            ⚠ {state.error}
          </div>
        )}
        {state?.success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl space-y-2">
            <p className="font-black">✓ {state.message}</p>
            {state.drawnNumbers && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-gray-500">Drawn:</span>
                {state.drawnNumbers.map((n: number, i: number) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-full bg-[#111] text-white text-sm font-black flex items-center justify-center"
                  >
                    {n}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isSimulating}
          className="w-full bg-[#111] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#e63946] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Dices className="w-4 h-4" />
          )}
          {isPending ? "Running Draw..." : "Execute Monthly Draw"}
        </button>

        {/* 
        <div className="pt-4 border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 text-center">Testing Utilities</p>
          <button
            type="button"
            onClick={handleSimulate}
            disabled={isPending || isSimulating}
            className="w-full bg-white border-2 border-[#e63946] text-[#e63946] py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#e63946] hover:text-white transition-all disabled:opacity-50"
          >
            {isSimulating ? "Simulating..." : "★ Force My Win (Cheat Mode)"}
          </button>
          {(simMessage || state?.success) && (
            <p className="text-[10px] text-green-600 font-bold mt-2 text-center">
              {simMessage || state?.message}
            </p>
          )}
        </div>

        <p className="text-[10px] text-gray-400 text-center px-4">
          The monthly draw will match all active subscriber scores against 5 drawn numbers.
          Use Cheat Mode to bypass probability and instantly manifest a winning record for your current account.
        </p>
        */}
      </form>
    </div>
  );
}
