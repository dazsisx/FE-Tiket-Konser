"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, Download, Loader2, MapPin, Ticket, X } from "lucide-react";
import { fetchMyOrder, formatJam, formatRupiah, formatTanggal, getImageUrl, type PesananRiwayat, type PesananSaya } from "@/utils/api";
import { statusOf, waktuPesanan } from "@/utils/pesanan";

const statusTiket = {
  aktif: { label: "Aktif", cls: "bg-[#ECFDF5] text-[#0F766E]" },
  terpakai: { label: "Sudah digunakan", cls: "bg-[#F3F4F6] text-[#6B7280]" },
  dibatalkan: { label: "Dibatalkan", cls: "bg-red-50 text-red-600" },
} as const;

const penjelasan: Record<string, string> = {
  "menunggu-pembayaran": "Pesanan ini belum dibayar. Selesaikan pembayaran agar tiketmu diterbitkan.",
  "menunggu-verifikasi": "Bukti pembayaran sudah diterima dan sedang diperiksa admin. Tiket muncul setelah disetujui.",
  berhasil: "Pembayaran terkonfirmasi. Tunjukkan QR tiket saat masuk venue.",
  ditolak: "Pembayaran tidak dapat diverifikasi dan tiket dikembalikan ke stok.",
  kedaluwarsa: "Batas waktu pembayaran sudah lewat dan pesanan ditutup.",
};

