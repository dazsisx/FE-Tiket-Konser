"use client";

import { useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import OfflineShell from "./OfflineShell";
import { useOfflineGuard } from "./useOfflineGuard";
import { useOfflineOrders } from "./useOfflineOrders";
import { buyerName, formatDateTime, orderDate, wibDateKey } from "./format";
import { formatRupiah, type PesananOffline } from "@/utils/api";

type Row = { key: string; label: string; sub?: string; transaksi: number; tiket: number; pendapatan: number };

function addDays(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function group(orders: PesananOffline[], keyOf: (o: PesananOffline) => { key: string; label: string; sub?: string }): Row[] {
  const map = new Map<string, Row>();
  for (const order of orders) {
    const { key, label, sub } = keyOf(order);
    const row = map.get(key) ?? { key, label, sub, transaksi: 0, tiket: 0, pendapatan: 0 };
    row.transaksi += 1;
    row.tiket += order.jumlah;
    row.pendapatan += Number(order.total_harga);
    map.set(key, row);
  }
  return Array.from(map.values());
}

function csvCell(value: string | number): string {
  const text = String(value);
  // Awali sel berbahaya dengan apostrof agar tidak dibaca sebagai rumus oleh Excel.
  const safe = /^[=+\-@]/.test(text) && Number.isNaN(Number(text)) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadCsv(orders: PesananOffline[]) {
  const header = ["No", "Waktu", "Kode tiket", "Pembeli", "Telepon", "Email", "Acara", "Kategori", "Jumlah", "Total", "Status", "Petugas"];
  const lines = orders.map((o) => [
    o.id, formatDateTime(orderDate(o)), o.kode_tiket ?? "", buyerName(o), o.no_telepon_pembeli ?? "", o.email_pembeli ?? "",
    o.event?.nama_event ?? "", o.kategori_tiket?.nama_kelas ?? "", o.jumlah, Number(o.total_harga), o.status_bayar, o.petugas?.nama ?? "",
  ].map(csvCell).join(","));
  const blob = new Blob(["﻿" + [header.map(csvCell).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan-penjualan-offline-${wibDateKey(new Date().toISOString())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const filterInput = "h-10 rounded-lg border border-[#D8DEDA] bg-white px-3 text-sm outline-none focus:border-[#0F766E]";

function RecapTable({ title, rows, firstHeader }: { title: string; rows: Row[]; firstHeader: string }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <div className="border-b border-[#E5E7EB] px-5 py-4"><h3 className="font-bold">{title}</h3></div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead><tr className="bg-[#F8FAF9] text-[11px] uppercase tracking-[0.08em] text-[#6B7280]"><th className="px-5 py-3 font-bold">{firstHeader}</th><th className="px-4 py-3 text-right font-bold">Transaksi</th><th className="px-4 py-3 text-right font-bold">Tiket</th><th className="px-5 py-3 text-right font-bold">Pendapatan</th></tr></thead>
            <tbody className="divide-y divide-[#EEF0EF]">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="px-5 py-3"><p className="text-sm font-semibold">{row.label}</p>{row.sub && <p className="text-xs text-[#6B7280]">{row.sub}</p>}</td>
                  <td className="px-4 py-3 text-right text-sm">{row.transaksi.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-right text-sm">{row.tiket.toLocaleString("id-ID")}</td>
                  <td className="px-5 py-3 text-right text-sm font-bold">{formatRupiah(row.pendapatan)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="px-5 py-10 text-center text-sm text-[#9CA3AF]">Tidak ada data pada periode ini.</p>}
    </section>
  );
}

export default function OfflineReport() {
  const { user, ready, logout } = useOfflineGuard();
  const { orders, loading, error, reload } = useOfflineOrders(ready);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Hanya transaksi lunas yang dihitung sebagai penjualan.
  const filtered = useMemo(() => orders.filter((order) => {
    if (order.status_bayar !== "lunas") return false;
    const day = wibDateKey(orderDate(order));
    if (from && (!day || day < from)) return false;
    if (to && (!day || day > to)) return false;
    return true;
  }), [orders, from, to]);

  const totals = useMemo(() => ({
    transaksi: filtered.length,
    tiket: filtered.reduce((t, o) => t + o.jumlah, 0),
    pendapatan: filtered.reduce((t, o) => t + Number(o.total_harga), 0),
  }), [filtered]);

  const perKategori = useMemo(() => group(filtered, (o) => ({
    key: `${o.event_id}-${o.kategori_tiket_id}`,
    label: o.event?.nama_event ?? "Acara",
    sub: o.kategori_tiket?.nama_kelas ?? "Kategori",
  })).sort((a, b) => b.pendapatan - a.pendapatan), [filtered]);

  const perHari = useMemo(() => group(filtered, (o) => {
    const key = wibDateKey(orderDate(o)) || "-";
    return { key, label: key };
  }).sort((a, b) => b.key.localeCompare(a.key)), [filtered]);

  if (!user) return <main className="min-h-screen bg-[#F7FAF8]" />;

  const today = wibDateKey(new Date().toISOString());
  const preset = (start: string, end: string) => { setFrom(start); setTo(end); };

  return (
    <OfflineShell active="laporan" userName={user.nama} onLogout={logout}>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B7791F]">LAPORAN</p><h2 className="mt-1 text-3xl font-bold tracking-tight">Laporan Penjualan Offline</h2><p className="mt-2 text-sm text-[#6B7280]">Rekap penjualan di loket, terpisah dari pesanan online.</p></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void reload()} className="flex items-center gap-2 rounded-lg border border-[#D8DEDA] bg-white px-3.5 py-2.5 text-sm font-semibold hover:bg-[#F4F8F6]"><RefreshCw size={16} /> Muat ulang</button>
          <button type="button" disabled={!filtered.length} onClick={() => downloadCsv(filtered)} className="flex items-center gap-2 rounded-lg bg-[#0F766E] px-3.5 py-2.5 text-sm font-bold text-white hover:bg-[#0D625B] disabled:opacity-50"><Download size={16} /> Unduh CSV</button>
        </div>
      </div>

      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input type="date" aria-label="Dari tanggal" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={filterInput} />
        <span className="text-xs text-[#9CA3AF]">s/d</span>
        <input type="date" aria-label="Sampai tanggal" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={filterInput} />
        <button type="button" onClick={() => preset(today, today)} className="h-10 rounded-lg border border-[#D8DEDA] bg-white px-3 text-xs font-bold hover:bg-[#F4F8F6]">Hari ini</button>
        <button type="button" onClick={() => preset(addDays(today, -6), today)} className="h-10 rounded-lg border border-[#D8DEDA] bg-white px-3 text-xs font-bold hover:bg-[#F4F8F6]">7 hari</button>
        <button type="button" onClick={() => preset("", "")} className="h-10 rounded-lg border border-[#D8DEDA] bg-white px-3 text-xs font-bold hover:bg-[#F4F8F6]">Semua</button>
      </div>

      {loading ? <div className="grid gap-3 sm:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-white" />)}</div> : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4"><p className="text-xs font-semibold text-[#6B7280]">Transaksi</p><p className="mt-2 text-2xl font-bold">{totals.transaksi.toLocaleString("id-ID")}</p></div>
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4"><p className="text-xs font-semibold text-[#6B7280]">Tiket terjual</p><p className="mt-2 text-2xl font-bold">{totals.tiket.toLocaleString("id-ID")}</p></div>
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-4"><p className="text-xs font-semibold text-[#6B7280]">Pendapatan</p><p className="mt-2 text-2xl font-bold text-[#0F766E]">{formatRupiah(totals.pendapatan)}</p></div>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <RecapTable title="Rekap per acara & kategori" firstHeader="Acara / kategori" rows={perKategori} />
            <RecapTable title="Rekap harian (WIB)" firstHeader="Tanggal" rows={perHari} />
          </div>
        </>
      )}
    </OfflineShell>
  );
}
