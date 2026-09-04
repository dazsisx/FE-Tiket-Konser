"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ImageIcon,
  Music2,
  Mic2,
  PartyPopper,
  Guitar,
  Sparkles,
} from "lucide-react";
import {
  type EventItem,
  getImageUrl,
  formatTanggal,
  getHargaTermurah,
} from "@/utils/api";

/**
 * Hero Banner + Top Events — sekarang pakai data ASLI dari BE (props
 * `events`, hasil fetch di landingpage/index.tsx sebagai server component).
 *
 * Kalau sebuah event belum punya poster, otomatis fallback ke placeholder
 * bergaya sama seperti sebelumnya (dashed border) supaya tetap kelihatan
 * rapi walau admin belum upload gambar.
 */

function HeroSlide({ event }: { event: EventItem }) {
  const posterUrl = getImageUrl(event.poster);

  if (posterUrl) {
    return (
      <div className="relative flex aspect-[16/6] min-h-[220px] w-full items-end overflow-hidden rounded-3xl bg-[#1F2937]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterUrl}
          alt={event.nama_event}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2937] via-[#1F2937]/40 to-transparent" />
        <div className="relative z-10 p-6 sm:p-8">
          <h3 className="text-lg font-extrabold text-white sm:text-2xl">
            {event.nama_event}
          </h3>
          <p className="mt-1 text-sm text-slate-200">
            {formatTanggal(event.tanggal)} &middot; {event.lokasi}
          </p>
        </div>
      </div>
    );
  }

  // Fallback: event belum ada poster
  return (
    <div className="relative flex aspect-[16/6] min-h-[220px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl bg-[#1F2937]">
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#0F766E] opacity-20 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#F59E0B] opacity-20 blur-[110px]" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#F59E0B]">
        <ImageIcon size={20} strokeWidth={1.5} />
      </div>
      <span className="relative border border-dashed border-white/20 px-4 py-1.5 text-xs font-medium tracking-wide text-slate-300">
        {event.nama_event}
      </span>
      <p className="relative text-xs text-slate-400">
        Poster belum diunggah &middot; {formatTanggal(event.tanggal)}
      </p>
    </div>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const posterUrl = getImageUrl(event.poster);

  return (
    <div className="flex w-[170px] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:w-[200px]">
      <div className="relative aspect-[3/4] w-full bg-[#FFFBF5]">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={event.nama_event}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E5E7EB] text-[#9CA3AF]">
            <ImageIcon size={22} strokeWidth={1.5} />
          </div>
        )}
        {event.status === "tutup" && (
          <span className="absolute top-2 left-2 rounded-full bg-[#1F2937]/80 px-2.5 py-1 text-[10px] font-bold text-white">
            Tiket Ditutup
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-xs font-bold text-[#1F2937]">
          {event.nama_event}
        </p>
        <p className="mt-1 text-[11px] text-[#6B7280]">
          {formatTanggal(event.tanggal)}
        </p>
        <p className="mt-1 text-[11px] font-semibold text-[#F59E0B]">
          Mulai {getHargaTermurah(event.kategori_tiket)}
        </p>
      </div>
    </div>
  );
}

const categories = [
  { label: "Konser", icon: Music2, color: "bg-[#ECFDF5] text-[#0F766E]" },
  { label: "Festival", icon: PartyPopper, color: "bg-[#FFF7ED] text-[#EA580C]" },
  { label: "Musik Live", icon: Mic2, color: "bg-[#EFF6FF] text-[#2563EB]" },
  { label: "Akustik", icon: Guitar, color: "bg-[#FEFCE8] text-[#A16207]" },
];

function SectionHeading({
  title,
  icon: Icon,
  tone,
}: {
  title: string;
  icon: typeof Music2;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tone} animate-[sectionIcon_3s_ease-in-out_infinite]`}>
        <Icon size={17} strokeWidth={2.2} />
      </span>
      <h2 className="text-xl font-bold text-[#1F2937] sm:text-2xl">{title}</h2>
    </div>
  );
}

function EventRail({
  title,
  events,
  emptyText,
  icon: Icon,
  tone,
}: {
  title: string;
  events: EventItem[];
  emptyText: string;
  icon: typeof Music2;
  tone: string;
}) {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between">
        <SectionHeading title={title} icon={Icon} tone={tone} />
        <Link
          href="/events"
          aria-label={`Lihat semua ${title.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#0F766E] transition-all duration-300 hover:border-transparent hover:bg-[#0F766E] hover:text-white"
        >
          <ArrowRight size={18} />
        </Link>
      </div>
      {events.length ? (
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} aria-label={`Lihat detail ${event.nama_event}`}>
              <EventCard event={event} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-[#9CA3AF]">{emptyText}</p>
      )}
    </div>
  );
}

export default function HeroAndTopEvents({ events }: { events: EventItem[] }) {
  const [active, setActive] = useState(0);
  const [heroMounted, setHeroMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setHeroMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const heroSlides = events.slice(0, 6);
  const topEvents = events.slice(0, 8);
  const newestEvents = [...events]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(8, 16);
  const recommendedEvents = events.slice(16, 24);
  const hasEvents = events.length > 0;

  const goTo = (index: number) => {
    if (heroSlides.length === 0) return;
    const next = (index + heroSlides.length) % heroSlides.length;
    setActive(next);
  };

  const activeSlide = heroSlides[active];

  return (
    <section className="bg-[#FFFBF5] px-4 pt-24 pb-16 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ===== Hero pencarian ===== */}
        <div className="grid items-center gap-8 pb-10 lg:grid-cols-[1fr_420px]">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#F59E0B]">Temukan acara favoritmu</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-[#1F2937] sm:text-6xl">
              Semua keseruan,
              <span className="block text-[#0F766E]">di satu panggung.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#6B7280]">
              Temukan konser dan acara musik pilihan untuk mengisi kalender serumu.
            </p>
          </div>
          <div className="relative hidden h-64 overflow-hidden rounded-3xl bg-[#FFF7ED] sm:block">
            <div className="absolute -right-8 -bottom-12 h-48 w-48 rounded-full bg-[#FCD34D]/40 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ballonbaru1.png" alt="Ilustrasi menemukan event" className="relative mx-auto h-full w-full object-contain animate-[float_5s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* ===== Kategori ===== */}
        <div className="border-y border-[#E5E7EB] py-6">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="mr-2 text-sm font-bold text-[#1F2937]">Jelajahi kategori</span>
            {categories.map(({ label, icon: Icon, color }) => (
              <button key={label} type="button" className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F2937] transition-all hover:-translate-y-0.5 hover:border-[#0F766E]">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${color}`}><Icon size={15} /></span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== Hero Banner ===== */}
        {hasEvents ? (
          <div
            className={`relative transition-all duration-700 ease-out ${
              heroMounted
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
          >
            <Link
              href={`/events/${activeSlide.id}`}
              aria-label={`Lihat detail ${activeSlide.nama_event}`}
              className="block rounded-3xl transition-transform duration-300 hover:scale-[1.005] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2"
            >
              <HeroSlide event={activeSlide} />
            </Link>

            {heroSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  aria-label="Slide sebelumnya"
                  className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-[#F59E0B] hover:border-[#F59E0B]"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  aria-label="Slide berikutnya"
                  className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-[#F59E0B] hover:border-[#F59E0B]"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="absolute bottom-5 left-6 flex items-center gap-1.5">
                  {heroSlides.map((slide, i) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Ke slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === active
                          ? "w-6 bg-gradient-to-r from-[#0F766E] to-[#F59E0B]"
                          : "w-2 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex aspect-[16/6] min-h-[220px] w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-[#E5E7EB] bg-white text-[#9CA3AF]">
            <ImageIcon size={24} strokeWidth={1.5} />
            <p className="text-sm font-medium">Belum ada event tersedia</p>
          </div>
        )}

        <EventRail title="Event Teratas" icon={Sparkles} tone="bg-[#FFF7ED] text-[#EA580C]" events={topEvents} emptyText="Belum ada event yang ditambahkan." />
        <EventRail title="Event Terbaru" icon={Mic2} tone="bg-[#EFF6FF] text-[#2563EB]" events={newestEvents} emptyText="Belum ada event terbaru." />
        <EventRail title="Rekomendasi Untukmu" icon={PartyPopper} tone="bg-[#ECFDF5] text-[#0F766E]" events={recommendedEvents} emptyText="Belum ada rekomendasi event." />
      </div>
      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes drift { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(6px, -8px) rotate(8deg); } }
        @keyframes sectionIcon { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-4px) rotate(4deg); } }
      `}</style>
    </section>
  );
}