/** Dialog detail transaksi. QR tiket hanya diambil dari backend untuk pesanan yang sudah lunas. */
export default function DetailTransaksi({ order, onClose }: { order: PesananRiwayat; onClose: () => void }) {
  const status = statusOf(order);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [detail, setDetail] = useState<PesananSaya | null>(null);
  const [loading, setLoading] = useState(status.key === "berhasil");
  const [error, setError] = useState<string | null>(null);

  // Fokus, Esc, kunci scroll latar, dan kembalikan fokus ke pemicu saat ditutup
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    if (status.key !== "berhasil") return;
    let cancelled = false;
    fetchMyOrder(order.id)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Tiket gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [order.id, status.key]);

  const event = order.event;
  const poster = getImageUrl(event?.image_url);
  const dibuat = waktuPesanan(order);
  const harga = order.kategori_tiket ? Number(order.kategori_tiket.harga) : null;
  const tiket = detail?.tiket ?? [];

  const rows: Array<[string, string]> = [
    ["Kode Booking", order.kode_tiket ?? "-"],
    ["Kategori Tiket", order.kategori_tiket?.nama_kelas ?? "-"],
    ["Jumlah Tiket", `${order.jumlah} Tiket`],
    ...(harga !== null ? ([["Harga per Tiket", formatRupiah(harga)]] as Array<[string, string]>) : []),
    ["Tanggal Transaksi", dibuat ? `${formatTanggal(dibuat)}, ${formatJam(dibuat)}` : "-"],
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Tutup detail transaksi"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#1F2937]/40 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-transaksi-judul"
        className="relative flex max-h-[92vh] w-full max-w-[600px] flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_30px_80px_rgba(31,41,55,0.30)] sm:rounded-[32px]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] px-6 py-4">
          <h2 id="detail-transaksi-judul" className="text-lg font-extrabold text-[#1F2937]">
            Detail Transaksi
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#1F2937] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(15,118,110,0.25)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <div className="flex items-start gap-4">
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" className="h-24 w-20 shrink-0 rounded-2xl object-cover" />
            )}
            <div className="min-w-0">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${status.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                {status.label}
              </span>
              <h3 className="mt-2 text-xl font-extrabold leading-snug text-[#1F2937]">{event?.nama_event ?? "Event tidak tersedia"}</h3>
              {event?.artis?.nama && <p className="text-sm text-[#6B7280]">{event.artis.nama}</p>}
            </div>
          </div>

          {event && (
            <div className="mt-4 flex flex-col gap-1.5 text-sm text-[#6B7280]">
              <span className="flex items-center gap-2">
                <CalendarDays size={15} className="shrink-0 text-[#9CA3AF]" aria-hidden="true" />
                {formatTanggal(event.tanggal)}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={15} className="shrink-0 text-[#9CA3AF]" aria-hidden="true" />
                {formatJam(event.tanggal)}
              </span>
              <span className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#9CA3AF]" aria-hidden="true" />
                <span className="font-medium text-[#1F2937]">{event.lokasi}</span>
              </span>
            </div>
          )}

          <p className="mt-5 rounded-xl bg-[#FFFBF5] px-4 py-3 text-sm leading-relaxed text-[#6B7280]">{penjelasan[status.key]}</p>

          <dl className="mt-5 flex flex-col gap-3 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <dt className="text-[#6B7280]">{label}</dt>
                <dd className="text-right font-semibold text-[#1F2937]">{value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3">
              <dt className="font-semibold text-[#1F2937]">Total Pembayaran</dt>
              <dd className="text-lg font-extrabold text-[#F59E0B]">{formatRupiah(order.total_harga)}</dd>
            </div>
          </dl>

          {status.key === "menunggu-pembayaran" && (
            <Link
              href={`/pembelian/sukses?order=${order.id}`}
              className="mt-6 flex h-[52px] items-center justify-center rounded-full bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488]"
            >
              Lanjutkan Pembayaran
            </Link>
          )}

          {(status.key === "ditolak" || status.key === "kedaluwarsa") && event?.status === "aktif" && (
            <Link
              href={`/pembelian/tiket/${order.event_id}`}
              className="mt-6 flex h-[52px] items-center justify-center rounded-full bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488]"
            >
              Pesan Ulang
            </Link>
          )}

          {/* ===== Tiket + QR (hanya pesanan lunas) ===== */}
          {status.key === "berhasil" && (
            <div className="mt-7">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#9CA3AF]">
                <span className="h-px flex-1 bg-[#E5E7EB]" />
                Tiket dan QR
                <span className="h-px flex-1 bg-[#E5E7EB]" />
              </div>

              {loading ? (
                <div className="mt-5 flex items-center justify-center gap-2 py-10 text-sm text-[#6B7280]" role="status">
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Memuat tiket...
                </div>
              ) : error ? (
                <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-6 text-center text-sm text-red-600">
                  {error}
                </p>
              ) : tiket.length === 0 ? (
                <p className="mt-5 rounded-2xl border border-[#E5E7EB] px-4 py-10 text-center text-sm text-[#6B7280]">
                  Tiketmu sedang disiapkan. Buka kembali detail ini beberapa saat lagi.
                </p>
              ) : (
                <ul className="mt-5 flex flex-col gap-4">
                  {tiket.map((t) => {
                    const st = statusTiket[t.status];
                    return (
                      <li key={t.nomor_urut} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-2 font-bold text-[#1F2937]">
                            <Ticket size={16} className="text-[#0F766E]" aria-hidden="true" />
                            Tiket {t.nomor_urut} dari {order.jumlah}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                        </div>
                        {t.status === "aktif" && t.qr_code ? (
                          <>
                            <div className="mt-3 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={t.qr_code}
                                alt={`QR tiket ${t.nomor_urut} dari ${order.jumlah}`}
                                className="h-56 w-56 max-w-full"
                              />
                            </div>
                            <a
                              href={t.qr_code}
                              download={`tiket-${order.kode_tiket ?? order.id}-${t.nomor_urut}.png`}
                              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#1F2937] transition-colors duration-300 hover:bg-[#FFFBF5]"
                            >
                              <Download size={16} aria-hidden="true" />
                              Unduh QR Tiket {t.nomor_urut}
                            </a>
                          </>
                        ) : (
                          <p className="py-6 text-center text-sm text-[#6B7280]">
                            {t.status === "terpakai"
                              ? `Tiket ini sudah dipakai${
                                  t.digunakan_pada ? ` pada ${formatTanggal(t.digunakan_pada)}, ${formatJam(t.digunakan_pada)}` : ""
                                }.`
                              : "Tiket ini sudah dibatalkan dan tidak dapat digunakan."}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
