"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { addCharity, updateCharity, deleteCharity } from "../actions";

type Charity = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  featured: boolean;
};

export default function CharityCMSClient({
  charities: initial,
}: {
  charities: Charity[];
}) {
  const [charities, setCharities] = useState(initial);
  const [editing, setEditing] = useState<Charity | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCharities(initial);
  }, [initial]);

  const [addState, addAction, isAdding] = useActionState(addCharity, (null as any));
  const [editState, editAction, isEditing] = useActionState(updateCharity, (null as any));

  const handleDelete = (id: string) => {
    if (!confirm("Delete this charity? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteCharity(id);
      if (!res.error) {
        setCharities((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Add new charity */}
      <div className="brand-card overflow-hidden">
        <button
          onClick={() => {
            setShowAdd(!showAdd);
            setEditing(null);
          }}
          className="w-full flex items-center justify-between p-6 font-black text-[#111] hover:text-[#e63946] transition-colors"
        >
          <span className="text-base uppercase tracking-tight">
            {showAdd ? "− Cancel" : "+ Add New Charity"}
          </span>
        </button>

        {showAdd && (
          <form
            action={addAction}
            className="border-t border-gray-100 p-6 space-y-4"
            onSubmit={() => setShowAdd(false)}
          >
            {addState?.error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                {addState.error}
              </div>
            )}
            {addState?.success && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
                Charity added successfully.
              </div>
            )}
            <CharityForm />
            <button
              type="submit"
              disabled={isAdding}
              className="bg-[#111] text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#e63946] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isAdding && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isAdding ? "Adding..." : "Add Charity"}
            </button>
          </form>
        )}
      </div>

      {/* Edit modal / form */}
      {editing && (
        <div className="brand-card border-2 border-[#e63946] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-black text-[#e63946] uppercase tracking-tight">
              Editing: {editing.name}
            </h2>
            <button
              onClick={() => setEditing(null)}
              className="text-gray-400 hover:text-[#111] text-sm font-bold"
            >
              Cancel ×
            </button>
          </div>
          {editState?.error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {editState.error}
            </div>
          )}
          <form action={editAction} className="space-y-4" onSubmit={() => setEditing(null)}>
            <input type="hidden" name="id" value={editing.id} />
            <CharityForm charity={editing} />
            <button
              type="submit"
              disabled={isEditing}
              className="bg-[#e63946] text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#111] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isEditing && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isEditing ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* Charity list */}
      <div className="space-y-3">
        {charities.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400 text-sm font-medium">
              No charities yet. Add your first one above.
            </p>
          </div>
        ) : (
          charities.map((c) => (
            <div
              key={c.id}
              className="brand-card p-5 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-[#111] tracking-tight">{c.name}</h3>
                  {c.featured && (
                    <span className="text-[9px] font-black uppercase tracking-widest bg-[#e63946] text-white px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
                {c.image_url && (
                  <p className="text-[10px] text-gray-300 mt-1 font-mono truncate">
                    {c.image_url}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditing(c);
                    setShowAdd(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-black text-[#111] px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors uppercase tracking-wider"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={isPending}
                  className="text-xs font-black text-[#e63946] px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors uppercase tracking-wider disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CharityForm({ charity }: { charity?: Charity }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
          Charity Name *
        </label>
        <input
          name="name"
          defaultValue={charity?.name}
          required
          placeholder="e.g. Children's Health Foundation"
          className="brand-input"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={charity?.description}
          rows={3}
          placeholder="Brief description of the charity's mission..."
          className="brand-input resize-none"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
          Image URL (optional)
        </label>
        <input
          name="image_url"
          defaultValue={charity?.image_url ?? ""}
          placeholder="https://..."
          className="brand-input"
        />
      </div>
      <div className="flex items-center gap-3 mt-auto pb-1">
        <input
          type="checkbox"
          name="featured"
          id="featured"
          defaultChecked={charity?.featured}
          className="w-4 h-4 accent-[#e63946]"
        />
        <label
          htmlFor="featured"
          className="text-sm font-bold text-[#111] cursor-pointer"
        >
          Feature this charity
        </label>
      </div>
    </div>
  );
}
