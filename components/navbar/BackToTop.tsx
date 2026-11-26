"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Tombol kembali ke atas. Muncul setelah pengguna melewati ±600px dari atas halaman.
 * Memakai IntersectionObserver pada penanda di puncak dokumen, jadi tidak ada listener scroll.
 */
export default function BackToTop() {
  const sentinel = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function naik() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <>
      <div
        ref={sentinel}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-[600px] w-px"
      />
      <button
        type="button"
        onClick={naik}
        aria-label="Kembali ke atas"
        tabIndex={show ? 0 : -1}
        className={`fixed right-4 bottom-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#1F2937] bg-[#1F2937] text-[#FFFBF5] shadow-[0_8px_20px_rgba(31,41,55,0.25)] transition-[opacity,transform,background-color] duration-200 hover:bg-[#0F766E] hover:border-[#0F766E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B] sm:right-6 sm:bottom-6 ${
          show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <ArrowUp size={18} aria-hidden="true" />
      </button>
    </>
  );
}
