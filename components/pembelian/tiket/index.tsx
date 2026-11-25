"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useParams, useRouter } from "next/navigation";
import { Big_Shoulders } from "next/font/google";
import { ArrowRight, CalendarDays, MapPin, Minus, Plus, RotateCw } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import VenueMap from "@/components/ui/VenueMap";
import { resolveLayout } from "@/utils/venueLayouts";
import { fetchEventById, formatRupiah, getImageUrl, type EventItem, type KategoriTiket } from "@/utils/api";
import { KATEGORI_BY_SLUG, formatHariTanggal, formatJamWib, kategoriOf } from "@/utils/kategori";
import styles from "./ticket-selection.module.css";

/**
 * Pilih tiket. Logika (satu kategori per pesanan, batas 5 tiket, refresh stok)
 * tidak berubah dari versi sebelumnya; hanya tampilan yang disamakan dengan
 * landing, halaman kategori, dan detail event. Ditambah daftar kelas di bawah
 * denah supaya mudah dipilih di HP.
 */

const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });

// Batas per pesanan; BE sendiri mengecek sisa kuota
const MAX_TICKETS_PER_ORDER = 5;

const timeLabel = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
const sisaOf = (k: KategoriTiket) => Math.max(0, k.sisa_kuota ?? k.kuota - k.terjual);
const n = (i: number) => ({ "--n": i }) as CSSProperties;

type Selection = { id: number; qty: number } | null;

