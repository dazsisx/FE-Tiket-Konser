"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

type Stage = "bayar" | "verifikasi" | "lunas" | "ditolak" | "kadaluarsa";

function stageOf(order: PesananSaya): Stage {
  if (order.status_bayar === "lunas") return "lunas";
  if (order.status_bayar === "ditolak") return "ditolak";
  if (order.status_bayar === "kadaluarsa") return "kadaluarsa";
  return order.bukti_bayar ? "verifikasi" : "bayar";
}

const stageInfo: Record<Stage, { title: string; desc: string; tone: string; Icon: typeof CheckCircle2 }> = {
  bayar: {
    title: "Pesanan Dibuat",
    desc: "Tiketmu sudah dipesan. Selesaikan pembayaran lalu unggah bukti pembayarannya di bawah ini.",
    tone: "bg-[#F59E0B]",
    Icon: Upload,
  },
  verifikasi: {
    title: "Menunggu Verifikasi",
    desc: "Bukti pembayaranmu sudah kami terima. Admin sedang memeriksanya.",
    tone: "bg-[#F59E0B]",
    Icon: Clock,
  },
  lunas: {
    title: "Pembayaran Berhasil!",
    desc: "Terima kasih! Pembayaranmu sudah diverifikasi. Tunjukkan QR di bawah saat masuk venue.",
    tone: "bg-[#0F766E]",
    Icon: CheckCircle2,
  },
  ditolak: {
    title: "Pembayaran Ditolak",
    desc: "Pembayaranmu tidak dapat diverifikasi dan tiket dikembalikan ke stok. Silakan pesan ulang.",
    tone: "bg-red-500",
    Icon: XCircle,
  },
  kadaluarsa: {
    title: "Pesanan Kedaluwarsa",
    desc: "Pesanan ini sudah kedaluwarsa. Silakan pesan ulang.",
    tone: "bg-red-500",
    Icon: XCircle,
  },
};

