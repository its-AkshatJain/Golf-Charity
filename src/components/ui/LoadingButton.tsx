"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

interface LoadingButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "dark" | "outline" | "danger" | "success";
  loadingText?: string;
  name?: string;
  value?: string;
}

export function LoadingButton({
  children,
  className = "",
  variant = "primary",
  loadingText,
  name,
  value,
}: LoadingButtonProps) {
  const { pending } = useFormStatus();

  const variantClasses = {
    primary: "bg-[#e63946] text-white hover:bg-[#111] shadow-[0_4px_16px_rgba(230,57,70,0.2)]",
    dark:    "bg-[#111] text-white hover:bg-[#e63946]",
    outline: "bg-white border-2 border-gray-100 text-[#111] hover:border-[#111]",
    danger:  "bg-red-50 border border-red-200 text-[#e63946] hover:bg-[#e63946] hover:text-white",
    success: "bg-green-600 text-white hover:bg-green-700",
  }[variant];

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses} ${className}`}
    >
      {pending && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      <span>{pending && loadingText ? loadingText : children}</span>
    </button>
  );
}
