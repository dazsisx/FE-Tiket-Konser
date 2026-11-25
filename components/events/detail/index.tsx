"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { Big_Shoulders } from "next/font/google";
import BackButton from "@/components/ui/BackButton";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { ArrowRight, BadgeCheck, FileText, MapPin, CalendarDays, Clock, Share2, Ticket, UserRound } from "lucide-react";
import { EventItem, getImageUrl, formatRupiah, formatTanggal, getHargaTermurah } from "@/utils/api";
import {
  KATEGORI_BY_SLUG,
  formatHariTanggal,
  formatJamWib,
  kategoriOf,
  potongTanggal,
  rentangHarga,
} from "@/utils/kategori";
import styles from "./event-detail.module.css";

/**
 * Detail event. Bahasa visual sama dengan landing dan halaman /kategori/<slug>:
 * hero gelap + judul condensed, emas + hijau, daftar kelas tiket dengan bar kuota.
 */

type EventDetailProps = { event: EventItem };

const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const STATUS_LABEL: Record<string, string> = {
  aktif: "Penjualan dibuka",
  ditutup: "Penjualan ditutup",
  draft: "Belum dibuka",
  selesai: "Acara selesai",
};

const n = (i: number) => ({ "--n": i }) as CSSProperties;

export default function EventDetail({ event }: EventDetailProps) {
  const [activeTab, setActiveTab] = useState<"deskripsi" | "profil">("deskripsi");
  const [copied, setCopied] = useState(false);

  const posterUrl = getImageUrl(event.poster);
  const creatorName = event.artis?.nama ?? "Promotor";
  const slug = kategoriOf(event);
  const kategori = KATEGORI_BY_SLUG[slug];
  const { hari, bulan } = potongTanggal(event.tanggal);
  const jam = formatJamWib(event.tanggal);
  const range = rentangHarga(event);
  const price = getHargaTermurah(event.kategori_tiket);
  const priceLabel = range && range.min !== range.max ? "Harga tiket mulai" : "Harga tiket";
  const saleOpen = event.status === "aktif";
  const tiers = [...(event.kategori_tiket ?? [])].sort((a, b) => parseFloat(a.harga) - parseFloat(b.harga));
  const buyHref = `/pembelian/tiket/${event.id}`;

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.nama_event, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* dibatalkan pengguna atau tidak didukung */
    }
  }

  const buy = saleOpen ? (
    <Link href={buyHref} className={styles.btn}>
      Beli tiket <ArrowRight size={18} aria-hidden="true" />
    </Link>
  ) : (
    <span className={`${styles.btn} ${styles.btnOff}`} aria-disabled="true">
      {STATUS_LABEL[event.status] ?? "Tidak tersedia"}
    </span>
  );

  return (
    <div className={`${display.variable} ${styles.root} pb-24 sm:pb-20`}>
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.content}>
        {/* ===== Hero gelap ===== */}
        <header className={`${styles.hero} pt-6 pb-12 sm:pt-8 sm:pb-16`}>
          {posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterUrl} alt="" aria-hidden="true" className={styles.backdrop} />
          )}
          <div className={styles.heroShade} aria-hidden="true" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <BackButton fallbackHref="/" className={styles.back} />

            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <Link href="/">DR Star</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/kategori/${slug}`}>{kategori.label}</Link>
              <span aria-hidden="true">/</span>
              <span className={styles.crumbCur} aria-current="page">{event.nama_event}</span>
            </nav>

            <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[400px_1fr] lg:items-start lg:gap-14">
              {/* Poster */}
              <div className={`${styles.posterWrap} ${styles.in}`} style={n(0)}>
                <div className={styles.poster}>
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={event.nama_event}
                      fill
                      unoptimized
                      priority
                      sizes="(max-width: 1024px) 100vw, 400px"
                      className="object-cover"
                    />
                  ) : (
                    <div className={`${styles.display} ${styles.posterEmpty}`} aria-hidden="true">{event.nama_event}</div>
                  )}
                  <span className={styles.chipDate} aria-hidden="true">
                    <span className={`${styles.display} ${styles.chipDay}`}>{hari}</span>
                    <span className={styles.chipMon}>{bulan}</span>
                  </span>
                </div>
              </div>

              {/* Info */}
              <div>
                <Link href={`/kategori/${slug}`} className={`${styles.kicker} ${styles.in}`} style={n(1)}>
                  {kategori.label}
                </Link>
                <h1 className={`${styles.display} ${styles.title} ${styles.in}`} style={n(2)}>
                  {event.nama_event}
                </h1>
                <p className={`${styles.by} ${styles.in}`} style={n(3)}>
                  oleh <strong>{creatorName}</strong>
                  {event.artis && <BadgeCheck size={17} className="text-[#6EE7B7]" aria-label="Terverifikasi" />}
                </p>

                <ul className={`${styles.facts} ${styles.in}`} style={n(4)}>
                  <li className={styles.fact}><MapPin size={18} aria-hidden="true" /><span>{event.lokasi}</span></li>
                  <li className={styles.fact}>
                    <CalendarDays size={18} aria-hidden="true" />
                    <span>{formatHariTanggal(event.tanggal)}{jam ? ` · ${jam}` : ""}</span>
                  </li>
                </ul>

                <div className={`${styles.cta} ${styles.in}`} style={n(5)}>
                  <div>
                    <div className={styles.ctaFrom}>{priceLabel}</div>
                    <div className={`${styles.display} ${styles.ctaPrice}`}>{price}</div>
                  </div>
                  {buy}
                  <WishlistButton eventId={event.id} className={styles.ghost} />
                  <button type="button" className={styles.ghost} onClick={() => void share()}>
                    <Share2 size={16} aria-hidden="true" /> Bagikan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* pita */}
        <div className={styles.ribbon} aria-hidden="true">
          <div className={`${styles.display} ${styles.ribbonTrack}`}>
            {[0, 1].map((k) => (
              <span key={k} className={styles.ribbonItem}>
                {Array.from({ length: 8 }, () => `${kategori.label}   /   `).join("")}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* ===== Ringkasan ===== */}
          <ul className={`${styles.stats} mt-10`} aria-label="Ringkasan acara">
            <li className={styles.stat}>
              <div className={`${styles.display} ${styles.statValue}`}>{formatTanggal(event.tanggal)}</div>
              <div className={styles.statLabel}>Tanggal</div>
            </li>
            <li className={styles.stat}>
              <div className={`${styles.display} ${styles.statValue}`}>{jam || "Menyusul"}</div>
              <div className={styles.statLabel}>Waktu</div>
            </li>
            <li className={styles.stat}>
              <div className={`${styles.display} ${styles.statValue}`}>{STATUS_LABEL[event.status] ?? event.status}</div>
              <div className={styles.statLabel}>Status</div>
            </li>
          </ul>

          {/* ===== Kelas tiket ===== */}
          <section className="mt-14" aria-labelledby="kelas-tiket">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="kelas-tiket" className={`${styles.display} ${styles.secTitle}`}>Kelas tiket</h2>
                <span className={styles.secBar} aria-hidden="true" />
              </div>
              <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                <Ticket size={15} aria-hidden="true" /> {tiers.length} kelas
              </span>
            </div>

            {tiers.length === 0 ? (
              <p className="mt-6 rounded-2xl border-2 border-dashed border-[#E5E7EB] px-5 py-10 text-center text-sm text-[#6B7280]">
                Kelas tiket belum diumumkan.
              </p>
            ) : (
              <ul className={styles.tiers}>
                {tiers.map((t, i) => {
                  const sisa = Math.max(0, t.sisa_kuota ?? t.kuota - t.terjual);
                  const habis = sisa === 0;
                  const persen = t.kuota > 0 ? Math.min(100, (sisa / t.kuota) * 100) : 0;
                  const tipis = !habis && persen <= 15;
                  return (
                    <li
                      key={t.id}
                      className={`${styles.tier} ${habis ? styles.tierOut : ""} ${tipis ? styles.tierLow : ""}`}
                      style={{ "--i": Math.min(i, 8) } as CSSProperties}
                    >
                      <span className={styles.tierName}>{t.nama_kelas}</span>
                      <span className={`${styles.display} ${styles.tierPrice}`}>{habis ? "Habis" : formatRupiah(t.harga)}</span>
                      <div className={styles.tierBar}>
                        <div className={styles.tierTrack} aria-hidden="true">
                          <span className={styles.tierFill} style={{ width: `${persen}%` }} />
                        </div>
                        <span className={styles.tierLeft}>
                          {habis ? "Habis terjual" : tipis ? `Tinggal ${sisa.toLocaleString("id-ID")}` : `${sisa.toLocaleString("id-ID")} tersisa`}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ===== Deskripsi / Profil ===== */}
          <section className="mt-14">
            <div className={styles.tabs} role="tablist" aria-label="Informasi acara">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "deskripsi"}
                onClick={() => setActiveTab("deskripsi")}
                className={`${styles.display} ${styles.tab}`}
              >
                <FileText size={20} aria-hidden="true" /> Deskripsi
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "profil"}
                onClick={() => setActiveTab("profil")}
                className={`${styles.display} ${styles.tab}`}
              >
                <UserRound size={20} aria-hidden="true" /> Profil kreator
              </button>
            </div>

            <p key={activeTab} className={styles.prose} role="tabpanel">
              {activeTab === "deskripsi"
                ? event.deskripsi || "Belum ada deskripsi untuk event ini."
                : event.artis?.bio || "Belum ada profil kreator untuk event ini."}
            </p>
          </section>
        </div>
      </div>

      {/* bar beli tetap di bawah (mobile) */}
      <div className={styles.dock}>
        <div>
          <div className={styles.dockFrom}>{priceLabel}</div>
          <div className={`${styles.display} ${styles.dockPrice}`}>{price}</div>
        </div>
        {buy}
      </div>

      {copied && <div className={styles.toast} role="status">Tautan disalin</div>}
    </div>
  );
}