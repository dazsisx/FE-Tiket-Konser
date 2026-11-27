import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Download, MapPin, Ticket, Upload, XCircle } from "lucide-react";
import styles from "@/components/flyer/flyer.module.css";
import { formatJam, formatRupiah, formatTanggal } from "@/utils/api";
import type { HasilCekPembelian } from "@/utils/cekPembelian";
import { TONE_TIKET } from "./tone";

// Hasil "cek pembelian" untuk pengunjung (tanpa login).
// Semua data berasal dari backend. Status pembayaran dan QR tidak pernah ditentukan di sini.

type Stage = "bayar" | "verifikasi" | "lunas" | "ditolak" | "kadaluarsa";

function stageOf(data: HasilCekPembelian): Stage {
  if (data.status_bayar === "lunas") return "lunas";
  if (data.status_bayar === "ditolak") return "ditolak";
  if (data.status_bayar === "kadaluarsa") return "kadaluarsa";
  return data.bukti_bayar_terunggah ? "verifikasi" : "bayar";
}

const stageInfo: Record<Stage, { title: string; desc: string; tone: "wait" | "ok" | "bad"; Icon: typeof CheckCircle2 }> = {
  bayar: {
    title: "Menunggu pembayaran",
    desc: "Pesanan ini belum dibayar. Masuk ke akun yang dipakai saat memesan, lalu unggah bukti pembayaran.",
    tone: "wait",
    Icon: Upload,
  },
  verifikasi: {
    title: "Menunggu verifikasi",
    desc: "Bukti pembayaran sudah diterima dan sedang diperiksa admin. QR tiket akan muncul di sini setelah disetujui.",
    tone: "wait",
    Icon: Clock,
  },
  lunas: {
    title: "Pembayaran berhasil",
    desc: "Pembayaran sudah terkonfirmasi. Setiap tiket punya QR sendiri, tunjukkan QR-nya saat masuk venue.",
    tone: "ok",
    Icon: CheckCircle2,
  },
  ditolak: {
    title: "Pembayaran ditolak",
    desc: "Pembayaran tidak dapat diverifikasi dan tiket dikembalikan ke stok. Silakan pesan ulang.",
    tone: "bad",
    Icon: XCircle,
  },
  kadaluarsa: {
    title: "Pesanan kedaluwarsa",
    desc: "Batas waktu pesanan ini sudah lewat. Silakan pesan ulang.",
    tone: "bad",
    Icon: XCircle,
  },
};

const labelTiket = { aktif: "Aktif", terpakai: "Sudah digunakan", dibatalkan: "Dibatalkan" } as const;

export default function HasilPembelian({ data }: { data: HasilCekPembelian }) {
  const stage = stageOf(data);
  const { title, desc, tone, Icon } = stageInfo[stage];
  const event = data.event;

  const rows: Array<[string, string]> = [
    ["Kode booking", data.kode_tiket],
    ["Nama pemesan", data.nama_pembeli ?? "-"],
    ["Tipe tiket", data.kategori?.nama_kelas ?? "-"],
    ["Jumlah", `${data.jumlah} tiket`],
    ["Dipesan", data.dibuat_pada ? `${formatTanggal(data.dibuat_pada)}, ${formatJam(data.dibuat_pada)}` : "-"],
  ];

  return (
    <section aria-label="Hasil pembelian" className={`${styles.sheet} ${styles.result}`}>
      {/* ===== Status pembayaran ===== */}
      <div className={styles.banner} data-tone={tone}>
        <Icon size={34} strokeWidth={1.8} aria-hidden="true" />
        <div>
          <h2 className={`${styles.display} ${styles.bannerTitle}`}>{title}</h2>
          <p className={styles.bannerText}>{desc}</p>
        </div>
      </div>

      <div className={styles.resultBody}>
        {/* ===== Event ===== */}
        <div className={styles.resultMain}>
          {event ? (
            <>
              <p className={styles.when}>Acara kamu</p>
              <h3 className={`${styles.display} ${styles.evTitle}`}>{event.nama_event}</h3>
              <ul className={styles.meta}>
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
            </>
          ) : (
            <p className={styles.noTier}>Data acara tidak tersedia.</p>
          )}

          {stage === "bayar" && (
            <p className={styles.note}>
              <Upload size={18} aria-hidden="true" />
              <span>
                Lakukan pembayaran sebesar <strong>{formatRupiah(data.total_harga)}</strong> sesuai instruksi penyelenggara, lalu{" "}
                <Link href="/auth/login" className={styles.link}>
                  masuk
                </Link>{" "}
                untuk mengunggah bukti pembayaran. QR tiket tidak akan tampil sebelum pembayaran dikonfirmasi.
              </span>
            </p>
          )}
          {stage === "verifikasi" && (
            <p className={styles.note}>
              <Clock size={18} aria-hidden="true" />
              <span>Muat ulang halaman ini nanti untuk memeriksa status. QR tiket muncul otomatis setelah admin menyetujui pembayaran.</span>
            </p>
          )}

          {(stage === "ditolak" || stage === "kadaluarsa") && event && (
            <div style={{ marginTop: "1.25rem" }}>
              <Link href={`/pembelian/tiket/${event.id}`} className={styles.cta}>
                Pesan ulang <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {/* ===== Rincian pesanan ===== */}
        <div className={styles.resultSide}>
          <div className={styles.stubHead}>
            <span className={styles.stubTitle}>Rincian pesanan</span>
          </div>
          <dl className={styles.rows}>
            {rows.map(([label, value]) => (
              <div key={label} className={styles.row}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.total}>
            <span className={styles.totalLabel}>Total harga</span>
            <span className={`${styles.display} ${styles.totalValue}`}>{formatRupiah(data.total_harga)}</span>
          </div>
        </div>
      </div>

      {/* ===== Lunas: satu QR unik per tiket ===== */}
      {stage === "lunas" && (
        <div className={styles.resultMain} style={{ paddingTop: 0 }}>
          <p className={styles.qrHead}>Tunjukkan QR ini saat masuk venue</p>

          {data.tiket.length === 0 ? (
            <p className={styles.qrState}>Tiketmu sedang disiapkan. Muat ulang halaman ini beberapa saat lagi.</p>
          ) : (
            <ul className={styles.qrList}>
              {data.tiket.map((t) => (
                <li key={t.nomor_urut} className={styles.qrItem}>
                  <div className={styles.qrTop}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Ticket size={16} aria-hidden="true" />
                      Tiket {t.nomor_urut} dari {data.jumlah}
                    </span>
                    <span className={styles.status} data-tone={TONE_TIKET[t.status]}>
                      {labelTiket[t.status]}
                    </span>
                  </div>

                  {t.status === "aktif" && t.qr_code ? (
                    <>
                      <div className={styles.qrImgWrap}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={t.qr_code}
                          alt={`QR tiket ${t.nomor_urut} dari ${data.jumlah}, kode booking ${data.kode_tiket}`}
                          className={styles.qrImg}
                        />
                      </div>
                      <a
                        href={t.qr_code}
                        download={`tiket-${data.kode_tiket}-${t.nomor_urut}.png`}
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
    </section>
  );
}
