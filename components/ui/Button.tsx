"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  size?: "md" | "sm";
  children: ReactNode;
}

export default function Button({
  loading = false,
  loadingText = "Memproses...",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const heightClass = size === "sm" ? "h-[46px]" : "h-[52px]";

  return (
    <button
      disabled={disabled || loading}
      className={`flex ${heightClass} w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488] active:translate-y-0 active:shadow-[0_6px_16px_rgba(15,118,110,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(15,118,110,0.25)] ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}