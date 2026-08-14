"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, ArrowRight } from "lucide-react";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export default function PembelianEmptyState() {
  return (
    <div
      className={`${outfit.variable} relative min-h-screen overflow-hidden bg-white font-[family-name:var(--font-outfit),Plus_Jakarta_Sans,sans-serif]`}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-[#2563EB] opacity-[0.06] blur-[110px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-[480px] w-[480px] rounded-full bg-[#06B6D4] opacity-[0.06] blur-[110px]" />

      {/* Bottom wave */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 w-full text-[#F0F5FF]"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,96 C240,160 480,32 720,64 C960,96 1200,192 1440,140 L1440,220 L0,220 Z"
        />
      </svg>

      <div className="relative mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-8 lg:px-10">
        {/* Left: illustration */}
        <div className="flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-[440px]">
            <Image
              src="/netralface.png"
              alt="Belum ada pembelian"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 440px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Right: content */}
        <div className="flex flex-col items-start text-left">
          <h1 className="text-4xl font-extrabold leading-tight text-[#081B4B] sm:text-5xl">
            Belum Ada Pembelian
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-[#64748B]">
            Sepertinya kamu belum memiliki pembelian tiket. Pastikan nomor HP
            yang kamu masukkan digunakan sebagai informasi kontak saat
            pembelian.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pembelian/email"
              className="flex h-[52px] items-center justify-center gap-2 rounded-full border-[1.5px] border-[#2563EB] px-6 text-sm font-bold text-[#2563EB] transition-all duration-200 hover:bg-[#EFF6FF]"
            >
              <Mail size={18} />
              Gunakan Email
            </Link>

            <Link
              href="/pembelian/nomor"
              className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] px-6 text-sm font-bold text-white shadow-[0_10px_28px_rgba(37,99,235,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#1D4ED8] hover:to-[#0891B2]"
            >
              <Phone size={18} />
              Gunakan Nomor HP
            </Link>
          </div>

          <p className="mt-8 text-sm text-[#64748B]">
            Butuh bantuan? Silakan{" "}
            <Link
              href="/kontak"
              className="inline-flex items-center gap-1 font-semibold text-[#06B6D4] transition-all hover:underline"
            >
              Hubungi Kami
              <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}