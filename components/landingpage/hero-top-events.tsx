"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { Big_Shoulders } from "next/font/google";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Guitar,
  LayoutGrid,
  MapPin,
  Megaphone,
  Mic2,
  Music2,
  PartyPopper,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import {
  type EventItem,
  getImageUrl,
  getHargaTermurah,
} from "@/utils/api";
import { KATEGORI, kategoriOf, potongTanggal, type KategoriSlug } from "@/utils/kategori";
import styles from "./hero-top-events.module.css";

/**
 * Landing page. Bahasa visual sama dengan halaman /kategori/<slug>
 * (judul poster condensed, emas + hijau, gerakan halus), tapi lebih tenang:
 * struktur tetap banner -> kategori/lokasi -> rail event supaya mudah dipindai.
 *
 * Kartu event = poster dengan sobekan kecil di sisinya (isyarat tiket), bukan tiket penuh.
 */

const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const ICONS: Record<KategoriSlug, LucideIcon> = {
  konser: Music2,
  festival: PartyPopper,
  "musik-live": Mic2,
  akustik: Guitar,
};

const railScroll =
  "flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// 1 kartu = 60% layar di mobile, 1/3 tablet, 1/5 desktop (gap 16px)
const railCard =
  "w-[60%] shrink-0 snap-start sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-64px)/5)]";

const pad = (n: number) => String(n).padStart(2, "0");

/* ---------- helper ---------- */

/** Muncul pelan saat masuk layar. */
function Reveal({ children, index = 0, className = "" }: { children: ReactNode; index?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.reveal} ${className}`} data-in={seen} style={{ "--i": Math.min(index, 8) } as CSSProperties}>
      {children}
    </div>
  );
}

function Poster({ event }: { event: EventItem }) {
  const url = getImageUrl(event.poster);
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={event.nama_event} loading="lazy" className="h-full w-full object-cover" />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#F1EBE0] p-4 pb-10 text-center">
      <span className={`${styles.display} line-clamp-3 text-2xl font-extrabold leading-[0.95] text-[#1F2937]/70`}>
        {event.nama_event}
      </span>
    </div>
  );
}

function ArrowButtons({ onPrev, onNext, className = "" }: { onPrev: () => void; onNext: () => void; className?: string }) {
  const base =
    "flex h-9 w-9 items-center justify-center rounded-full border border-[#1F2937]/20 bg-white text-[#1F2937] transition-colors hover:border-[#1F2937] hover:bg-[#1F2937] hover:text-white";
  return (
    <div className={`gap-2 ${className}`}>
      <button type="button" onClick={onPrev} aria-label="Geser ke kiri" className={base}>
        <ChevronLeft size={18} />
      </button>
      <button type="button" onClick={onNext} aria-label="Geser ke kanan" className={base}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1F2937] text-[#F59E0B]">
        <Icon size={18} strokeWidth={2} />
      </span>
      <div>
        <h2 className={`${styles.display} ${styles.secTitle}`}>{title}</h2>
        <span className={styles.secBar} aria-hidden="true" />
        {hint && <p className="mt-2 text-sm text-[#6B7280]">{hint}</p>}
      </div>
    </div>
  );
}

/* ---------- banner full-bleed ---------- */

