"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { addScore, deleteScore, updateScore } from "./actions";

type Score = { id: string; score: number; date: string };
type Props = { initialScores: Score[] };

export default function ScoresClient({ initialScores }: Props) {
  const [scores, setScores] = useState(initialScores);
  const [editing, setEditing] = useState<Score | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setScores(initialScores);
  }, [initialScores]);

  // Add score form state
  const [addState, addAction, isAdding] = useActionState(addScore, null);
  // Edit score form state
  const [editState, editAction, isEditing] = useActionState(updateScore, null);

  useEffect(() => {
    if (editState?.success) {
      setEditing(null);
    }
  }, [editState?.success]);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this score?")) return;
    startTransition(async () => {
      const res = await deleteScore(id);
      if (!res.error) {
        setScores((prev) => prev.filter((s) => s.id !== id));
      }
    });
  };

  // After successful add, clear form
  const addFormRef = (form: HTMLFormElement | null) => {
    if (addState?.success && form) form.reset();
  };

  return (
    <div className="space-y-5">
      {/* ─── CURRENT SCORES LIST ─── */}
      <div className="brand-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-[#111] text-base uppercase tracking-tight">
            Last 5 Rounds
          </h2>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i < scores.length ? "bg-[#e63946]" : "bg-gray-200"
                }`}
              />
            ))}
            <span className="text-xs font-bold text-gray-400 ml-2">{scores.length}/5</span>
          </div>
        </div>

        {scores.length > 0 ? (
          <div className="space-y-2">
            {scores.map((s, idx) => (
              <div key={s.id}>
                {editing?.id === s.id ? (
                  // ─── INLINE EDIT FORM ───
                  <form
                    action={editAction}
                    className="flex flex-wrap items-center gap-2 p-3 bg-red-50 rounded-xl border border-[#e63946]/30"
                  >
                    <input type="hidden" name="scoreId" value={s.id} />
                    <input
                      name="score"
                      type="number"
                      min="1"
                      max="45"
                      defaultValue={s.score}
                      required
                      className="w-20 brand-input text-sm py-1.5 px-3 font-mono font-bold"
                    />
                    <input
                      name="date"
                      type="date"
                      defaultValue={s.date.substring(0, 10)}
                      required
                      className="brand-input text-sm py-1.5 px-3 font-mono flex-1 min-w-[140px]"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="submit"
                        disabled={isEditing}
                        className="bg-[#e63946] text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[#111] transition-all disabled:opacity-50"
                      >
                        {isEditing ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                    {editState?.error && (
                      <p className="w-full text-xs text-red-600 font-medium">{editState.error}</p>
                    )}
                  </form>
                ) : (
                  // ─── DISPLAY ROW ───
                  <div className="flex items-center justify-between py-2.5 px-1 border-b border-gray-50 last:border-0 group">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">
                        {new Date(s.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditing(s)}
                          className="text-[10px] font-black text-blue-500 hover:text-[#111] uppercase tracking-widest border border-blue-200 bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={isPending}
                          className="text-[10px] font-black text-[#e63946] hover:text-white hover:bg-[#e63946] uppercase tracking-widest border border-red-200 bg-red-50 px-2 py-1 rounded-lg transition-all disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-2xl text-[#111]">{s.score}</span>
                        <span className="text-xs text-gray-400 font-semibold ml-1">pts</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
            <p className="text-gray-400 text-sm font-medium">No rounds recorded yet.</p>
          </div>
        )}

        {scores.length >= 5 && (
          <p className="text-xs text-orange-500 font-semibold text-center mt-4 p-3 bg-orange-50 rounded-xl">
            ⚠ You have 5 scores. Adding a new one will automatically remove the oldest.
          </p>
        )}
      </div>

      {/* ─── ADD NEW SCORE ─── */}
      <div className="brand-card p-5">
        <h2 className="font-black text-[#111] text-base uppercase tracking-tight mb-4">
          Add New Round
        </h2>
        <form action={addAction} ref={addFormRef} className="space-y-4">
          {addState?.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
              {addState.error}
            </div>
          )}
          {addState?.success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl font-medium">
              ✓ Score added successfully.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block" htmlFor="score">
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
                className="brand-input font-mono text-xl font-black"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block" htmlFor="date">
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
            disabled={isAdding}
            className="w-full bg-[#111] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#e63946] transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20 disabled:opacity-50"
          >
            {isAdding ? "Saving…" : "Submit Score"}
          </button>
        </form>
      </div>
    </div>
  );
}
