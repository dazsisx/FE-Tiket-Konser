import type { Metadata } from "next";
import { Big_Shoulders, Instrument_Sans } from "next/font/google";
import Pembelian from "@/components/pembelian";

// Font sama dengan halaman kategori: judul poster condensed + teks Instrument Sans.
const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Histori Pembelian — Tiket Konser",
  description: "Lihat status pesanan dan tiketmu, dengan atau tanpa akun.",
};

export default function PembelianPage() {
  return (
    <div className={`${display.variable} ${body.variable}`}>
      <Pembelian />
    </div>
  );
}
