"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type BackButtonProps = {
  /** Tujuan kalau tidak ada riwayat browser (mis. halaman dibuka langsung dari link) */
  fallbackHref?: string;
  label?: string;
  showIcon?: boolean;
  className?: string;
};

const defaultClass =
  "inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E] transition-colors duration-300 hover:text-[#F59E0B]";

export default function BackButton({
  fallbackHref = "/",
  label = "Kembali",
  showIcon = true,
  className = defaultClass,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button type="button" onClick={handleBack} className={className}>
      {showIcon && <ChevronLeft size={16} />}
      {label}
    </button>
  );
}