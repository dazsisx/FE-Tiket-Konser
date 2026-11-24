"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
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
  formatTanggal,
  getHargaTermurah,
} from "@/utils/api";

/**
 * Landing page, gabungan:
 *  - loket.com   : banner full-bleed tepat di bawah navbar (panah di tepi,
 *                  dot di kiri bawah), heading seksi berikon, kartu lebar
 *  - tiket.com   : tab pill + baris ikon bulat yang bisa digeser
 *
 * Search sengaja tidak dibuat lagi di sini karena sudah ada di navbar.
 *
 * Asumsi route: kategori -> /events?kategori=<slug>. Sesuaikan jika beda.
 */

const categories = [
  { label: "Konser", slug: "konser", icon: Music2 },
  { label: "Festival", slug: "festival", icon: PartyPopper },
  { label: "Musik Live", slug: "musik-live", icon: Mic2 },
  { label: "Akustik", slug: "akustik", icon: Guitar },
];

const railScroll =
  "flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// 1 kartu = 72% layar di mobile, 1/3 di tablet, 1/4 di desktop (gap 16px)
const railCard =
  "w-[72%] shrink-0 snap-start sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)]";

/* ---------- helper ---------- */

function Poster({ event }: { event: EventItem }) {
  const url = getImageUrl(event.poster);
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={event.nama_event}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-end bg-[#F1EBE0] p-3">
      <span className="line-clamp-3 text-xs font-semibold text-[#6B7280]">
        {event.nama_event}
      </span>
    </div>
  );
}

function ArrowButtons({
  onPrev,
  onNext,
  className = "",
}: {
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  const base =
    "flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1F2937] transition-colors hover:border-[#1F2937] hover:bg-[#1F2937] hover:text-white";
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

function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={26} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#1F2937]" />
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#1F2937] sm:text-2xl">
          {title}
        </h2>
        {hint && <p className="mt-0.5 text-sm text-[#6B7280]">{hint}</p>}
      </div>
    </div>
  );
}

/* ---------- banner full-bleed (gaya loket) ---------- */

