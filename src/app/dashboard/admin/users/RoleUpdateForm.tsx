"use client";

import { useActionState, useEffect, useState } from "react";
import { updateUserRole } from "../actions";
import { Loader2, Check } from "lucide-react";

export default function RoleUpdateForm({ userId, defaultRole }: { userId: string, defaultRole: string }) {
  const [state, action, isPending] = useActionState(updateUserRole, null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success && !isPending) {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(t);
    }
    if (state?.error) {
      alert(state.error);
    }
  }, [state, isPending]);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="user_id" value={userId} />
      <select
        name="role"
        defaultValue={defaultRole}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white font-semibold focus:outline-none focus:border-[#e63946]"
      >
        <option value="public">Public</option>
        <option value="subscriber">Subscriber</option>
        <option value="admin">Admin</option>
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="relative text-xs bg-[#111] text-white px-3 py-1.5 rounded-lg font-black hover:bg-[#e63946] transition-all whitespace-nowrap min-w-[70px] flex items-center justify-center disabled:opacity-50 h-[30px]"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : showSuccess ? (
          <span className="flex items-center gap-1 text-green-300"><Check className="w-3.5 h-3.5"/> Saved</span>
        ) : (
          "Save"
        )}
      </button>
    </form>
  );
}
