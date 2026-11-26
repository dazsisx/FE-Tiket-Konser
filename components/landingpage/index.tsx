import { Suspense } from "react";
import Footer from "@/components/footer";
import HeroAndTopEvents from "./hero-top-events";
import { fetchEvents } from "@/utils/api";

export default async function LandingPage() {
  // Kalau BE belum jalan / error, fallback ke array kosong biar halaman
  // tetap render (nanti UI-nya nampilin empty state, bukan crash).
  const events = await fetchEvents().catch(() => []);

  return (
    <div>
      {/* useSearchParams (filter ?kota=) wajib berada di dalam Suspense */}
      <Suspense fallback={null}>
        <HeroAndTopEvents events={events} />
      </Suspense>
      <Footer />
    </div>
  );
}