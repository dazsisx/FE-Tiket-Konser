"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarDays, CheckCircle2, ClipboardList, Receipt, Ticket } from "lucide-react";
import OfflineShell from "./OfflineShell";
import { OFFLINE_BASE } from "./config";
import { useOfflineGuard } from "./useOfflineGuard";
import { buyerName, formatDateTime, orderDate } from "./format";
import {
  fetchEvents,
  fetchOfflineDashboard,
  formatRupiah,
  formatTanggal,
  getImageUrl,
  type EventItem,
  type OfflineDashboard,
} from "@/utils/api";

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Ticket }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_30px_rgba(31,41,55,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[#1F2937]">{value}</p>
          <p className="mt-1 text-xs text-[#9CA3AF]">{detail}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#0F766E]"><Icon size={19} /></span>
      </div>
    </div>
  );
}

export default function OfflineDashboardPage() {
  const { user, ready, logout } = useOfflineGuard();
  const [dashboard, setDashboard] = useState<OfflineDashboard | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    Promise.all([fetchOfflineDashboard(), fetchEvents()])
      .then(([dash, eventList]) => {
        if (cancelled) return;
        setDashboard(dash);
        // Status event di database: draft | aktif | ditutup | selesai. Hanya "aktif" yang bisa dijual.
        setEvents(eventList.filter((event) => (event.status as string) === "aktif"));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Dashboard gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [ready]);

  if (!user) return <main className="min-h-screen bg-[#F7FAF8]" />;

  const summary = dashboard?.ringkasan;

  return (
    <OfflineShell active="dashboard" userName={user.nama} onLogout={logout}>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-[#F59E0B]">PENJUALAN OFFLINE</p><h2 className="mt-1 text-3xl font-bold tracking-tight">Hari ini di loket</h2><p className="mt-2 text-sm text-[#6B7280]">Pantau penjualan tiket langsung di lokasi konser.</p></div>
        <Link href={`${OFFLINE_BASE}/jual`} className="flex w-fit items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.18)]">Jual tiket <ArrowUpRight size={16} /></Link>
      </div>

      {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Transaksi hari ini" value={(summary?.penjualan_hari_ini ?? 0).toLocaleString("id-ID")} detail="Transaksi offline lunas" icon={Receipt} />
          <StatCard label="Tiket terjual hari ini" value={(summary?.tiket_terjual_hari_ini ?? 0).toLocaleString("id-ID")} detail="Dari transaksi hari ini" icon={CheckCircle2} />
          <StatCard label="Pendapatan hari ini" value={formatRupiah(summary?.pendapatan_hari_ini ?? 0)} detail="Hari ini (WIB)" icon={Ticket} />
          <StatCard label="Total transaksi offline" value={(summary?.total_transaksi_offline ?? 0).toLocaleString("id-ID")} detail="Sepanjang waktu" icon={ClipboardList} />
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h3 className="font-bold">Acara yang dijual</h3><p className="mt-1 text-sm text-[#6B7280]">Acara aktif beserta sisa kuota tiket.</p></div><CalendarDays className="text-[#0F766E]" size={20} /></div>
          <div className="mt-5 space-y-3">
            {events.length ? events.map((event) => {
              const posterUrl = getImageUrl(event.poster);
              const sisa = (event.kategori_tiket ?? []).reduce((total, k) => total + Math.max(k.kuota - k.terjual, 0), 0);
              return (
                <div key={event.id} className="flex items-center gap-3 rounded-xl border border-[#F0F1F2] p-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#ECFDF5]">{posterUrl && <Image src={posterUrl} alt="" width={48} height={48} unoptimized className="h-full w-full object-cover" />}</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{event.nama_event}</p><p className="mt-1 truncate text-xs text-[#6B7280]">{event.lokasi} · {formatTanggal(event.tanggal)}</p></div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${sisa > 0 ? "bg-[#ECFDF5] text-[#047857]" : "bg-red-50 text-red-700"}`}>{sisa > 0 ? `${sisa.toLocaleString("id-ID")} tersisa` : "Habis"}</span>
                </div>
              );
            }) : <p className="py-8 text-center text-sm text-[#9CA3AF]">{loading ? "Memuat..." : "Tidak ada acara yang sedang dijual."}</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h3 className="font-bold">Transaksi terbaru</h3><p className="mt-1 text-sm text-[#6B7280]">5 penjualan offline terakhir.</p></div><Link href={`${OFFLINE_BASE}/riwayat`} className="text-xs font-bold text-[#0F766E] hover:underline">Lihat semua</Link></div>
          <div className="mt-5 space-y-3">
            {dashboard?.transaksi_terbaru?.length ? dashboard.transaksi_terbaru.map((order) => (
              <div key={order.id} className="border-b border-[#F0F1F2] pb-3 last:border-0">
                <div className="flex justify-between gap-3"><p className="truncate text-sm font-bold">{buyerName(order)}</p><p className="shrink-0 text-sm font-bold text-[#0F766E]">{formatRupiah(order.total_harga)}</p></div>
                <p className="mt-1 truncate text-xs text-[#6B7280]">{order.event?.nama_event ?? "Acara"} · {order.jumlah} tiket · {order.kode_tiket}</p>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{formatDateTime(orderDate(order))}</p>
              </div>
            )) : <p className="py-8 text-center text-sm text-[#9CA3AF]">{loading ? "Memuat..." : "Belum ada transaksi offline."}</p>}
          </div>
        </section>
      </div>
    </OfflineShell>
  );
}
