"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Compass,
  UserCheck,
  Ticket,
  CreditCard,
  RotateCcw,
  ShieldAlert,
  RefreshCw,
  Database,
  Settings2,
  Lock,
  Share2,
  Cookie,
  type LucideIcon,
} from "lucide-react";

type LegalVariant = "terms" | "privacy";

type LegalSection = {
  icon: LucideIcon;
  title: string;
  summary: string;
  content: string | string[];
};

const TERMS_SECTIONS: LegalSection[] = [
  {
    icon: Compass,
    title: "Menggunakan DRStar",
    summary: "Ketentuan dasar penggunaan platform.",
    content:
      "DRStar membantu kamu menemukan informasi event dan memesan tiket secara online. Dengan menggunakan layanan ini, kamu dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan yang berlaku, serta setuju menggunakan layanan secara bertanggung jawab dan sesuai peraturan yang berlaku.",
  },
  {
    icon: UserCheck,
    title: "Tanggung Jawab Pengguna",
    summary: "Keakuratan data yang kamu berikan.",
    content:
      "Kamu bertanggung jawab untuk memberikan informasi yang benar, lengkap, dan terbaru saat melakukan pendaftaran maupun pemesanan tiket. Data yang tidak akurat dapat memengaruhi proses pemesanan dan keabsahan tiket.",
  },
  {
    icon: Ticket,
    title: "Pemesanan Tiket",
    summary: "Ketentuan mengikuti penyelenggara event.",
    content:
      "Setiap pemesanan yang berhasil dilakukan akan mengikuti ketentuan dari event atau penyelenggara terkait. Pastikan kembali informasi event, jadwal, lokasi, dan jumlah tiket sebelum menyelesaikan pemesanan, karena kesalahan input menjadi tanggung jawab pengguna.",
  },
  {
    icon: CreditCard,
    title: "Pembayaran",
    summary: "Diproses melalui metode resmi DRStar.",
    content:
      "Pembayaran tiket dilakukan melalui metode pembayaran yang tersedia di platform DRStar. Pesanan akan diproses setelah pembayaran berhasil dikonfirmasi sesuai dengan ketentuan yang berlaku.",
  },
  {
    icon: RotateCcw,
    title: "Pembatalan & Pengembalian Dana",
    summary: "Kebijakan berbeda tiap event.",
    content:
      "Kebijakan pembatalan dan pengembalian dana dapat berbeda pada setiap event. Kami menyarankan untuk membaca ketentuan event secara saksama sebelum melakukan pembelian tiket.",
  },
  {
    icon: ShieldAlert,
    title: "Aktivitas Terlarang",
    summary: "Batasan penggunaan layanan.",
    content:
      "Pengguna dilarang menggunakan layanan DRStar untuk tindakan yang melanggar hukum, melakukan penipuan, menyalahgunakan sistem, atau mengganggu keamanan dan kenyamanan pengguna lain.",
  },
  {
    icon: RefreshCw,
    title: "Perubahan Ketentuan",
    summary: "Pembaruan berkala oleh DRStar.",
    content:
      "DRStar berhak mengubah atau memperbarui syarat dan ketentuan sewaktu-waktu. Perubahan akan berlaku sejak dipublikasikan pada website DRStar.",
  },
];

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    icon: Database,
    title: "Informasi yang Kami Kumpulkan",
    summary: "Data yang diperlukan untuk layanan.",
    content:
      "DRStar dapat mengumpulkan informasi seperti nama, alamat email, nomor telepon, serta data lain yang diperlukan untuk menyediakan layanan dan memproses pemesanan tiket.",
  },
  {
    icon: Settings2,
    title: "Bagaimana Kami Menggunakan Informasi",
    summary: "Untuk memproses dan meningkatkan layanan.",
    content: [
      "Memproses pemesanan tiket",
      "Menghubungi pengguna terkait pesanan atau event",
      "Memberikan informasi dan pembaruan layanan",
      "Meningkatkan kualitas layanan DRStar",
      "Menjaga keamanan sistem dan mencegah penyalahgunaan",
    ],
  },
  {
    icon: Lock,
    title: "Perlindungan Data",
    summary: "Langkah keamanan yang kami terapkan.",
    content:
      "Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi data pribadi pengguna dari akses, penggunaan, atau penyebaran yang tidak sah.",
  },
  {
    icon: Share2,
    title: "Berbagi Informasi",
    summary: "Tidak dijual ke pihak ketiga.",
    content:
      "DRStar tidak akan menjual atau menyebarkan informasi pribadi pengguna kepada pihak lain tanpa izin, kecuali diperlukan untuk proses layanan, pembayaran, penyelenggaraan event, atau diwajibkan oleh hukum.",
  },
  {
    icon: Cookie,
    title: "Cookie",
    summary: "Meningkatkan pengalaman penggunaan.",
    content:
      "Kami dapat menggunakan cookie atau teknologi serupa untuk meningkatkan pengalaman pengguna, memahami penggunaan website, dan membantu pengembangan layanan.",
  },
  {
    icon: UserCheck,
    title: "Hak Pengguna",
    summary: "Akses atas data pribadimu.",
    content:
      "Kamu dapat menghubungi tim DRStar kapan saja untuk menanyakan informasi mengenai data pribadi yang digunakan dalam layanan.",
  },
  {
    icon: RefreshCw,
    title: "Pembaruan Kebijakan",
    summary: "Perubahan dipublikasikan secara terbuka.",
    content:
      "Kebijakan Privasi ini dapat diperbarui sewaktu-waktu. Perubahan akan dipublikasikan melalui website DRStar. Dengan menggunakan layanan DRStar, kamu menyetujui pengumpulan dan penggunaan informasi sesuai kebijakan ini.",
  },
];

