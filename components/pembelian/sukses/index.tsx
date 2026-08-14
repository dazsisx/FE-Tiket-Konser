"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  CalendarDays,
  Clock,
  MapPin,
  Info,
  Download,
  Home,
  MessageCircle,
  HelpCircle,
  Mail,
  Phone,
} from "lucide-react";

/**
 * HALAMAN E-TICKET (PEMBAYARAN BERHASIL) — masih DATA DUMMY.
 * ------------------------------------------------------------
 * Layout mengikuti referensi desain yang dikasih, tapi palet warna
 * di-swap total ke skema light DR Star (bukan dark) biar konsisten
 * sama halaman lain (checkout, navbar, dll):
 *   - Dark navy (#111827) → dipakai buat teks utama & aksen ikon,
 *     BUKAN buat background (background di web kamu tetap putih).
 *   - Electric Blue (#2563EB) & Cyan (#06B6D4) → gradient aksen,
 *     sama persis kayak yang dipakai di tombol "Bayar Sekarang" &
 *     header countdown di halaman checkout.
 *   - White (#FFFFFF) → background utama & background card QR.
 *
 * Cara sambungin ke BE nanti:
 * 1. Ganti `orderData` dengan hasil response dari endpoint detail order
 *    (bisa diambil pakai `slug`/orderId dari URL params).
 * 2. `qrValue` sebaiknya isinya kode booking / token unik dari BE,
 *    bukan string bebas — dipakai buat scan validasi masuk venue.
 *    QR di-generate lewat service publik (qrserver.com) dari `qrValue`;
 *    kalau BE sudah generate QR image sendiri, tinggal ganti `qrImageUrl`
 *    jadi URL dari BE.
 * 3. Tombol "Unduh E-Ticket" idealnya trigger download PDF dari BE
 *    (atau generate PDF di client pakai lib seperti jsPDF/html2canvas).
 * 4. Tombol "Salin" kode booking pakai Clipboard API — sudah jalan,
 *    tinggal pastikan `orderData.bookingCode` diisi data asli.
 */

const orderData = {
  eventCategory: "Konser",
  eventTitle: "Guns N' Roses",
  eventSubtitle: "World Tour 2026",
  eventDate: "Sabtu, 21 November 2026",
  eventTime: "19:30 WIB",
  eventVenue: "Madya Stadium GBK, Jakarta",
  eventAddress: "Jl. Pintu Satu Senayan, Jakarta Pusat",
  posterUrl: "/ballon.png", // ganti ke poster event asli dari BE

  customerName: "Muhammad Diaz Pradana",
  bookingCode: "DRS-211126-8F3Q2K",
  orderDate: "20 Mei 2026, 14:23 WIB",
  ticketType: "Festival A",
  ticketQty: 2,
  totalPrice: 1400000,
  email: "diazpradana@gmail.com",
};

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function PembayaranSukses() {
  const [copied, setCopied] = useState(false);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=0&data=${encodeURIComponent(
    orderData.bookingCode
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderData.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard bisa gagal di browser lama / non-https, abaikan secara diam-diam
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ===== Header sukses ===== */}
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-white shadow-[0_10px_26px_rgba(37,99,235,0.28)]">
            <CheckCircle2 size={28} />
          </span>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-[#111827] sm:text-3xl">
              Pembayaran Berhasil!
              <Sparkles size={22} className="text-[#06B6D4]" />
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Terima kasih! Tiketmu sudah berhasil dipesan. Detail
              pemesananmu dapat dilihat di bawah ini.
            </p>
          </div>
        </div>

        {/* ===== Konten utama: 2 kolom ===== */}
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* ----- Kolom kiri: detail event & pemesanan ----- */}
          <div className="rounded-2xl border border-slate-200 p-6 lg:min-w-0 lg:flex-1">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="h-44 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={orderData.posterUrl}
                  alt={orderData.eventTitle}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <span className="inline-flex items-center rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
                  {orderData.eventCategory}
                </span>

                <h2 className="mt-2 text-xl font-extrabold text-[#111827]">
                  {orderData.eventTitle}
                </h2>
                <p className="text-sm font-bold text-[#2563EB]">
                  {orderData.eventSubtitle}
                </p>

                <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={15} className="shrink-0 text-slate-400" />
                    {orderData.eventDate}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={15} className="shrink-0 text-slate-400" />
                    {orderData.eventTime}
                  </span>
                  <span className="flex items-start gap-2">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
                    <span>
                      <span className="font-medium text-[#111827]">
                        {orderData.eventVenue}
                      </span>
                      <br />
                      <span className="text-slate-400">
                        {orderData.eventAddress}
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="text-base font-bold text-[#111827]">
                Detail Pemesanan
              </h3>

              <dl className="mt-4 flex flex-col gap-3 text-sm">
                {[
                  ["Nama Customer", orderData.customerName],
                  ["Kode Booking", orderData.bookingCode],
                  ["Tanggal Pemesanan", orderData.orderDate],
                  ["Tipe Tiket", orderData.ticketType],
                  ["Jumlah Tiket", `${orderData.ticketQty} Tiket`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-semibold text-[#111827]">{value}</dd>
                  </div>
                ))}

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <dt className="font-semibold text-[#111827]">Total Harga</dt>
                  <dd className="text-lg font-extrabold text-[#2563EB]">
                    {formatRupiah(orderData.totalPrice)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* ----- Kolom kanan: kode booking & QR ----- */}
          <div className="rounded-2xl border border-slate-200 p-6 lg:w-[380px] lg:shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Kode Booking</p>
                <p className="mt-1 text-lg font-extrabold tracking-wide text-[#111827]">
                  {orderData.bookingCode}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#2563EB] px-3 py-1.5 text-xs font-semibold text-[#2563EB] transition-colors duration-300 hover:bg-[#EEF4FF]"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3 text-xs font-semibold text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              Tunjukkan QRIS ini saat masuk venue
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-5 flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt={`QR kode booking ${orderData.bookingCode}`}
                className="h-56 w-56"
              />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#06B6D4]/20 bg-[#ECFEFF] px-4 py-3.5 text-xs leading-relaxed text-slate-600">
              <Info size={16} className="mt-0.5 shrink-0 text-[#06B6D4]" />
              <p>
                Simpan kode booking ini dengan baik. Kamu juga akan menerima
                e-ticket melalui email{" "}
                <span className="font-semibold text-[#111827]">
                  {orderData.email}
                </span>
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-semibold text-[#111827] transition-colors duration-300 hover:bg-slate-50"
              >
                <Download size={16} />
                Unduh E-Ticket
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] py-3 text-sm font-bold text-white shadow-[0_10px_26px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <Home size={16} />
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>

        {/* ===== Bantuan ===== */}
        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-[#2563EB]">
              <MessageCircle size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#111827]">
                Butuh bantuan?
              </p>
              <p className="text-xs text-slate-500">Kami siap membantu 24/7</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-8">
            <span className="flex items-center gap-2 text-slate-600">
              <Mail size={15} className="text-slate-400" />
              <span>
                <span className="block text-xs text-slate-400">Email</span>
                support@drstar.id
              </span>
            </span>
            <span className="flex items-center gap-2 text-slate-600">
              <Phone size={15} className="text-slate-400" />
              <span>
                <span className="block text-xs text-slate-400">WhatsApp</span>
                +62 812-3456-7890
              </span>
            </span>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#111827] transition-colors duration-300 hover:bg-slate-50"
          >
            <HelpCircle size={16} />
            Pusat Bantuan
          </button>
        </div>
      </div>
    </div>
  );
}