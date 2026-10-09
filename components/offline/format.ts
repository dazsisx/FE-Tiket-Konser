import type { PesananOffline } from "@/utils/api";

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

export function buyerName(order: PesananOffline): string {
  return order.nama_pembeli ?? order.user?.nama ?? "Pembeli";
}
