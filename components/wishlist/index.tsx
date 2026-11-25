"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowRight, CalendarDays, Heart, MapPin, RefreshCw, Ticket, UserRound } from "lucide-react";
import { Outfit } from "next/font/google";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchWishlist,
  getHargaTermurah,
  getImageUrl,
  removeFromWishlist,
  type EventItem,
  type WishlistItem,
} from "@/utils/api";
import { formatHariTanggal, formatJamWib } from "@/utils/kategori";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

/** Apakah event masih bisa dibeli: penjualan dibuka, belum lewat, dan masih ada sisa kuota. */
function ketersediaan(event: EventItem): { bisaBeli: boolean; label: string } {
  if (event.status === "selesai" || new Date(event.tanggal).getTime() < Date.now()) {
    return { bisaBeli: false, label: "Acara selesai" };
  }
  if (event.status === "draft") return { bisaBeli: false, label: "Belum dibuka" };
  if (event.status === "ditutup") return { bisaBeli: false, label: "Penjualan ditutup" };

  const tiers = event.kategori_tiket ?? [];
  if (tiers.length === 0) return { bisaBeli: false, label: "Tiket belum tersedia" };
  const sisa = tiers.reduce((sum, t) => sum + Math.max(0, (t.sisa_kuota ?? t.kuota - t.terjual)), 0);
  if (sisa === 0) return { bisaBeli: false, label: "Tiket habis" };
  return { bisaBeli: true, label: "Tiket tersedia" };
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${outfit.variable} relative min-h-screen overflow-hidden bg-white font-[family-name:var(--font-outfit),Plus_Jakarta_Sans,sans-serif]`}
    >
      <div className="pointer-events-none absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-[#0F766E] opacity-[0.07] blur-[110px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-[480px] w-[480px] rounded-full bg-[#F59E0B] opacity-[0.07] blur-[110px]" />
      <div className="relative mx-auto max-w-[1200px] px-5 pt-28 pb-20 sm:px-8 sm:pt-32">{children}</div>
    </div>
  );
}

function Header({ total }: { total?: number }) {
  return (
    <header className="mb-8 sm:mb-10">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#0F766E]">
        <Heart size={13} aria-hidden="true" />
        Koleksi kamu
      </span>
      <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[#1F2937] sm:text-5xl">Wishlist</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-[#6B7280]">
        {typeof total === "number" && total > 0
          ? `${total} event yang kamu simpan. Pesan tiketnya sebelum kehabisan.`
          : "Simpan event yang kamu incar, lalu pesan tiketnya kapan saja."}
      </p>
    </header>
  );
}

function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Memuat wishlist">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">
          <div className="aspect-[16/10] animate-pulse bg-[#F3F4F6]" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-[#E5E7EB]" />
            <div className="h-3.5 w-1/2 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="mt-5 flex gap-2">
              <div className="h-11 flex-1 animate-pulse rounded-full bg-[#F3F4F6]" />
              <div className="h-11 flex-1 animate-pulse rounded-full bg-[#E5E7EB]" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function StateCard({
  image = true,
  title,
  text,
  children,
}: {
  image?: boolean;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-8 rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-[0_20px_60px_rgba(31,41,55,0.08)] sm:p-12 lg:grid-cols-[320px_1fr] lg:gap-12">
      {image && (
        <div className="relative mx-auto aspect-square w-full max-w-[280px] lg:max-w-none">
          <Image src="/netralbaru.png" alt="" fill sizes="(max-width: 1024px) 70vw, 320px" className="object-contain" />
        </div>
      )}
      <div className={image ? "text-center lg:text-left" : "text-center"}>
        <h2 className="text-3xl font-extrabold text-[#1F2937] sm:text-4xl">{title}</h2>
        <p className={`mt-4 max-w-md text-base leading-relaxed text-[#6B7280] ${image ? "mx-auto lg:mx-0" : "mx-auto"}`}>{text}</p>
        {children && <div className={`mt-7 flex flex-col gap-3 sm:flex-row ${image ? "sm:justify-center lg:justify-start" : "sm:justify-center"}`}>{children}</div>}
      </div>
    </div>
  );
}

const primaryBtn =
  "inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#0F766E] px-6 text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488]";
const outlineBtn =
  "inline-flex h-[52px] items-center justify-center gap-2 rounded-full border-[1.5px] border-[#0F766E] px-6 text-sm font-bold text-[#0F766E] transition-all duration-200 hover:bg-[#ECFDF5]";

