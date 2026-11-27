import { formatRupiah, type KategoriTiket } from "@/utils/api";
import styles from "./flyer.module.css";

/** Satu baris kelas tiket: nama, harga, dan batang sisa kuota. */
export function Tier({ tier }: { tier: KategoriTiket }) {
  const sisa = Math.max(0, tier.sisa_kuota ?? tier.kuota - tier.terjual);
  const habis = sisa === 0;
  const persen = tier.kuota > 0 ? Math.min(100, (sisa / tier.kuota) * 100) : 0;
  return (
    <li className={`${styles.tier} ${habis ? styles.tierSoldOut : ""}`}>
      <div className={styles.tierLine}>
        <span className={styles.tierName}>{tier.nama_kelas}</span>
        <span className={styles.tierPrice}>{habis ? "Habis" : formatRupiah(tier.harga)}</span>
      </div>
      <div className={styles.tierBar}>
        <div className={styles.tierTrack} aria-hidden="true">
          <span className={styles.tierFill} style={{ width: `${persen}%` }} />
        </div>
        <span className={styles.tierLeft}>{habis ? "0 tersisa" : `${sisa.toLocaleString("id-ID")} tersisa`}</span>
      </div>
    </li>
  );
}