const COPY: Record<
  LegalVariant,
  { label: string; title: string; description: string }
> = {
  terms: {
    label: "Legalitas",
    title: "Syarat & Ketentuan",
    description:
      "Ringkasan ketentuan penggunaan layanan DRStar, disusun agar mudah dipahami sebelum kamu memesan tiket.",
  },
  privacy: {
    label: "Legalitas",
    title: "Kebijakan Privasi",
    description:
      "Bagaimana DRStar mengumpulkan, menggunakan, dan melindungi data pribadimu di seluruh platform.",
  },
};

export default function LegalContent({ variant }: { variant: LegalVariant }) {
  const sections = variant === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;
  const copy = COPY[variant];
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      {/* Slim top bar */}
      <header className="border-b border-[#E5E7EB] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logobaru.png"
              alt="DRStar"
              width={120}
              height={120}
              priority
              className="h-8 w-auto object-contain"
            />
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0F766E]"
          >
            <ArrowLeft size={15} />
            Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-16 pt-10 md:pt-14">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#9CA3AF]">
          <Link href="/" className="hover:text-[#0F766E]">
            Beranda
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#0F766E]">{copy.title}</span>
        </div>

        {/* Header */}
        <div className="mt-4 flex flex-col gap-6 border-b border-[#E5E7EB] pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F59E0B]">
              {copy.label}
            </span>
            <h1 className="mt-2 text-3xl font-bold text-[#1F2937] md:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280]">
              {copy.description}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 md:items-end">
            {/* Pill switcher */}
            <div className="flex rounded-full border border-[#E5E7EB] bg-white p-1 text-xs font-semibold">
              <Link
                href="/terms"
                className={`rounded-full px-3.5 py-1.5 transition-colors ${
                  variant === "terms"
                    ? "bg-[#0F766E] text-white"
                    : "text-[#6B7280] hover:text-[#0F766E]"
                }`}
              >
                Ketentuan
              </Link>
              <Link
                href="/privacy"
                className={`rounded-full px-3.5 py-1.5 transition-colors ${
                  variant === "privacy"
                    ? "bg-[#0F766E] text-white"
                    : "text-[#6B7280] hover:text-[#0F766E]"
                }`}
              >
                Privasi
              </Link>
            </div>
          </div>
        </div>

        {/* Accordion sections */}
        <div className="mt-6 divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(31,41,55,0.04)]">
          {sections.map((section, index) => {
            const isOpen = openIndex === index;
            const Icon = section.icon;
            return (
              <div key={section.title}>
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#FAFAF9] md:px-6"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F766E]/[0.08] text-[#0F766E]">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] md:text-[15px]">
                      {index + 1}. {section.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[#9CA3AF] md:text-sm">
                      {section.summary}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#0F766E]" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid overflow-hidden transition-all duration-200 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="min-h-0">
                    <div className="px-5 pb-5 pl-[4.25rem] pr-6 md:px-6 md:pl-[4.75rem]">
                      {Array.isArray(section.content) ? (
                        <ul className="space-y-1.5">
                          {section.content.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-sm leading-relaxed text-[#6B7280]"
                            >
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#0F766E]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm leading-relaxed text-[#6B7280]">
                          {section.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Acceptance note */}
        <p className="mt-6 text-center text-xs leading-relaxed text-[#9CA3AF]">
          Dengan terus menggunakan DRStar, kamu menyetujui{" "}
          {variant === "terms" ? (
            <Link href="/terms" className="font-medium text-[#0F766E] hover:underline">
              Syarat & Ketentuan
            </Link>
          ) : (
            <Link href="/privacy" className="font-medium text-[#0F766E] hover:underline">
              Kebijakan Privasi
            </Link>
          )}{" "}
          ini.
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-[#9CA3AF] md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/logobaru.png"
              alt="DRStar"
              width={80}
              height={80}
              className="h-5 w-auto object-contain opacity-80"
            />
            <span>&copy; 2026 DRStar. Seluruh hak cipta dilindungi.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-[#0F766E]">
              Syarat & Ketentuan
            </Link>
            <Link href="/privacy" className="hover:text-[#0F766E]">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}