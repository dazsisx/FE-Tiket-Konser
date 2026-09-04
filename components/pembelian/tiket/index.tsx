"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info, RotateCw, Plus, Minus } from "lucide-react";

const eventSlug = "event-1";
const eventTitle = "Nama Event Konser";

const ticketTiers = [
  { id: "tier-a", name: "Festival A (Berdiri)", price: 3750000, available: true },
  { id: "tier-b", name: "Festival B (Berdiri)", price: 2750000, available: true },
  { id: "tier-c", name: "Festival C (Berdiri)", price: 1750000, available: true },
];

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export default function TicketSelection() {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState(() =>
    new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );

  const add = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

  const remove = (id: string) =>
    setSelected((prev) => {
      const next = { ...prev };
      if (!next[id]) return next;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });

  const refresh = () => {
    // TODO: re-fetch stok tiket terbaru dari API di sini
    setLastUpdated(
      new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const totalTickets = Object.values(selected).reduce((a, b) => a + b, 0);
  const totalPrice = ticketTiers.reduce(
    (sum, tier) => sum + (selected[tier.id] ?? 0) * tier.price,
    0
  );

  const handleContinue = () => {
    if (totalTickets === 0) return;

    const params = new URLSearchParams();
    Object.entries(selected).forEach(([tierId, qty]) => {
      if (qty > 0) params.set(`qty_${tierId}`, String(qty));
    });

    router.push(`/pembelian/checkout/${eventSlug}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* ===== Kolom kiri: daftar tiket ===== */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F766E] transition-colors duration-300 hover:text-[#F59E0B]"
            >
              <ChevronLeft size={16} />
              Kembali
            </Link>

            <h1 className="mt-3 text-2xl font-bold text-[#1F2937] sm:text-3xl">
              {eventTitle}
            </h1>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#6B7280]">
                Pilih tiket yang ingin kamu pesan:
              </p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-[#9CA3AF]">
                  Pembaruan terakhir {lastUpdated}
                </span>
                <span className="h-4 w-px bg-[#E5E7EB]" />
                <button
                  type="button"
                  onClick={refresh}
                  className="flex items-center gap-1.5 font-semibold text-[#0F766E] transition-colors duration-300 hover:text-[#F59E0B]"
                >
                  Perbarui
                  <RotateCw size={14} />
                </button>
              </div>
            </div>

            {/* Daftar tier tiket */}
            <div className="mt-6 flex flex-col gap-4">
              {ticketTiers.map((tier) => {
                const qty = selected[tier.id] ?? 0;
                return (
                  <div
                    key={tier.id}
                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFBF5] px-6 py-5"
                  >
                    <h3 className="text-base font-extrabold tracking-wide text-[#1F2937] sm:text-lg">
                      {tier.name}
                    </h3>

                    {/* Info ketersediaan */}
                    <div className="mt-3 flex items-center gap-2 text-sm text-[#6B7280]">
                      <Info size={14} className="text-[#9CA3AF]" />
                      {tier.available ? "Tiket Tersedia" : "Tiket Habis"}
                    </div>

                    {/* Garis sobekan tiket — konsisten dengan motif di footer */}
                    <div className="relative my-4">
                      <div className="h-px w-full border-t border-dashed border-[#E5E7EB]" />
                      <span className="absolute top-1/2 -left-6 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#E5E7EB] bg-white" />
                      <span className="absolute top-1/2 -right-6 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#E5E7EB] bg-white" />
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-extrabold text-[#F59E0B] sm:text-xl">
                        {formatRupiah(tier.price)}
                      </p>

                      {tier.available ? (
                        qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => add(tier.id)}
                            className="flex items-center gap-1.5 rounded-full bg-[#0F766E] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0D9488]"
                          >
                            Tambah
                            <Plus size={16} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 rounded-full border border-[#E5E7EB] bg-white px-2 py-1.5">
                            <button
                              type="button"
                              onClick={() => remove(tier.id)}
                              aria-label={`Kurangi ${tier.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#0F766E] transition-colors duration-300 hover:bg-[#ECFDF5]"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-4 text-center text-sm font-bold text-[#1F2937]">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => add(tier.id)}
                              aria-label={`Tambah ${tier.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-white transition-transform duration-300 hover:scale-105"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="rounded-full bg-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#9CA3AF]">
                          Habis
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===== Kolom kanan: ringkasan pesanan ===== */}
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_40px_rgba(31,41,55,0.06)]">
              <h2 className="text-base font-bold text-[#1F2937]">
                Detail Pemesanan
              </h2>

              {totalTickets > 0 && (
                <div className="mt-4 flex flex-col gap-2 border-b border-[#E5E7EB] pb-4">
                  {ticketTiers
                    .filter((tier) => selected[tier.id])
                    .map((tier) => (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between text-sm text-[#6B7280]"
                      >
                        <span>
                          {tier.name} × {selected[tier.id]}
                        </span>
                        <span className="font-semibold text-[#1F2937]">
                          {formatRupiah(tier.price * selected[tier.id])}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              <div className="mt-4 flex flex-col items-end gap-0.5 text-right">
                <span className="text-sm text-[#6B7280]">
                  Total {totalTickets} Tiket
                </span>
                <span className="text-base font-extrabold text-[#F59E0B]">
                  {formatRupiah(totalPrice)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={totalTickets === 0}
                className="mt-5 w-full rounded-full py-3 text-sm font-bold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] enabled:bg-[#0F766E] enabled:shadow-[0_10px_26px_rgba(15,118,110,0.28)] enabled:hover:-translate-y-0.5 enabled:hover:bg-[#0D9488]"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}