import { useId, type CSSProperties } from "react";
import styles from "./flyer.module.css";

export type HeroStat = { value: string | number; label: string };

/** Kepala halaman: kicker, judul poster, stempel berputar, kalimat pembuka, dan ringkasan angka. */
export default function FlyerHero({
  kicker,
  title,
  tagline,
  blurb,
  stampValue,
  stampLabel,
  stats,
  statsLabel,
}: {
  kicker: string;
  title: string;
  tagline: string;
  blurb?: string;
  /** angka besar di tengah stempel; kosongkan untuk menyembunyikan stempel */
  stampValue?: string | number;
  stampLabel?: string;
  stats?: HeroStat[];
  statsLabel?: string;
}) {
  const ringId = `ring-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ring = stampLabel ?? title;

  return (
    <header className={styles.hero}>
      <p className={styles.kicker}>{kicker}</p>

      <h1 className={`${styles.display} ${styles.title} ${stampValue !== undefined ? styles.titleStamp : ""}`} aria-label={title}>
        {Array.from(title).map((ch, i) =>
          ch === " " ? (
            <span key={i} className={styles.space} aria-hidden="true" />
          ) : (
            <span key={i} className={styles.letter} style={{ "--d": i } as CSSProperties} aria-hidden="true">
              {ch}
            </span>
          )
        )}
      </h1>

      {stampValue !== undefined && (
        <svg className={styles.stamp} viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <path id={ringId} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <g className={styles.stampRing}>
            <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 6" />
            <text fontSize="17" fontWeight="700" letterSpacing="4.2" fill="currentColor" style={{ textTransform: "uppercase" }}>
              <textPath href={`#${ringId}`}>Tiket Konser • {ring} • Tiket Konser • {ring} •</textPath>
            </text>
          </g>
          <text className={styles.stampNum} x="100" y="118" textAnchor="middle" fontSize="64">
            {stampValue}
          </text>
        </svg>
      )}

      <p className={styles.tagline}>{tagline}</p>
      {blurb && <p className={styles.blurb}>{blurb}</p>}

      {stats && stats.length > 0 && (
        <ul className={styles.stats} aria-label={statsLabel ?? "Ringkasan"}>
          {stats.map((s) => (
            <li key={s.label} className={styles.stat}>
              <div className={`${styles.display} ${styles.statValue}`}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
