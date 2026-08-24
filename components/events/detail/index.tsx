"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import {
  EventItem,
  getImageUrl,
  formatTanggal,
  formatJam,
  getHargaTermurah,
} from "@/utils/api";

type EventDetailProps = {
  event: EventItem;
};

function PosterPlaceholder() {
  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#FFFBF5]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#0F766E] shadow-sm">
        <ImageIcon size={20} strokeWidth={1.5} />
      </div>
      <span className="text-xs font-medium text-[#9CA3AF]">
        Poster Event &middot; 800×800px
      </span>
    </div>
  );
}

export default function EventDetail({ event }: EventDetailProps) {
  const [activeTab, setActiveTab] = useState<"deskripsi" | "profil">(
    "deskripsi"
  );

  const posterUrl = getImageUrl(event.poster);
  const creatorName = event.artis?.nama ?? "Promotor";
  const priceLabel =
    event.kategori_tiket && event.kategori_tiket.length > 0
      ? "Harga Tiket Mulai"
      : "Harga Tiket";
  const price = getHargaTermurah(event.kategori_tiket);
  const breadcrumb = ["DR Star", event.nama_event];

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-sm"
        >
          {breadcrumb.map((crumb, i) => {
            const isLast = i === breadcrumb.length - 1;
            return (
              <span key={crumb} className="flex items-center gap-2">
                {isLast ? (
                  <span className="font-semibold text-[#1F2937]">
                    {crumb}
                  </span>
                ) : (
                  <Link
                    href="/"
                    className="font-medium text-[#6B7280] transition-colors duration-300 hover:text-[#F59E0B]"
                  >
                    {crumb}
                  </Link>
                )}
                {!isLast && (
                  <ChevronRight size={14} className="text-[#E5E7EB]" />
                )}
              </span>
            );
          })}
        </nav>

        <div className="h-px w-full bg-[#E5E7EB]" />

        {/* Konten utama */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[420px_1fr]">
          {/* Poster */}
          {posterUrl ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFBF5]">
              <Image
                src={posterUrl}
                alt={event.nama_event}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover"
              />
            </div>
          ) : (
            <PosterPlaceholder />
          )}

          {/* Info event */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-[#1F2937] sm:text-3xl">
                {event.nama_event}
              </h1>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#6B7280] transition-colors duration-300 hover:text-[#0F766E]"
              >
                <Share2 size={16} />
                Bagikan
              </button>
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-sm text-[#6B7280]">
              oleh{" "}
              <span className="font-semibold text-[#1F2937]">
                {creatorName}
              </span>
              {event.artis && <BadgeCheck size={16} className="text-[#0F766E]" />}
            </p>

            <div className="mt-4 flex flex-col gap-2.5 text-sm text-[#6B7280] sm:flex-row sm:flex-wrap sm:gap-6">
              <span className="flex items-center gap-2">
                <Building2 size={16} className="text-[#0F766E]" />
                {event.lokasi}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-[#0F766E]" />
                {event.lokasi}
              </span>
            </div>

            {/* Info boxes: tanggal, waktu, status */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFBF5] px-4 py-3.5">
                <p className="text-xs text-[#6B7280]">Tanggal</p>
                <p className="mt-1 text-sm font-bold text-[#F59E0B]">
                  {formatTanggal(event.tanggal)}
                </p>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFBF5] px-4 py-3.5">
                <p className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                  Waktu
                  <Info size={12} className="text-[#9CA3AF]" />
                </p>
                <p className="mt-1 text-sm font-bold text-[#F59E0B]">
                  {formatJam(event.tanggal)}
                </p>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFBF5] px-4 py-3.5">
                <p className="text-xs text-[#6B7280]">Status</p>
                <p className="mt-1 text-sm font-bold capitalize text-[#1F2937]">
                  {event.status}
                </p>
              </div>
            </div>

            {/* Harga + CTA */}
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#FFFBF5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-[#6B7280]">{priceLabel}</p>
                <p className="mt-1 text-xl font-extrabold text-[#F59E0B]">
                  {price}
                </p>
              </div>
              <Link
                href={`/pembelian/tiket/${event.id}`}
                className="w-full shrink-0 rounded-full bg-[#0F766E] px-8 py-3 text-center text-sm font-bold text-white shadow-[0_10px_26px_rgba(15,118,110,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0D9488] sm:w-auto"
              >
                Beli Tiket
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs: Deskripsi / Profil Kreator */}
        <div className="mt-12">
          <div className="flex items-center gap-8 border-b border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setActiveTab("deskripsi")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors duration-300 ${
                activeTab === "deskripsi"
                  ? "border-b-2 border-[#0F766E] text-[#1F2937]"
                  : "border-b-2 border-transparent text-[#9CA3AF] hover:text-[#6B7280]"
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
                  ? "border-b-2 border-[#0F766E] text-[#1F2937]"
                  : "border-b-2 border-transparent text-[#9CA3AF] hover:text-[#6B7280]"
              }`}
            >
              <UserRound size={16} />
              Profil Kreator
            </button>
          </div>

          <div className="mt-6 max-w-3xl text-sm leading-relaxed text-[#6B7280]">
            {activeTab === "deskripsi" ? (
              <p>
                {event.deskripsi ||
                  "Belum ada deskripsi untuk event ini."}
              </p>
            ) : (
              <p>
                {event.artis?.bio ||
                  "Belum ada profil kreator untuk event ini."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}