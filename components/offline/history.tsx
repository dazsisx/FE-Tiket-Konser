"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Receipt as ReceiptIcon, RefreshCw, Search, X } from "lucide-react";
import OfflineShell from "./OfflineShell";
import Receipt from "./Receipt";
import { useOfflineGuard } from "./useOfflineGuard";
import { useOfflineOrders } from "./useOfflineOrders";
import { buyerName, formatDateTime, orderDate, wibDateKey } from "./format";
import { formatRupiah, type PesananOffline } from "@/utils/api";

const PAGE_SIZE = 10;

const statusStyle: Record<PesananOffline["status_bayar"], string> = {
  pending: "bg-amber-50 text-amber-800",
  lunas: "bg-emerald-50 text-emerald-800",
  ditolak: "bg-red-50 text-red-700",
  kadaluarsa: "bg-gray-100 text-gray-600",
};
const statusLabel: Record<PesananOffline["status_bayar"], string> = {
  pending: "Menunggu",
  lunas: "Lunas",
  ditolak: "Ditolak",
  kadaluarsa: "Kedaluwarsa",
};

const filterInput = "h-10 rounded-lg border border-[#D8DEDA] bg-white px-3 text-sm outline-none focus:border-[#0F766E]";

export default function OfflineHistory() {
  const { user, ready, logout } = useOfflineGuard();
  const { orders, loading, error, reload } = useOfflineOrders(ready);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("semua");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<PesananOffline | null>(null);

  const eventOptions = useMemo(() => {
    const map = new Map<number, string>();
    orders.forEach((order) => { if (order.event) map.set(order.event.id, order.event.nama_event); });
    return Array.from(map.entries());
  }, [orders]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (eventFilter !== "semua" && String(order.event_id) !== eventFilter) return false;
      const day = wibDateKey(orderDate(order));
      if (from && (!day || day < from)) return false;
      if (to && (!day || day > to)) return false;
      if (!q) return true;
      const text = `${order.id} ${buyerName(order)} ${order.email_pembeli ?? ""} ${order.no_telepon_pembeli ?? ""} ${order.event?.nama_event ?? ""} ${order.kode_tiket ?? ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [orders, search, eventFilter, from, to]);

  const pageCount = Math.max(Math.ceil(visible.length / PAGE_SIZE), 1);
  const current = Math.min(page, pageCount);
  const rows = visible.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  if (!user) return <main className="min-h-screen bg-[#F7FAF8]" />;

  return (
    <OfflineShell active="riwayat" userName={user.nama} onLogout={logout}>
      <div className="print:hidden">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B7791F]">TRANSAKSI</p><h2 className="mt-1 text-3xl font-bold tracking-tight">Riwayat Transaksi</h2><p className="mt-2 text-sm text-[#6B7280]">Seluruh penjualan tiket offline yang Anda catat.</p></div>
          <button type="button" onClick={() => void reload()} className="flex w-fit items-center gap-2 rounded-lg border border-[#D8DEDA] bg-white px-3.5 py-2.5 text-sm font-semibold hover:bg-[#F4F8F6]"><RefreshCw size={16} /> Muat ulang</button>
        </div>

        {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
          <div className="flex flex-col gap-4 border-b border-[#E5E7EB] p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-[#D8DEDA] px-3 text-[#6B7280] focus-within:border-[#0F766E]"><Search size={16} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama, acara, kode tiket" aria-label="Cari transaksi" className="w-full bg-transparent text-sm text-[#1F2937] outline-none lg:w-64" /></label>
              <div className="flex flex-wrap items-center gap-2">
                <select aria-label="Filter acara" value={eventFilter} onChange={(e) => { setEventFilter(e.target.value); setPage(1); }} className={filterInput}>
                  <option value="semua">Semua acara</option>
                  {eventOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
                <input type="date" aria-label="Dari tanggal" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={filterInput} />
                <span className="text-xs text-[#9CA3AF]">s/d</span>
                <input type="date" aria-label="Sampai tanggal" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={filterInput} />
              </div>
            </div>
            <p className="text-xs text-[#6B7280]">Menampilkan {visible.length} dari {orders.length} transaksi</p>
          </div>

          {loading ? <div className="space-y-3 p-5">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-md bg-[#F1F4F2]" />)}</div> : rows.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left">
                  <thead><tr className="bg-[#F8FAF9] text-[11px] uppercase tracking-[0.08em] text-[#6B7280]"><th className="px-5 py-3 font-bold">Transaksi</th><th className="px-4 py-3 font-bold">Pembeli</th><th className="px-4 py-3 font-bold">Acara & tiket</th><th className="px-4 py-3 font-bold">Total</th><th className="px-4 py-3 font-bold">Status</th><th className="px-5 py-3 text-right font-bold">Tindakan</th></tr></thead>
                  <tbody className="divide-y divide-[#EEF0EF]">
                    {rows.map((order) => (
                      <tr key={order.id} className="align-top hover:bg-[#FCFDFC]">
                        <td className="px-5 py-4"><p className="text-sm font-bold">#{order.id}</p><p className="mt-1 text-xs text-[#6B7280]">{formatDateTime(orderDate(order))}</p>{order.kode_tiket && <p className="mt-1 font-mono text-[11px] text-[#6B7280]">{order.kode_tiket}</p>}</td>
                        <td className="px-4 py-4"><p className="text-sm font-semibold">{buyerName(order)}</p><p className="mt-1 text-xs text-[#6B7280]">{order.no_telepon_pembeli ?? order.email_pembeli ?? "-"}</p></td>
                        <td className="px-4 py-4"><p className="max-w-52 truncate text-sm font-semibold">{order.event?.nama_event ?? "Acara"}</p><p className="mt-1 text-xs text-[#6B7280]">{order.kategori_tiket?.nama_kelas ?? "Kategori"} · {order.jumlah} tiket</p></td>
                        <td className="px-4 py-4 text-sm font-bold">{formatRupiah(order.total_harga)}</td>
                        <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[order.status_bayar]}`}>{statusLabel[order.status_bayar]}</span></td>
                        <td className="px-5 py-4 text-right"><button type="button" onClick={() => setDetail(order)} className="rounded-md border border-[#D8DEDA] px-2.5 py-2 text-xs font-bold hover:bg-[#F4F8F6]">Detail</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-[#E5E7EB] px-5 py-3 text-xs text-[#6B7280]">
                <span>Halaman {current} dari {pageCount}</span>
                <div className="flex gap-2">
                  <button type="button" aria-label="Halaman sebelumnya" disabled={current <= 1} onClick={() => setPage(current - 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D8DEDA] disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <button type="button" aria-label="Halaman berikutnya" disabled={current >= pageCount} onClick={() => setPage(current + 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D8DEDA] disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-5 py-14 text-center"><ReceiptIcon className="mx-auto text-[#8CA59A]" size={26} /><p className="mt-3 font-semibold">{orders.length ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi offline"}</p><p className="mt-1 text-sm text-[#6B7280]">{orders.length ? "Ubah filter atau kata pencarian." : "Penjualan di loket akan muncul di sini."}</p></div>
          )}
        </section>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1F2937]/40 p-4 print:static print:block print:overflow-visible print:bg-white print:p-0" role="dialog" aria-modal="true" aria-label={`Detail transaksi ${detail.id}`}>
          <div className="my-6 w-full max-w-2xl print:my-0">
            <button type="button" aria-label="Tutup detail" onClick={() => setDetail(null)} className="mb-2 ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white shadow print:hidden"><X size={18} /></button>
            <Receipt order={detail} />
          </div>
        </div>
      )}
    </OfflineShell>
  );
}
