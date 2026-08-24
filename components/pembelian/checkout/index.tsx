"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  Percent,
  MessageCircle,
  ShieldCheck,
  RefreshCw,
  Check,
  CreditCard,
  Landmark,
  Wallet as WalletIcon,
  Smartphone,
  QrCode,
  CalendarDays,
  X,
  CheckCircle2,
  Smile,
} from "lucide-react";

const eventInfo = {
  title: "Nama Event Konser",
  schedule: "Tanggal & jam event akan tampil di sini",
  venue: "Nama venue & alamat lengkap akan tampil di sini",
};

const cartItems = [{ id: "tier-a", name: "Festival A (Standing)", price: 200000, qty: 1 }];

type ProtectionPackage = {
  id: string;
  label: string;
  icon: typeof ShieldCheck;
  pricePerTicket: number;
  coverage: string[];
};

const protectionPackages: ProtectionPackage[] = [
  {
    id: "pasti",
    label: "Paket Proteksi Pasti",
    icon: CheckCircle2,
    pricePerTicket: 5000,
    coverage: [
      "Santunan meninggal dunia s.d. Rp5.000.000",
      "Biaya pengobatan akibat kecelakaan s.d. Rp500.000",
      "Pembatalan acara oleh penyelenggara s.d. Rp500.000",
    ],
  },
  {
    id: "aman",
    label: "Paket Proteksi Aman",
    icon: ShieldCheck,
    pricePerTicket: 10000,
    coverage: [
      "Santunan meninggal dunia s.d. Rp15.000.000",
      "Biaya pengobatan akibat kecelakaan s.d. Rp1.500.000",
      "Pembatalan acara oleh penyelenggara s.d. Rp3.000.000",
    ],
  },
  {
    id: "tenang",
    label: "Paket Proteksi Tenang",
    icon: Smile,
    pricePerTicket: 20000,
    coverage: [
      "Santunan meninggal dunia s.d. Rp30.000.000",
      "Biaya pengobatan akibat kecelakaan s.d. Rp3.000.000",
      "Pembatalan acara oleh penyelenggara s.d. Rp10.000.000",
    ],
  },
];

type Attendee = {
  namaLengkap: string;
  email: string;
  noHp: string;
  nomorIdentitas: string;
  tanggalLahir: string;
  jenisKelamin: "" | "laki-laki" | "perempuan";
};

const emptyAttendee: Attendee = {
  namaLengkap: "",
  email: "",
  noHp: "",
  nomorIdentitas: "",
  tanggalLahir: "",
  jenisKelamin: "",
};

const paymentCategories = [
  {
    id: "credit_card",
    label: "Credit Card",
    icon: CreditCard,
    options: [{ id: "credit_card", label: "Kartu Kredit / Debit" }],
  },
  {
    id: "virtual_account",
    label: "Virtual Account",
    icon: Landmark,
    options: [{ id: "va", label: "Virtual Account Bank" }],
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: WalletIcon,
    options: [{ id: "wallet", label: "E-Wallet" }],
  },
  {
    id: "paylater",
    label: "PayLater",
    icon: Smartphone,
    promo: true,
    options: [{ id: "paylater", label: "PayLater" }],
  },
  {
    id: "qr",
    label: "QR",
    icon: QrCode,
    options: [{ id: "qris", label: "QRIS" }],
  },
];

