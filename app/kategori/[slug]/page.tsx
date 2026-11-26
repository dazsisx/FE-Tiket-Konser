import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Big_Shoulders, Instrument_Sans } from "next/font/google";
import KategoriExplorer from "@/components/kategori/KategoriExplorer";
import { PAGE_BY_SLUG, PAGE_KATEGORI, isPageSlug, toSortKey } from "@/utils/kategori";
import { toKotaParam } from "@/utils/kota";

// Judul poster: condensed tebal ala flyer gig. Teks biasa: Instrument Sans.
const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

type Props = {
  params: Promise<{ slug: string }>;
  // /kategori/semua?urut=terlaris  (terdekat | termurah | terlaris)
  // ?kota=jakarta (filter lokasi dari navbar), ?q=kata (pencarian dari navbar)
  searchParams: Promise<{ urut?: string | string[]; kota?: string | string[]; q?: string | string[] }>;
};

export function generateStaticParams() {
  return PAGE_KATEGORI.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  if (!isPageSlug(slug)) return {};
  const kategori = PAGE_BY_SLUG[slug];
  return {
    title: slug === "semua" ? "Semua Acara — Tiket Konser" : `${kategori.label} — Tiket Konser`,
    description: `${kategori.tagline} ${kategori.blurb}`,
  };
}

export default async function KategoriPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!isPageSlug(slug)) notFound();
  const { urut, kota, q } = await searchParams;
  const kataKunci = (Array.isArray(q) ? q[0] : q)?.slice(0, 80);

  return (
    <div className={`${display.variable} ${body.variable}`}>
      <KategoriExplorer
        initialSlug={slug}
        initialSort={toSortKey(urut) ?? undefined}
        initialKota={toKotaParam(kota)}
        initialQ={kataKunci}
      />
    </div>
  );
}
