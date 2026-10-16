// Pemanggil API publik "cek pembelian" (tanpa login).
// Base URL memakai API_BASE_URL dari utils/api.ts, supaya satu aturan untuk semua pemanggilan
// (NEXT_PUBLIC_API_URL boleh diisi dengan atau tanpa "/api" di belakangnya).
import { API_BASE_URL } from "./api";

export type StatusBayar = "pending" | "lunas" | "ditolak" | "kadaluarsa";
export type StatusTiket = "aktif" | "terpakai" | "dibatalkan";

/** Satu lembar tiket. qr_code hanya ada untuk tiket yang masih aktif. */
export interface TiketCek {
  nomor_urut: number;
  status: StatusTiket;
  digunakan_pada: string | null;
  qr_code: string | null; // data URL PNG
}

export interface HasilCekPembelian {
  kode_tiket: string; // kode booking
  status_bayar: StatusBayar;
  order_type: "online" | "offline";
  jumlah: number;
  total_harga: number;
  dibuat_pada: string | null;
  nama_pembeli: string | null;
  event: {
    id: number;
    nama_event: string;
    tanggal: string;
    lokasi: string;
    status: string;
  } | null;
  kategori: { nama_kelas: string; harga: number } | null;
  /** true jika bukti bayar sudah diunggah (status pending = menunggu verifikasi admin) */
  bukti_bayar_terunggah: boolean;
  /** Satu QR unik per tiket. Kosong jika pesanan belum lunas. */
  tiket: TiketCek[];
}

export interface CekPembelianInput {
  kode_tiket: string;
  email?: string;
  no_telepon?: string;
}

export async function cekPembelian(input: CekPembelianInput): Promise<HasilCekPembelian> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/pesanan/cek`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server. Coba lagi beberapa saat.");
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? "Terjadi kesalahan. Coba lagi.");
  }
  return json.data as HasilCekPembelian;
}