function WishlistCard({
  item,
  removing,
  onRemove,
}: {
  item: WishlistItem;
  removing: boolean;
  onRemove: (eventId: number) => void;
}) {
  const { event } = item;
  const poster = getImageUrl(event.poster);
  const { bisaBeli, label } = ketersediaan(event);
  const jam = formatJamWib(event.tanggal);

  return (
    <li
      className={`group flex flex-col overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#0F766E]/40 hover:shadow-[0_18px_44px_rgba(15,118,110,0.14)] ${
        removing ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1F2937]">
        {poster ? (
          <Image
            src={poster}
            alt={event.nama_event}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-xl font-extrabold text-white/80">
            {event.nama_event}
          </div>
        )}
        <span
          className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
            bisaBeli ? "bg-[#F59E0B] text-[#1F2937]" : "bg-white/90 text-[#6B7280]"
          }`}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={() => onRemove(event.id)}
          disabled={removing}
          aria-label={`Hapus ${event.nama_event} dari wishlist`}
          title="Hapus dari wishlist"
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#F59E0B] shadow-md transition-all duration-200 hover:scale-105 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(15,118,110,0.25)]"
        >
          <Heart size={18} className="fill-current" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-2 text-xl font-extrabold leading-snug text-[#1F2937]">{event.nama_event}</h2>

        <ul className="mt-3 flex flex-col gap-1.5 text-sm text-[#6B7280]">
          <li className="flex items-center gap-2">
            <UserRound size={15} className="shrink-0 text-[#9CA3AF]" aria-hidden="true" />
            <span className="truncate font-medium text-[#1F2937]">{event.artis?.nama ?? "Promotor"}</span>
          </li>
          <li className="flex items-center gap-2">
            <CalendarDays size={15} className="shrink-0 text-[#9CA3AF]" aria-hidden="true" />
            <span>
              {formatHariTanggal(event.tanggal)}
              {jam ? ` · ${jam}` : ""}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin size={15} className="mt-0.5 shrink-0 text-[#9CA3AF]" aria-hidden="true" />
            <span className="line-clamp-2">{event.lokasi}</span>
          </li>
        </ul>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#E5E7EB] pt-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">Harga mulai</p>
            <p className="text-lg font-extrabold text-[#F59E0B]">{getHargaTermurah(event.kategori_tiket)}</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Ticket size={14} aria-hidden="true" />
            {event.kategori_tiket?.length ?? 0} kelas
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Link
            href={`/events/${event.id}`}
            className="flex h-11 items-center justify-center rounded-full border-[1.5px] border-[#E5E7EB] text-sm font-semibold text-[#1F2937] transition-all duration-200 hover:border-[#0F766E] hover:text-[#0F766E]"
          >
            Lihat Detail
          </Link>
          {bisaBeli ? (
            <Link
              href={`/pembelian/tiket/${event.id}`}
              className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#0F766E] text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488]"
            >
              Beli Tiket
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="flex h-11 cursor-not-allowed items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-semibold text-[#9CA3AF]"
            >
              Tidak tersedia
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export default function Wishlist() {
  const { user, isLoading: authLoading } = useAuth();
  const isCustomer = user?.role === "pelanggan";

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading || !isCustomer) return;
    let cancelled = false;
    fetchWishlist()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Wishlist gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isCustomer, reloadKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleRemove = useCallback(async (eventId: number) => {
    setRemovingId(eventId);
    try {
      await removeFromWishlist(eventId);
      setItems((prev) => prev.filter((i) => i.event_id !== eventId));
      setToast("Dihapus dari wishlist");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Gagal menghapus dari wishlist.");
    } finally {
      setRemovingId(null);
    }
  }, []);

  const total = useMemo(() => items.length, [items]);

  // ===== Menunggu status login =====
  if (authLoading) {
    return (
      <Shell>
        <Header />
        <SkeletonGrid />
      </Shell>
    );
  }

  // ===== Belum login =====
  if (!user) {
    return (
      <Shell>
        <Header />
        <StateCard
          title="Masuk untuk melihat wishlist"
          text="Wishlist tersimpan di akunmu, jadi kamu bisa membukanya dari perangkat mana saja. Masuk dulu untuk melihat event yang sudah kamu simpan."
        >
          <Link href="/auth/login" className={primaryBtn}>
            Masuk
          </Link>
          <Link href="/auth/register" className={outlineBtn}>
            Daftar
          </Link>
        </StateCard>
      </Shell>
    );
  }

  // ===== Akun staf (admin) tidak punya wishlist =====
  if (!isCustomer) {
    return (
      <Shell>
        <Header />
        <StateCard
          image={false}
          title="Wishlist khusus akun pelanggan"
          text="Akun ini adalah akun petugas, jadi tidak memiliki wishlist. Gunakan akun pelanggan untuk menyimpan event."
        >
          <Link href="/" className={primaryBtn}>
            Kembali ke Beranda
          </Link>
        </StateCard>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header total={loading || error ? undefined : total} />

      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <div role="alert" className="flex flex-col items-center rounded-[32px] border border-red-200 bg-red-50 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={26} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-extrabold text-[#1F2937]">Wishlist gagal dimuat</h2>
          <p className="mt-2 max-w-md text-sm text-[#6B7280]">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#0F766E] px-6 text-sm font-bold text-white transition-colors hover:bg-[#0D9488]"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Coba Lagi
          </button>
        </div>
      ) : items.length === 0 ? (
        <StateCard
          title="Wishlist masih kosong"
          text="Belum ada event yang kamu simpan. Jelajahi konser dan festival, lalu tekan tombol Wishlist di halaman event untuk menyimpannya di sini."
        >
          <Link href="/kategori/konser" className={primaryBtn}>
            Jelajahi Konser
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/" className={outlineBtn}>
            Ke Beranda
          </Link>
        </StateCard>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <WishlistCard key={item.id} item={item} removing={removingId === item.event_id} onRemove={handleRemove} />
          ))}
        </ul>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1F2937] px-5 py-3 text-sm font-semibold text-white shadow-2xl"
        >
          {toast}
        </div>
      )}
    </Shell>
  );
}
