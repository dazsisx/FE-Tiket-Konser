import type { Metadata } from "next";
import { Big_Shoulders, Instrument_Sans } from "next/font/google";
import Wishlist from "@/components/wishlist";

// Font sama dengan halaman kategori: judul poster condensed + teks Instrument Sans.
const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Wishlist — Tiket Konser",
  description: "Event yang kamu simpan, siap dipesan kapan saja.",
};

export default function WishlistPage() {
  return (
    <div className={`${display.variable} ${body.variable}`}>
      <Wishlist />
    </div>
  );
}
