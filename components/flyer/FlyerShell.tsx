import type { ReactNode } from "react";
import BackButton from "@/components/ui/BackButton";
import { themeVars, type FlyerTheme } from "./theme";
import styles from "./flyer.module.css";

/**
 * Kerangka halaman bergaya flyer: latar tema, butiran kertas, tombol kembali,
 * dan tirai pembuka yang memudar. Font (--font-display / --font-body) dipasang
 * oleh page.tsx yang membungkus komponen ini, sama seperti halaman kategori.
 */
export default function FlyerShell({
  theme,
  curtainLabel,
  children,
}: {
  theme: FlyerTheme;
  /** kata besar yang muncul sekilas di tirai pembuka */
  curtainLabel: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.root} style={themeVars(theme)}>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.wrap}>
        <BackButton fallbackHref="/" label="Beranda" className={styles.back} />
        {children}
      </div>

      <div className={`${styles.curtain} ${styles.intro}`} aria-hidden="true">
        <div className={styles.panelBack} style={{ background: theme.accent }} />
        <div className={styles.panelFront} style={{ background: theme.bg }}>
          <span className={`${styles.display} ${styles.curtainLabel}`} style={{ color: theme.ink }}>
            {curtainLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
