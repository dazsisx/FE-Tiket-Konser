import type { StatusKey } from "@/utils/pesanan";

/** Warna lencana status di atas kertas tiket (lihat [data-tone] di flyer.module.css). */
export const TONE: Record<StatusKey, "wait" | "ok" | "bad" | "off"> = {
  "menunggu-pembayaran": "wait",
  "menunggu-verifikasi": "wait",
  berhasil: "ok",
  ditolak: "bad",
  kedaluwarsa: "off",
};

export const TONE_TIKET = { aktif: "ok", terpakai: "off", dibatalkan: "bad" } as const;
