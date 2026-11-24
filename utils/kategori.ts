import type { EventItem } from "@/utils/api";

/**
 * Daftar kategori halaman /kategori/<slug>.
 * `label` HARUS sama dengan nilai kolom events.kategori_event di backend
 * (lihat BE-TiketKonser/utils/kategoriEvent.js).
 */
export type KategoriSlug = "konser" | "festival" | "musik-live" | "akustik";

export type KategoriTheme = {
  /** warna halaman */
  bg: string;
  /** warna teks di atas bg */
  ink: string;
  /** teks sekunder di atas bg */
  muted: string;
  /** warna penegas: panel tirai pertama, penanda aktif, harga */
  accent: string;
  /** teks di atas accent */
  onAccent: string;
  /** warna garis tipis */
  line: string;
};

export type KategoriDef = {
  slug: KategoriSlug;
  label: string;
  /** kalimat pendek di bawah judul besar */
  tagline: string;
  /** satu baris penjelasan isi kategori */
  blurb: string;
  theme: KategoriTheme;
};

export const KATEGORI: KategoriDef[] = [
  {
    slug: "konser",
    label: "Konser",
    tagline: "Satu panggung, satu nama, ribuan suara.",
    blurb: "Tur artis dan show tunggal dengan kelas tiket bertingkat, dari tribun sampai barisan depan.",
    theme: {
      bg: "#0F3D38",
      ink: "#FFF4DC",
      muted: "rgba(255,244,220,0.72)",
      accent: "#F6B93B",
      onAccent: "#1B2A27",
      line: "rgba(255,244,220,0.22)",
    },
  },
  {
    slug: "festival",
    label: "Festival",
    tagline: "Berhari-hari, banyak panggung, tanpa jeda.",
    blurb: "Pass harian dan multi-hari, paket rombongan, dan tiket early entry.",
    theme: {
      bg: "#C42E16",
      ink: "#FFF1E0",
      muted: "rgba(255,241,224,0.8)",
      accent: "#FFD23F",
      onAccent: "#3A1208",
      line: "rgba(255,241,224,0.3)",
    },
  },
  {
    slug: "musik-live",
    label: "Musik Live",
    tagline: "Ruang kecil, suara penuh, jarak sedekat itu.",
    blurb: "Showcase dan gig di venue intim. Biasanya hanya ada presale dan tiket di tempat.",
    theme: {
      bg: "#111418",
      ink: "#F4F1EA",
      muted: "rgba(244,241,234,0.7)",
      accent: "#6EE7B7",
      onAccent: "#07211A",
      line: "rgba(244,241,234,0.2)",
    },
  },
  {
    slug: "akustik",
    label: "Akustik",
    tagline: "Gitar, suara, dan ruangan yang ikut diam.",
    blurb: "Sesi duduk dan nyanyi bareng. Cari kursi, bawa telinga.",
    theme: {
      bg: "#E9DCC3",
      ink: "#2B1D12",
      muted: "rgba(43,29,18,0.72)",
      accent: "#B4501E",
      onAccent: "#FFF6E6",
      line: "rgba(43,29,18,0.24)",
    },
  },
];

export const KATEGORI_BY_SLUG: Record<KategoriSlug, KategoriDef> = Object.fromEntries(
  KATEGORI.map((k) => [k.slug, k])
) as Record<KategoriSlug, KategoriDef>;

export function isKategoriSlug(value: string): value is KategoriSlug {
  return value in KATEGORI_BY_SLUG;
}

/** Terima slug atau label ("Musik Live") dan kembalikan slug baku, atau null. */
export function toSlug(value?: string | null): KategoriSlug | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  const hit = KATEGORI.find((k) => k.slug === v || k.label.toLowerCase() === v);
  return hit?.slug ?? null;
}

/**
 * Kategori sebuah event.
 * 1) Pakai kolom kategori_event dari backend bila ada.
 * 2) Cadangan untuk event lama yang belum dikategorikan admin: tebak dari nama,
 *    genre artis, dan nama kelas tiket. Event yang tidak cocok apa pun jatuh ke "konser".
 */
export function kategoriOf(event: EventItem): KategoriSlug {
  const explicit = toSlug(event.kategori_event);
  if (explicit) return explicit;

  const nama = event.nama_event.toLowerCase();
  const genre = (event.artis?.genre ?? "").toLowerCase();
  const kelas = (event.kategori_tiket ?? []).map((k) => k.nama_kelas.toLowerCase());

  if (/akustik|acoustic|unplugged/.test(`${nama} ${genre}`)) return "akustik";
  if (/festival|fest\b|day pass|\d-day/.test(nama) || kelas.some((n) => /\b(day|daily) pass\b|\d-day pass/.test(n))) {
    return "festival";
  }
  return "konser";
}

/** Harga terendah dan tertinggi dari kelas tiket; null bila belum ada kelas. */
export function rentangHarga(event: EventItem): { min: number; max: number } | null {
  const harga = (event.kategori_tiket ?? []).map((k) => parseFloat(k.harga)).filter((n) => !Number.isNaN(n));
  if (!harga.length) return null;
  return { min: Math.min(...harga), max: Math.max(...harga) };
}

const WIB = "Asia/Jakarta";

/** "Sabtu, 12 Desember 2026" menurut WIB. */
export function formatHariTanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: WIB,
  }).format(new Date(iso));
}

/** "19.00 WIB"; string kosong bila jam tepat 00.00 (di data seed berarti jam belum diketahui). */
export function formatJamWib(iso: string): string {
  const jam = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: WIB }).format(new Date(iso));
  if (jam === "00:00" || jam === "24:00") return "";
  return (
    new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: WIB })
      .format(new Date(iso))
      .replace(":", ".") + " WIB"
  );
}

/** Potongan untuk blok tanggal: { hari: "12", bulan: "DES" } menurut WIB. */
export function potongTanggal(iso: string): { hari: string; bulan: string } {
  const d = new Date(iso);
  return {
    hari: new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone: WIB }).format(d),
    bulan: new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: WIB }).format(d).replace(".", "").toUpperCase(),
  };
}
