"use client";

import { Suspense, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Big_Shoulders } from "next/font/google";
import { ArrowRight, CalendarDays, Check, Info, MapPin, ShieldCheck, Ticket, User } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import {
  createOrder,
  fetchEventById,
  formatRupiah,
  getImageUrl,
  type EventItem,
} from "@/utils/api";
import { KATEGORI_BY_SLUG, formatHariTanggal, formatJamWib, kategoriOf } from "@/utils/kategori";
import styles from "./checkout.module.css";

/**
 * Checkout. Logika (wajib login, hanya role pelanggan, validasi query,
 * cek kuota, createOrder -> redirect Midtrans) tidak berubah dari versi
 * sebelumnya; hanya tampilan yang disamakan dengan landing, halaman
 * kategori, detail event, dan pilih tiket.
 */

const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const MAX_TICKETS_PER_ORDER = 5;

const n = (i: number) => ({ "--n": i }) as CSSProperties;

function Shell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${display.variable} ${styles.root} ${className}`}>
      <div className={styles.grain} aria-hidden="true" />
      {children}
    </div>
  );
}

function Notice({ title, message, backHref }: { title: string; message: string; backHref: string }) {
  return (
    <Shell>
      <div className={styles.noticeWrap}>
        <div className={styles.noticeCard}>
          <span className={styles.noticeIcon}>
            <Info size={22} aria-hidden="true" />
          </span>
          <h1 className={`${styles.display} ${styles.noticeTitle}`}>{title}</h1>
          <p className={styles.noticeText}>{message}</p>
          <BackButton fallbackHref={backHref} showIcon={false} className={styles.noticeBtn} />
        </div>
      </div>
    </Shell>
  );
}

function CheckoutSkeleton() {
  return (
    <Shell>
      <div className={styles.content}>
        <header className={`${styles.hero} pt-6 pb-9 sm:pt-8 sm:pb-12`}>
          <div className={styles.heroShade} aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="h-9 w-28 animate-pulse rounded-full bg-white/15" aria-hidden="true" />
            <div className="mt-8 space-y-3" aria-hidden="true">
              <div className="h-4 w-24 animate-pulse rounded bg-white/15" />
              <div className="h-12 w-2/3 animate-pulse rounded bg-white/15" />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10" aria-hidden="true">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
            <div className="order-2 space-y-5 lg:order-1">
              <div className={`${styles.skel} h-8 w-1/2`} />
              <div className={`${styles.skel} h-32`} />
              <div className={`${styles.skel} h-32`} />
              <div className={`${styles.skel} h-40`} />
            </div>
            <div className={`${styles.skel} order-1 h-80 lg:order-2`} />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Card({
  i,
  title,
  icon,
  action,
  children,
}: {
  i: number;
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={`${styles.card} ${styles.in}`} style={n(i)}>
      <header className={styles.cardHead}>
        <span className={styles.cardIcon} aria-hidden="true">
          {icon}
        </span>
        <h2 className={`${styles.display} ${styles.cardTitle}`}>{title}</h2>
        {action}
      </header>
      <div className={styles.cardBody}>{children}</div>
    </section>
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
    return <CheckoutSkeleton />;
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

  const tier = event.kategori_tiket?.find((k) => k.id === kategoriId);
  const paramsValid =
    Number.isInteger(kategoriId) &&
    Number.isInteger(jumlah) &&
    jumlah >= 1 &&
    jumlah <= MAX_TICKETS_PER_ORDER;

  if (!paramsValid || !tier) {
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

  const sisa = Math.max(0, tier.sisa_kuota ?? tier.kuota - tier.terjual);
  const harga = parseFloat(tier.harga);
  const total = harga * jumlah;
  const kuotaCukup = jumlah <= sisa;
  const agreedAll = agreeTerms && agreePrivacy;
  const canPay = agreedAll && kuotaCukup && !isSubmitting;

  const posterUrl = getImageUrl(event.poster);
  const eventKategori = KATEGORI_BY_SLUG[kategoriOf(event)];
  const jam = formatJamWib(event.tanggal);
  const initials =
    user.nama
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const handlePay = async () => {
    if (!canPay) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createOrder({
        event_id: event.id,
        kategori_tiket_id: tier.id,
        jumlah,
      });
      if (!order.payment_url) throw new Error("Sesi pembayaran belum tersedia. Silakan coba lagi.");
      // isSubmitting sengaja dibiarkan true agar pesanan tidak dibuat dua kali saat berpindah ke Midtrans.
      window.location.assign(order.payment_url);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Pesanan gagal dibuat.");
      setIsSubmitting(false);
    }
  };

  const payLabel = isSubmitting ? (
    "Memproses..."
  ) : (
    <>
      Buat Pesanan <ArrowRight size={18} aria-hidden="true" />
    </>
  );

  return (
    <Shell className="pb-28 lg:pb-20">
      <div className={styles.content}>
        {/* ===== hero ringkas ===== */}
        <header className={`${styles.hero} pt-6 pb-9 sm:pt-8 sm:pb-12`}>
          {posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterUrl} alt="" aria-hidden="true" className={styles.backdrop} />
          )}
          <div className={styles.heroShade} aria-hidden="true" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <BackButton fallbackHref={backHref} className={styles.back} />
              <ol className={styles.steps} aria-label="Langkah pembelian">
                <li className={styles.step} data-state="done">
                  <span className={`${styles.display} ${styles.stepNum}`}>
                    <Check size={15} aria-hidden="true" />
                  </span>
                  Pilih tiket
                </li>
                <li className={styles.step} data-state="active" aria-current="step">
                  <span className={`${styles.display} ${styles.stepNum}`}>02</span>
                  Checkout
                </li>
                <li className={styles.step}>
                  <span className={`${styles.display} ${styles.stepNum}`}>03</span>
                  Bayar
                </li>
              </ol>
            </div>

            <div className="mt-8">
              <span className={`${styles.kicker} ${styles.in}`} style={n(0)}>
                {eventKategori.label}
              </span>
              <h1 className={`${styles.display} ${styles.title} ${styles.in}`} style={n(1)}>
                {event.nama_event}
              </h1>
              <ul className={`${styles.meta} ${styles.in}`} style={n(2)}>
                <li className={styles.metaRow}>
                  <CalendarDays size={16} aria-hidden="true" />
                  {formatHariTanggal(event.tanggal)}
                  {jam ? ` · ${jam}` : ""}
                </li>
                <li className={styles.metaRow}>
                  <MapPin size={16} aria-hidden="true" />
                  {event.lokasi}
                </li>
              </ul>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
            {/* ===== kiri: detail pesanan ===== */}
            <div className="order-2 min-w-0 lg:order-1">
              <h2 className={`${styles.display} ${styles.secTitle}`}>Detail pesanan</h2>
              <span className={styles.secBar} aria-hidden="true" />
              <p className={`${styles.hint} mt-3`}>
                Periksa kembali pesananmu sebelum lanjut ke pembayaran.
              </p>

              <div className="mt-6 space-y-5">
                <Card i={0} title="Data pembeli" icon={<User size={16} />}>
                  <div className={styles.buyer}>
                    <span className={`${styles.display} ${styles.avatar}`} aria-hidden="true">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className={styles.buyerName}>{user.nama}</p>
                      <p className={styles.buyerMail}>{user.email}</p>
                      <p className={styles.buyerNote}>Pesanan dicatat atas akun yang sedang login.</p>
                    </div>
                  </div>
                </Card>

                <Card
                  i={1}
                  title="Tiket dipilih"
                  icon={<Ticket size={16} />}
                  action={
                    <Link href={backHref} className={styles.cardLink}>
                      Ubah
                    </Link>
                  }
                >
                  <div className={styles.chosen}>
                    <span className={styles.chosenBar} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className={styles.lineName}>{tier.nama_kelas}</p>
                      <p className={styles.lineSub}>
                        {formatRupiah(harga)} × {jumlah} tiket · sisa {sisa.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span className={`${styles.display} ${styles.lineAmt}`}>{formatRupiah(total)}</span>
                  </div>
                </Card>

                <Card i={2} title="Cara pembayaran" icon={<ShieldCheck size={16} />}>
                  <p className={styles.payInfo}>
                    <Info size={16} className={styles.payIcon} aria-hidden="true" />
                    <span>
                      Setelah menekan <strong>Buat Pesanan</strong>, kamu akan diarahkan ke halaman
                      pembayaran Midtrans. E-ticket (QR) terbit otomatis setelah pembayaran berhasil
                      dikonfirmasi.
                    </span>
                  </p>
                </Card>

                <Card i={3} title="Persetujuan" icon={<Check size={16} />}>
                  <div className={styles.agreeList}>
                    <label className={styles.agree} data-checked={agreeTerms}>
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                      />
                      <span>
                        Saya setuju dengan{" "}
                        <Link href="/terms" target="_blank" rel="noopener noreferrer">
                          Syarat &amp; Ketentuan
                        </Link>{" "}
                        yang berlaku di DR Star.
                      </span>
                    </label>
                    <label className={styles.agree} data-checked={agreePrivacy}>
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                      />
                      <span>
                        Saya menyetujui{" "}
                        <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                          Kebijakan Privasi &amp; Pemrosesan Data
                        </Link>{" "}
                        DR Star.
                      </span>
                    </label>
                  </div>
                </Card>
              </div>
            </div>

            {/* ===== kanan: ringkasan pesanan (di mobile tampil paling atas) ===== */}
            <aside
              className="order-1 lg:order-2 lg:sticky lg:top-8 lg:h-fit"
              aria-label="Ringkasan pesanan"
            >
              <div className={styles.summary}>
                <div className={styles.sumTop}>
                  <p className={styles.sumLabel}>Ringkasan pesanan</p>
                  <p className={`${styles.display} ${styles.sumEvent}`}>{event.nama_event}</p>
                </div>
                <div className={styles.perf} aria-hidden="true" />
                <div className={styles.sumBottom}>
                  <div className={styles.line}>
                    <div className="min-w-0">
                      <p className={styles.lineName}>{tier.nama_kelas}</p>
                      <p className={styles.lineSub}>
                        {jumlah} × {formatRupiah(harga)}
                      </p>
                    </div>
                    <span className={`${styles.display} ${styles.lineAmt}`}>{formatRupiah(total)}</span>
                  </div>

                  <div className={styles.total}>
                    <span className={styles.totalLbl}>Total {jumlah} tiket</span>
                    <span className={`${styles.display} ${styles.totalAmt}`}>{formatRupiah(total)}</span>
                  </div>

                  {!kuotaCukup && (
                    <p role="alert" className={styles.alert}>
                      Sisa kuota kategori ini hanya {sisa} tiket. Kembali dan kurangi jumlahnya.
                    </p>
                  )}

                  {submitError && (
                    <p role="alert" className={`${styles.alert} ${styles.alertDesktop}`}>
                      {submitError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => void handlePay()}
                    disabled={!canPay}
                    className={`${styles.go} ${styles.goDesktop} mt-5`}
                  >
                    {payLabel}
                  </button>

                  {kuotaCukup && !agreedAll && (
                    <p className={styles.fine}>Centang kedua persetujuan untuk melanjutkan.</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* bar total tetap di bawah (mobile & tablet) */}
      <div className={styles.dock}>
        {submitError && (
          <p role="alert" className={styles.dockErr}>
            {submitError}
          </p>
        )}
        <div>
          <div className={styles.dockLbl}>Total {jumlah} tiket</div>
          <div className={`${styles.display} ${styles.dockAmt}`}>{formatRupiah(total)}</div>
        </div>
        <button type="button" onClick={() => void handlePay()} disabled={!canPay} className={styles.go}>
          {payLabel}
        </button>
      </div>
    </Shell>
  );
}

// useSearchParams harus berada di dalam Suspense
export default function OrderCheckout() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}