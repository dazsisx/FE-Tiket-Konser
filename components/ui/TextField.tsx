"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  size?: "md" | "sm";
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, icon, trailing, id, size = "md", className = "", ...props }, ref) => {
    const heightClass = size === "sm" ? "h-[46px]" : "h-[52px]";

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-[#1F2937]">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={`${heightClass} w-full rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)] ${
              icon ? "pl-11" : "pl-4"
            } ${trailing ? "pr-12" : "pr-4"} ${className}`}
            {...props}
          />
          {trailing && (
            <span className="absolute top-1/2 right-4 -translate-y-1/2">
              {trailing}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;