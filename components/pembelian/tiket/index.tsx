"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Info, RotateCw, Plus, Minus } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import {
  fetchEventById,
  formatRupiah,
  type EventItem,
  type KategoriTiket,
} from "@/utils/api";

// Batas per pesanan; BE sendiri mengecek sisa kuota
const MAX_TICKETS_PER_ORDER = 5;

const timeLabel = () =>
  new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const sisaOf = (k: KategoriTiket) =>
  Math.max(0, k.sisa_kuota ?? k.kuota - k.terjual);

type Selection = { id: number; qty: number } | null;

export default function TicketSelection() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>(); // isinya id event

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection>(null);
  const [lastUpdated, setLastUpdated] = useState(timeLabel);

  const load = useCallback(async () => {
    try {
      const data = await fetchEventById(slug);
      setEvent(data);
      setError(null);
      setLastUpdated(timeLabel());
      // Stok bisa berubah: sesuaikan pilihan yang sudah ada
      setSelected((prev) => {
        if (!prev) return prev;
        const k = data.kategori_tiket?.find((x) => x.id === prev.id);
        if (!k) return null;
        const max = Math.min(MAX_TICKETS_PER_ORDER, sisaOf(k));
        return max < 1 ? null : { id: prev.id, qty: Math.min(prev.qty, max) };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Event gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const tiers = event?.kategori_tiket ?? [];
  const saleOpen = event?.status === "aktif";
  const selectedTier = tiers.find((t) => t.id === selected?.id) ?? null;
  const totalTickets = selectedTier && selected ? selected.qty : 0;
  const totalPrice = selectedTier ? parseFloat(selectedTier.harga) * totalTickets : 0;

  const add = (tier: KategoriTiket) => {
    const max = Math.min(MAX_TICKETS_PER_ORDER, sisaOf(tier));
    setSelected((prev) => {
      // Satu pesanan = satu kategori: memilih kategori lain menggantikan yang lama
      if (!prev || prev.id !== tier.id) return max >= 1 ? { id: tier.id, qty: 1 } : prev;
      return { id: tier.id, qty: Math.min(prev.qty + 1, max) };
    });
  };

  const remove = (tier: KategoriTiket) =>
    setSelected((prev) => {
      if (!prev || prev.id !== tier.id) return prev;
      return prev.qty <= 1 ? null : { id: tier.id, qty: prev.qty - 1 };
    });

  const handleContinue = () => {
    if (!selectedTier || totalTickets === 0 || !saleOpen) return;
    const params = new URLSearchParams({
      kategori: String(selectedTier.id),
      jumlah: String(totalTickets),
    });
    router.push(`/pembelian/checkout/${slug}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* ===== Kolom kiri: daftar tiket ===== */}
          <div>
            <BackButton fallbackHref={`/events/${slug}`} />

            {loading ? (
              <div className="mt-6 space-y-4">
                <div className="h-8 w-2/3 animate-pulse rounded-lg bg-[#F3F4F6]" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#F3F4F6]" />
                ))}
              </div>
            ) : error || !event ? (
              <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
                {error ?? "Event tidak ditemukan."}
              </div>
            ) : (
              <>
                <h1 className="mt-3 text-2xl font-bold text-[#1F2937] sm:text-3xl">
                  {event.nama_event}
                </h1>

                {!saleOpen && (
                  <div role="status" className="mt-4 rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB] px-4 py-3 text-sm text-[#6B7280]">
                    Penjualan tiket untuk event ini sedang tidak dibuka.
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-[#6B7280]">
                    Pilih tiket yang ingin kamu pesan (satu kategori per pesanan,
                    maksimal {MAX_TICKETS_PER_ORDER} tiket):
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#9CA3AF]">Pembaruan terakhir {lastUpdated}</span>
                    <span className="h-4 w-px bg-[#E5E7EB]" />
                    <button
                      type="button"
                      onClick={() => void load()}
                      className="flex items-center gap-1.5 font-semibold text-[#0F766E] transition-colors duration-300 hover:text-[#F59E0B]"
                    >
                      Perbarui
                      <RotateCw size={14} />
                    </button>
                  </div>
                </div>

                {tiers.length === 0 ? (
                  <p className="mt-6 rounded-2xl border border-dashed border-[#E5E7EB] px-6 py-10 text-center text-sm text-[#6B7280]">
                    Belum ada kategori tiket untuk event ini.
                  </p>
                ) : (
                  <div className="mt-6 flex flex-col gap-4">
                    {tiers.map((tier) => {
                      const sisa = sisaOf(tier);
                      const available = saleOpen && sisa > 0;
                      const qty = selected?.id === tier.id ? selected.qty : 0;
                      const maxQty = Math.min(MAX_TICKETS_PER_ORDER, sisa);
                      return (
                        <div
                          key={tier.id}
                          className="rounded-2xl border border-[#E5E7EB] bg-[#FFFBF5] px-6 py-5"
                        >
                          <h3 className="text-base font-extrabold tracking-wide text-[#1F2937] sm:text-lg">
                            {tier.nama_kelas}
                          </h3>

                          <div className="mt-3 flex items-center gap-2 text-sm text-[#6B7280]">
                            <Info size={14} className="text-[#9CA3AF]" />
                            {sisa > 0 ? `Tiket Tersedia (sisa ${sisa})` : "Tiket Habis"}
                          </div>

                          {/* Garis sobekan tiket — konsisten dengan motif di footer */}
                          <div className="relative my-4">
                            <div className="h-px w-full border-t border-dashed border-[#E5E7EB]" />
                            <span className="absolute top-1/2 -left-6 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#E5E7EB] bg-white" />
                            <span className="absolute top-1/2 -right-6 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#E5E7EB] bg-white" />
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-lg font-extrabold text-[#F59E0B] sm:text-xl">
                              {formatRupiah(tier.harga)}
                            </p>

                            {available ? (
                              qty === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => add(tier)}
                                  className="flex items-center gap-1.5 rounded-full bg-[#0F766E] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0D9488]"
                                >
                                  Tambah
                                  <Plus size={16} />
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 rounded-full border border-[#E5E7EB] bg-white px-2 py-1.5">
                                  <button
                                    type="button"
                                    onClick={() => remove(tier)}
                                    aria-label={`Kurangi ${tier.nama_kelas}`}
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#0F766E] transition-colors duration-300 hover:bg-[#ECFDF5]"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="w-4 text-center text-sm font-bold text-[#1F2937]">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => add(tier)}
                                    disabled={qty >= maxQty}
                                    aria-label={`Tambah ${tier.nama_kelas}`}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-white transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:hover:scale-100"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              )
                            ) : (
                              <span className="rounded-full bg-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#9CA3AF]">
                                {sisa > 0 ? "Ditutup" : "Habis"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ===== Kolom kanan: ringkasan pesanan ===== */}
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_10px_40px_rgba(31,41,55,0.06)]">
              <h2 className="text-base font-bold text-[#1F2937]">Detail Pemesanan</h2>

              {selectedTier && totalTickets > 0 && (
                <div className="mt-4 flex flex-col gap-2 border-b border-[#E5E7EB] pb-4">
                  <div className="flex items-center justify-between text-sm text-[#6B7280]">
                    <span>
                      {selectedTier.nama_kelas} × {totalTickets}
                    </span>
                    <span className="font-semibold text-[#1F2937]">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col items-end gap-0.5 text-right">
                <span className="text-sm text-[#6B7280]">Total {totalTickets} Tiket</span>
                <span className="text-base font-extrabold text-[#F59E0B]">
                  {formatRupiah(totalPrice)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={totalTickets === 0 || !saleOpen}
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