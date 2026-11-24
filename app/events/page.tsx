import { redirect } from "next/navigation";
import { toSlug } from "@/utils/kategori";

/**
 * Link lama /events?kategori=<slug> dialihkan ke halaman kategori baru.
 * Tanpa parameter (atau tidak dikenal) -> /kategori/konser.
 * Rute detail /events/[id] tidak terpengaruh.
 */
export default async function EventsIndex({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string | string[] }>;
}) {
  const { kategori } = await searchParams;
  const value = Array.isArray(kategori) ? kategori[0] : kategori;
  redirect(`/kategori/${toSlug(value) ?? "konser"}`);
}
