"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowRight, CalendarDays, MapPin, RefreshCw, Search, Ticket, UserRound, X } from "lucide-react";
import { fetchOrderHistory, formatJam, formatRupiah, formatTanggal, getImageUrl, type PesananRiwayat } from "@/utils/api";
import { STATUS_ORDER, statusLabel, statusOf, waktuPesanan, type StatusKey } from "@/utils/pesanan";
import DetailTransaksi from "./detail-transaksi";

type Filter = "semua" | StatusKey;

const primaryBtn =
  "inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#0F766E] px-6 text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488]";

function SkeletonList() {
  return (
    <ul className="flex flex-col gap-4" aria-busy="true" aria-label="Memuat histori pembelian">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="flex gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-4 sm:gap-5 sm:p-5">
          <div className="h-28 w-24 shrink-0 animate-pulse rounded-2xl bg-[#F3F4F6] sm:h-36 sm:w-32" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-5 w-24 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-[#E5E7EB]" />
            <div className="h-3.5 w-1/2 animate-pulse rounded-full bg-[#F3F4F6]" />
            <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-[#F3F4F6]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function OrderCard({ order, onDetail }: { order: PesananRiwayat; onDetail: (o: PesananRiwayat) => void }) {
  const status = statusOf(order);
  const event = order.event;
  const poster = getImageUrl(event?.image_url);
  const dibuat = waktuPesanan(order);
  const bisaPesanUlang = (status.key === "ditolak" || status.key === "kedaluwarsa") && event?.status === "aktif";

  return (
    <li className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-4 transition-all duration-300 hover:border-[#0F766E]/40 hover:shadow-[0_18px_44px_rgba(15,118,110,0.12)] sm:flex-row sm:gap-5 sm:p-5">
      <div className="flex gap-4 sm:contents">
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#1F2937] sm:h-auto sm:w-36">
          {poster ? (
            <Image src={poster} alt="" fill unoptimized sizes="144px" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-xs font-bold text-white/80">
              {event?.nama_event ?? "Event"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 sm:hidden">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${status.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
            {status.label}
          </span>
          <h2 className="mt-2 line-clamp-2 text-base font-extrabold leading-snug text-[#1F2937]">
            {event?.nama_event ?? "Event tidak tersedia"}
          </h2>
          <p className="mt-1 text-xs text-[#9CA3AF]">{order.kode_tiket}</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden items-start justify-between gap-3 sm:flex">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-xl font-extrabold leading-snug text-[#1F2937]">
              {event?.nama_event ?? "Event tidak tersedia"}
            </h2>
            <p className="mt-0.5 text-xs font-semibold tracking-wide text-[#9CA3AF]">{order.kode_tiket}</p>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${status.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
            {status.label}
          </span>
        </div>

        {event && (
          <ul className="mt-1 flex flex-col gap-1.5 text-sm text-[#6B7280] sm:mt-3">
            {event.artis?.nama && (
              <li className="flex items-center gap-2">
                <UserRound size={15} className="shrink-0 text-[#9CA3AF]" aria-hidden="true" />
                <span className="truncate font-medium text-[#1F2937]">{event.artis.nama}</span>
              </li>
            )}
            <li className="flex items-center gap-2">
              <CalendarDays size={15} className="shrink-0 text-[#9CA3AF]" aria-hidden="true" />
              {formatTanggal(event.tanggal)}
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#9CA3AF]" aria-hidden="true" />
              <span className="line-clamp-1">{event.lokasi}</span>
            </li>
          </ul>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6B7280]">
          <span className="flex items-center gap-1.5">
            <Ticket size={14} className="text-[#9CA3AF]" aria-hidden="true" />
            {order.kategori_tiket?.nama_kelas ?? "Tiket"} × {order.jumlah}
          </span>
          {dibuat && (
            <span>
              Dipesan {formatTanggal(dibuat)}, {formatJam(dibuat)}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[#E5E7EB] pt-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">Total pembayaran</p>
            <p className="text-lg font-extrabold text-[#F59E0B]">{formatRupiah(order.total_harga)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onDetail(order)}
              className="h-11 rounded-full border-[1.5px] border-[#E5E7EB] px-5 text-sm font-semibold text-[#1F2937] transition-all duration-200 hover:border-[#0F766E] hover:text-[#0F766E]"
            >
              {status.key === "berhasil" ? "Detail & Tiket" : "Detail Transaksi"}
            </button>
            {status.key === "menunggu-pembayaran" && (
              <Link
                href={`/pembelian/sukses?order=${order.id}`}
                className="flex h-11 items-center rounded-full bg-[#0F766E] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488]"
              >
                Lanjutkan Pembayaran
              </Link>
            )}
            {bisaPesanUlang && (
              <Link
                href={`/pembelian/tiket/${order.event_id}`}
                className="flex h-11 items-center rounded-full bg-[#0F766E] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488]"
              >
                Pesan Ulang
              </Link>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

/** Histori pembelian milik user yang login. Data dari GET /api/pesanan/riwayat (BE memfilter per user). */
export default function RiwayatSaya() {
  const [orders, setOrders] = useState<PesananRiwayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("semua");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PesananRiwayat | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchOrderHistory()
      .then((data) => {
        if (cancelled) return;
        setOrders(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Histori pembelian gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { semua: orders.length };
    for (const o of orders) {
      const k = statusOf(o).key;
      c[k] = (c[k] ?? 0) + 1;
    }
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "semua" && statusOf(o).key !== filter) return false;
      if (!q) return true;
      return [o.event?.nama_event, o.event?.artis?.nama, o.kode_tiket, o.kategori_tiket?.nama_kelas, `#${o.id}`]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [orders, filter, query]);

  const closeDetail = useCallback(() => setSelected(null), []);

  if (loading) return <SkeletonList />;

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center rounded-[32px] border border-red-200 bg-red-50 px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={26} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-[#1F2937]">Histori pembelian gagal dimuat</h2>
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
    );
  }

  if (orders.length === 0) {
    return (
      <div className="grid items-center gap-8 rounded-[32px] border border-[#E5E7EB] bg-white p-8 shadow-[0_20px_60px_rgba(31,41,55,0.08)] sm:p-12 lg:grid-cols-[320px_1fr] lg:gap-12">
        <div className="relative mx-auto aspect-square w-full max-w-[280px] lg:max-w-none">
          <Image src="/netralbaru.png" alt="" fill sizes="(max-width: 1024px) 70vw, 320px" className="object-contain" />
        </div>
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-extrabold text-[#1F2937] sm:text-4xl">Belum Ada Pembelian</h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#6B7280] lg:mx-0">
            Kamu belum pernah memesan tiket. Temukan konser favoritmu, dan setiap transaksi akan tercatat di sini.
          </p>
          <div className="mt-7 flex justify-center lg:justify-start">
            <Link href="/kategori/konser" className={primaryBtn}>
              Cari Konser
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const chips: Array<{ key: Filter; label: string }> = [
    { key: "semua", label: "Semua" },
    ...STATUS_ORDER.filter((k) => counts[k]).map((k) => ({ key: k as Filter, label: statusLabel(k) })),
  ];

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama event, artis, atau kode booking"
            aria-label="Cari transaksi"
            className="h-[52px] w-full rounded-full border border-[#E5E7EB] bg-white pr-11 pl-11 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
              className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#1F2937]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div role="group" aria-label="Filter status transaksi" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {chips.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-2 rounded-full border-[1.5px] px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "border-[#0F766E] bg-[#0F766E] text-white shadow-[0_6px_16px_rgba(15,118,110,0.25)]"
                    : "border-[#E5E7EB] bg-white text-[#1F2937] hover:border-[#F59E0B] hover:bg-[#FFFBEB]"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-[#F3F4F6] text-[#6B7280]"}`}
                >
                  {counts[key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-5 text-sm text-[#6B7280]" aria-live="polite">
        Menampilkan {visible.length} dari {orders.length} transaksi
      </p>

      {visible.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-[28px] border-2 border-dashed border-[#E5E7EB] px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFFBEB] text-[#F59E0B]">
            <Search size={24} aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-extrabold text-[#1F2937]">Tidak ada transaksi yang cocok</h2>
          <p className="mt-1.5 max-w-sm text-sm text-[#6B7280]">Coba kata kunci lain atau ubah filter status.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("semua");
            }}
            className="mt-5 h-11 rounded-full border-[1.5px] border-[#0F766E] px-6 text-sm font-bold text-[#0F766E] transition-colors hover:bg-[#ECFDF5]"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {visible.map((o) => (
            <OrderCard key={o.id} order={o} onDetail={setSelected} />
          ))}
        </ul>
      )}

      {selected && <DetailTransaksi order={selected} onClose={closeDetail} />}
    </>
  );
}
