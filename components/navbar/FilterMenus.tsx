"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Check, ChevronDown, Guitar, LayoutGrid, MapPin, Mic2, Music2, PartyPopper, type LucideIcon } from "lucide-react";
import type { EventItem } from "@/utils/api";
import { KATEGORI, kategoriOf, type KategoriSlug } from "@/utils/kategori";
import { cocokKota, kotaLabelDariSlug, kotaOptions } from "@/utils/kota";

export type Panel = "search" | "kategori" | "lokasi" | "profile" | null;

const ICONS: Record<KategoriSlug, LucideIcon> = {
  konser: Music2,
  festival: PartyPopper,
  "musik-live": Mic2,
  akustik: Guitar,
};

const DISPLAY = "[font-family:var(--font-display),'Arial_Narrow',Impact,sans-serif]";

const trigger = (active: boolean, filled = false) =>
  `inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors lg:px-4 ${
    active
      ? "border-[#0F766E] bg-[#ECFDF5] text-[#0F766E]"
      : filled
        ? "border-[#0F766E]/40 bg-[#F3FBF8] text-[#0F766E] hover:border-[#0F766E]"
        : "border-[#DAD3C2] bg-transparent text-[#1F2937] hover:border-[#B9B09A]"
  }`;

const popover =
  "absolute top-[calc(100%+0.5rem)] left-0 z-50 rounded-2xl border border-[#E7E2D6] bg-white p-2 shadow-[0_18px_40px_rgba(31,41,55,0.14)]";

/** Tombol "Kategori" + kartu pilihan 4 kategori. */
export function KategoriMenu({
  panel,
  setPanel,
  events,
  kota,
}: {
  panel: Panel;
  setPanel: (p: Panel) => void;
  events: EventItem[];
  kota: string | null;
}) {
  const open = panel === "kategori";
  const qs = kota ? `?kota=${kota}` : "";

  const jumlah = useMemo(() => {
    const m: Record<KategoriSlug, number> = { konser: 0, festival: 0, "musik-live": 0, akustik: 0 };
    events.forEach((e) => {
      if (cocokKota(e, kota)) m[kategoriOf(e)] += 1;
    });
    return m;
  }, [events, kota]);

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setPanel(open ? null : "kategori")}
        aria-expanded={open}
        aria-haspopup="true"
        className={trigger(open)}
      >
        <LayoutGrid size={16} aria-hidden="true" />
        <span className="hidden lg:inline">Kategori</span>
        <span className="sr-only lg:hidden">Kategori</span>
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`${popover} w-[min(26rem,calc(100vw-2rem))]`}>
          <ul className="grid grid-cols-2 gap-1">
            {KATEGORI.map((k) => {
              const Icon = ICONS[k.slug];
              return (
                <li key={k.slug}>
                  <Link
                    href={`/kategori/${k.slug}${qs}`}
                    onClick={() => setPanel(null)}
                    className="group flex h-full gap-3 rounded-xl p-3 transition-colors hover:bg-[#F6F1E4]"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E7E2D6] text-[#0F766E] transition-colors group-hover:border-[#0F766E]">
                      <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-lg leading-none font-extrabold tracking-wide uppercase text-[#1F2937] ${DISPLAY}`}>
                        {k.label}
                      </span>
                      <span className="mt-1 block text-xs text-[#6B7280]">
                        {jumlah[k.slug] > 0 ? `${jumlah[k.slug]} acara` : "Belum ada acara"}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={`/kategori/semua${qs}`}
            onClick={() => setPanel(null)}
            className="mt-1 flex items-center justify-between rounded-xl border-t border-[#EFE9D8] px-3 pt-3 pb-2 text-sm font-semibold text-[#0F766E] hover:underline"
          >
            Lihat semua acara
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

/** Tombol lokasi + kartu pilihan kota. Pilihan disimpan di URL (?kota=). */
export function LokasiMenu({
  panel,
  setPanel,
  events,
  kota,
  onPick,
}: {
  panel: Panel;
  setPanel: (p: Panel) => void;
  events: EventItem[];
  kota: string | null;
  onPick: (slug: string | null) => void;
}) {
  const open = panel === "lokasi";
  const options = useMemo(() => kotaOptions(events), [events]);
  const label = kota ? (options.find((o) => o.slug === kota)?.label ?? kotaLabelDariSlug(kota)) : null;

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setPanel(open ? null : "lokasi")}
        aria-expanded={open}
        aria-haspopup="true"
        className={trigger(open, !!label)}
      >
        <MapPin size={16} aria-hidden="true" />
        <span className={`max-w-[7rem] truncate ${label ? "" : "hidden lg:inline"}`}>{label ?? "Lokasi"}</span>
        {!label && <span className="sr-only lg:hidden">Lokasi</span>}
        <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`${popover} w-72`}>
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.14em] text-[#8B8472] uppercase">Pilih lokasi</p>
          <ul className="max-h-72 overflow-y-auto">
            <li>
              <KotaRow selected={!kota} onClick={() => onPick(null)} count={events.length}>
                Semua lokasi
              </KotaRow>
            </li>
            {options.map((o) => (
              <li key={o.slug}>
                <KotaRow selected={kota === o.slug} onClick={() => onPick(o.slug)} count={o.count}>
                  {o.label}
                </KotaRow>
              </li>
            ))}
          </ul>
          {options.length === 0 && (
            <p className="px-3 py-3 text-sm text-[#6B7280]">Daftar kota muncul setelah ada acara.</p>
          )}
        </div>
      )}
    </div>
  );
}

function KotaRow({
  selected,
  count,
  onClick,
  children,
}: {
  selected: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#F6F1E4] ${
        selected ? "font-bold text-[#0F766E]" : "font-medium text-[#1F2937]"
      }`}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {selected && <Check size={15} strokeWidth={2.5} aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <span className="text-xs font-normal text-[#8B8472]">{count}</span>
    </button>
  );
}
