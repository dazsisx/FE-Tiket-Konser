"use client";

import { Suspense, useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Big_Shoulders } from "next/font/google";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  RefreshCw,
  Copy,
  Check,
  CalendarDays,
  MapPin,
  Info,
  Download,
  Home,
  MessageCircle,
  HelpCircle,
  Mail,
  Phone,
  Ticket,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchMyOrder,
  formatJam,
  formatRupiah,
  formatTanggal,
  getImageUrl,
  uploadPaymentProof,
  type PesananSaya,
} from "@/utils/api";
import styles from "./sukses.module.css";

/**
 * Status pesanan. Logika (muat pesanan, salin kode, unggah bukti, QR per
 * tiket, periksa status) tidak berubah dari versi sebelumnya; hanya
 * tampilan yang disamakan dengan landing, kategori, pilih tiket, dan checkout.
 */

const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const n = (i: number) => ({ "--n": i }) as CSSProperties;

type Stage = "bayar" | "verifikasi" | "lunas" | "ditolak" | "kadaluarsa";

function stageOf(order: PesananSaya): Stage {
  if (order.status_bayar === "lunas") return "lunas";
  if (order.status_bayar === "ditolak") return "ditolak";
  if (order.status_bayar === "kadaluarsa") return "kadaluarsa";
  return order.bukti_bayar ? "verifikasi" : "bayar";
}

const stageInfo: Record<
  Stage,
  { title: string; desc: string; tone: "gold" | "teal" | "red"; Icon: typeof CheckCircle2 }
> = {
  bayar: {
    title: "Pesanan Dibuat",
    desc: "Tiketmu sudah dipesan. Selesaikan pembayaran agar e-ticket dapat diterbitkan.",
    tone: "gold",
    Icon: Upload,
  },
  verifikasi: {
    title: "Menunggu Verifikasi",
    desc: "Bukti pembayaranmu sudah kami terima. Admin sedang memeriksanya.",
    tone: "gold",
    Icon: Clock,
  },
  lunas: {
    title: "Pembayaran Berhasil!",
    desc: "Terima kasih! Pembayaranmu sudah diverifikasi. Setiap tiket punya QR sendiri, tunjukkan QR-nya saat masuk venue.",
    tone: "teal",
    Icon: CheckCircle2,
  },
  ditolak: {
    title: "Pembayaran Ditolak",
    desc: "Pembayaranmu tidak dapat diverifikasi dan tiket dikembalikan ke stok. Silakan pesan ulang.",
    tone: "red",
    Icon: XCircle,
  },
  kadaluarsa: {
    title: "Pesanan Kedaluwarsa",
    desc: "Pesanan ini sudah kedaluwarsa. Silakan pesan ulang.",
    tone: "red",
    Icon: XCircle,
  },
};

