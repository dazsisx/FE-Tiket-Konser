"use client";

import Image from "next/image";
import { MapPin, Printer } from "lucide-react";
import { formatRupiah, formatTanggal, type PesananOffline } from "@/utils/api";
import { buyerName, formatDateTime, orderDate } from "./format";

/** Bukti pembelian tiket offline (QR + kode tiket dari backend). */
export default function Receipt({ order }: { order: PesananOffline }) {
  const phone = order.no_telepon_pembeli ?? order.user?.no_telepon;
  const email = order.email_pembeli ?? order.user?.email;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B7791F]">Bukti pembelian</p>
          <h3 className="mt-1 text-xl font-bold">{order.event?.nama_event ?? "Acara"}</h3>
          {order.event && (
            <p className="mt-1 flex items-center gap-1 text-sm text-[#6B7280]"><MapPin size={14} /> {order.event.lokasi} · {formatTanggal(order.event.tanggal)}</p>
          )}
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800">{order.status_bayar === "lunas" ? "Lunas" : order.status_bayar}</span>
      </div>

      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center">
          {order.qr_code ? (
            <Image src={order.qr_code} alt={`QR tiket ${order.kode_tiket ?? ""}`} width={176} height={176} unoptimized className="h-44 w-44 rounded-xl border border-[#E5E7EB]" />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] text-xs text-[#9CA3AF]">QR tidak tersedia</div>
          )}
          <p className="mt-2 font-mono text-sm font-bold tracking-wider">{order.kode_tiket ?? "-"}</p>
        </div>

        <dl className="grid w-full flex-1 grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-[#6B7280]">No. transaksi</dt><dd className="font-semibold">#{order.id}</dd>
          <dt className="text-[#6B7280]">Waktu</dt><dd className="font-semibold">{formatDateTime(orderDate(order))}</dd>
          <dt className="text-[#6B7280]">Pembeli</dt><dd className="font-semibold">{buyerName(order)}</dd>
          {phone && (<><dt className="text-[#6B7280]">Telepon</dt><dd className="font-semibold">{phone}</dd></>)}
          {email && (<><dt className="text-[#6B7280]">Email</dt><dd className="break-all font-semibold">{email}</dd></>)}
          <dt className="text-[#6B7280]">Kategori</dt><dd className="font-semibold">{order.kategori_tiket?.nama_kelas ?? "-"}</dd>
          <dt className="text-[#6B7280]">Jumlah</dt><dd className="font-semibold">{order.jumlah} tiket</dd>
          <dt className="text-[#6B7280]">Total</dt><dd className="text-base font-bold text-[#0F766E]">{formatRupiah(order.total_harga)}</dd>
          {order.petugas && (<><dt className="text-[#6B7280]">Petugas</dt><dd className="font-semibold">{order.petugas.nama}</dd></>)}
        </dl>
      </div>

      <button type="button" onClick={() => window.print()} className="mt-5 flex items-center gap-2 rounded-lg border border-[#D8DEDA] bg-white px-3.5 py-2.5 text-sm font-semibold hover:bg-[#F4F8F6] print:hidden"><Printer size={16} /> Cetak bukti</button>
    </div>
  );
}