const MAX_PROOF_BYTES = 5 * 1024 * 1024;

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
    return <div className="min-h-screen bg-white pt-24 sm:pt-32" />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-32">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h1 className="text-xl font-bold text-[#1F2937]">Pesanan tidak ditemukan</h1>
          <p className="mt-2 text-sm text-[#6B7280]">{error ?? "Pesanan tidak tersedia."}</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[#0F766E] px-6 py-3 text-sm font-bold text-white hover:bg-[#0D9488]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const stage = stageOf(order);
  const { title, desc, tone, Icon } = stageInfo[stage];
  const event = order.event;
  const posterUrl = getImageUrl(event?.image_url ?? event?.banner);
  const orderDate = order.createdAt ?? order.created_at;
  const bookingCode = order.kode_tiket ?? "-";

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ===== Header status ===== */}
        <div className="flex items-start gap-4">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-[0_10px_26px_rgba(31,41,55,0.18)] ${tone}`}>
            <Icon size={28} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1F2937] sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">{desc}</p>
          </div>
        </div>

        {/* ===== Konten utama: 2 kolom ===== */}
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* ----- Kolom kiri: detail event & pemesanan ----- */}
          <div className="rounded-2xl border border-[#E5E7EB] p-6 lg:min-w-0 lg:flex-1">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex h-44 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FFFBF5] sm:h-36 sm:w-28">
                {posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={posterUrl} alt={event?.nama_event ?? "Poster event"} className="h-full w-full object-cover" />
                ) : (
                  <CalendarDays size={28} className="text-[#9CA3AF]" />
                )}
              </div>

              <div>
                <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#0F766E]">
                  Konser
                </span>
                <h2 className="mt-2 text-xl font-extrabold text-[#1F2937]">{event?.nama_event ?? "-"}</h2>

                {event && (
                  <div className="mt-3 flex flex-col gap-1.5 text-sm text-[#6B7280]">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={15} className="shrink-0 text-[#9CA3AF]" />
                      {formatTanggal(event.tanggal)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={15} className="shrink-0 text-[#9CA3AF]" />
                      {formatJam(event.tanggal)}
                    </span>
                    <span className="flex items-start gap-2">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-[#9CA3AF]" />
                      <span className="font-medium text-[#1F2937]">{event.lokasi}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-[#E5E7EB] pt-6">
              <h3 className="text-base font-bold text-[#1F2937]">Detail Pemesanan</h3>

              <dl className="mt-4 flex flex-col gap-3 text-sm">
                {[
                  ["Nama Pelanggan", user.nama],
                  ["Kode Booking", bookingCode],
                  ["Tanggal Pemesanan", orderDate ? `${formatTanggal(orderDate)}, ${formatJam(orderDate)}` : "-"],
                  ["Tipe Tiket", order.kategori_tiket?.nama_kelas ?? "-"],
                  ["Jumlah Tiket", `${order.jumlah} Tiket`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-[#6B7280]">{label}</dt>
                    <dd className="text-right font-semibold text-[#1F2937]">{value}</dd>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3">
                  <dt className="font-semibold text-[#1F2937]">Total Harga</dt>
                  <dd className="text-lg font-extrabold text-[#F59E0B]">{formatRupiah(order.total_harga)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* ----- Kolom kanan: kode booking + aksi sesuai status ----- */}
          <div className="rounded-2xl border border-[#E5E7EB] p-6 lg:w-[380px] lg:shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[#6B7280]">Kode Booking</p>
                <p className="mt-1 text-lg font-extrabold tracking-wide text-[#1F2937]">{bookingCode}</p>
              </div>
              {order.kode_tiket && (
                <button
                  type="button"
                  onClick={() => void handleCopy(order.kode_tiket as string)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#0F766E] px-3 py-1.5 text-xs font-semibold text-[#0F766E] transition-colors duration-300 hover:bg-[#ECFDF5]"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Tersalin" : "Salin"}
                </button>
              )}
            </div>

            {/* --- Belum bayar: unggah bukti --- */}
            {stage === "bayar" && (
              <div className="mt-5">
                <div className="flex items-start gap-3 rounded-xl border border-[#F59E0B]/20 bg-[#FFFBEB] px-4 py-3.5 text-xs leading-relaxed text-[#6B7280]">
                  <Info size={16} className="mt-0.5 shrink-0 text-[#F59E0B]" />
                  <p>
                    Lakukan pembayaran sebesar{" "}
                    <span className="font-semibold text-[#1F2937]">{formatRupiah(order.total_harga)}</span> sesuai
                    instruksi dari penyelenggara, lalu unggah foto bukti pembayarannya.
                  </p>
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#B7C8BF] p-3 text-sm text-[#475569]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#EAF4F0] text-[#0F766E]">
                    <Upload size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">Bukti pembayaran</span>
                    <span className="block truncate text-xs text-[#6B7280]">{file?.name ?? "JPG, PNG, WEBP, GIF hingga 5 MB"}</span>
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>

                {uploadError && (
                  <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {uploadError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => void handleUpload()}
                  disabled={!file || uploading}
                  className="mt-4 w-full rounded-full py-3 text-sm font-bold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] enabled:bg-[#0F766E] enabled:shadow-[0_10px_26px_rgba(15,118,110,0.28)] enabled:hover:-translate-y-0.5 enabled:hover:bg-[#0D9488]"
                >
                  {uploading ? "Mengunggah..." : "Unggah Bukti Pembayaran"}
                </button>
              </div>
            )}

            {/* --- Menunggu verifikasi --- */}
            {stage === "verifikasi" && (
              <div className="mt-5">
                <div className="flex items-start gap-3 rounded-xl border border-[#F59E0B]/20 bg-[#FFFBEB] px-4 py-3.5 text-xs leading-relaxed text-[#6B7280]">
                  <Info size={16} className="mt-0.5 shrink-0 text-[#F59E0B]" />
                  <p>Setelah admin menyetujui pembayaran, QR tiketmu akan muncul di halaman ini.</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRefresh()}
                  disabled={refreshing}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#0F766E] py-3 text-sm font-semibold text-[#0F766E] transition-colors duration-300 hover:bg-[#ECFDF5] disabled:opacity-60"
                >
                  <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Memeriksa..." : "Periksa Status"}
                </button>
              </div>
            )}

            {/* --- Lunas: QR dari BE --- */}
            {stage === "lunas" && (
              <>
                <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-[#9CA3AF]">
                  <span className="h-px flex-1 bg-[#E5E7EB]" />
                  Tunjukkan QR ini saat masuk venue
                  <span className="h-px flex-1 bg-[#E5E7EB]" />
                </div>

                <div className="mt-5 flex items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  {order.qr_code ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={order.qr_code} alt={`QR kode booking ${bookingCode}`} className="h-56 w-56" />
                  ) : (
                    <p className="py-16 text-center text-sm text-[#6B7280]">QR belum tersedia. Coba muat ulang halaman.</p>
                  )}
                </div>

                {order.qr_code && (
                  <a
                    href={order.qr_code}
                    download={`tiket-${bookingCode}.png`}
                    className="mt-5 flex items-center justify-center gap-2 rounded-full border border-[#E5E7EB] py-3 text-sm font-semibold text-[#1F2937] transition-colors duration-300 hover:bg-[#FFFBF5]"
                  >
                    <Download size={16} />
                    Unduh QR Tiket
                  </a>
                )}
              </>
            )}

            {/* --- Ditolak / kedaluwarsa --- */}
            {(stage === "ditolak" || stage === "kadaluarsa") && (
              <Link
                href={`/pembelian/tiket/${order.event_id}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#0F766E] py-3 text-sm font-bold text-white shadow-[0_10px_26px_rgba(15,118,110,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0D9488]"
              >
                Pesan Ulang
              </Link>
            )}

            <Link
              href="/"
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-[#E5E7EB] py-3 text-sm font-semibold text-[#1F2937] transition-colors duration-300 hover:bg-[#FFFBF5]"
            >
              <Home size={16} />
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        {/* ===== Bantuan ===== */}
        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-[#E5E7EB] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-[#0F766E]">
              <MessageCircle size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#1F2937]">Butuh bantuan?</p>
              <p className="text-xs text-[#6B7280]">Kami siap membantu 24/7</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-8">
            <span className="flex items-center gap-2 text-[#6B7280]">
              <Mail size={15} className="text-[#9CA3AF]" />
              <span>
                <span className="block text-xs text-[#9CA3AF]">Email</span>
                support@drstar.id
              </span>
            </span>
            <span className="flex items-center gap-2 text-[#6B7280]">
              <Phone size={15} className="text-[#9CA3AF]" />
              <span>
                <span className="block text-xs text-[#9CA3AF]">WhatsApp</span>
                +62 812-3456-7890
              </span>
            </span>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#1F2937] transition-colors duration-300 hover:bg-[#FFFBF5]"
          >
            <HelpCircle size={16} />
            Pusat Bantuan
          </button>
        </div>
      </div>
    </div>
  );
}

// useSearchParams harus berada di dalam Suspense
export default function PembayaranSukses() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pt-24 sm:pt-32" />}>
      <SuksesContent />
    </Suspense>
  );
}