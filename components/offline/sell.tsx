"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Minus, Plus, RefreshCw, X } from "lucide-react";
import OfflineShell from "./OfflineShell";
import Receipt from "./Receipt";
import { MAX_TIKET } from "./config";
import { useOfflineGuard } from "./useOfflineGuard";
import {
  createOfflineOrder,
  fetchEvents,
  formatRupiah,
  formatTanggal,
  type EventItem,
  type PesananOffline,
} from "@/utils/api";

const fieldClass =
  "h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm outline-none transition-all placeholder:text-[#9CA3AF] focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)]";

export default function OfflineSell() {
  const { user, ready, logout } = useOfflineGuard();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [nama, setNama] = useState("");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PesananOffline | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const list = await fetchEvents();
      // Hanya event berstatus "aktif" yang bisa dijual (backend juga menolak selain itu).
      setEvents(list.filter((event) => (event.status as string) === "aktif"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Acara gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) void loadEvents();
  }, [ready, loadEvents]);

  const event = events.find((item) => item.id === eventId) ?? null;
  const categories = event?.kategori_tiket ?? [];
  const category = categories.find((item) => item.id === categoryId) ?? null;
  const sisa = category ? Math.max(category.kuota - category.terjual, 0) : 0;
  const maxQty = Math.min(MAX_TIKET, sisa);
  const jumlah = Math.min(qty, Math.max(maxQty, 1));
  const total = category ? Number(category.harga) * jumlah : 0;

  function validate(): string | null {
    if (!event || !category) return "Pilih acara dan kategori tiket terlebih dahulu.";
    if (sisa < 1) return "Kategori tiket ini sudah habis.";
    const name = nama.trim();
    if (name.length < 2 || name.length > 100) return "Nama pembeli harus 2-100 karakter.";
    if (telepon.trim() && !/^[0-9+\-\s]{6,20}$/.test(telepon.trim())) return "Format nomor telepon tidak valid.";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return "Format email tidak valid.";
    return null;
  }

  function openConfirm() {
    const message = validate();
    setFormError(message);
    if (!message) setConfirmOpen(true);
  }

  async function submit() {
    if (!event || !category || submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const order = await createOfflineOrder({
        event_id: event.id,
        kategori_tiket_id: category.id,
        jumlah,
        nama_pembeli: nama.trim(),
        ...(telepon.trim() ? { no_telepon: telepon.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
      });
      setResult(order);
      setConfirmOpen(false);
      void loadEvents(); // stok terbaru dari backend
    } catch (err) {
      setConfirmOpen(false);
      setFormError(err instanceof Error ? err.message : "Transaksi gagal diproses.");
      void loadEvents(); // stok mungkin berubah (mis. kuota habis)
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setResult(null);
    setEventId(null);
    setCategoryId(null);
    setQty(1);
    setNama("");
    setTelepon("");
    setEmail("");
    setFormError(null);
  }

  if (!user) return <main className="min-h-screen bg-[#F7FAF8]" />;

  return (
    <OfflineShell active="jual" userName={user.nama} onLogout={logout}>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end print:hidden">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B7791F]">LOKET</p><h2 className="mt-1 text-3xl font-bold tracking-tight">Jual Tiket</h2><p className="mt-2 text-sm text-[#6B7280]">Catat penjualan tiket langsung di lokasi konser.</p></div>
        {!result && <button type="button" onClick={() => { setLoading(true); void loadEvents(); }} className="flex w-fit items-center gap-2 rounded-lg border border-[#D8DEDA] bg-white px-3.5 py-2.5 text-sm font-semibold hover:bg-[#F4F8F6]"><RefreshCw size={16} /> Muat ulang stok</button>}
      </div>

      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 print:hidden">{error}</div>}

      {result ? (
        <div className="mx-auto max-w-2xl">
          <div role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 print:hidden"><Check size={16} /> Transaksi berhasil dicatat dan stok sudah diperbarui.</div>
          <Receipt order={result} />
          <button type="button" onClick={resetForm} className="mt-5 flex h-[46px] w-full items-center justify-center rounded-xl bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] hover:bg-[#0D9488] print:hidden">Transaksi baru</button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
              <h3 className="font-bold">1. Pilih acara</h3>
              {loading ? <div className="mt-4 h-20 animate-pulse rounded-xl bg-[#F1F4F2]" /> : events.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {events.map((item) => {
                    const selected = item.id === eventId;
                    return (
                      <button key={item.id} type="button" aria-pressed={selected} onClick={() => { setEventId(item.id); setCategoryId(null); setQty(1); setFormError(null); }} className={`rounded-xl border p-4 text-left transition-colors ${selected ? "border-[#0F766E] bg-[#ECFDF5]" : "border-[#E5E7EB] hover:border-[#0F766E]"}`}>
                        <p className="text-sm font-bold">{item.nama_event}</p>
                        <p className="mt-1 text-xs text-[#6B7280]">{item.lokasi}</p>
                        <p className="mt-1 text-xs text-[#6B7280]">{formatTanggal(item.tanggal)}</p>
                      </button>
                    );
                  })}
                </div>
              ) : <p className="mt-4 text-sm text-[#9CA3AF]">Tidak ada acara yang sedang dijual.</p>}
            </section>

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
              <h3 className="font-bold">2. Kategori tiket & jumlah</h3>
              {!event ? <p className="mt-4 text-sm text-[#9CA3AF]">Pilih acara terlebih dahulu.</p> : categories.length ? (
                <>
                  <div className="mt-4 space-y-3">
                    {categories.map((item) => {
                      const left = Math.max(item.kuota - item.terjual, 0);
                      const selected = item.id === categoryId;
                      return (
                        <button key={item.id} type="button" disabled={left < 1} aria-pressed={selected} onClick={() => { setCategoryId(item.id); setQty(1); setFormError(null); }} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-[#0F766E] bg-[#ECFDF5]" : "border-[#E5E7EB] hover:border-[#0F766E]"}`}>
                          <div><p className="text-sm font-bold">{item.nama_kelas}</p><p className="mt-1 text-xs text-[#6B7280]">{left > 0 ? `Sisa ${left.toLocaleString("id-ID")} dari ${item.kuota.toLocaleString("id-ID")}` : "Habis"}</p></div>
                          <p className="text-sm font-bold text-[#0F766E]">{formatRupiah(item.harga)}</p>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <span className="text-sm font-semibold">Jumlah tiket</span>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label="Kurangi" disabled={!category || jumlah <= 1} onClick={() => setQty(jumlah - 1)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D8DEDA] disabled:opacity-40"><Minus size={16} /></button>
                      <span className="w-8 text-center text-lg font-bold" aria-live="polite">{jumlah}</span>
                      <button type="button" aria-label="Tambah" disabled={!category || jumlah >= maxQty} onClick={() => setQty(jumlah + 1)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D8DEDA] disabled:opacity-40"><Plus size={16} /></button>
                    </div>
                    <span className="text-xs text-[#9CA3AF]">Maks. {MAX_TIKET} tiket per transaksi</span>
                  </div>
                </>
              ) : <p className="mt-4 text-sm text-[#9CA3AF]">Acara ini belum punya kategori tiket.</p>}
            </section>

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
              <h3 className="font-bold">3. Data pembeli</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><label htmlFor="nama" className="mb-1.5 block text-sm font-semibold">Nama pembeli *</label><input id="nama" value={nama} maxLength={100} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap" className={fieldClass} /></div>
                <div><label htmlFor="telepon" className="mb-1.5 block text-sm font-semibold">No. telepon</label><input id="telepon" inputMode="tel" value={telepon} maxLength={20} onChange={(e) => setTelepon(e.target.value)} placeholder="Opsional" className={fieldClass} /></div>
                <div><label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Opsional" className={fieldClass} /></div>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 xl:sticky xl:top-6">
            <h3 className="font-bold">Ringkasan pesanan</h3>
            {event && category ? (
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-[#6B7280]">Acara</dt><dd className="text-right font-semibold">{event.nama_event}</dd>
                <dt className="text-[#6B7280]">Kategori</dt><dd className="text-right font-semibold">{category.nama_kelas}</dd>
                <dt className="text-[#6B7280]">Harga</dt><dd className="text-right font-semibold">{formatRupiah(category.harga)}</dd>
                <dt className="text-[#6B7280]">Jumlah</dt><dd className="text-right font-semibold">{jumlah} tiket</dd>
                <dt className="text-[#6B7280]">Pembeli</dt><dd className="text-right font-semibold">{nama.trim() || "-"}</dd>
              </dl>
            ) : <p className="mt-4 text-sm text-[#9CA3AF]">Belum ada tiket yang dipilih.</p>}
            <div className="mt-5 flex items-center justify-between border-t border-[#EEF0EF] pt-4"><span className="text-sm font-semibold">Total bayar</span><span className="text-2xl font-bold text-[#0F766E]">{formatRupiah(total)}</span></div>
            {formError && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{formError}</div>}
            <button type="button" onClick={openConfirm} disabled={!category || sisa < 1} className="mt-5 flex h-[46px] w-full items-center justify-center rounded-xl bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-colors hover:bg-[#0D9488] disabled:cursor-not-allowed disabled:opacity-60">Lanjut ke konfirmasi</button>
          </aside>
        </div>
      )}

      {confirmOpen && event && category && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/40 p-4 print:hidden" role="dialog" aria-modal="true" aria-labelledby="konfirmasi-judul">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between"><h3 id="konfirmasi-judul" className="text-lg font-bold">Konfirmasi transaksi</h3><button type="button" aria-label="Tutup" disabled={submitting} onClick={() => setConfirmOpen(false)}><X size={20} /></button></div>
            <p className="mt-3 text-sm text-[#6B7280]">{jumlah} tiket {category.nama_kelas} · {event.nama_event} untuk <span className="font-semibold text-[#1F2937]">{nama.trim()}</span>.</p>
            <p className="mt-4 text-3xl font-bold text-[#0F766E]">{formatRupiah(total)}</p>
            <p className="mt-3 rounded-lg bg-[#FFFBEB] px-3 py-2.5 text-xs leading-relaxed text-[#92400E]">Transaksi langsung dicatat <strong>lunas</strong> dan stok berkurang. Pastikan pembayaran sudah diterima dari pembeli.</p>
            <div className="mt-5 flex gap-3">
              <button type="button" disabled={submitting} onClick={() => setConfirmOpen(false)} className="h-[46px] flex-1 rounded-xl border border-[#D8DEDA] text-sm font-bold hover:bg-[#F4F8F6] disabled:opacity-50">Batal</button>
              <button type="button" disabled={submitting} onClick={() => void submit()} className="h-[46px] flex-1 rounded-xl bg-[#0F766E] text-sm font-bold text-white hover:bg-[#0D9488] disabled:opacity-60">{submitting ? "Memproses..." : "Pembayaran diterima"}</button>
            </div>
          </div>
        </div>
      )}
    </OfflineShell>
  );
}
