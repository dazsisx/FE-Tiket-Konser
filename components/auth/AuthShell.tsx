"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, type CSSProperties, type ReactNode } from "react";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { Big_Shoulders, Instrument_Sans } from "next/font/google";
import styles from "./auth.module.css";

// Font sama dengan landing, kategori, wishlist, dan pembelian.
const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export type AuthPerk = { icon: LucideIcon; text: string };

type Props = {
  /** kata besar yang muncul sekilas di tirai pembuka */
  curtainLabel: string;
  kicker: string;
  /** judul poster di sisi kiri (hanya tampil di layar lebar) */
  title: string;
  tagline: string;
  blurb: string;
  perks: AuthPerk[];
  /** label kecil di kanan atas tiket */
  ticketTag: string;
  children: ReactNode;
};

const RIBBON = ["Tiket Konser", "DR Star", "Konser Favoritmu", "Tanpa Ribet"];

/**
 * Kerangka halaman masuk/daftar: poster di kiri, formulir di kanan dalam
 * bentuk tiket sobek. Judul <h1> berada di dalam formulir (children).
 */
export default function AuthShell({
  curtainLabel,
  kicker,
  title,
  tagline,
  blurb,
  perks,
  ticketTag,
  children,
}: Props) {
  const ringId = `ring-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className={`${display.variable} ${body.variable} ${styles.root}`}>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.wrap}>
        <div>
          <Link href="/" className={styles.back}>
            <ArrowLeft size={16} />
            Beranda
          </Link>
        </div>

        <div className={styles.stage}>
          {/* ---------- poster ---------- */}
          <aside className={styles.poster}>
            <p className={styles.kicker}>{kicker}</p>

            <p className={`${styles.display} ${styles.posterTitle}`} aria-hidden="true">
                           {title.split(" ").map((word, wi, words) => {
                const offset = words.slice(0, wi).reduce((n, w) => n + w.length + 1, 0);
                return (
                  <span key={wi} className={styles.word}>
                    {Array.from(word).map((ch, i) => (
                      <span key={i} className={styles.letter} style={{ "--d": offset + i } as CSSProperties}>
                        {ch}
                      </span>
                    ))}
                    {wi < words.length - 1 && <span className={styles.space} />}
                  </span>
                );
              })}
            </p>

            <p className={styles.tagline}>{tagline}</p>
            <p className={styles.blurb}>{blurb}</p>

            <div className={styles.scene}>
              <ul className={styles.perks}>
                {perks.map(({ icon: Icon, text }) => (
                  <li key={text} className={styles.perk}>
                    <span className={styles.perkIcon}>
                      <Icon size={17} strokeWidth={1.9} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              <div className={styles.sunWrap} aria-hidden="true">
                <div className={styles.sun}>
                  <Image
                    src="/ballonbaru1.png"
                    alt=""
                    fill
                    priority
                    sizes="264px"
                    className={styles.sunImg}
                  />
                </div>
                <svg className={styles.stamp} viewBox="0 0 200 200">
                  <defs>
                    <path id={ringId} d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
                  </defs>
                  <text
                    fontSize="13"
                    fontWeight="700"
                    fill="currentColor"
                    textLength="508"
                    lengthAdjust="spacing"
                    style={{ textTransform: "uppercase" }}
                  >
                    <textPath href={`#${ringId}`}>Tiket Konser • DR Star • Tiket Konser • DR Star •</textPath>
                  </text>
                </svg>
              </div>
            </div>

            <div className={styles.ribbon} aria-hidden="true">
              <div className={styles.ribbonTrack}>
                {[0, 1].map((g) => (
                  <div key={g} style={{ display: "flex" }}>
                    {[...RIBBON, ...RIBBON].map((word, i) => (
                      <span key={i} className={`${styles.display} ${styles.ribbonItem}`}>
                        {word}
                        {"  •  "}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ---------- tiket / formulir ---------- */}
          <section className={styles.ticket}>
            <div className={styles.stub}>
              <Link href="/" className={styles.logo} aria-label="DR Star — ke beranda">
                <Image
                  src="/logobaru.png"
                  alt="DR Star"
                  width={707}
                  height={353}
                  priority
                  className={styles.logoImg}
                />
              </Link>
              <span className={styles.stubTag}>{ticketTag}</span>
            </div>

            <div className={styles.perf} aria-hidden="true">
              <span className={styles.perfLine} />
            </div>

            <div className={styles.body}>{children}</div>
          </section>
        </div>
      </div>

      <div className={`${styles.curtain} ${styles.intro}`} aria-hidden="true">
        <div className={styles.panelBack} />
        <div className={styles.panelFront}>
          <span className={`${styles.display} ${styles.curtainLabel}`}>{curtainLabel}</span>
        </div>
      </div>
    </div>
  );
}