function formatRupiah(value: number) {
  return `Rp. ${value.toLocaleString("id-ID")}`;
}

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Modal ubah paket proteksi tiket */
function ProtectionModal({
  selectedId,
  onSelect,
  onSkip,
  onClose,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-[#1F2937]">
            DR Star Plus Protection
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#9CA3AF] transition-colors duration-300 hover:bg-[#FFFBF5] hover:text-[#1F2937]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
          Perlindungan ekstra untuk beli tiket event tanpa cemas. Dapatkan
          perlindungan untuk pembatalan event, kecelakaan, dan kehilangan
          barang.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {protectionPackages.map((pkg) => {
            const Icon = pkg.icon;
            const isSelected = selectedId === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`flex flex-col rounded-2xl border-2 p-5 transition-colors duration-300 ${
                  isSelected ? "border-[#0F766E]" : "border-[#E5E7EB]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECFDF5] text-[#0F766E]">
                    <Icon size={18} />
                  </span>
                  <h3 className="text-sm font-bold text-[#1F2937]">
                    {pkg.label}
                  </h3>
                </div>

                <div className="mt-4 rounded-xl bg-[#FFFBF5] p-3.5">
                  <p className="text-xs font-semibold text-[#6B7280]">
                    Pertanggungan:
                  </p>
                  <ol className="mt-2 flex flex-col gap-2">
                    {pkg.coverage.map((item, i) => (
                      <li key={i} className="flex gap-2 text-xs text-[#6B7280]">
                        <span className="shrink-0 font-semibold text-[#1F2937]">
                          {i + 1}.
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-xs text-[#9CA3AF]">
                    Benefit lainnya cek di S&amp;K
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-3 self-start text-xs font-semibold text-[#0F766E] underline underline-offset-2 hover:text-[#F59E0B]"
                >
                  Syarat Ketentuan
                </button>

                <p className="mt-4 text-lg font-extrabold text-[#F59E0B]">
                  {formatRupiah(pkg.pricePerTicket)}
                </p>

                <button
                  type="button"
                  onClick={() => onSelect(pkg.id)}
                  className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold transition-all duration-300 ${
                    isSelected
                      ? "bg-[#0F766E] text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)]"
                      : "border border-[#0F766E] text-[#0F766E] hover:bg-[#ECFDF5]"
                  }`}
                >
                  {isSelected ? (
                    <>
                      Dipilih
                      <Check size={15} />
                    </>
                  ) : (
                    "Pilih"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="mx-auto mt-6 block w-full max-w-xs rounded-full border border-[#E5E7EB] py-3 text-center text-sm font-semibold text-[#6B7280] transition-colors duration-300 hover:bg-[#FFFBF5]"
        >
          Lanjutkan Tanpa Proteksi
        </button>
      </div>
    </div>
  );
}

export default function OrderCheckout() {
  const router = useRouter();

  // Satu form attendee per tiket di cart (di-flatten berdasarkan qty)
  const attendeeSlots = cartItems.flatMap((item) =>
    Array.from({ length: item.qty }, (_, i) => ({
      tierName: item.name,
      key: `${item.id}-${i}`,
    }))
  );

  const [attendees, setAttendees] = useState<Attendee[]>(
    attendeeSlots.map(() => ({ ...emptyAttendee }))
  );
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [openCategory, setOpenCategory] = useState<string | null>("qr");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [selectedProtection, setSelectedProtection] = useState<string | null>(
    "aman"
  );
  const [protectionModalOpen, setProtectionModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateAttendee = (
    index: number,
    field: keyof Attendee,
    value: string
  ) => {
    setAttendees((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalTickets = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const activeProtection = protectionPackages.find(
    (p) => p.id === selectedProtection
  );
  const protectionFee = activeProtection
    ? activeProtection.pricePerTicket * totalTickets
    : 0;
  const grandTotal = subtotal + protectionFee;

  const canPay = agreeTerms && agreePrivacy && !!selectedMethod;

  const handlePay = () => {
    if (!canPay || isSubmitting) return;
    setIsSubmitting(true);
    router.push("/pembelian/sukses");
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* ===== Kolom kiri ===== */}
          <div className="lg:min-w-0 lg:flex-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E] transition-colors duration-300 hover:text-[#F59E0B]"
            >
              <ChevronLeft size={16} />
              Kembali
            </Link>

            <p className="mt-3 text-sm text-[#6B7280]">
              Langkah 2 dari 3 &middot;{" "}
              <span className="font-semibold text-[#1F2937]">
                Detail Pesanan
              </span>
            </p>

            <h1 className="mt-2 text-2xl font-bold text-[#1F2937] sm:text-3xl">
              {eventInfo.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {eventInfo.schedule} &middot; {eventInfo.venue}
            </p>

            {/* ===== Form Pengunjung ===== */}
            <div className="mt-8 rounded-2xl border border-[#E5E7EB]">
              <div className="border-b border-[#E5E7EB] px-6 py-4">
                <h2 className="text-base font-bold text-[#1F2937]">
                  Pengunjung
                </h2>
              </div>

              <div className="flex flex-col divide-y divide-[#E5E7EB]">
                {attendeeSlots.map((slot, index) => (
                  <div key={slot.key} className="px-6 py-6">
                    <h3 className="text-base font-extrabold text-[#1F2937]">
                      {slot.tierName}
                    </h3>

                    <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold text-[#1F2937]">
                          Nama Lengkap<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={attendees[index]?.namaLengkap ?? ""}
                          onChange={(e) =>
                            updateAttendee(index, "namaLengkap", e.target.value)
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-[#E5E7EB] px-3.5 text-sm text-[#1F2937] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.10)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-[#1F2937]">
                          Email<span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={attendees[index]?.email ?? ""}
                          onChange={(e) =>
                            updateAttendee(index, "email", e.target.value)
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-[#E5E7EB] px-3.5 text-sm text-[#1F2937] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.10)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-[#1F2937]">
                          No. Handphone<span className="text-red-500">*</span>
                        </label>
                        <div className="mt-2 flex items-stretch gap-2">
                          <span className="flex items-center gap-1 rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#6B7280]">
                            ID +62
                          </span>
                          <input
                            type="tel"
                            value={attendees[index]?.noHp ?? ""}
                            onChange={(e) =>
                              updateAttendee(index, "noHp", e.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3.5 text-sm text-[#1F2937] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.10)] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-[#1F2937]">
                          Nomor Identitas (KTP/Passport, dll)
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={attendees[index]?.nomorIdentitas ?? ""}
                          onChange={(e) =>
                            updateAttendee(
                              index,
                              "nomorIdentitas",
                              e.target.value
                            )
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-[#E5E7EB] px-3.5 text-sm text-[#1F2937] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.10)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-[#1F2937]">
                          Tanggal Lahir<span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-2">
                          <CalendarDays
                            size={16}
                            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#9CA3AF]"
                          />
                          <input
                            type="date"
                            value={attendees[index]?.tanggalLahir ?? ""}
                            onChange={(e) =>
                              updateAttendee(
                                index,
                                "tanggalLahir",
                                e.target.value
                              )
                            }
                            className="h-11 w-full rounded-xl border border-[#E5E7EB] pr-3.5 pl-10 text-sm text-[#1F2937] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.10)] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">
                          Jenis Kelamin<span className="text-red-500">*</span>
                        </p>
                        <div className="mt-2 flex items-center gap-6">
                          {(["laki-laki", "perempuan"] as const).map(
                            (gender) => (
                              <label
                                key={gender}
                                className="flex items-center gap-2 text-sm text-[#1F2937]"
                              >
                                <input
                                  type="radio"
                                  name={`gender-${slot.key}`}
                                  checked={
                                    attendees[index]?.jenisKelamin === gender
                                  }
                                  onChange={() =>
                                    updateAttendee(
                                      index,
                                      "jenisKelamin",
                                      gender
                                    )
                                  }
                                  className="h-4 w-4 accent-[#0F766E]"
                                />
                                {gender === "laki-laki"
                                  ? "Laki-laki"
                                  : "Perempuan"}
                              </label>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== Metode Pembayaran ===== */}
            <div className="mt-10">
              <h2 className="text-lg font-bold text-[#1F2937]">
                Metode pembayaran
              </h2>

              <div className="mt-4 flex flex-col gap-3">
                {paymentCategories.map((category) => {
                  const Icon = category.icon;
                  const isOpen = openCategory === category.id;
                  return (
                    <div
                      key={category.id}
                      className="overflow-hidden rounded-2xl border border-[#E5E7EB]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenCategory(isOpen ? null : category.id)
                        }
                        className="flex w-full items-center justify-between px-5 py-4"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECFDF5] text-[#0F766E]">
                            <Icon size={17} />
                          </span>
                          <span className="text-sm font-bold text-[#1F2937]">
                            {category.label}
                          </span>
                          {category.promo && (
                            <span className="rounded-full bg-[#F59E0B] px-2.5 py-0.5 text-[11px] font-bold text-white">
                              Promo
                            </span>
                          )}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`text-[#9CA3AF] transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* FIX: grid-rows animasi, bukan conditional render.
                          Ini yang bikin sidebar sticky di kanan gak "kesentak"
                          waktu accordion dibuka/ditutup. */}
                      <div
                        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
                        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-[#E5E7EB] px-5 py-4">
                            {category.options.map((opt) => (
                              <label
                                key={opt.id}
                                className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-[#FFFBF5]"
                              >
                                <input
                                  type="radio"
                                  name="payment-method"
                                  checked={selectedMethod === opt.id}
                                  onChange={() => setSelectedMethod(opt.id)}
                                  className="h-4 w-4 accent-[#0F766E]"
                                />
                                <span className="text-sm text-[#1F2937]">
                                  {opt.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===== Kolom kanan: ringkasan & pembayaran ===== */}
          <div className="lg:sticky lg:top-28 lg:w-[380px] lg:shrink-0 [overflow-anchor:none]">
            {/* Countdown */}
            <div className="flex items-center gap-2 rounded-t-2xl bg-[#0F766E] px-5 py-3.5 text-white">
              <Clock size={16} />
              <span className="text-sm font-bold">
                {formatCountdown(secondsLeft)}
              </span>
              <span className="h-3 w-px bg-white/40" />
              <span className="text-sm">Waktu pemesanan tersisa</span>
            </div>

            <div className="rounded-b-2xl border border-t-0 border-[#E5E7EB] bg-white p-5">
              <h2 className="text-base font-bold text-[#1F2937]">
                Ringkasan Pesanan
              </h2>

              <div className="mt-4 flex flex-col gap-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <span className="w-1 shrink-0 rounded-full bg-gradient-to-b from-[#0F766E] to-[#F59E0B]" />
                    <div className="flex flex-1 items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#6B7280]">
                          {formatRupiah(item.price)} × {item.qty}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#1F2937]">
                        {formatRupiah(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-4 text-sm">
                <span className="text-[#6B7280]">
                  Subtotal ({totalTickets} tiket)
                </span>
                <span className="font-semibold text-[#1F2937]">
                  {formatRupiah(subtotal)}
                </span>
              </div>

              <div className="mt-2 flex items-start justify-between text-sm">
                <span className="text-[#6B7280]">
                  Proteksi Pembeli Tiket
                  <br />
                  <span className="text-xs text-[#9CA3AF]">
                    (Tidak dapat dikembalikan)
                  </span>
                </span>
                <span className="font-semibold text-[#1F2937]">
                  {formatRupiah(protectionFee)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-4">
                <span className="text-sm font-bold text-[#1F2937]">
                  Grand Total
                </span>
                <span className="text-base font-extrabold text-[#F59E0B]">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              {/* Promo */}
              <button
                type="button"
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3 text-left transition-colors duration-300 hover:border-[#0F766E]/40"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ECFDF5] text-[#0F766E]">
                    <Percent size={15} />
                  </span>
                  Makin hemat pakai promo
                </span>
                <ChevronRight size={16} className="text-[#9CA3AF]" />
              </button>

              {/* Notifikasi WhatsApp */}
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#F59E0B]/20 bg-[#FFFBEB] px-4 py-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#F59E0B]">
                  <MessageCircle size={15} />
                </span>
                <span className="flex-1 text-sm">
                  <span className="font-semibold text-[#1F2937]">
                    Notifikasi WhatsApp
                  </span>
                  <br />
                  <span className="text-xs text-[#6B7280]">
                    Saya setuju untuk menerima notifikasi pemesanan tiket ini
                    melalui WhatsApp.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#F59E0B]"
                />
              </label>

              {/* Paket Proteksi — dinamis sesuai pilihan modal */}
              <div className="mt-4 rounded-xl border border-[#0F766E]/20 bg-[#ECFDF5] px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#0F766E]">
                      <ShieldCheck size={15} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937]">
                        {activeProtection
                          ? activeProtection.label
                          : "Tanpa Proteksi"}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {activeProtection
                          ? `${formatRupiah(activeProtection.pricePerTicket)}/orang`
                          : "Kamu belum memilih perlindungan tambahan"}
                      </p>
                      <button
                        type="button"
                        className="mt-1 text-xs font-semibold text-[#0F766E] underline underline-offset-2 hover:text-[#F59E0B]"
                      >
                        Syarat Ketentuan
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProtectionModalOpen(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#0F766E] px-3 py-1.5 text-xs font-semibold text-[#0F766E] transition-colors duration-300 hover:bg-white"
                  >
                    <RefreshCw size={12} />
                    Ubah
                  </button>
                </div>
                {activeProtection && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0F766E] to-[#F59E0B] px-3 py-2 text-xs font-semibold text-white">
                    <Check size={14} />
                    Yeay, tiket kamu terlindungi!
                  </div>
                )}
              </div>

              {/* Agreement */}
              <div className="mt-4 flex flex-col gap-2.5">
                <label className="flex items-start gap-2.5 text-xs text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#0F766E]"
                  />
                  Saya setuju dengan{" "}
                  <Link
                    href="/terms"
                    className="font-semibold text-[#0F766E] hover:text-[#F59E0B]"
                  >
                    Syarat &amp; Ketentuan
                  </Link>{" "}
                  yang berlaku di DR Star.
                </label>
                <label className="flex items-start gap-2.5 text-xs text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#0F766E]"
                  />
                  Saya menyetujui{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-[#0F766E] hover:text-[#F59E0B]"
                  >
                    Kebijakan Privasi &amp; Pemrosesan Data
                  </Link>{" "}
                  DR Star.
                </label>
              </div>

              <button
                type="button"
                onClick={handlePay}
                disabled={!canPay || isSubmitting}
                className="mt-5 w-full rounded-full py-3 text-sm font-bold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] enabled:bg-[#0F766E] enabled:shadow-[0_10px_26px_rgba(15,118,110,0.28)] enabled:hover:-translate-y-0.5 enabled:hover:bg-[#0D9488]"
              >
                {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {protectionModalOpen && (
        <ProtectionModal
          selectedId={selectedProtection}
          onSelect={(id) => {
            setSelectedProtection(id);
            setProtectionModalOpen(false);
          }}
          onSkip={() => {
            setSelectedProtection(null);
            setProtectionModalOpen(false);
          }}
          onClose={() => setProtectionModalOpen(false)}
        />
      )}
    </div>
  );
}