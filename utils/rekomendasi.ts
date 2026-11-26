import type { EventItem } from "@/utils/api";
import { bandingTerlaris, kategoriOf, type KategoriSlug } from "@/utils/kategori";

export type Rekomendasi = {
  /** Acara yang disarankan, skor tertinggi dulu. Kosong bila belum ada sinyal atau tidak ada yang cocok. */
  items: EventItem[];
  /** Kategori yang paling sering muncul di sinyal pengguna (dipakai untuk tujuan "Lihat semua"). */
  kategoriUtama: KategoriSlug | null;
};

/**
 * Rekomendasi sederhana dari event yang pernah disimpan (wishlist) atau dibeli pengguna.
 *
 * Skor sebuah acara = 3 bila artisnya sama dengan salah satu sinyal
 *                     + jumlah sinyal yang kategorinya sama.
 * Acara yang sudah jadi sinyal (sudah disimpan/dibeli) dan yang ada di `kecualiIds` tidak ikut.
 * Seri skor diurutkan dari yang terlaris, lalu yang tanggalnya terdekat.
 *
 * @param semuaEvent  seluruh event, dipakai untuk mengenali kategori & artis dari sinyal
 * @param kandidat    acara yang boleh direkomendasikan (sudah disaring lokasi/status)
 * @param sinyalIds   id event yang disimpan atau dibeli pengguna
 * @param kecualiIds  id yang tidak boleh muncul lagi (mis. yang sudah tampil di rail lain)
 */
export function rekomendasiDariSinyal(
  semuaEvent: EventItem[],
  kandidat: EventItem[],
  sinyalIds: number[],
  kecualiIds: Set<number>,
  batas = 8
): Rekomendasi {
  const sinyal = new Set(sinyalIds);
  const asal = semuaEvent.filter((e) => sinyal.has(e.id));
  if (asal.length === 0) return { items: [], kategoriUtama: null };

  const bobotKategori = new Map<KategoriSlug, number>();
  const artisSinyal = new Set<number>();
  for (const e of asal) {
    const k = kategoriOf(e);
    bobotKategori.set(k, (bobotKategori.get(k) ?? 0) + 1);
    if (e.artis_id) artisSinyal.add(e.artis_id);
  }

  let kategoriUtama: KategoriSlug | null = null;
  let terbanyak = 0;
  bobotKategori.forEach((jumlah, k) => {
    if (jumlah > terbanyak) {
      terbanyak = jumlah;
      kategoriUtama = k;
    }
  });

  const skor = (e: EventItem) => (artisSinyal.has(e.artis_id) ? 3 : 0) + (bobotKategori.get(kategoriOf(e)) ?? 0);

  const items = kandidat
    .filter((e) => !sinyal.has(e.id) && !kecualiIds.has(e.id))
    .map((e) => ({ e, s: skor(e) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || bandingTerlaris(a.e, b.e))
    .slice(0, batas)
    .map((x) => x.e);

  return { items, kategoriUtama };
}