function Banner({ events }: { events: EventItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = events.length;

  const go = (i: number) => setActive(((i % total) + total) % total);

  const arrow =
    "absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1F2937] shadow-md transition-colors hover:bg-[#F59E0B] sm:flex";

  return (
    <div
      className={`relative h-[380px] w-full overflow-hidden bg-[#1F2937] sm:h-[440px] lg:h-[500px] ${paused ? styles.paused : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {events.map((event, i) => {
        const url = getImageUrl(event.poster);
        const isActive = i === active;
        const { hari, bulan } = potongTanggal(event.tanggal);
        return (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            aria-label={`Lihat detail ${event.nama_event}`}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
            data-active={isActive}
            className={`${styles.slide} absolute inset-0 block transition-opacity duration-700 ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className={styles.bannerImg} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-transparent" />

            <div className="absolute inset-0 flex items-end pb-14 sm:items-center sm:pb-0">
              <div className="mx-auto w-full max-w-7xl px-5 sm:px-16">
                <div className={`${styles.bannerIn} flex items-center gap-3`} style={{ "--n": 0 } as CSSProperties}>
                  <span className={styles.dateChip}>
                    <span className={`${styles.display} ${styles.dateDay}`}>{hari}</span>
                    <span className={styles.dateMonth}>{bulan}</span>
                  </span>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-white/90">
                    <MapPin size={15} className="shrink-0 text-[#F59E0B]" />
                    <span className="line-clamp-1">{event.lokasi}</span>
                  </p>
                </div>
                <h3
                  className={`${styles.display} ${styles.bannerTitle} ${styles.bannerIn} mt-4 line-clamp-3 max-w-3xl`}
                  style={{ "--n": 1 } as CSSProperties}
                >
                  {event.nama_event}
                </h3>
                <span
                  className={`${styles.bannerIn} mt-6 inline-flex items-center gap-2 rounded-lg bg-[#F59E0B] px-5 py-2.5 text-sm font-bold text-[#1F2937]`}
                  style={{ "--n": 2 } as CSSProperties}
                >
                  {event.status === "ditutup"
                    ? "Tiket ditutup"
                    : `Beli tiket · mulai ${getHargaTermurah(event.kategori_tiket)}`}
                  <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        );
      })}

      {total > 1 && (
        <>
          <button type="button" onClick={() => go(active - 1)} aria-label="Banner sebelumnya" className={`${arrow} left-4`}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => go(active + 1)} aria-label="Banner berikutnya" className={`${arrow} right-4`}>
            <ChevronRight size={20} />
          </button>

          <div className="absolute inset-x-0 bottom-3 z-20">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 sm:px-16">
              <div className={styles.segs}>
                {events.map((event, i) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Ke banner ${i + 1}`}
                    aria-current={i === active}
                    data-state={i < active ? "done" : i === active ? "active" : "idle"}
                    className={styles.seg}
                  >
                    {/* penanda waktu: saat penuh, banner pindah ke berikutnya */}
                    <span className={styles.segFill} onAnimationEnd={i === active ? () => go(active + 1) : undefined} />
                  </button>
                ))}
              </div>
              <span className={`${styles.display} ${styles.counter}`} aria-hidden="true">
                {pad(active + 1)} / {pad(total)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- kartu event: poster dengan sobekan kecil ---------- */

function EventCard({ event, rank, className = "" }: { event: EventItem; rank?: number; className?: string }) {
  const closed = event.status === "ditutup";
  const { hari, bulan } = potongTanggal(event.tanggal);
  return (
    <Link href={`/events/${event.id}`} aria-label={`Lihat detail ${event.nama_event}`} className={`${styles.card} ${className}`}>
      <div className={styles.poster}>
        <div className={styles.posterImg}>
          <Poster event={event} />
        </div>
        <span className={styles.chipDate} aria-hidden="true">
          <span className={`${styles.display} ${styles.chipDay}`}>{hari}</span>
          <span className={styles.chipMon}>{bulan}</span>
        </span>
        {rank !== undefined && <span className={`${styles.display} ${styles.rank}`}>{pad(rank)}</span>}
        {closed && <span className={styles.closed}>Ditutup</span>}
      </div>
      <p className={`${styles.cardTitle} line-clamp-2`}>{event.nama_event}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-[#6B7280]">
        <MapPin size={12} className="shrink-0" />
        <span className="line-clamp-1">{event.lokasi}</span>
      </p>
      <p className={`${styles.display} ${styles.cardPrice}`}>
        <span className={styles.cardPriceLbl}>Mulai</span>
        {getHargaTermurah(event.kategori_tiket)}
      </p>
    </Link>
  );
}

/* ---------- rail horizontal ---------- */

function Rail({ icon, title, hint, children }: { icon: LucideIcon; title: string; hint?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="mt-16">
      <Reveal>
        <div className="flex items-start justify-between gap-4">
          <SectionTitle icon={icon} title={title} hint={hint} />
          <div className="flex items-center gap-4 pt-1">
            <Link href="/kategori/konser" className="text-sm font-semibold text-[#0F766E] underline-offset-4 hover:underline">
              Lihat semua
            </Link>
            <ArrowButtons onPrev={() => move(-1)} onNext={() => move(1)} className="hidden sm:flex" />
          </div>
        </div>
      </Reveal>
      <Reveal index={1}>
        <div ref={ref} className={`${railScroll} mt-6 -mx-4 px-4 sm:mx-0 sm:px-0`}>
          {children}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- komponen utama ---------- */

export default function HeroAndTopEvents({ events }: { events: EventItem[] }) {
  const [tab, setTab] = useState<"kategori" | "lokasi">("kategori");
  const [lokasi, setLokasi] = useState<string | null>(null);

  // Jumlah acara per kategori (draft & selesai tidak dihitung)
  const jumlah: Record<KategoriSlug, number> = { konser: 0, festival: 0, "musik-live": 0, akustik: 0 };
  events.forEach((e) => {
    if (e.status === "aktif" || e.status === "ditutup") jumlah[kategoriOf(e)] += 1;
  });

  // Lokasi dari data asli: 8 lokasi dengan event terbanyak
  const lokasiCount = new Map<string, number>();
  events.forEach((e) => {
    if (e.lokasi) lokasiCount.set(e.lokasi, (lokasiCount.get(e.lokasi) ?? 0) + 1);
  });
  const lokasiList = [...lokasiCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  const banners = events.slice(0, 6);
  const filtered = lokasi ? events.filter((e) => e.lokasi === lokasi) : events;
  const topEvents = filtered.slice(0, 8);
  const newestEvents = [...filtered]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 10);
  const recommendedEvents = filtered.slice(8, 16);

  return (
    <section className={`${display.variable} ${styles.root} bg-[#FFFBF5] pt-24 pb-24 sm:pt-28`}>
      <div className={styles.grain} aria-hidden="true" />
      <h1 className="sr-only">Tiket konser dan acara musik</h1>

      <div className={styles.content}>
        {/* ===== Banner full-bleed ===== */}
        {banners.length > 0 ? (
          <Banner events={banners} />
        ) : (
          <div className="flex h-[380px] items-center justify-center bg-[#1F2937] sm:h-[440px] lg:h-[500px]">
            <p className="text-sm font-medium text-white/60">Belum ada event tersedia</p>
          </div>
        )}

        {/* pita nama kategori */}
        <div className={styles.ribbon} aria-hidden="true">
          <div className={`${styles.display} ${styles.ribbonTrack}`}>
            {[0, 1].map((n) => (
              <span key={n} className={styles.ribbonItem}>
                {Array.from({ length: 6 }, () => "Konser   /   Festival   /   Musik Live   /   Akustik   /   ").join("")}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ===== Kategori / lokasi ===== */}
          <Reveal className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={styles.seg2} role="group" aria-label="Jelajahi berdasarkan">
                <button type="button" aria-pressed={tab === "kategori"} onClick={() => setTab("kategori")} className={styles.seg2Btn}>
                  <LayoutGrid size={16} />
                  Kategori
                </button>
                {lokasiList.length > 1 && (
                  <button type="button" aria-pressed={tab === "lokasi"} onClick={() => setTab("lokasi")} className={styles.seg2Btn}>
                    <MapPin size={16} />
                    Lokasi
                  </button>
                )}
              </div>
              <p className="text-sm text-[#6B7280]">
                {tab === "kategori" ? "Pilih jenis acara" : "Saring acara berdasarkan tempat"}
              </p>
            </div>

            {tab === "kategori" && (
              <div className={`${styles.cats} mt-5`}>
                {KATEGORI.map(({ label, slug }, i) => {
                  const Icon = ICONS[slug];
                  return (
                    <Link key={slug} href={`/kategori/${slug}`} className={styles.cat}>
                      <span className={styles.catTop}>
                        <span>{pad(i + 1)}</span>
                        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className={`${styles.display} ${styles.catLabel}`}>{label}</span>
                      <span className={`${styles.catCount} flex items-center justify-between`}>
                        {jumlah[slug]} acara
                        <ArrowRight size={16} className={styles.catGo} aria-hidden="true" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {tab === "lokasi" && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button type="button" aria-pressed={lokasi === null} onClick={() => setLokasi(null)} className={styles.chip}>
                  <LayoutGrid size={15} />
                  Semua
                </button>
                {lokasiList.map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={lokasi === name}
                    onClick={() => setLokasi(lokasi === name ? null : name)}
                    className={styles.chip}
                  >
                    <MapPin size={15} className="shrink-0" />
                    <span className="truncate">{name}</span>
                    <span className="text-xs opacity-70">{lokasiCount.get(name)}</span>
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          {filtered.length === 0 && events.length > 0 && (
            <p className="mt-10 text-sm text-[#9CA3AF]">Belum ada event di lokasi ini.</p>
          )}

          {/* ===== Event Teratas ===== */}
          {topEvents.length > 0 && (
            <Rail icon={Megaphone} title="Event Teratas" hint="Paling banyak dilihat minggu ini">
              {topEvents.map((event, i) => (
                <EventCard key={event.id} event={event} rank={i + 1} className={railCard} />
              ))}
            </Rail>
          )}

          {/* ===== Event Terbaru (grid) ===== */}
          {newestEvents.length > 0 && (
            <section className="mt-16">
              <Reveal>
                <div className="flex items-start justify-between gap-4">
                  <SectionTitle icon={Clock} title="Event Terbaru" />
                  <Link href="/kategori/konser" className="pt-1 text-sm font-semibold text-[#0F766E] underline-offset-4 hover:underline">
                    Lihat semua
                  </Link>
                </div>
              </Reveal>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
                {newestEvents.map((event, i) => (
                  <Reveal key={event.id} index={i % 5}>
                    <EventCard event={event} />
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* ===== Rekomendasi ===== */}
          {recommendedEvents.length > 0 && (
            <Rail icon={ThumbsUp} title="Rekomendasi Untukmu">
              {recommendedEvents.map((event) => (
                <EventCard key={event.id} event={event} className={railCard} />
              ))}
            </Rail>
          )}
        </div>
      </div>
    </section>
  );
}