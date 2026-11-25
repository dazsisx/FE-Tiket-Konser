"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Phone, ShieldCheck, Ticket, Loader2, Search, RotateCcw } from "lucide-react";
import HasilPembelian from "./HasilPembelian";
import { cekPembelian, type HasilCekPembelian } from "@/utils/cekPembelian";

type Metode = "email" | "telepon";

// Aturan yang sama dengan backend (utils/cekPembelian.js) supaya salah ketik ketahuan sebelum request.
const KODE_REGEX = /^TKT-[0-9A-F]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalisasiTelepon(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  digits = digits.replace(/^0+/, "");
  return digits ? `0${digits}` : "";
}

const inputClass =
  "h-[56px] w-full rounded-2xl border border-[#E5E7EB] bg-white pl-11 pr-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)] focus:outline-none";

/**
 * Cek pesanan tanpa login. Verifikasi dilakukan backend (POST /api/pesanan/cek):
 * email / nomor HP saja tidak cukup, harus cocok dengan kode booking pesanannya,
 * dan permintaan gagal dibatasi rate limiter. Frontend hanya mengirim dan menampilkan hasilnya.
 */
export default function GuestLookup() {
  const [metode, setMetode] = useState<Metode>("email");
  const [kontak, setKontak] = useState("");
  const [kode, setKode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasil, setHasil] = useState<HasilCekPembelian | null>(null);

  const pilihMetode = (m: Metode) => {
    if (m === metode) return;
    setMetode(m);
    setKontak("");
    setError("");
    setHasil(null);
  };

  const reset = () => {
    setKontak("");
    setKode("");
    setError("");
    setHasil(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setHasil(null);

    const kodeBersih = kode.trim().toUpperCase();
    const kontakBersih = kontak.trim();

    if (metode === "email") {
      if (!EMAIL_REGEX.test(kontakBersih) || kontakBersih.length > 150) {
        setError("Format email tidak valid.");
        return;
      }
    } else {
      const tel = normalisasiTelepon(kontakBersih);
      if (tel.length < 9 || tel.length > 15) {
        setError("Format nomor HP tidak valid. Contoh: 081234567890.");
        return;
      }
    }
    if (!KODE_REGEX.test(kodeBersih)) {
      setError("Format kode booking tidak valid. Contoh: TKT-1A2B3C4D.");
      return;
    }

    setLoading(true);
    try {
      setHasil(
        await cekPembelian(
          metode === "email"
            ? { kode_tiket: kodeBersih, email: kontakBersih }
            : { kode_tiket: kodeBersih, no_telepon: kontakBersih }
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const Icon = metode === "email" ? Mail : Phone;

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-7 shadow-[0_20px_60px_rgba(31,41,55,0.10)] sm:p-10">
        <h2 className="text-2xl font-extrabold text-[#1F2937] sm:text-[28px]">Cek Pesanan Tanpa Login</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#6B7280] sm:text-[15px]">
          Pilih email atau nomor HP yang kamu pakai saat membeli, lalu masukkan kode booking pesanan untuk melihat status dan tiketmu.
        </p>

        {/* Pilihan metode */}
        <div role="group" aria-label="Metode pencarian" className="mt-6 grid grid-cols-2 gap-1.5 rounded-full bg-[#F3F4F6] p-1.5">
          {(
            [
              ["email", "Email", Mail],
              ["telepon", "Nomor HP", Phone],
            ] as const
          ).map(([key, label, MIcon]) => (
            <button
              key={key}
              type="button"
              onClick={() => pilihMetode(key)}
              aria-pressed={metode === key}
              className={`flex h-11 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-200 ${
                metode === key
                  ? "bg-white text-[#0F766E] shadow-[0_4px_14px_rgba(15,118,110,0.18)] ring-1 ring-[#F59E0B]/40"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              <MIcon size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-2">
          <label htmlFor="kontak" className="text-sm font-semibold text-[#1F2937]">
            {metode === "email" ? "Email" : "Nomor HP"} <span className="text-[#0F766E]">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]">
              <Icon size={18} />
            </span>
            <input
              id="kontak"
              key={metode}
              type={metode === "email" ? "email" : "tel"}
              inputMode={metode === "email" ? "email" : "tel"}
              autoComplete={metode === "email" ? "email" : "tel"}
              value={kontak}
              onChange={(e) => setKontak(e.target.value)}
              placeholder={metode === "email" ? "Email yang dipakai saat membeli" : "Contoh: 081234567890"}
              className={inputClass}
            />
          </div>

          <label htmlFor="kode" className="mt-4 text-sm font-semibold text-[#1F2937]">
            Kode Booking <span className="text-[#0F766E]">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]">
              <Ticket size={18} />
            </span>
            <input
              id="kode"
              type="text"
              value={kode}
              onChange={(e) => setKode(e.target.value.toUpperCase())}
              placeholder="Contoh: TKT-1A2B3C4D"
              maxLength={12}
              autoComplete="off"
              spellCheck={false}
              className={`${inputClass} tracking-wider placeholder:tracking-normal`}
            />
          </div>
          <p className="text-xs text-[#6B7280]">Kode booking diawali TKT- dan tertera pada pesanan atau struk pembelianmu.</p>

          {error && (
            <p role="alert" className="mt-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Memeriksa...
              </>
            ) : (
              <>
                <Search size={18} aria-hidden="true" />
                Cek Pesanan
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#0F766E]/15 bg-[#ECFDF5] px-4 py-3.5 text-xs leading-relaxed text-[#6B7280]">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#0F766E]" aria-hidden="true" />
          <p>
            Demi keamanan, daftar pesanan tidak bisa dibuka hanya dengan email atau nomor HP. Kode booking dipakai untuk memastikan pesanan ini milikmu.
          </p>
        </div>

        {hasil && (
          <>
            <HasilPembelian data={hasil} />
            <button
              type="button"
              onClick={reset}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[#E5E7EB] text-sm font-semibold text-[#1F2937] transition-colors hover:border-[#0F766E] hover:text-[#0F766E]"
            >
              <RotateCcw size={15} aria-hidden="true" />
              Cek Pesanan Lain
            </button>
          </>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-[#6B7280]">
        Punya akun?{" "}
        <Link href="/auth/login" className="font-bold text-[#F59E0B] hover:underline">
          Masuk
        </Link>{" "}
        untuk melihat seluruh histori pembelianmu.
      </p>
    </div>
  );
}
