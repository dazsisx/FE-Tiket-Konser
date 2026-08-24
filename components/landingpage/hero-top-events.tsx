"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, ImageIcon } from "lucide-react";
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

function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

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

export default function HeroAndTopEvents({ events }: { events: EventItem[] }) {
  const [active, setActive] = useState(0);
  const [heroMounted, setHeroMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setHeroMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const { ref: eventsRef, inView: eventsInView } = useInView<HTMLDivElement>();

  const heroSlides = events.slice(0, 6);
  const topEvents = events.slice(0, 8);
  const hasEvents = events.length > 0;

  const goTo = (index: number) => {
    if (heroSlides.length === 0) return;
    const next = (index + heroSlides.length) % heroSlides.length;
    setActive(next);
  };

  const activeSlide = heroSlides[active];

  return (
    <section className="bg-[#FFFBF5] px-4 pt-24 pb-10 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
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

        {/* ===== Top Events ===== */}
        <div
          className={`mt-10 transition-all duration-700 ease-out ${
            heroMounted
              ? "translate-y-0 opacity-100 delay-150"
              : "translate-y-6 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1F2937] sm:text-2xl">
              Top Events
            </h2>
            <Link
              href="/events"
              aria-label="Lihat semua event"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#0F766E] transition-all duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-[#0F766E] hover:to-[#F59E0B] hover:text-white"
            >
              <ArrowRight size={18} />
            </Link>
          </div>

          {hasEvents ? (
            <div
              ref={eventsRef}
              className="mt-5 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {topEvents.map((event, i) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  aria-label={`Lihat detail ${event.nama_event}`}
                  style={{ transitionDelay: `${i * 70}ms` }}
                  className={`shrink-0 rounded-2xl transition-all duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 ${
                    eventsInView
                      ? "translate-y-0 opacity-100"
                      : "translate-y-5 opacity-0"
                  }`}
                >
                  <EventCard event={event} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-[#9CA3AF]">
              Belum ada event yang ditambahkan.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}