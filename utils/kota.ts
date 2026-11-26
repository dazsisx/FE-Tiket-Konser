import type { EventItem } from "@/utils/api";

/**
 * Kota event.
 * ------------------------------------------------------------
 * Sumber utama: kolom `events.kota` (diisi admin). Event lama yang kolomnya masih kosong
 * ditebak dari teks `lokasi` lewat daftar kecil di bawah, supaya filter tetap berguna selama
 * data lama belum dirapikan. Kalau semua event sudah punya `kota`, daftar tebakan ini
 * boleh dihapus.
 */

type Kotaish = Pick<EventItem, "lokasi"> & { kota?: string | null };

/** [kata kunci pada teks lokasi, nama kota]. Hanya nama yang tidak ambigu. */
const TEBAKAN: Array<[string, string]> = [
  ["jakarta", "Jakarta"],
  ["gelora bung karno", "Jakarta"],
  ["senayan", "Jakarta"],
  ["istora", "Jakarta"],
  ["jiexpo", "Jakarta"],
  ["ancol", "Jakarta"],
  ["bandung", "Bandung"],
  ["surabaya", "Surabaya"],
  ["yogyakarta", "Yogyakarta"],
  ["jogja", "Yogyakarta"],
  ["yogya", "Yogyakarta"],
  ["semarang", "Semarang"],
  ["malang", "Malang"],
  ["medan", "Medan"],
  ["makassar", "Makassar"],
  ["bali", "Bali"],
  ["denpasar", "Bali"],
  ["badung", "Bali"],
  ["bogor", "Bogor"],
  ["depok", "Depok"],
  ["tangerang", "Tangerang"],
  ["bekasi", "Bekasi"],
  ["surakarta", "Surakarta"],
  ["solo", "Surakarta"],
  ["palembang", "Palembang"],
  ["balikpapan", "Balikpapan"],
  ["samarinda", "Samarinda"],
  ["batam", "Batam"],
  ["manado", "Manado"],
];

const AWALAN = /^(kota administrasi|kota|kabupaten|kab\.?|dki)\s+/i;

function bersihkan(teks: string): string {
  return teks.replace(AWALAN, "").replace(/\s+/g, " ").trim();
}

function judul(teks: string): string {
  return teks
    .toLowerCase()
    .split(" ")
    .map((k) => (k ? k[0].toUpperCase() + k.slice(1) : k))
    .join(" ");
}

/** "Kota Bandung", "bandung ", "BANDUNG" -> "bandung". Dipakai di URL dan untuk mengelompokkan. */
export function kotaSlug(label: string): string {
  return bersihkan(label)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug -> teks tampilan ("jakarta-selatan" -> "Jakarta Selatan"). */
export function kotaLabelDariSlug(slug: string): string {
  return judul(slug.replace(/-/g, " "));
}

/** Nilai ?kota= dari URL -> slug bersih, atau null kalau kosong. */
export function toKotaParam(value?: string | string[] | null): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return null;
  const slug = kotaSlug(v);
  return slug || null;
}

/** Nama kota sebuah event, atau null kalau tidak diketahui. */
export function kotaOf(event: Kotaish): string | null {
  const dariDb = event.kota ? bersihkan(event.kota) : "";
  if (dariDb) return judul(dariDb);

  const lokasi = (event.lokasi ?? "").toLowerCase();
  if (!lokasi) return null;
  for (const [kunci, kota] of TEBAKAN) {
    // cocok per kata supaya "solo" tidak ikut menangkap "solomon"
    if (new RegExp(`(^|[^a-z])${kunci}([^a-z]|$)`).test(lokasi)) return kota;
  }
  return null;
}

export function cocokKota(event: Kotaish, slug: string | null): boolean {
  if (!slug) return true;
  const kota = kotaOf(event);
  return kota !== null && kotaSlug(kota) === slug;
}

export type KotaOption = { slug: string; label: string; count: number };

/** Daftar kota dari event yang ada, terbanyak dulu. Event tanpa kota tidak dihitung. */
export function kotaOptions(events: Kotaish[]): KotaOption[] {
  const map = new Map<string, KotaOption>();
  for (const e of events) {
    const label = kotaOf(e);
    if (!label) continue;
    const slug = kotaSlug(label);
    const ada = map.get(slug);
    if (ada) ada.count += 1;
    else map.set(slug, { slug, label, count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "id"));
}
