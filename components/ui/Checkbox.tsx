"use client";

import { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export default function Checkbox({ label, id, className = "", ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex select-none items-start gap-2 text-sm leading-relaxed text-[#6B7280] cursor-pointer"
    >
      <input
        id={id}
        type="checkbox"
        className={`mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#E5E7EB] accent-[#0F766E] transition-transform duration-150 active:scale-90 ${className}`}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}