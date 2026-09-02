/**
 * API client terpusat buat komunikasi ke backend Tiket Konser.
 * ------------------------------------------------------------
 * WAJIB: buat file .env.local di root project FE, isi:
 *   NEXT_PUBLIC_API_URL=http://localhost:5000/api
 * (sesuaikan port dengan PORT yang dipakai backend kamu — ingat app.js
 * backend default PORT=3000, SAMA kayak port default Next.js. Ubah salah
 * satu, misal set PORT=5000 di .env backend, biar gak tabrakan.)
 */

export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:5000";

export const API_BASE_URL = `${API_ORIGIN}/api`;

export type Artis = {
  id: number;
  nama: string;
  bio: string | null;
  foto: string | null;
  genre: string | null;
};

export type KategoriTiket = {
  id: number;
  event_id: number;
  nama_kelas: string;
  harga: string; // DECIMAL dari Sequelize dikirim sebagai string
  kuota: number;
  terjual: number;
  sisa_kuota?: number; // cuma ada di response GET /event/:id
};

export type EventItem = {
  id: number;
  nama_event: string;
  deskripsi: string | null;
  tanggal: string; // ISO date string
  lokasi: string;
  poster: string | null;
  artis_id: number;
  status: "buka" | "tutup";
  artis?: Artis;
  kategori_tiket?: KategoriTiket[];
};

export type AuthUser = {
  id: number;
  nama: string;
  email: string;
  role: "admin" | "pelanggan";
};

type AuthData = AuthUser & { token: string };

type ApiListResponse<T> = { success: boolean; total: number; data: T[] };
type ApiItemResponse<T> = { success: boolean; data: T; message?: string };
type ApiMessageResponse = { success: boolean; message: string };
type ApiDataResponse<T> = { success: boolean; message: string; data: T };

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Request gagal (status ${res.status})`);
  }

  return res.json();
}

/** GET /api/event — semua event */
export async function fetchEvents(): Promise<EventItem[]> {
  const res = await apiFetch<ApiListResponse<EventItem>>("/event");
  return res.data;
}

/** GET /api/event/:id — detail satu event (sudah termasuk kategori_tiket + sisa_kuota) */
export async function fetchEventById(id: string | number): Promise<EventItem> {
  const res = await apiFetch<ApiItemResponse<EventItem>>(`/event/${id}`);
  return res.data;
}

/** POST /api/auth/register — daftar akun pelanggan baru */
export async function registerUser(payload: {
  nama: string;
  email: string;
  password: string;
  no_telepon?: string;
}): Promise<AuthData> {
  const res = await apiFetch<ApiItemResponse<AuthData>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

/** POST /api/auth/login — login admin & pelanggan */
export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthData> {
  const res = await apiFetch<ApiItemResponse<AuthData>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

/** GET /api/auth/profile — profil user yang sedang login (butuh token) */
export async function fetchProfile(): Promise<AuthUser> {
  const res = await apiFetch<ApiItemResponse<AuthUser>>("/auth/profile");
  return res.data;
}

// ===== Forgot Password Flow =====

/** POST /api/auth/forgot-password — kirim kode OTP ke email */
export async function forgotPassword(payload: {
  email: string;
}): Promise<ApiMessageResponse> {
  return apiFetch<ApiMessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /api/auth/verify-reset-otp — verifikasi 6 digit OTP, dapat resetToken */
export async function verifyResetOtp(payload: {
  email: string;
  otp: string;
}): Promise<{ resetToken: string }> {
  const res = await apiFetch<ApiDataResponse<{ resetToken: string }>>(
    "/auth/verify-reset-otp",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return res.data;
}

/** POST /api/auth/resend-reset-otp — kirim ulang kode OTP */
export async function resendResetOtp(payload: {
  email: string;
}): Promise<ApiMessageResponse> {
  return apiFetch<ApiMessageResponse>("/auth/resend-reset-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /api/auth/reset-password — set kata sandi baru pakai resetToken */
export async function resetPassword(payload: {
  email: string;
  resetToken: string;
  password: string;
}): Promise<ApiMessageResponse> {
  return apiFetch<ApiMessageResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ===== Penyimpanan sesi login (localStorage) =====
const TOKEN_KEY = "drstar_token";
const USER_KEY = "drstar_user";

/** Simpan token + data user ke localStorage setelah login/register berhasil */
export function saveAuth(data: AuthData): void {
  if (typeof window === "undefined") return;
  const { token, ...user } = data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Ambil token JWT yang tersimpan (null kalau belum login / di server) */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Ambil data user yang sedang login dari localStorage */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Cek cepat apakah user sedang login */
export function isLoggedIn(): boolean {
  return getToken() !== null;
}

/** Hapus sesi login (logout) */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Backend nyimpen path poster dari multer (mis. "uploads\\1699-file.png" di
 * Windows), bukan URL penuh. Helper ini gabungin ke origin backend + rapiin
 * slash-nya. Kalau posternya kosong, return null (dipakai buat fallback ke
 * placeholder di UI).
 */
export function getImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${API_ORIGIN}/${clean}`;
}

export function formatRupiah(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "Rp0";
  return `Rp${Math.round(num).toLocaleString("id-ID")}`;
}

export function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatJam(iso: string): string {
  return (
    new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

/** Harga tiket termurah dari daftar kategori tiket suatu event */
export function getHargaTermurah(kategoriTiket?: KategoriTiket[]): string {
  if (!kategoriTiket || kategoriTiket.length === 0) return "Belum tersedia";
  const min = Math.min(...kategoriTiket.map((k) => parseFloat(k.harga)));
  return formatRupiah(min);
}