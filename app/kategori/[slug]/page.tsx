import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Big_Shoulders, Instrument_Sans } from "next/font/google";
import KategoriExplorer from "@/components/kategori/KategoriExplorer";
import { KATEGORI, KATEGORI_BY_SLUG, isKategoriSlug } from "@/utils/kategori";

// Judul poster: condensed tebal ala flyer gig. Teks biasa: Instrument Sans.
const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return KATEGORI.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isKategoriSlug(slug)) return {};
  const kategori = KATEGORI_BY_SLUG[slug];
  return {
    title: `${kategori.label} — Tiket Konser`,
    description: `${kategori.tagline} ${kategori.blurb}`,
  };
}

export default async function KategoriPage({ params }: Props) {
  const { slug } = await params;
  if (!isKategoriSlug(slug)) notFound();

  return (
    <div className={`${display.variable} ${body.variable}`}>
      <KategoriExplorer initialSlug={slug} />
    </div>
  );
}
