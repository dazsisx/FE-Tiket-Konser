import type { CSSProperties } from "react";

/** Warna per halaman. Nilainya diturunkan dari token merek (emerald, gold, charcoal) + gaya halaman kategori. */
export type FlyerTheme = {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  onAccent: string;
  line: string;
  /** warna penegas di atas kertas tiket (harus cukup gelap) */
  ticketAccent: string;
};

export const THEME_WISHLIST: FlyerTheme = {
  bg: "#0C4B46",
  ink: "#FFF4DC",
  muted: "rgba(255,244,220,0.76)",
  accent: "#F59E0B",
  onAccent: "#1F2937",
  line: "rgba(255,244,220,0.24)",
  ticketAccent: "#0F766E",
};

export const THEME_PEMBELIAN: FlyerTheme = {
  bg: "#1F2937",
  ink: "#FFFBF5",
  muted: "rgba(255,251,245,0.74)",
  accent: "#F59E0B",
  onAccent: "#1F2937",
  line: "rgba(255,251,245,0.22)",
  ticketAccent: "#0F766E",
};

export function themeVars(t: FlyerTheme): CSSProperties {
  return {
    "--bg": t.bg,
    "--ink": t.ink,
    "--muted": t.muted,
    "--accent": t.accent,
    "--on-accent": t.onAccent,
    "--line": t.line,
    "--ticket-accent": t.ticketAccent,
    "--ticket-on": "#FFF8EA",
  } as CSSProperties;
}