export default function TicketSelection() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>(); // isinya id event

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection>(null);
  const [lastUpdated, setLastUpdated] = useState(timeLabel);

  const load = useCallback(async () => {
    setRefreshing(true);
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
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const tiers = event?.kategori_tiket ?? [];
  const sortedTiers = [...tiers].sort((a, b) => parseFloat(a.harga) - parseFloat(b.harga));
  const saleOpen = event?.status === "aktif";
  const selectedTier = tiers.find((t) => t.id === selected?.id) ?? null;
  const totalTickets = selectedTier && selected ? selected.qty : 0;
  const totalPrice = selectedTier ? parseFloat(selectedTier.harga) * totalTickets : 0;
  const maxQty = selectedTier ? Math.min(MAX_TICKETS_PER_ORDER, sisaOf(selectedTier)) : 0;
  const canContinue = totalTickets > 0 && saleOpen;

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

  const posterUrl = event ? getImageUrl(event.poster) : null;
  const kategori = event ? KATEGORI_BY_SLUG[kategoriOf(event)] : null;
  const jam = event ? formatJamWib(event.tanggal) : "";

  return (
    <div className={`${display.variable} ${styles.root} pb-28 lg:pb-20`}>
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.content}>
        {/* ===== hero ringkas ===== */}
        <header className={`${styles.hero} pt-6 pb-9 sm:pt-8 sm:pb-12`}>
          {posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterUrl} alt="" aria-hidden="true" className={styles.backdrop} />
          )}
          <div className={styles.heroShade} aria-hidden="true" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <BackButton fallbackHref={`/events/${slug}`} className={styles.back} />
              <ol className={styles.steps} aria-label="Langkah pembelian">
                <li className={styles.step} data-state="active" aria-current="step"><span className={`${styles.display} ${styles.stepNum}`}>01</span>Pilih tiket</li>
                <li className={styles.step}><span className={`${styles.display} ${styles.stepNum}`}>02</span>Checkout</li>
                <li className={styles.step}><span className={`${styles.display} ${styles.stepNum}`}>03</span>Bayar</li>
              </ol>
            </div>

            {loading ? (
              <div className="mt-8 space-y-3" aria-hidden="true">
                <div className="h-4 w-24 animate-pulse rounded bg-white/15" />
                <div className="h-12 w-2/3 animate-pulse rounded bg-white/15" />
              </div>
            ) : event ? (
              <div className="mt-8">
                <span className={`${styles.kicker} ${styles.in}`} style={n(0)}>{kategori?.label ?? "Acara"}</span>
                <h1 className={`${styles.display} ${styles.title} ${styles.in}`} style={n(1)}>{event.nama_event}</h1>
                <ul className={`${styles.meta} ${styles.in}`} style={n(2)}>
                  <li className={styles.metaRow}><CalendarDays size={16} aria-hidden="true" />{formatHariTanggal(event.tanggal)}{jam ? ` · ${jam}` : ""}</li>
                  <li className={styles.metaRow}><MapPin size={16} aria-hidden="true" />{event.lokasi}</li>
                </ul>
              </div>
            ) : null}
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
            {/* ===== kiri: denah + daftar kelas ===== */}
            <div className="min-w-0">
              {loading ? (
                <div className="space-y-4" aria-hidden="true">
                  <div className={`${styles.skel} h-8 w-1/2`} />
                  <div className={`${styles.skel} h-96`} />
                </div>
              ) : error || !event ? (
                <div role="alert" className={styles.error}>{error ?? "Event tidak ditemukan."}</div>
              ) : (
                <>
                  {!saleOpen && (
                    <div role="status" className={styles.notice} style={{ marginTop: 0 }}>
                      Penjualan tiket untuk event ini sedang tidak dibuka.
                    </div>
                  )}

                  <div className="mt-0 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className={`${styles.display} ${styles.secTitle}`}>Pilih zona</h2>
                      <span className={styles.secBar} aria-hidden="true" />
                      <p className={`${styles.hint} mt-3`}>
                        Klik zona di denah atau pilih dari daftar. Satu kategori per pesanan, maksimal {MAX_TICKETS_PER_ORDER} tiket.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-[#9CA3AF]">Pembaruan {lastUpdated}</span>
                      <button
                        type="button"
                        onClick={() => void load()}
                        disabled={refreshing}
                        className={`${styles.refresh} ${refreshing ? styles.spin : ""}`}
                      >
                        Perbarui <RotateCw size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {tiers.length === 0 ? (
                    <p className="mt-6 rounded-2xl border-2 border-dashed border-[#E5E7EB] px-6 py-10 text-center text-sm text-[#6B7280]">
                      Belum ada kategori tiket untuk event ini.
                    </p>
                  ) : (
                    <>
                      <div className={styles.mapCard}>
                        <VenueMap layout={resolveLayout(event)} tiers={tiers} selected={selected} saleOpen={saleOpen} onSelect={add} />
                      </div>

                      <h3 className={`${styles.display} ${styles.secTitle} mt-10`} style={{ fontSize: "1.6rem" }}>Daftar kelas</h3>
                      <ul className={styles.tiers}>
                        {sortedTiers.map((t) => {
                          const sisa = sisaOf(t);
                          const habis = sisa === 0;
                          const persen = t.kuota > 0 ? Math.min(100, (sisa / t.kuota) * 100) : 0;
                          const tipis = !habis && persen <= 15;
                          const isSel = selected?.id === t.id;
                          return (
                            <li key={t.id} className={tipis ? styles.low : ""} data-selected={isSel} data-out={habis}>
                              <button
                                type="button"
                                className={styles.tierBtn}
                                onClick={() => add(t)}
                                disabled={habis || !saleOpen}
                                aria-pressed={isSel}
                              >
                                <span className={styles.tierName}>{t.nama_kelas}</span>
                                <span className={`${styles.display} ${styles.tierPrice}`}>{habis ? "Habis" : formatRupiah(t.harga)}</span>
                                <span className={styles.tierBar}>
                                  <span className={styles.tierTrack} aria-hidden="true">
                                    <span className={styles.tierFill} style={{ width: `${persen}%` }} />
                                  </span>
                                  <span className={styles.tierLeft}>
                                    {habis ? "Habis terjual" : tipis ? `Tinggal ${sisa}` : `${sisa.toLocaleString("id-ID")} tersisa`}
                                  </span>
                                </span>
                              </button>
                              {isSel && selected && (
                                <div className={styles.stepper}>
                                  <span>Jumlah tiket</span>
                                  <div className={styles.qty}>
                                    <button type="button" className={styles.qtyBtn} onClick={() => remove(t)} aria-label={`Kurangi ${t.nama_kelas}`}>
                                      <Minus size={15} />
                                    </button>
                                    <span className={`${styles.display} ${styles.qtyNum}`} aria-live="polite">{selected.qty}</span>
                                    <button
                                      type="button"
                                      className={`${styles.qtyBtn} ${styles.qtyPlus}`}
                                      onClick={() => add(t)}
                                      disabled={selected.qty >= maxQty}
                                      aria-label={`Tambah ${t.nama_kelas}`}
                                    >
                                      <Plus size={15} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </>
              )}
            </div>

            {/* ===== kanan: ringkasan pesanan (desktop) ===== */}
            <aside className="hidden lg:sticky lg:top-8 lg:block lg:h-fit" aria-label="Detail pemesanan">
              <div className={styles.summary}>
                <div className={styles.sumTop}>
                  <p className={styles.sumLabel}>Detail pemesanan</p>
                  <p className={`${styles.display} ${styles.sumEvent}`}>{event?.nama_event ?? "—"}</p>
                </div>
                <div className={styles.perf} aria-hidden="true" />
                <div className={styles.sumBottom}>
                  {selectedTier && selected && totalTickets > 0 ? (
                    <div className={styles.line}>
                      <div className="min-w-0">
                        <p className={styles.lineName}>{selectedTier.nama_kelas}</p>
                        <p className={styles.lineSub}>
                          {selected.qty} × {formatRupiah(selectedTier.harga)} · sisa {sisaOf(selectedTier)}
                        </p>
                      </div>
                      <span className={`${styles.display} ${styles.lineAmt}`}>{formatRupiah(totalPrice)}</span>
                    </div>
                  ) : (
                    <p className={styles.empty}>Belum ada tiket dipilih. Klik zona di denah atau pilih dari daftar kelas.</p>
                  )}

                  <div className={styles.total}>
                    <span className={styles.totalLbl}>Total {totalTickets} tiket</span>
                    <span className={`${styles.display} ${styles.totalAmt}`}>{formatRupiah(totalPrice)}</span>
                  </div>

                  <button type="button" onClick={handleContinue} disabled={!canContinue} className={`${styles.go} mt-5`}>
                    Lanjutkan <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* bar total tetap di bawah (mobile & tablet) */}
      <div className={styles.dock}>
        <div>
          <div className={styles.dockLbl}>Total {totalTickets} tiket</div>
          <div className={`${styles.display} ${styles.dockAmt}`}>{formatRupiah(totalPrice)}</div>
        </div>
        <button type="button" onClick={handleContinue} disabled={!canContinue} className={styles.go}>
          Lanjutkan <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}