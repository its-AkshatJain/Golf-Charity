"use client";

import { useActionState, useState } from "react";
import { runDraw } from "../actions";

export default function DrawClient() {
  const [mode, setMode] = useState<"random" | "algorithmic">("random");
  const [state, formAction, isPending] = useActionState(runDraw, null);

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
          disabled={isPending}
          className="w-full bg-[#e63946] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#111] transition-all disabled:opacity-50"
        >
          {isPending ? "Running Draw..." : "🎲 Execute Monthly Draw"}
        </button>
        <p className="text-xs text-gray-400 text-center">
          This will match all active subscriber scores against 5 drawn numbers
          and assign prizes automatically.
        </p>
      </form>
    </div>
  );
}
