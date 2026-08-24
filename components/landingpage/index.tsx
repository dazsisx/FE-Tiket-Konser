import Footer from "@/components/footer";
import HeroAndTopEvents from "./hero-top-events";
import { fetchEvents } from "@/utils/api";

export default async function LandingPage() {
  // Kalau BE belum jalan / error, fallback ke array kosong biar halaman
  // tetap render (nanti UI-nya nampilin empty state, bukan crash).
  const events = await fetchEvents().catch(() => []);

  return (
    <div>
      <HeroAndTopEvents events={events} />
      <Footer />
    </div>
  );
}