function Banner({ events }: { events: EventItem[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = events.length;

  useEffect(() => {
    if (paused || total < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % total), 6000);
    return () => clearInterval(id);
  }, [paused, total]);

  const go = (i: number) => setActive(((i % total) + total) % total);

  const arrow =
    "absolute top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1F2937] shadow-md transition-colors hover:bg-[#F59E0B] sm:flex";

  return (
    <div
      className="relative h-[340px] w-full overflow-hidden bg-[#1F2937] sm:h-[400px] lg:h-[460px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {events.map((event, i) => {
        const url = getImageUrl(event.poster);
        const isActive = i === active;
        return (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            aria-label={`Lihat detail ${event.nama_event}`}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
            className={`absolute inset-0 block transition-opacity duration-700 ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/35 sm:to-transparent" />

            <div className="absolute inset-0 flex items-end pb-12 sm:items-center sm:pb-0">
              <div className="mx-auto w-full max-w-7xl px-5 sm:px-16">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F59E0B]">
                  {formatTanggal(event.tanggal)}
                </p>
                <h3 className="mt-2 line-clamp-2 max-w-xl text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                  {event.nama_event}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
                  <MapPin size={14} className="shrink-0" />
                  <span className="line-clamp-1">{event.lokasi}</span>
                </p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#F59E0B] px-5 py-2.5 text-sm font-bold text-[#1F2937]">
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
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Banner sebelumnya"
            className={`${arrow} left-4`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Banner berikutnya"
            className={`${arrow} right-4`}
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute inset-x-0 bottom-4 z-20">
            <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-5 sm:px-16">
              {events.map((event, i) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ke banner ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- kartu event ---------- */

function EventCard({
  event,
  rank,
  className = "",
}: {
  event: EventItem;
  rank?: number;
  className?: string;
}) {
  const closed = event.status === "ditutup";
  return (
    <Link
      href={`/events/${event.id}`}
      aria-label={`Lihat detail ${event.nama_event}`}
      className={`group block ${className}`}
    >
      <div className="relative aspect-[5/4] overflow-hidden rounded-xl bg-[#F1EBE0]">
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]">
          <Poster event={event} />
        </div>
        {rank !== undefined && (
          <span className="absolute bottom-0 left-0 rounded-tr-xl bg-[#FFFBF5] px-3 pt-1 text-3xl font-extrabold leading-none text-[#1F2937]">
            {String(rank).padStart(2, "0")}
          </span>
        )}
        {closed && (
          <span className="absolute top-2 left-2 rounded bg-[#1F2937] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Ditutup
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="line-clamp-2 text-sm font-bold leading-snug text-[#1F2937] group-hover:text-[#0F766E]">
          {event.nama_event}
        </p>
        <p className="mt-1.5 text-xs text-[#6B7280]">
          {formatTanggal(event.tanggal)}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6B7280]">
          <MapPin size={12} className="shrink-0" />
          <span className="line-clamp-1">{event.lokasi}</span>
        </p>
        <p className="mt-2 text-sm font-bold text-[#1F2937]">
          <span className="mr-1 text-xs font-medium text-[#6B7280]">Mulai</span>
          {getHargaTermurah(event.kategori_tiket)}
        </p>
      </div>
    </Link>
  );
}

/* ---------- rail horizontal ---------- */

function Rail({
  icon,
  title,
  hint,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="mt-14">
      <div className="flex items-start justify-between gap-4">
        <SectionTitle icon={icon} title={title} hint={hint} />
        <div className="flex items-center gap-4">
          <Link
            href="/events"
            className="text-sm font-semibold text-[#0F766E] underline-offset-4 hover:underline"
          >
            Lihat semua
          </Link>
          <ArrowButtons
            onPrev={() => move(-1)}
            onNext={() => move(1)}
            className="hidden sm:flex"
          />
        </div>
      </div>
      <div ref={ref} className={`${railScroll} mt-5 -mx-4 px-4 sm:mx-0 sm:px-0`}>
        {children}
      </div>
    </section>
  );
}

/* ---------- komponen utama ---------- */

export default function HeroAndTopEvents({ events }: { events: EventItem[] }) {
  const [tab, setTab] = useState<"kategori" | "lokasi">("kategori");
  const [lokasi, setLokasi] = useState<string | null>(null);

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
    .sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
    )
    .slice(0, 8);
  const recommendedEvents = filtered.slice(8, 16);

  const pill = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "border-[#0F766E] bg-[#ECFDF5] text-[#0F766E]"
        : "border-[#E5E7EB] bg-white text-[#1F2937] hover:border-[#1F2937]"
    }`;

  const circle =
    "flex h-16 w-16 items-center justify-center rounded-full border bg-white transition-colors";

  return (
    <section className="bg-[#FFFBF5] pt-24 pb-20 sm:pt-28">
      <h1 className="sr-only">Tiket konser dan acara musik</h1>

      {/* ===== Banner full-bleed ===== */}
      {banners.length > 0 ? (
        <Banner events={banners} />
      ) : (
        <div className="flex h-[340px] items-center justify-center bg-[#1F2937] sm:h-[400px] lg:h-[460px]">
          <p className="text-sm font-medium text-white/60">
            Belum ada event tersedia
          </p>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ===== Tab + baris ikon bulat (gaya tiket.com) ===== */}
        <div className="mt-8">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("kategori")}
              className={pill(tab === "kategori")}
            >
              <LayoutGrid size={16} />
              Kategori
            </button>
            {lokasiList.length > 1 && (
              <button
                type="button"
                onClick={() => setTab("lokasi")}
                className={pill(tab === "lokasi")}
              >
                <MapPin size={16} />
                Lokasi
              </button>
            )}
          </div>

          <div className="mt-5 flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tab === "kategori" &&
              categories.map(({ label, slug, icon: Icon }) => (
                <Link
                  key={slug}
                  href={`/events?kategori=${slug}`}
                  className="group flex w-[88px] shrink-0 flex-col items-center gap-2"
                >
                  <span
                    className={`${circle} border-[#E5E7EB] text-[#0F766E] group-hover:border-[#0F766E] group-hover:bg-[#ECFDF5]`}
                  >
                    <Icon size={26} strokeWidth={1.6} />
                  </span>
                  <span className="text-center text-xs font-semibold text-[#1F2937]">
                    {label}
                  </span>
                </Link>
              ))}

            {tab === "lokasi" && (
              <>
                <button
                  type="button"
                  onClick={() => setLokasi(null)}
                  className="group flex w-[88px] shrink-0 flex-col items-center gap-2"
                >
                  <span
                    className={`${circle} ${
                      lokasi === null
                        ? "border-[#0F766E] bg-[#0F766E] text-white"
                        : "border-[#E5E7EB] text-[#0F766E] group-hover:border-[#0F766E]"
                    }`}
                  >
                    <LayoutGrid size={26} strokeWidth={1.6} />
                  </span>
                  <span className="text-center text-xs font-semibold text-[#1F2937]">
                    Semua
                  </span>
                </button>
                {lokasiList.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setLokasi(lokasi === name ? null : name)}
                    className="group flex w-[88px] shrink-0 flex-col items-center gap-2"
                  >
                    <span
                      className={`${circle} ${
                        lokasi === name
                          ? "border-[#0F766E] bg-[#0F766E] text-white"
                          : "border-[#E5E7EB] text-[#0F766E] group-hover:border-[#0F766E]"
                      }`}
                    >
                      <MapPin size={26} strokeWidth={1.6} />
                    </span>
                    <span className="line-clamp-2 text-center text-xs font-semibold text-[#1F2937]">
                      {name}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {filtered.length === 0 && events.length > 0 && (
          <p className="mt-10 text-sm text-[#9CA3AF]">
            Belum ada event di lokasi ini.
          </p>
        )}

        {/* ===== Event Teratas ===== */}
        {topEvents.length > 0 && (
          <Rail
            icon={Megaphone}
            title="Event Teratas"
            hint="Paling banyak dilihat minggu ini"
          >
            {topEvents.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                rank={i + 1}
                className={railCard}
              />
            ))}
          </Rail>
        )}

        {/* ===== Event Terbaru (grid) ===== */}
        {newestEvents.length > 0 && (
          <section className="mt-14">
            <div className="flex items-start justify-between gap-4">
              <SectionTitle icon={Clock} title="Event Terbaru" />
              <Link
                href="/events"
                className="text-sm font-semibold text-[#0F766E] underline-offset-4 hover:underline"
              >
                Lihat semua
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {newestEvents.map((event) => (
                <EventCard key={event.id} event={event} />
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
    </section>
  );
}