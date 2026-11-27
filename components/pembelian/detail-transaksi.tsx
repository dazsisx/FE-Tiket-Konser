"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Download, Loader2, MapPin, Ticket, X } from "lucide-react";
import styles from "@/components/flyer/flyer.module.css";
import { fetchMyOrder, formatJam, formatRupiah, formatTanggal, getImageUrl, type PesananRiwayat, type PesananSaya } from "@/utils/api";
import { statusOf, waktuPesanan } from "@/utils/pesanan";
import { TONE, TONE_TIKET } from "./tone";

const labelTiket = { aktif: "Aktif", terpakai: "Sudah digunakan", dibatalkan: "Dibatalkan" } as const;

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
    ["Kode booking", order.kode_tiket ?? "-"],
    ["Kategori tiket", order.kategori_tiket?.nama_kelas ?? "-"],
    ["Jumlah", `${order.jumlah} tiket`],
    ...(harga !== null ? ([["Harga per tiket", formatRupiah(harga)]] as Array<[string, string]>) : []),
    ["Transaksi", dibuat ? `${formatTanggal(dibuat)}, ${formatJam(dibuat)}` : "-"],
  ];

  return (
    <div className={styles.modalWrap}>
      <button type="button" aria-label="Tutup detail transaksi" tabIndex={-1} onClick={onClose} className={styles.modalScrim} />
      <div role="dialog" aria-modal="true" aria-labelledby="detail-transaksi-judul" className={styles.modal}>
        <div className={styles.modalHead}>
          <h2 id="detail-transaksi-judul" className={`${styles.display} ${styles.modalTitle}`}>
            Detail transaksi
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Tutup" className={styles.modalClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalHero}>
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" className={styles.modalPoster} />
            )}
            <div style={{ minWidth: 0 }}>
              <span className={styles.status} data-tone={TONE[status.key]}>
                {status.label}
              </span>
              <h3 className={`${styles.display} ${styles.modalEvent}`}>{event?.nama_event ?? "Event tidak tersedia"}</h3>
              {event?.artis?.nama && <p className={styles.modalArtist}>{event.artis.nama}</p>}
            </div>
          </div>

          {event && (
            <ul className={styles.meta} style={{ marginTop: "1rem" }}>
              <li className={styles.metaRow}>
                <CalendarDays size={15} aria-hidden="true" />
                <span>{formatTanggal(event.tanggal)}</span>
              </li>
              <li className={styles.metaRow}>
                <Clock size={15} aria-hidden="true" />
                <span>{formatJam(event.tanggal)}</span>
              </li>
              <li className={styles.metaRow}>
                <MapPin size={15} aria-hidden="true" />
                <span>{event.lokasi}</span>
              </li>
            </ul>
          )}

          <p className={styles.modalExplain}>{penjelasan[status.key]}</p>

          <dl className={styles.rows} style={{ marginTop: "1.1rem" }}>
            {rows.map(([label, value]) => (
              <div key={label} className={styles.row}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.total}>
            <span className={styles.totalLabel}>Total pembayaran</span>
            <span className={`${styles.display} ${styles.totalValue}`}>{formatRupiah(order.total_harga)}</span>
          </div>

          {status.key === "menunggu-pembayaran" && (
            <Link href={`/pembelian/sukses?order=${order.id}`} className={`${styles.cta} ${styles.ctaBlock}`} style={{ marginTop: "1.25rem" }}>
              Lanjutkan pembayaran <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}

          {(status.key === "ditolak" || status.key === "kedaluwarsa") && event?.status === "aktif" && (
            <Link href={`/pembelian/tiket/${order.event_id}`} className={`${styles.cta} ${styles.ctaBlock}`} style={{ marginTop: "1.25rem" }}>
              Pesan ulang <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}

          {/* ===== Tiket + QR (hanya pesanan lunas) ===== */}
          {status.key === "berhasil" && (
            <div>
              <p className={styles.qrHead}>Tiket dan QR</p>

              {loading ? (
                <div className={styles.modalSpin} role="status">
                  <Loader2 size={18} className={styles.spin} aria-hidden="true" />
                  Memuat tiket...
                </div>
              ) : error ? (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              ) : tiket.length === 0 ? (
                <p className={styles.qrState}>Tiketmu sedang disiapkan. Buka kembali detail ini beberapa saat lagi.</p>
              ) : (
                <ul className={styles.qrList} style={{ gridTemplateColumns: "1fr" }}>
                  {tiket.map((t) => (
                    <li key={t.nomor_urut} className={styles.qrItem}>
                      <div className={styles.qrTop}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Ticket size={16} aria-hidden="true" />
                          Tiket {t.nomor_urut} dari {order.jumlah}
                        </span>
                        <span className={styles.status} data-tone={TONE_TIKET[t.status]}>
                          {labelTiket[t.status]}
                        </span>
                      </div>
                      {t.status === "aktif" && t.qr_code ? (
                        <>
                          <div className={styles.qrImgWrap}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={t.qr_code} alt={`QR tiket ${t.nomor_urut} dari ${order.jumlah}`} className={styles.qrImg} />
                          </div>
                          <a
                            href={t.qr_code}
                            download={`tiket-${order.kode_tiket ?? order.id}-${t.nomor_urut}.png`}
                            className={`${styles.cta} ${styles.ctaGhost} ${styles.ctaBlock}`}
                            style={{ marginTop: "0.7rem" }}
                          >
                            <Download size={16} aria-hidden="true" />
                            Unduh QR
                          </a>
                        </>
                      ) : (
                        <p className={styles.qrNote}>
                          {t.status === "terpakai"
                            ? `Tiket ini sudah dipakai${t.digunakan_pada ? ` pada ${formatTanggal(t.digunakan_pada)}, ${formatJam(t.digunakan_pada)}` : ""}.`
                            : "Tiket ini sudah dibatalkan dan tidak dapat digunakan."}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
