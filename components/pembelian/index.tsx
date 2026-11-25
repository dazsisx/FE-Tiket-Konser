"use client";

import Link from "next/link";
import { History, Receipt } from "lucide-react";
import { Outfit } from "next/font/google";
import { useAuth } from "@/contexts/AuthContext";
import GuestLookup from "./guest-lookup";
import RiwayatSaya from "./riwayat";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

/**
 * Histori Pembelian Tiket.
 * - Sudah login: daftar transaksi milik akun (GET /api/pesanan/riwayat).
 * - Belum login: form cek pesanan (email / nomor HP + kode booking) lewat POST /api/pesanan/cek.
 */
export default function HistoriPembelian() {
  const { user, isLoading } = useAuth();
  const isCustomer = user?.role === "pelanggan";

  return (
    <div
      className={`${outfit.variable} relative min-h-screen overflow-hidden bg-white font-[family-name:var(--font-outfit),Plus_Jakarta_Sans,sans-serif]`}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-[#0F766E] opacity-[0.07] blur-[110px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-[480px] w-[480px] rounded-full bg-[#F59E0B] opacity-[0.07] blur-[110px]" />

      <div className="relative mx-auto max-w-[1000px] px-5 pt-28 pb-20 sm:px-8 sm:pt-32">
        <header className={`mb-8 sm:mb-10 ${!isLoading && !user ? "text-center" : ""}`}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#0F766E]">
            <History size={13} aria-hidden="true" />
            Riwayat transaksi
          </span>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[#1F2937] sm:text-5xl">Histori Pembelian</h1>
          <p className={`mt-3 max-w-xl text-base leading-relaxed text-[#6B7280] ${!isLoading && !user ? "mx-auto" : ""}`}>
            {user
              ? "Semua pesanan tiket yang pernah kamu buat, lengkap dengan status pembayaran dan tiketnya."
              : "Lihat status pesanan dan tiketmu, dengan atau tanpa akun."}
          </p>
        </header>

        {isLoading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Memuat">
            <div className="h-[52px] animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-44 animate-pulse rounded-3xl bg-[#F3F4F6]" />
            <div className="h-44 animate-pulse rounded-3xl bg-[#F3F4F6]" />
          </div>
        ) : !user ? (
          <GuestLookup />
        ) : isCustomer ? (
          <RiwayatSaya />
        ) : (
          <div className="flex flex-col items-center rounded-[32px] border border-[#E5E7EB] bg-white px-6 py-14 text-center shadow-[0_20px_60px_rgba(31,41,55,0.08)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF5] text-[#0F766E]">
              <Receipt size={26} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-[#1F2937]">Histori khusus akun pelanggan</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6B7280]">
              Akun ini adalah akun petugas. Transaksi dikelola lewat dashboard admin.
            </p>
            <Link
              href={user.role === "admin" ? "/admin/orders" : "/admin/offline/riwayat"}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-[#0F766E] px-6 text-sm font-bold text-white transition-colors hover:bg-[#0D9488]"
            >
              Buka Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
