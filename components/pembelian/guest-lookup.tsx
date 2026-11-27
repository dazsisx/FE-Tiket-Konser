"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, ShieldCheck, KeyRound, Loader2, Search, RotateCcw, Send } from "lucide-react";
import styles from "@/components/flyer/flyer.module.css";
import HasilPembelian from "./HasilPembelian";
import {
  kirimOtpCekPembelian,
  verifikasiOtpCekPembelian,
  type HasilCekPembelian,
} from "@/utils/cekPembelian";

type Langkah = "email" | "otp";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // detik
// Aturan yang sama dengan backend (utils/cekPembelian.js) supaya salah ketik ketahuan sebelum request.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LANGKAH = [
  { judul: "Masukkan email pembelian", teks: "Pakai email yang sama dengan saat kamu memesan tiket." },
  { judul: "Masukkan kode OTP", teks: "Kami kirim 6 digit kode ke emailmu. Berlaku 10 menit." },
  { judul: "Lihat status dan tiketmu", teks: "Kalau sudah lunas, QR tiket langsung muncul dan bisa diunduh." },
];

/**
 * Cek pesanan tanpa login. Verifikasi dilakukan backend lewat OTP email:
 *   POST /api/pesanan/cek/kirim-otp  -> kirim kode ke email pembeli
 *   POST /api/pesanan/cek/verifikasi -> cek kode, balikan daftar pesanan
 * Frontend hanya mengirim dan menampilkan hasilnya.
 */
export default function GuestLookup() {
  const [langkah, setLangkah] = useState<Langkah>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [hasil, setHasil] = useState<HasilCekPembelian[] | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const reset = () => {
    setLangkah("email");
    setEmail("");
    setOtp("");
    setError("");
    setInfo("");
    setCooldown(0);
    setHasil(null);
  };

  const gantiEmail = () => {
    setLangkah("email");
    setOtp("");
    setError("");
    setInfo("");
  };

  /** Validasi email di sisi klien. Mengembalikan email bersih, atau null (error sudah di-set). */
  const bacaEmail = (): string | null => {
    const bersih = email.trim();
    if (!EMAIL_REGEX.test(bersih) || bersih.length > 150) {
      setError("Format email tidak valid.");
      return null;
    }
    return bersih;
  };

  const kirimOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    if (loading || cooldown > 0) return;
    setError("");
    setInfo("");

    const bersih = bacaEmail();
    if (!bersih) return;

    setLoading(true);
    try {
      await kirimOtpCekPembelian({ email: bersih });
      setLangkah("otp");
      setOtp("");
      setCooldown(RESEND_COOLDOWN);
      setInfo("Jika ada pesanan dengan email ini, kode OTP sudah kami kirim. Cek kotak masuk atau folder spam.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const verifikasi = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (otp.length !== OTP_LENGTH) {
      setError(`Masukkan ${OTP_LENGTH} digit kode OTP.`);
      return;
    }
    const bersih = bacaEmail();
    if (!bersih) return;

    setLoading(true);
    try {
      setHasil(await verifikasiOtpCekPembelian({ email: bersih }, otp));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "2.5rem" }}>
      <article className={`${styles.ticket} ${styles.ticketForm}`}>
        <div className={styles.main} style={{ padding: "1.6rem 1.4rem" }}>
          <p className={styles.when}>Tanpa login</p>
          <h2 className={`${styles.display} ${styles.stepsTitle}`} style={{ marginTop: "0.45rem" }}>
            Tiga langkah, selesai
          </h2>
          <ol className={styles.steps}>
            {LANGKAH.map((l, i) => (
              <li key={l.judul} className={styles.step}>
                <span className={`${styles.display} ${styles.stepNum}`}>{i + 1}</span>
                <div>
                  <p className={styles.stepTitle}>{l.judul}</p>
                  <p className={styles.stepText}>{l.teks}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.note}>
            <ShieldCheck size={18} aria-hidden="true" />
            <span>
              Demi keamanan, daftar pesanan tidak bisa dibuka hanya dengan email. Kode OTP yang dikirim ke emailmu dipakai untuk memastikan pesanan ini milikmu.
            </span>
          </p>
        </div>

        <div className={`${styles.stub} ${styles.stubForm}`}>
          <div className={styles.stubHead}>
            <span className={styles.stubTitle}>Cek pesanan</span>
          </div>

          {langkah === "email" ? (
            <form onSubmit={kirimOtp} noValidate className={styles.form}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <div className={styles.field}>
                <Mail size={18} className={styles.fieldIcon} aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email yang dipakai saat membeli"
                  className={styles.input}
                />
              </div>
              <p className={styles.hint}>Kode OTP akan dikirim ke email ini.</p>

              {error && (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className={`${styles.cta} ${styles.ctaBlock} ${styles.submit}`}>
                {loading ? (
                  <>
                    <Loader2 size={18} className={styles.spin} aria-hidden="true" />
                    Mengirim kode...
                  </>
                ) : (
                  <>
                    <Send size={18} aria-hidden="true" />
                    Kirim kode OTP
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={verifikasi} noValidate className={styles.form}>
              <p className={styles.hint} style={{ marginTop: "0.8rem" }}>
                {email.trim()}
              </p>

              <label htmlFor="otp" className={styles.label}>
                Kode OTP
              </label>
              <div className={styles.field}>
                <KeyRound size={18} className={styles.fieldIcon} aria-hidden="true" />
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                  placeholder="6 digit kode"
                  maxLength={OTP_LENGTH}
                  spellCheck={false}
                  autoFocus
                  className={`${styles.input} ${styles.inputCode}`}
                />
              </div>
              {info && <p className={styles.hint}>{info}</p>}

              {error && (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className={`${styles.cta} ${styles.ctaBlock} ${styles.submit}`}>
                {loading ? (
                  <>
                    <Loader2 size={18} className={styles.spin} aria-hidden="true" />
                    Memeriksa...
                  </>
                ) : (
                  <>
                    <Search size={18} aria-hidden="true" />
                    Cek pesanan
                  </>
                )}
              </button>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => void kirimOtp()}
                  disabled={loading || cooldown > 0}
                  className={`${styles.btn} ${styles.btnGhost}`}
                >
                  {cooldown > 0 ? `Kirim ulang kode (${cooldown} dtk)` : "Kirim ulang kode"}
                </button>
                <button type="button" onClick={gantiEmail} disabled={loading} className={`${styles.btn} ${styles.btnGhost}`}>
                  Ganti email
                </button>
              </div>
            </form>
          )}
        </div>
      </article>

      {hasil && (
        <>
          {hasil.length === 0 ? (
            <p className={styles.below}>Belum ada pesanan yang terhubung dengan email ini.</p>
          ) : (
            hasil.map((h) => <HasilPembelian key={h.kode_tiket} data={h} />)
          )}
          <div style={{ marginTop: "1.25rem" }}>
            <button type="button" onClick={reset} className={`${styles.btn} ${styles.btnGhost}`}>
              <RotateCcw size={15} aria-hidden="true" />
              Cek pesanan lain
            </button>
          </div>
        </>
      )}

      <p className={styles.below}>
        Punya akun? <Link href="/auth/login">Masuk</Link> untuk melihat seluruh histori pembelianmu.
      </p>
    </div>
  );
}