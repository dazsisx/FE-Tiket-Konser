"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Info, MapPin, User } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  createOrder,
  fetchEventById,
  formatJam,
  formatRupiah,
  formatTanggal,
  type EventItem,
} from "@/utils/api";

const MAX_TICKETS_PER_ORDER = 5;

function Notice({ title, message, backHref }: { title: string; message: string; backHref: string }) {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-32">
      <div className="mx-auto max-w-xl px-4 text-center">
        <h1 className="text-xl font-bold text-[#1F2937]">{title}</h1>
        <p className="mt-2 text-sm text-[#6B7280]">{message}</p>
        <BackButton
          fallbackHref={backHref}
          showIcon={false}
          className="mt-6 inline-flex rounded-full bg-[#0F766E] px-6 py-3 text-sm font-bold text-white hover:bg-[#0D9488]"
        />
      </div>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>(); // id event
  const search = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  const kategoriId = Number(search.get("kategori"));
  const jumlah = Number(search.get("jumlah"));

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const backHref = `/pembelian/tiket/${slug}`;

  // Wajib login
  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    let cancelled = false;
    fetchEventById(slug)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Event gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (authLoading || !user || loading) {
    return <div className="min-h-screen bg-white pt-24 sm:pt-32" />;
  }

  if (user.role !== "pelanggan") {
    return (
      <Notice
        title="Khusus akun pelanggan"
        message="Pembelian tiket online hanya bisa dilakukan dengan akun pelanggan."
        backHref="/"
      />
    );
  }

  if (loadError || !event) {
    return <Notice title="Event tidak ditemukan" message={loadError ?? "Event tidak tersedia."} backHref="/" />;
  }

  const kategori = event.kategori_tiket?.find((k) => k.id === kategoriId);
  const paramsValid =
    Number.isInteger(kategoriId) &&
    Number.isInteger(jumlah) &&
    jumlah >= 1 &&
    jumlah <= MAX_TICKETS_PER_ORDER;

  if (!paramsValid || !kategori) {
    return (
      <Notice
        title="Pilihan tiket tidak valid"
        message="Silakan pilih kategori dan jumlah tiket terlebih dahulu."
        backHref={backHref}
      />
    );
  }

  if (event.status !== "aktif") {
    return (
      <Notice
        title="Penjualan ditutup"
        message="Penjualan tiket untuk event ini sedang tidak dibuka."
        backHref="/"
      />
    );
  }

  const sisa = Math.max(0, kategori.sisa_kuota ?? kategori.kuota - kategori.terjual);
  const harga = parseFloat(kategori.harga);
  const total = harga * jumlah;
  const kuotaCukup = jumlah <= sisa;
  const canPay = agreeTerms && agreePrivacy && kuotaCukup && !isSubmitting;

  const handlePay = async () => {
    if (!canPay) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        event_id: event.id,
        kategori_tiket_id: kategori.id,
        jumlah,
      });
      // isSubmitting sengaja dibiarkan true supaya tidak bisa klik dua kali saat pindah halaman
      router.push(`/pembelian/sukses?order=${order.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Pesanan gagal dibuat.");
      setIsSubmitting(false);
    }
  };

  const infoCard = (title: string, children: ReactNode) => (
    <div className="mt-6 rounded-2xl border border-[#E5E7EB]">
      <div className="border-b border-[#E5E7EB] px-6 py-4">
        <h2 className="text-base font-bold text-[#1F2937]">{title}</h2>
      </div>
      <div className="px-6 py-5 text-sm text-[#6B7280]">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* ===== Kolom kiri ===== */}
          <div className="lg:min-w-0 lg:flex-1">
            <BackButton fallbackHref={backHref} />

            <p className="mt-3 text-sm text-[#6B7280]">
              Langkah 2 dari 3 &middot;{" "}
              <span className="font-semibold text-[#1F2937]">Detail Pesanan</span>
            </p>

            <h1 className="mt-2 text-2xl font-bold text-[#1F2937] sm:text-3xl">{event.nama_event}</h1>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-[#6B7280]">
              <span className="flex items-center gap-2">
                <CalendarDays size={15} className="shrink-0 text-[#9CA3AF]" />
                {formatTanggal(event.tanggal)} &middot; {formatJam(event.tanggal)}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={15} className="shrink-0 text-[#9CA3AF]" />
                {event.lokasi}
              </span>
            </div>

            {infoCard(
              "Data Pembeli",
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-[#0F766E]">
                  <User size={17} />
                </span>
                <div>
                  <p className="font-semibold text-[#1F2937]">{user.nama}</p>
                  <p>{user.email}</p>
                  <p className="mt-1 text-xs text-[#9CA3AF]">Pesanan dicatat atas akun yang sedang login.</p>
                </div>
              </div>
            )}

            {infoCard(
              "Cara Pembayaran",
              <div className="flex items-start gap-3">
                <Info size={16} className="mt-0.5 shrink-0 text-[#F59E0B]" />
                <p className="leading-relaxed">
                  Setelah menekan <span className="font-semibold text-[#1F2937]">Buat Pesanan</span>, pesananmu tercatat
                  dengan status menunggu pembayaran dan stok tiket dipesan untukmu. Di halaman berikutnya kamu
                  mengunggah bukti pembayaran, lalu admin memverifikasinya. E-ticket (QR) muncul setelah pembayaran
                  disetujui.
                </p>
              </div>
            )}
          </div>

          {/* ===== Kolom kanan: ringkasan ===== */}
          <div className="lg:sticky lg:top-28 lg:w-[380px] lg:shrink-0 [overflow-anchor:none]">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <h2 className="text-base font-bold text-[#1F2937]">Ringkasan Pesanan</h2>

              <div className="mt-4 flex gap-3">
                <span className="w-1 shrink-0 rounded-full bg-gradient-to-b from-[#0F766E] to-[#F59E0B]" />
                <div className="flex flex-1 items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1F2937]">{kategori.nama_kelas}</p>
                    <p className="text-xs text-[#6B7280]">
                      {formatRupiah(harga)} × {jumlah}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#1F2937]">{formatRupiah(total)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-4 text-sm">
                <span className="text-[#6B7280]">Subtotal ({jumlah} tiket)</span>
                <span className="font-semibold text-[#1F2937]">{formatRupiah(total)}</span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-4">
                <span className="text-sm font-bold text-[#1F2937]">Total Keseluruhan</span>
                <span className="text-base font-extrabold text-[#F59E0B]">{formatRupiah(total)}</span>
              </div>

              {!kuotaCukup && (
                <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  Sisa kuota kategori ini hanya {sisa} tiket. Kembali dan kurangi jumlahnya.
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2.5">
                <label className="flex items-start gap-2.5 text-xs text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#0F766E]"
                  />
                  <span>
                    Saya setuju dengan{" "}
                    <Link href="/terms" className="font-semibold text-[#0F766E] hover:text-[#F59E0B]">
                      Syarat &amp; Ketentuan
                    </Link>{" "}
                    yang berlaku di DR Star.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 text-xs text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#0F766E]"
                  />
                  <span>
                    Saya menyetujui{" "}
                    <Link href="/privacy" className="font-semibold text-[#0F766E] hover:text-[#F59E0B]">
                      Kebijakan Privasi &amp; Pemrosesan Data
                    </Link>{" "}
                    DR Star.
                  </span>
                </label>
              </div>

              {submitError && (
                <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </p>
              )}

              <button
                type="button"
                onClick={() => void handlePay()}
                disabled={!canPay}
                className="mt-5 w-full rounded-full py-3 text-sm font-bold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] enabled:bg-[#0F766E] enabled:shadow-[0_10px_26px_rgba(15,118,110,0.28)] enabled:hover:-translate-y-0.5 enabled:hover:bg-[#0D9488]"
              >
                {isSubmitting ? "Memproses..." : "Buat Pesanan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// useSearchParams harus berada di dalam Suspense
export default function OrderCheckout() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pt-24 sm:pt-32" />}>
      <CheckoutContent />
    </Suspense>
  );
}