import type { PesananRiwayat } from "@/utils/api";

/**
 * Status tampilan sebuah pesanan. Diturunkan dari data backend:
 * status_bayar (pending | lunas | ditolak | kadaluarsa) dan ada-tidaknya bukti bayar.
 * Frontend tidak pernah menentukan sendiri apakah pesanan sudah lunas.
 */
export type StatusKey = "menunggu-pembayaran" | "menunggu-verifikasi" | "berhasil" | "ditolak" | "kedaluwarsa";

export type StatusInfo = {
  key: StatusKey;
  label: string;
  /** kelas untuk lencana status */
  badge: string;
  /** warna titik kecil di lencana / filter */
  dot: string;
};

const INFO: Record<StatusKey, Omit<StatusInfo, "key">> = {
  "menunggu-pembayaran": {
    label: "Menunggu Pembayaran",
    badge: "bg-[#FFFBEB] text-[#B45309] ring-[#F59E0B]/30",
    dot: "bg-[#F59E0B]",
  },
  "menunggu-verifikasi": {
    label: "Menunggu Verifikasi",
    badge: "bg-[#FFFBEB] text-[#B45309] ring-[#F59E0B]/30",
    dot: "bg-[#F59E0B]",
  },
  berhasil: {
    label: "Berhasil",
    badge: "bg-[#ECFDF5] text-[#0F766E] ring-[#0F766E]/25",
    dot: "bg-[#0F766E]",
  },
  ditolak: {
    label: "Ditolak",
    badge: "bg-red-50 text-red-600 ring-red-200",
    dot: "bg-red-500",
  },
  kedaluwarsa: {
    label: "Kedaluwarsa",
    badge: "bg-[#F3F4F6] text-[#6B7280] ring-[#E5E7EB]",
    dot: "bg-[#9CA3AF]",
  },
};

export const STATUS_ORDER: StatusKey[] = [
  "menunggu-pembayaran",
  "menunggu-verifikasi",
  "berhasil",
  "ditolak",
  "kedaluwarsa",
];

export function statusLabel(key: StatusKey): string {
  return INFO[key].label;
}

export function statusOf(p: Pick<PesananRiwayat, "status_bayar" | "bukti_bayar">): StatusInfo {
  let key: StatusKey;
  switch (p.status_bayar) {
    case "lunas":
      key = "berhasil";
      break;
    case "ditolak":
      key = "ditolak";
      break;
    case "kadaluarsa":
      key = "kedaluwarsa";
      break;
    default:
      key = p.bukti_bayar ? "menunggu-verifikasi" : "menunggu-pembayaran";
  }
  return { key, ...INFO[key] };
}

/** Waktu transaksi dibuat (Sequelize mengirim createdAt, created_at dijaga sebagai cadangan). */
export function waktuPesanan(p: Pick<PesananRiwayat, "createdAt" | "created_at">): string | null {
  return p.createdAt ?? p.created_at ?? null;
}
