"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Silkscreen } from "next/font/google";
import type { EventItem } from "@/utils/api";
import styles from "./promo-tiket.module.css";

const pixel = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-pixel", display: "swap" });

/** Rentang "minggu ini" = 7 hari ke depan dari sekarang */
const HARI = 7;
const BARIS = 6;
const TEKS = "TIKET MINGGU INI  ·  ";

export default function PromoTiket({ events, href }: { events: EventItem[]; href: string }) {
  // dihitung setelah mount supaya tidak beda antara render server dan browser
  const [jumlah, setJumlah] = useState<number | null>(null);

  useEffect(() => {
    const sekarang = Date.now();
    const batas = sekarang + HARI * 86_400_000;
    setJumlah(
      events.filter((e) => {
        const t = new Date(e.tanggal).getTime();
        return t >= sekarang && t <= batas;
      }).length
    );
  }, [events]);

  const ada = jumlah !== null && jumlah > 0;

  return (
    <section className={`${pixel.variable} ${styles.promo}`} aria-label="Event minggu ini">
      {/* teks pixel berulang di latar */}
      <div className={styles.rows} aria-hidden="true">
        {Array.from({ length: BARIS }, (_, i) => (
          <div key={i} className={styles.row} data-rev={i % 2 === 1} style={{ "--d": `${-i * 4}s` } as CSSProperties}>
            <span>{TEKS.repeat(8)}</span>
            <span>{TEKS.repeat(8)}</span>
          </div>
        ))}
      </div>

      {/* lantai grid yang bergerak maju */}
      <div className={styles.floor} aria-hidden="true" />

      <div className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>
            <span className={styles.cursor}>&gt; 7 HARI KE DEPAN</span>
          </p>
          <h2 className={styles.title}>
            {ada ? (
              <>
                <span className={styles.num}>{jumlah}</span> event
                <br />
                minggu ini
              </>
            ) : (
              <>
                Event seru
                <br />
                segera hadir
              </>
            )}
          </h2>
          <p className={styles.sub}>Amankan tiketmu sebelum kehabisan.</p>
          <Link href={href} className={styles.cta}>
            Lihat semua event
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {/* mesin tiket retro */}
        <div className={styles.art} aria-hidden="true">
          <svg viewBox="0 0 240 260" role="presentation">
            <defs>
              <clipPath id="promoSlotClip">
                <rect x="60" y="180" width="110" height="80" />
              </clipPath>
            </defs>

            <ellipse className={styles.shadow} cx="120" cy="246" rx="72" ry="9" />

            <g className={styles.machine}>
              {/* sisi samping */}
              <path d="M170 40 L196 52 L196 214 L170 226 Z" fill="#B45309" stroke="#1F2937" strokeWidth="3" strokeLinejoin="round" />
              {/* badan */}
              <rect x="56" y="34" width="114" height="192" rx="10" fill="#F59E0B" stroke="#1F2937" strokeWidth="3" />
              {/* papan nama */}
              <rect x="68" y="46" width="90" height="18" rx="4" fill="#1F2937" />
              <text x="113" y="59" textAnchor="middle" className={styles.pixelText} fontSize="9" fill="#F59E0B">
                DRSTAR
              </text>
              {/* layar */}
              <rect x="68" y="72" width="90" height="62" rx="6" fill="#111827" />
              <rect x="74" y="78" width="78" height="50" rx="3" fill="#064E3B" />
              <text x="113" y="96" textAnchor="middle" className={styles.pixelText} fontSize="11" fill="#FDE68A">
                TIKET
              </text>
              <text x="113" y="113" textAnchor="middle" className={styles.pixelText} fontSize="11" fill="#FDE68A">
                {ada ? `${jumlah} EVENT` : "SEGERA"}
              </text>
              <rect className={styles.blink} x="104" y="118" width="18" height="3" fill="#FDE68A" />
              {/* tombol */}
              <circle cx="82" cy="150" r="5" fill="#0F766E" stroke="#1F2937" strokeWidth="2" />
              <circle cx="100" cy="150" r="5" fill="#FFFBF5" stroke="#1F2937" strokeWidth="2" />
              <circle cx="118" cy="150" r="5" fill="#1F2937" />
              <rect x="132" y="146" width="20" height="8" rx="2" fill="#1F2937" />
              {/* slot tiket */}
              <rect x="76" y="168" width="78" height="12" rx="3" fill="#1F2937" />

              {/* tiket keluar dari slot (hanya terlihat di bawah bibir slot) */}
              <g clipPath="url(#promoSlotClip)">
                <g className={styles.ticket}>
                  <path
                    d="M84 174 H146 V220 H84 Z"
                    fill="#FFFBF5"
                    stroke="#1F2937"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx="84" cy="200" r="4" fill="#F59E0B" stroke="#1F2937" strokeWidth="2" />
                  <circle cx="146" cy="200" r="4" fill="#F59E0B" stroke="#1F2937" strokeWidth="2" />
                  <line x1="92" y1="200" x2="138" y2="200" stroke="#1F2937" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="115" y="192" textAnchor="middle" className={styles.pixelText} fontSize="8" fill="#0F766E">
                    ADMIT
                  </text>
                  <text x="115" y="213" textAnchor="middle" className={styles.pixelText} fontSize="7" fill="#1F2937">
                    DRSTAR
                  </text>
                </g>
              </g>
            </g>

            {/* kilau */}
            <rect className={styles.spark} x="30" y="60" width="6" height="6" fill="#F59E0B" style={{ "--s": "0s" } as CSSProperties} />
            <rect className={styles.spark} x="208" y="96" width="5" height="5" fill="#FDE68A" style={{ "--s": "0.8s" } as CSSProperties} />
            <rect className={styles.spark} x="22" y="150" width="4" height="4" fill="#0F766E" style={{ "--s": "1.5s" } as CSSProperties} />
            <rect className={styles.spark} x="214" y="170" width="6" height="6" fill="#F59E0B" style={{ "--s": "2.1s" } as CSSProperties} />
          </svg>
        </div>
      </div>
    </section>
  );
}