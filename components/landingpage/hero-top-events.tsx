"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, ImageIcon } from "lucide-react";

/**
 * PLACEHOLDER SECTION — Hero Banner + Top Events
 * ------------------------------------------------
 * Token warna:
 *   Primary Dark   #111827
 *   Primary Blue   #2563EB
 *   Accent Cyan    #06B6D4
 *   Background     #F8FAFC
 *   White          #FFFFFF
 *
 * Animasi:
 * - Hero banner fade-in + slide-up begitu komponen pertama kali mount.
 * - Card "Top Events" fade-in + slide-up satu-satu (staggered) begitu
 *   section-nya masuk viewport (pakai IntersectionObserver di hook
 *   `useInView` di bawah).
 *
 * Semua interaksi (arrow, dots, scroll horizontal, klik ke detail) sudah jalan.
 * Yang masih kosong cuma isi gambar & datanya.
 *
 * Cara pasang data asli nanti dari BE:
 * 1. Ganti `heroSlides` dan `topEvents` dengan data dari API — pastikan tiap
 *    item punya `slug`/`id` asli dari BE untuk dipakai di URL.
 * 2. Di dalam <HeroPlaceholder> / <EventCardPlaceholder>, ganti isinya jadi:
 *      <Image src={slide.image} alt={slide.title} fill className="object-cover" />
 * 3. Hapus border dashed + ikon placeholder-nya kalau gambar sudah terisi.
 * 4. Sesuaikan path "/events/[slug]" dengan struktur route detail event kamu.
 */

const HERO_SLIDE_COUNT = 6;
const heroSlides = Array.from({ length: HERO_SLIDE_COUNT }, (_, i) => ({
  id: i,
  slug: `event-${i + 1}`,
  label: `Hero Banner ${i + 1}`,
}));

const topEvents = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  slug: `event-${i + 1}`,
  label: `Event ${i + 1}`,
}));

/** Hook kecil buat deteksi kapan elemen masuk viewport (trigger sekali) */
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

function HeroPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative flex aspect-[16/6] min-h-[220px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl bg-[#111827]">
      {/* Radial glow biru & cyan, konsisten sama footer */}
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#2563EB] opacity-20 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#06B6D4] opacity-20 blur-[110px]" />

      {/* Dot pattern dekorasi */}
      <svg
        className="pointer-events-none absolute top-6 left-6 opacity-20"
        width="90"
        height="70"
        aria-hidden="true"
      >
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 15 + 4}
              cy={row * 15 + 4}
              r="1.6"
              fill="#06B6D4"
            />
          ))
        )}
      </svg>

      <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#06B6D4]">
        <ImageIcon size={20} strokeWidth={1.5} />
      </div>
      <span className="relative border border-dashed border-white/20 px-4 py-1.5 text-xs font-medium tracking-wide text-slate-300">
        {label} &middot; 1600×520px
      </span>
    </div>
  );
}

function EventCardPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-[3/4] w-[170px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-slate-400 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/40 hover:shadow-md sm:w-[200px]">
      <ImageIcon size={24} strokeWidth={1.5} className="text-slate-300" />
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </div>
  );
}

export default function HeroAndTopEvents() {
  const [active, setActive] = useState(0);

  // Trigger fade-in hero begitu komponen mount
  const [heroMounted, setHeroMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setHeroMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Trigger staggered fade-in card "Top Events" begitu section terlihat
  const { ref: eventsRef, inView: eventsInView } = useInView<HTMLDivElement>();

  const goTo = (index: number) => {
    const next = (index + HERO_SLIDE_COUNT) % HERO_SLIDE_COUNT;
    setActive(next);
  };

  const activeSlide = heroSlides[active];

  return (
    <section className="bg-[#F8FAFC] px-4 pt-24 pb-10 sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ===== Hero Banner ===== */}
        <div
          className={`relative transition-all duration-700 ease-out ${
            heroMounted
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          {/* Klik area hero -> detail event dari slide yang aktif.
              Arrow & dots ada di atasnya (DOM setelah ini) jadi tetap
              bisa diklik terpisah tanpa ikut trigger navigasi. */}
          <Link
            href={`/events/${activeSlide.slug}`}
            aria-label={`Lihat detail ${activeSlide.label}`}
            className="block rounded-3xl transition-transform duration-300 hover:scale-[1.005] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] focus-visible:ring-offset-2"
          >
            <HeroPlaceholder label={activeSlide.label} />
          </Link>

          {/* Arrow kiri */}
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Slide sebelumnya"
            className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-[#06B6D4] hover:border-[#06B6D4]"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Arrow kanan */}
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Slide berikutnya"
            className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-[#06B6D4] hover:border-[#06B6D4]"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-5 left-6 flex items-center gap-1.5">
            {heroSlides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ke slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-6 bg-gradient-to-r from-[#2563EB] to-[#06B6D4]"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ===== Top Events ===== */}
        <div
          className={`mt-10 transition-all duration-700 ease-out ${
            heroMounted
              ? "translate-y-0 opacity-100 delay-150"
              : "translate-y-6 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#111827] sm:text-2xl">
              Top Events
            </h2>
            <Link
              href="/events"
              aria-label="Lihat semua event"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[#2563EB] transition-all duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-[#2563EB] hover:to-[#06B6D4] hover:text-white"
            >
              <ArrowRight size={18} />
            </Link>
          </div>

          <div
            ref={eventsRef}
            className="mt-5 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {topEvents.map((event, i) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                aria-label={`Lihat detail ${event.label}`}
                style={{ transitionDelay: `${i * 70}ms` }}
                className={`shrink-0 rounded-2xl transition-all duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] focus-visible:ring-offset-2 ${
                  eventsInView
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                }`}
              >
                <EventCardPlaceholder label={event.label} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}