"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, X } from "lucide-react";
import { formatTanggal, getImageUrl, type EventItem } from "@/utils/api";
import { bandingTerlaris } from "@/utils/kategori";
import { cocokKota, kotaLabelDariSlug, kotaOf } from "@/utils/kota";

const HISTORY_KEY = "drstar:riwayat-cari";
const HISTORY_MAX = 6;
const PANEL_ID = "navbar-search-panel";

function readHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string").slice(0, HISTORY_MAX)
      : [];
  } catch {
    return [];
  }
}

function writeHistory(list: string[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // penyimpanan diblokir (mode privat): histori hanya hidup selama halaman terbuka
  }
}

function Mark({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-bold text-[#0F766E]">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

type Row =
  | { kind: "history"; text: string }
  | { kind: "event"; event: EventItem }
  | { kind: "all"; text: string };

/**
 * Kolom cari + kartu saran.
 * - Saat kosong dan belum difokus, placeholder bergantian menampilkan nama acara.
 * - Saat difokus, kartu di bawahnya memuat pencarian terakhir dan acara populer.
 * - Saat mengetik, kartu berisi acara yang cocok (nama, artis, atau tempat).
 */
export default function SearchBox({
  events,
  kota,
  open,
  onOpenChange,
  variant = "bar",
  onDone,
}: {
  events: EventItem[];
  /** slug kota yang sedang dipilih (null = semua) */
  kota: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "sheet" = dipakai di layar penuh mobile: kartu selalu terbuka dan menyatu di halaman */
  variant?: "bar" | "sheet";
  /** dipanggil setelah pengguna memilih sesuatu */
  onDone?: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  // di layar penuh mobile komponen baru muncul setelah klik, jadi aman membaca localStorage langsung
  const [history, setHistory] = useState<string[]>(() => (variant === "sheet" ? readHistory() : []));
  const [active, setActive] = useState(-1);
  const [phIndex, setPhIndex] = useState(0);

  const sheet = variant === "sheet";
  const isOpen = sheet || open;
  const query = value.trim();
  const q = query.toLowerCase();

  // histori dibaca saat kartu dibuka (bukan saat render server), supaya selalu segar
  function bukaKartu() {
    if (!isOpen) setHistory(readHistory());
    onOpenChange(true);
  }

  useEffect(() => {
    if (sheet) inputRef.current?.focus();
  }, [sheet]);

  const pool = useMemo(() => events.filter((e) => cocokKota(e, kota)), [events, kota]);
  const populer = useMemo(() => [...pool].sort(bandingTerlaris).slice(0, 5), [pool]);

  const hasil = useMemo(() => {
    if (!q) return [];
    return pool
      .map((e) => {
        const nama = e.nama_event.toLowerCase();
        const artis = (e.artis?.nama ?? "").toLowerCase();
        const tempat = `${e.lokasi ?? ""} ${kotaOf(e) ?? ""}`.toLowerCase();
        const skor = nama.startsWith(q) ? 0 : nama.includes(q) ? 1 : artis.includes(q) ? 2 : tempat.includes(q) ? 3 : -1;
        return { e, skor };
      })
      .filter((x) => x.skor >= 0)
      .sort((a, b) => a.skor - b.skor || new Date(a.e.tanggal).getTime() - new Date(b.e.tanggal).getTime())
      .slice(0, 6)
      .map((x) => x.e);
  }, [pool, q]);

  const rows: Row[] = useMemo(() => {
    if (!q) {
      return [
        ...history.map((text): Row => ({ kind: "history", text })),
        ...populer.map((event): Row => ({ kind: "event", event })),
      ];
    }
    return [...hasil.map((event): Row => ({ kind: "event", event })), { kind: "all", text: query }];
  }, [q, query, history, populer, hasil]);

  // Placeholder bergantian: ajakan umum, lalu beberapa nama acara populer
  const placeholders = useMemo(
    () => ["Cari konser, artis, atau kota", ...populer.slice(0, 4).map((e) => `Cari “${e.nama_event}”`)],
    [populer],
  );
  useEffect(() => {
    if (sheet || isOpen || value || placeholders.length < 2) return;
    const t = window.setInterval(() => setPhIndex((i) => i + 1), 3200);
    return () => window.clearInterval(t);
  }, [sheet, isOpen, value, placeholders.length]);
  const placeholder = placeholders[phIndex % placeholders.length];

  /* ---------- aksi ---------- */

  function remember(text: string) {
    const t = text.trim();
    if (!t) return;
    const next = [t, ...history.filter((h) => h.toLowerCase() !== t.toLowerCase())].slice(0, HISTORY_MAX);
    setHistory(next);
    writeHistory(next);
  }

  function forget(text?: string) {
    const next = text ? history.filter((h) => h !== text) : [];
    setHistory(next);
    writeHistory(next);
    setActive(-1);
  }

  function finish() {
    onOpenChange(false);
    inputRef.current?.blur();
    onDone?.();
  }

  function cari(text: string) {
    const t = text.trim();
    if (!t) return;
    remember(t);
    setValue(t);
    const params = new URLSearchParams({ q: t });
    if (kota) params.set("kota", kota);
    router.push(`/kategori/semua?${params.toString()}`);
    finish();
  }

  function bukaEvent(event: EventItem) {
    remember(event.nama_event);
    router.push(`/events/${event.id}`);
    finish();
  }

  function jalankan(row: Row) {
    if (row.kind === "event") bukaEvent(row.event);
    else cari(row.text);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const row = rows[active];
    if (row) jalankan(row);
    else cari(value);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (rows.length === 0) return;
      e.preventDefault();
      bukaKartu();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i === -1 && step === -1 ? rows.length - 1 : (i + step + rows.length) % rows.length));
    } else if (e.key === "Escape") {
      finish();
    }
  }

  /* ---------- tampilan ---------- */

  const kotaLabel = kota ? kotaLabelDariSlug(kota) : null;

  const panel = (
    <div
      id={PANEL_ID}
      className={
        sheet
          ? "mt-3 overflow-hidden rounded-2xl border border-[#E7E2D6] bg-white"
          : "absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 max-h-[min(30rem,calc(100vh-6rem))] overflow-y-auto rounded-2xl border border-[#E7E2D6] bg-white shadow-[0_18px_40px_rgba(31,41,55,0.14)]"
      }
    >
      {rows.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-[#6B7280]">Belum ada acara yang bisa disarankan.</p>
      )}

      {q && hasil.length === 0 && (
        <p className="px-4 pt-4 pb-1 text-sm text-[#6B7280]">
          Tidak ada acara yang cocok dengan “{query}”{kotaLabel ? ` di ${kotaLabel}` : ""}.
        </p>
      )}

      <ul className="py-2">
        {rows.map((row, i) => {
          const prev = rows[i - 1];
          const heading =
            !q && row.kind === "history" && !prev
              ? "Pencarian terakhir"
              : !q && row.kind === "event" && prev?.kind !== "event"
                ? "Populer sekarang"
                : null;
          const on = i === active;

          return (
            <li key={row.kind === "event" ? `e${row.event.id}` : `${row.kind}-${row.text}`}>
              {heading && (
                <div className="flex items-center justify-between px-4 pt-2 pb-1">
                  <p className="text-[11px] font-bold tracking-[0.14em] text-[#8B8472] uppercase">{heading}</p>
                  {row.kind === "history" && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => forget()}
                      className="text-xs font-semibold text-[#6B7280] underline-offset-2 hover:text-[#B45309] hover:underline"
                    >
                      Hapus semua
                    </button>
                  )}
                </div>
              )}

              {row.kind === "history" && (
                <div
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center gap-1 px-2 ${on ? "bg-[#F6F1E4]" : ""}`}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => cari(row.text)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-[#1F2937]"
                  >
                    <Clock size={15} className="shrink-0 text-[#8B8472]" aria-hidden="true" />
                    <span className="truncate">{row.text}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Hapus “${row.text}” dari histori`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => forget(row.text)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8B8472] hover:bg-[#EFE9D8] hover:text-[#1F2937]"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              )}

              {row.kind === "event" && (
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => bukaEvent(row.event)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left ${on ? "bg-[#F6F1E4]" : ""}`}
                >
                  <Poster event={row.event} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#1F2937]">
                      <Mark text={row.event.nama_event} q={q} />
                    </span>
                    <span className="block truncate text-xs text-[#6B7280]">
                      {formatTanggal(row.event.tanggal)} · {kotaOf(row.event) ?? row.event.lokasi}
                    </span>
                  </span>
                </button>
              )}

              {row.kind === "all" && (
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => cari(row.text)}
                  className={`flex w-full items-center gap-3 border-t border-[#EFE9D8] px-4 py-3 text-left text-sm font-semibold text-[#0F766E] ${
                    on ? "bg-[#F6F1E4]" : ""
                  }`}
                >
                  <Search size={15} aria-hidden="true" />
                  <span className="truncate">
                    Lihat semua hasil “{row.text}”{kotaLabel ? ` di ${kotaLabel}` : ""}
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <form role="search" onSubmit={onSubmit} className="relative min-w-0 flex-1">
      <div
        className={`flex h-10 items-center rounded-full border bg-white pr-1 pl-5 transition-[border-color,box-shadow] duration-150 ${
          isOpen
            ? "border-[#0F766E] shadow-[0_0_0_3px_rgba(15,118,110,0.12)]"
            : "border-[#DAD3C2] hover:border-[#B9B09A]"
        }`}
      >
        <div className="relative h-full min-w-0 flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setActive(-1);
              bukaKartu();
            }}
            onFocus={bukaKartu}
            onKeyDown={onKeyDown}
            autoComplete="off"
            aria-label="Cari acara, artis, atau kota"
            aria-expanded={isOpen}
            aria-controls={PANEL_ID}
            placeholder={isOpen ? "Ketik nama acara, artis, atau kota" : ""}
            className="h-full w-full bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#9B9483]"
          />
                   {!isOpen && !value && (
            <span
              key={phIndex % placeholders.length}
              aria-hidden="true"
              className="nav-ph pointer-events-none absolute inset-0 flex items-center pr-2 text-sm text-[#8B8472]"
            >
              <span className="min-w-0 truncate">{placeholder}</span>
            </span>
          )}
        </div>
        {value && (
          <button
            type="button"
            aria-label="Hapus teks"
            onClick={() => {
              setValue("");
              setActive(-1);
              inputRef.current?.focus();
            }}
            className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8B8472] hover:bg-[#EFE9D8] hover:text-[#1F2937]"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          aria-label="Cari"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white transition-colors hover:bg-[#0D9488]"
        >
          <Search size={15} aria-hidden="true" />
        </button>
      </div>

      {isOpen && panel}
    </form>
  );
}

function Poster({ event }: { event: EventItem }) {
  const src = getImageUrl(event.poster);
  return (
    <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#EFE9D8]">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      )}
    </span>
  );
}
