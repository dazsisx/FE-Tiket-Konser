"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export default function CekPembelianEmail() {
  const [email, setEmail] = useState("");

  return (
    <div
      className={`${outfit.variable} relative min-h-screen overflow-hidden bg-white font-[family-name:var(--font-outfit),Plus_Jakarta_Sans,sans-serif]`}
    >
      <svg
        className="pointer-events-none absolute top-10 left-8 opacity-[0.15]"
        width="120"
        height="90"
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 7 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 16 + 4}
              cy={row * 16 + 4}
              r="2"
              fill="#2563EB"
            />
          ))
        )}
      </svg>

      <div className="pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-[#2563EB] opacity-[0.05] blur-[100px]" />

      <div className="relative flex flex-col items-center px-6 pt-20 pb-4 sm:pt-28">
        <div className="w-full max-w-[600px] rounded-[32px] border border-[#E6EEF8] bg-white p-8 shadow-[0_20px_60px_rgba(8,27,75,0.10)] sm:p-10">
          <h1 className="text-3xl font-extrabold text-[#081B4B] sm:text-[32px]">
            Pembelian
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
            Silakan masukkan email yang digunakan saat melakukan pembelian
            tiket untuk melihat detail pesanan Anda.
          </p>

          <form className="mt-7 flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-[#081B4B]"
            >
              Email <span className="text-[#2563EB]">*</span>
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#94A3B8]">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan alamat email"
                className="h-[56px] w-full rounded-2xl border border-[#DCE7F5] bg-white pl-11 pr-4 text-sm text-[#081B4B] placeholder:text-[#94A3B8] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-6 h-[56px] w-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-sm font-bold text-white shadow-[0_10px_28px_rgba(37,99,235,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#1D4ED8] hover:to-[#0891B2]"
            >
              Lihat Pembelian
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E6EEF8]" />
            <a href="/pembelian/nomor" className="shrink-0 text-sm text-[#64748B]">
              Atau gunakan{" "}
              <span className="font-bold text-[#06B6D4] hover:underline">
                Nomor HP
              </span>
            </a>
            <div className="h-px flex-1 bg-[#E6EEF8]" />
          </div>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden">
        <svg
          className="absolute inset-x-0 bottom-0 w-full"
          viewBox="0 0 1536 500"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="waveGradientEmail" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradientEmail)"
            fillOpacity="0.9"
            d="M0,180 C280,260 500,90 780,140 C1060,190 1280,320 1536,240 L1536,500 L0,500 Z"
          />
        </svg>

        <svg
          className="pointer-events-none absolute top-16 left-[18%] h-6 w-6 text-[#06B6D4] opacity-70"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
        </svg>
        <svg
          className="pointer-events-none absolute top-40 right-[16%] h-5 w-5 text-[#2563EB] opacity-60"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
        </svg>
        <div className="pointer-events-none absolute top-10 right-[10%] h-10 w-10 rounded-full border-2 border-[#2563EB]/30" />
      </div>
    </div>
  );
}