"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AlertProps {
  variant?: "error" | "success";
  children: React.ReactNode;
}

export default function Alert({ variant = "error", children }: AlertProps) {
  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex animate-[fadeIn_0.2s_ease-out] items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-[#0F766E]/20 bg-[#0F766E]/5 text-[#0F766E]"
      }`}
    >
      {isError ? (
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
      )}
      <span>{children}</span>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}