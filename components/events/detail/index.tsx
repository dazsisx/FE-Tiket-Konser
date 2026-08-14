"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Building2,
  MapPin,
  Info,
  Share2,
  BadgeCheck,
  ImageIcon,
  FileText,
  UserRound,
} from "lucide-react";

/**
 * HALAMAN DETAIL EVENT — masih pakai DATA DUMMY di bawah ini.
 * ------------------------------------------------------------
 * Cara sambungin ke BE nanti:
 * 1. Ganti object `event` ini jadi hasil fetch (server component / API route),
 *    idealnya diambil pakai slug/id dari URL, mis. app/events/[slug]/page.tsx.
 *    Pastikan field `slug` dari BE juga ikut disimpan (dipakai tombol Beli Tiket).
 * 2. Ganti <PosterPlaceholder /> dengan <Image src={event.posterUrl} .../>.
 * 3. Hapus komentar & elemen dashed-border placeholder yang sudah tidak perlu.
 * 4. Isi deskripsi lengkap & data kreator asli di bagian tab konten.
 * 5. Sesuaikan path "/pembelian/tiket/[slug]" dengan struktur route halaman
 *    pilih tiket kamu kalau berbeda.
 */
const event = {
  slug: "event-1",
  breadcrumb: ["DR Star", "Nama Event Konser"],
  title: "Nama Event Konser",
  creator: "Nama Promotor",
  verified: true,
  city: "Nama Kota",
  address: "Alamat lengkap venue akan tampil di sini",
  date: "Tanggal Event",
  time: "Jam mulai - selesai",
  type: "Kategori Event",
  priceLabel: "Harga Tiket Mulai",
  price: "Rp0",
  description:
    "Deskripsi lengkap event akan tampil di sini setelah data dari backend tersedia. Bagian ini bisa memuat cerita event, line-up, aturan masuk venue, hingga informasi penting lain untuk pembeli tiket.",
  creatorProfile:
    "Profil singkat kreator/promotor event akan tampil di sini, termasuk jumlah event yang pernah diselenggarakan dan rating dari pembeli sebelumnya.",
};

function PosterPlaceholder() {
  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-[#F8FAFC]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-sm">
        <ImageIcon size={20} strokeWidth={1.5} />
      </div>
      <span className="text-xs font-medium text-slate-400">
        Poster Event &middot; 800×800px
      </span>
    </div>
  );
}

export default function EventDetail() {
  const [activeTab, setActiveTab] = useState<"deskripsi" | "profil">(
    "deskripsi"
  );

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm"
        >
          {event.breadcrumb.map((crumb, i) => {
            const isLast = i === event.breadcrumb.length - 1;
            return (
              <span key={crumb} className="flex items-center gap-2">
                {isLast ? (
                  <span className="font-semibold text-[#111827]">
                    {crumb}
                  </span>
                ) : (
                  <Link
                    href="/"
                    className="font-medium text-slate-500 transition-colors duration-300 hover:text-[#06B6D4]"
                  >
                    {crumb}
                  </Link>
                )}
                {!isLast && (
                  <ChevronRight size={14} className="text-slate-300" />
                )}
              </span>
            );
          })}
        </nav>

        <div className="h-px w-full bg-slate-200" />

        {/* Konten utama */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[420px_1fr]">
          {/* Poster */}
          <PosterPlaceholder />

          {/* Info event */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">
                {event.title}
              </h1>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors duration-300 hover:text-[#2563EB]"
              >
                <Share2 size={16} />
                Bagikan
              </button>
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
              oleh{" "}
              <span className="font-semibold text-[#111827]">
                {event.creator}
              </span>
              {event.verified && (
                <BadgeCheck size={16} className="text-[#2563EB]" />
              )}
            </p>

            <div className="mt-4 flex flex-col gap-2.5 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:gap-6">
              <span className="flex items-center gap-2">
                <Building2 size={16} className="text-[#2563EB]" />
                {event.city}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-[#2563EB]" />
                {event.address}
              </span>
            </div>

            {/* Info boxes: tanggal, waktu, tipe event */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3.5">
                <p className="text-xs text-slate-500">Tanggal</p>
                <p className="mt-1 text-sm font-bold text-[#111827]">
                  {event.date}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3.5">
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  Waktu
                  <Info size={12} className="text-slate-400" />
                </p>
                <p className="mt-1 text-sm font-bold text-[#111827]">
                  {event.time}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-3.5">
                <p className="text-xs text-slate-500">Tipe Event</p>
                <p className="mt-1 text-sm font-bold text-[#111827]">
                  {event.type}
                </p>
              </div>
            </div>

            {/* Harga + CTA */}
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-slate-500">{event.priceLabel}</p>
                <p className="mt-1 text-xl font-extrabold text-[#111827]">
                  {event.price}
                </p>
              </div>
              <Link
                href={`/pembelian/tiket/${event.slug}`}
                className="w-full shrink-0 rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] px-8 py-3 text-center text-sm font-bold text-white shadow-[0_10px_26px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#1D4ED8] hover:to-[#0891B2] sm:w-auto"
              >
                Beli Tiket
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs: Deskripsi / Profil Kreator */}
        <div className="mt-12">
          <div className="flex items-center gap-8 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("deskripsi")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors duration-300 ${
                activeTab === "deskripsi"
                  ? "border-b-2 border-[#2563EB] text-[#111827]"
                  : "border-b-2 border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <FileText size={16} />
              Deskripsi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("profil")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors duration-300 ${
                activeTab === "profil"
                  ? "border-b-2 border-[#2563EB] text-[#111827]"
                  : "border-b-2 border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <UserRound size={16} />
              Profil Kreator
            </button>
          </div>

          <div className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-600">
            {activeTab === "deskripsi" ? (
              <p>{event.description}</p>
            ) : (
              <p>{event.creatorProfile}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}