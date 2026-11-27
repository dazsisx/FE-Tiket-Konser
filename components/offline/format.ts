import type { EventItem, PesananOffline } from "@/utils/api";

/** createdAt (Sequelize underscored) dengan cadangan created_at. */
export function orderDate(order: Pick<PesananOffline, "createdAt" | "created_at">): string | undefined {
  return order.createdAt ?? order.created_at;
}

export function formatDateTime(value?: string): string {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

/** Kunci tanggal YYYY-MM-DD menurut WIB (sama dengan acuan "hari ini" di backend). */
export function wibDateKey(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(date);
}

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Apakah event masih boleh dijual di loket. Aturan sama dengan assertEventOpenForSale di backend
 * (utils/eventSales.js): status "aktif" dan belum lewat 23:59:59 WIB pada tanggal acara.
 * Backend tetap yang memutuskan; ini hanya agar petugas tidak memilih event yang pasti ditolak.
 */
export function isEventOnSale(event: Pick<EventItem, "status" | "tanggal">, now: Date = new Date()): boolean {
  if (event.status !== "aktif") return false;
  const date = new Date(event.tanggal);
  if (Number.isNaN(date.getTime())) return false;
  const startOfDay = Math.floor((date.getTime() + WIB_OFFSET_MS) / DAY_MS) * DAY_MS - WIB_OFFSET_MS;
  return now.getTime() < startOfDay + DAY_MS;
}

export function buyerName(order: PesananOffline): string {
  return order.nama_pembeli ?? order.user?.nama ?? "Pembeli";
}