const MAX_PROOF_BYTES = 5 * 1024 * 1024;

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${styles.root} pb-16 lg:pb-20`}>
      <div className={styles.grain} aria-hidden="true" />
      {children}
    </div>
  );
}

function SuksesSkeleton() {
  return (
    <Shell>
      <div className={styles.content}>
        <header className={`${styles.hero} pt-6 pb-9 sm:pt-8 sm:pb-12`}>
          <div className={styles.heroShade} aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="h-9 w-28 animate-pulse rounded-full bg-white/15" aria-hidden="true" />
            <div className="mt-8 flex items-start gap-4" aria-hidden="true">
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-white/15" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-24 animate-pulse rounded bg-white/15" />
                <div className="h-12 w-2/3 animate-pulse rounded bg-white/15" />
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10" aria-hidden="true">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
            <div className="order-2 space-y-5 lg:order-1">
              <div className={`${styles.skel} h-44`} />
              <div className={`${styles.skel} h-56`} />
            </div>
            <div className={`${styles.skel} order-1 h-72 lg:order-2`} />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function SuksesContent() {
  const router = useRouter();
  const search = useSearchParams();
  const orderId = search.get("order");
  const { user, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<PesananSaya | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) {
      setError("Pesanan tidak ditemukan.");
      setLoading(false);
      return;
    }
    try {
      setOrder(await fetchMyOrder(orderId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pesanan gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    void load();
  }, [authLoading, user, router, load]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard bisa gagal di browser lama / non-https, abaikan secara diam-diam
    }
  };

  const handlePickFile = (picked: File | null) => {
    setUploadError(null);
    if (!picked) {
      setFile(null);
      return;
    }
    if (!picked.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar (JPG, PNG, WEBP, atau GIF).");
      return;
    }
    if (picked.size > MAX_PROOF_BYTES) {
      setUploadError("Ukuran file maksimal 5 MB.");
      return;
    }
    setFile(picked);
  };

  const handleUpload = async () => {
    if (!file || !order || uploading) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadPaymentProof(order.id, file);
      setFile(null);
      await load();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Bukti pembayaran gagal diunggah.");
    } finally {
      setUploading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (authLoading || !user || loading) {
    return <SuksesSkeleton />;
  }

  if (error || !order) {
    return (
      <Shell>
        <div className={styles.noticeWrap}>
          <div className={styles.noticeCard}>
            <span className={styles.noticeIcon}>
              <Info size={22} aria-hidden="true" />
            </span>
            <h1 className={`${styles.display} ${styles.noticeTitle}`}>Pesanan tidak ditemukan</h1>
            <p className={styles.noticeText}>{error ?? "Pesanan tidak tersedia."}</p>
            <Link href="/" className={styles.noticeBtn}>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const stage = stageOf(order);
  const { title, desc, tone, Icon } = stageInfo[stage];
  const event = order.event;
  const posterUrl = getImageUrl(event?.image_url ?? event?.banner);
  const orderDate = order.createdAt ?? order.created_at;
  const bookingCode = order.kode_tiket ?? "-";
  const tickets = order.tiket ?? [];

  // Langkah 03: selesai kalau lunas, gagal kalau ditolak/kedaluwarsa, selain itu sedang berjalan
  const step3 = stage === "lunas" ? "done" : stage === "ditolak" || stage === "kadaluarsa" ? "fail" : "active";

  const detailRows: [string, string][] = [
    ["Nama Pelanggan", user.nama],
    ["Kode Booking", bookingCode],
    ["Tanggal Pemesanan", orderDate ? `${formatTanggal(orderDate)}, ${formatJam(orderDate)}` : "-"],
    ["Tipe Tiket", order.kategori_tiket?.nama_kelas ?? "-"],
    ["Jumlah Tiket", `${order.jumlah} Tiket`],
  ];

  const refreshIcon = <RefreshCw size={15} aria-hidden="true" />;

  return (
    <Shell>
      <div className={styles.content}>
        {/* ===== hero status ===== */}
        <header className={`${styles.hero} pt-6 pb-9 sm:pt-8 sm:pb-12`}>
          {posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterUrl} alt="" aria-hidden="true" className={styles.backdrop} />
          )}
          <div className={styles.heroShade} aria-hidden="true" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className={styles.back}>
                <Home size={15} aria-hidden="true" />
                Beranda
              </Link>
              <ol className={styles.steps} aria-label="Langkah pembelian">
                <li className={styles.step} data-state="done">
                  <span className={`${styles.display} ${styles.stepNum}`}>
                    <Check size={15} aria-hidden="true" />
                  </span>
                  Pilih tiket
                </li>
                <li className={styles.step} data-state="done">
                  <span className={`${styles.display} ${styles.stepNum}`}>
                    <Check size={15} aria-hidden="true" />
                  </span>
                  Checkout
                </li>
                <li
                  className={styles.step}
                  data-state={step3}
                  aria-current={step3 === "active" ? "step" : undefined}
                >
                  <span className={`${styles.display} ${styles.stepNum}`}>
                    {step3 === "done" ? (
                      <Check size={15} aria-hidden="true" />
                    ) : step3 === "fail" ? (
                      <X size={15} aria-hidden="true" />
                    ) : (
                      "03"
                    )}
                  </span>
                  Bayar
                </li>
              </ol>
            </div>

            <div className={`${styles.heroMain} mt-8`}>
              <span className={`${styles.statusIcon} ${styles.in}`} data-tone={tone} style={n(0)}>
                <Icon size={30} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <span className={`${styles.kicker} ${styles.in}`} style={n(1)}>
                  Status pesanan
                </span>
                <h1 className={`${styles.display} ${styles.title} ${styles.in}`} style={n(2)}>
                  {title}
                </h1>
                <p className={`${styles.lead} ${styles.in}`} style={n(3)}>
                  {desc}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          {/* ===== e-ticket (hanya setelah lunas) ===== */}
          {stage === "lunas" && (
            <section className="mb-10 lg:mb-12" aria-label="E-ticket">
              <h2 className={`${styles.display} ${styles.secTitle}`}>E-ticket kamu</h2>
              <span className={styles.secBar} aria-hidden="true" />
              <p className={`${styles.hint} mt-3`}>
                Tunjukkan QR ini saat masuk venue. Satu QR berlaku untuk satu tiket.
              </p>

              {tickets.length === 0 ? (
                <div className={styles.qrEmpty}>
                  <p>Tiketmu sedang disiapkan. Coba muat ulang halaman.</p>
                  <button
                    type="button"
                    onClick={() => void handleRefresh()}
                    disabled={refreshing}
                    className={`${styles.ghost} ${styles.ghostTeal} ${refreshing ? styles.spin : ""}`}
                  >
                    {refreshIcon}
                    {refreshing ? "Memeriksa..." : "Muat Ulang"}
                  </button>
                </div>
              ) : (
                <ul className={styles.qrGrid}>
                  {tickets.map((t, i) => (
                    <li key={t.nomor_urut} className={`${styles.qrCard} ${styles.in}`} style={n(i)}>
                      <div className={styles.qrTop}>
                        <span className={`${styles.display} ${styles.qrTitle}`}>
                          Tiket {t.nomor_urut} dari {order.jumlah}
                        </span>
                        <span
                          className={styles.pill}
                          data-tone={t.status === "aktif" ? "aktif" : t.status === "terpakai" ? "terpakai" : "batal"}
                        >
                          {t.status === "aktif" ? "Aktif" : t.status === "terpakai" ? "Sudah digunakan" : "Dibatalkan"}
                        </span>
                      </div>
                      <div className={styles.perf} aria-hidden="true" />
                      <div className={styles.qrBody}>
                        {t.status === "aktif" && t.qr_code ? (
                          <>
                            <div className={styles.qrImg}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={t.qr_code}
                                alt={`QR tiket ${t.nomor_urut} dari ${order.jumlah}, kode booking ${bookingCode}`}
                              />
                            </div>
                            <a
                              href={t.qr_code}
                              download={`tiket-${bookingCode}-${t.nomor_urut}.png`}
                              className={styles.qrDl}
                            >
                              <Download size={16} aria-hidden="true" />
                              Unduh QR Tiket {t.nomor_urut}
                            </a>
                          </>
                        ) : (
                          <p className={styles.qrMsg}>
                            {t.status === "terpakai"
                              ? `Tiket ini sudah dipakai${
                                  t.digunakan_pada
                                    ? ` pada ${formatTanggal(t.digunakan_pada)}, ${formatJam(t.digunakan_pada)}`
                                    : ""
                                }.`
                              : "Tiket ini sudah dibatalkan dan tidak dapat digunakan."}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
            {/* ===== kiri: detail event & pemesanan ===== */}
            <div className="order-2 min-w-0 space-y-5 lg:order-1">
              <section className={`${styles.card} ${styles.in}`} style={n(0)}>
                <div className={styles.eventRow}>
                  <div className={styles.poster}>
                    {posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={posterUrl} alt={event?.nama_event ?? "Poster event"} />
                    ) : (
                      <CalendarDays size={28} aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={styles.eventLabel}>Event</p>
                    <h2 className={`${styles.display} ${styles.eventName}`}>{event?.nama_event ?? "-"}</h2>
                    {event && (
                      <ul className={styles.eventMeta}>
                        <li>
                          <CalendarDays size={15} aria-hidden="true" />
                          {formatTanggal(event.tanggal)}
                        </li>
                        <li>
                          <Clock size={15} aria-hidden="true" />
                          {formatJam(event.tanggal)}
                        </li>
                        <li>
                          <MapPin size={15} aria-hidden="true" />
                          <strong>{event.lokasi}</strong>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </section>

              <section className={`${styles.card} ${styles.in}`} style={n(1)}>
                <header className={styles.cardHead}>
                  <span className={styles.cardIcon} aria-hidden="true">
                    <Ticket size={16} />
                  </span>
                  <h2 className={`${styles.display} ${styles.cardTitle}`}>Detail pemesanan</h2>
                </header>
                <div className={styles.cardBody}>
                  <dl className={styles.rows}>
                    {detailRows.map(([label, value]) => (
                      <div key={label} className={styles.row}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                    <div className={styles.totalRow}>
                      <dt>Total Harga</dt>
                      <dd className={styles.display}>{formatRupiah(order.total_harga)}</dd>
                    </div>
                  </dl>
                </div>
              </section>
            </div>

            {/* ===== kanan: kode booking + aksi sesuai status ===== */}
            <aside className="order-1 min-w-0 lg:order-2" aria-label="Kode booking dan aksi">
              <div className={styles.summary}>
                <div className={styles.sumTop}>
                  <div className="min-w-0">
                    <p className={styles.sumLabel}>Kode booking</p>
                    <p className={`${styles.display} ${styles.code}`}>{bookingCode}</p>
                  </div>
                  {order.kode_tiket && (
                    <button
                      type="button"
                      onClick={() => void handleCopy(order.kode_tiket as string)}
                      className={styles.copy}
                    >
                      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                      {copied ? "Tersalin" : "Salin"}
                    </button>
                  )}
                </div>
                <div className={styles.perf} aria-hidden="true" />
                <div className={styles.sumBottom}>
                  {/* --- Belum bayar: lanjut ke Midtrans --- */}
                  {stage === "bayar" && order.payment_url && (
                    <>
                      <p className={styles.note}>
                        <Info size={16} aria-hidden="true" />
                        <span>
                          Selesaikan pembayaran sebesar <strong>{formatRupiah(order.total_harga)}</strong> melalui
                          halaman pembayaran Midtrans. Tiket akan aktif otomatis setelah pembayaran terkonfirmasi.
                        </span>
                      </p>
                      <a href={order.payment_url} className={styles.go}>
                        Lanjutkan Pembayaran
                      </a>
                      <button
                        type="button"
                        onClick={() => void handleRefresh()}
                        disabled={refreshing}
                        className={`${styles.ghost} ${styles.ghostTeal} ${refreshing ? styles.spin : ""}`}
                      >
                        {refreshIcon}
                        {refreshing ? "Memeriksa..." : "Periksa Status Pembayaran"}
                      </button>
                    </>
                  )}

                  {/* --- Belum bayar, tanpa payment_url: unggah bukti --- */}
                  {stage === "bayar" && !order.payment_url && (
                    <>
                      <p className={styles.note}>
                        <Info size={16} aria-hidden="true" />
                        <span>
                          Lakukan pembayaran sebesar <strong>{formatRupiah(order.total_harga)}</strong> sesuai
                          instruksi dari penyelenggara, lalu unggah foto bukti pembayarannya.
                        </span>
                      </p>

                      <label className={styles.drop}>
                        <span className={styles.dropIcon}>
                          <Upload size={18} aria-hidden="true" />
                        </span>
                        <span className={styles.dropText}>
                          <span className={styles.dropTitle}>Bukti pembayaran</span>
                          <span className={styles.dropSub}>{file?.name ?? "JPG, PNG, WEBP, GIF hingga 5 MB"}</span>
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
                          className="sr-only"
                        />
                      </label>

                      {uploadError && (
                        <p role="alert" className={styles.alert}>
                          {uploadError}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleUpload()}
                        disabled={!file || uploading}
                        className={styles.go}
                      >
                        {uploading ? "Mengunggah..." : "Unggah Bukti Pembayaran"}
                      </button>
                    </>
                  )}

                  {/* --- Menunggu verifikasi --- */}
                  {stage === "verifikasi" && (
                    <>
                      <p className={styles.note}>
                        <Info size={16} aria-hidden="true" />
                        <span>Setelah admin menyetujui pembayaran, QR tiketmu akan muncul di halaman ini.</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleRefresh()}
                        disabled={refreshing}
                        className={`${styles.ghost} ${styles.ghostTeal} ${refreshing ? styles.spin : ""}`}
                      >
                        {refreshIcon}
                        {refreshing ? "Memeriksa..." : "Periksa Status"}
                      </button>
                    </>
                  )}

                  {/* --- Lunas --- */}
                  {stage === "lunas" && (
                    <p className={styles.note}>
                      <Info size={16} aria-hidden="true" />
                      <span>
                        Simpan kode booking ini. E-ticket (QR) untuk setiap tiket ada di bagian atas halaman.
                      </span>
                    </p>
                  )}

                  {/* --- Ditolak / kedaluwarsa --- */}
                  {(stage === "ditolak" || stage === "kadaluarsa") && (
                    <Link href={`/pembelian/tiket/${order.event_id}`} className={styles.go}>
                      Pesan Ulang
                    </Link>
                  )}

                  <Link href="/" className={styles.ghost}>
                    <Home size={16} aria-hidden="true" />
                    Kembali ke Beranda
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* ===== bantuan ===== */}
          <div className={`${styles.help} mt-8`}>
            <div className={styles.helpHead}>
              <span className={styles.cardIcon} aria-hidden="true">
                <MessageCircle size={18} />
              </span>
              <div>
                <p className={`${styles.display} ${styles.helpTitle}`}>Butuh bantuan?</p>
                <p className={styles.helpSub}>Kami siap membantu 24/7</p>
              </div>
            </div>

            <div className={styles.helpContacts}>
              <span className={styles.helpItem}>
                <Mail size={16} aria-hidden="true" />
                <span>
                  <small>Email</small>
                  support@drstar.id
                </span>
              </span>
              <span className={styles.helpItem}>
                <Phone size={16} aria-hidden="true" />
                <span>
                  <small>WhatsApp</small>
                  +62 812-3456-7890
                </span>
              </span>
            </div>

            <button type="button" className={styles.ghost}>
              <HelpCircle size={16} aria-hidden="true" />
              Pusat Bantuan
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// useSearchParams harus berada di dalam Suspense
export default function PembayaranSukses() {
  return (
    <Suspense fallback={<SuksesSkeleton />}>
      <SuksesContent />
    </Suspense>
  );
}