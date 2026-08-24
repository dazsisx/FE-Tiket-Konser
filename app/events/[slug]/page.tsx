import { notFound } from "next/navigation";
import { fetchEventById } from "@/utils/api";
import EventDetail from "@/components/events/detail";

// NOTE: folder tetap bernama [slug] (biar gak perlu rename struktur folder),
// tapi isinya sekarang adalah ID numerik dari database, karena model Event
// di backend belum punya kolom slug tersendiri.
export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await fetchEventById(slug).catch(() => null);

  if (!event) return notFound();

  return <EventDetail event={event} />;
}