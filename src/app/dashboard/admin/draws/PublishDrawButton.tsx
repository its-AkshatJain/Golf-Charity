"use client";

import { useTransition } from "react";
import { publishDraw } from "../actions";
import { Loader2 } from "lucide-react";

export default function PublishDrawButton({ drawId }: { drawId: string }) {
  const [isPending, startTransition] = useTransition();

  const handlePublish = () => {
    if (!confirm("Are you sure you want to publish this draw? This will notify all subscribers and winners!")) return;
    startTransition(async () => {
      const res = await publishDraw(drawId);
      if (res.error) {
        alert(res.error);
      }
    });
  };

  return (
    <button
      onClick={handlePublish}
      disabled={isPending}
      className="bg-[#111] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-[#e63946] transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
    >
      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
      Publish
    </button>
  );
}
