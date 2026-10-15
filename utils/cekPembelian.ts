// Pemanggil API publik "cek pembelian" (tanpa login).
// Base URL mengikuti NEXT_PUBLIC_API_URL (tanpa "/api" di belakangnya), default ke backend lokal.
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");

export type StatusBayar = "pending" | "lunas" | "ditolak" | "kadaluarsa";

export interface HasilCekPembelian {
  kode_tiket: string;
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
  qr_code: string | null;
}

export interface CekPembelianInput {
  kode_tiket: string;
  email?: string;
  no_telepon?: string;
}

export async function cekPembelian(input: CekPembelianInput): Promise<HasilCekPembelian> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/pesanan/cek`, {
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