"use client";

import { useActionState } from "react";
import { addScore } from "./actions";

export default function ScoresClient() {
  const [state, formAction, isPending] = useActionState(addScore, null);

  return (
    <div className="brand-card p-6">
      <h2 className="font-black text-[#111] text-base tracking-tight mb-4 uppercase">
        Add New Round
      </h2>
      <form action={formAction} className="space-y-5">
        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
            {state.error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              className="text-xs font-bold text-gray-400 uppercase tracking-widest block"
              htmlFor="score"
            >
              Stableford Score (1–45)
            </label>
            <input
              id="score"
              name="score"
              type="number"
              min="1"
              max="45"
              required
              placeholder="e.g. 36"
              className="brand-input font-mono text-lg font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-xs font-bold text-gray-400 uppercase tracking-widest block"
              htmlFor="date"
            >
              Round Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className="brand-input font-mono"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#111] text-white py-4 rounded-xl font-black text-sm tracking-widest uppercase hover:bg-[#e63946] transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Submit Score"}
        </button>
      </form>
    </div>
  );
}
