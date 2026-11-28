"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { forgotPassword } from "@/utils/api";
import AuthShell from "./AuthShell";
import { Field, FormAlert, SubmitButton } from "./fields";
import styles from "./auth.module.css";

const PERKS = [
  { icon: Mail, text: "Masukkan email yang terdaftar" },
  { icon: ShieldCheck, text: "Verifikasi dengan kode OTP" },
  { icon: KeyRound, text: "Buat kata sandi baru" },
];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Alamat email wajib diisi.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid.");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword({ email });
      // Simpan email di session storage supaya bisa dipakai di halaman verifikasi
      sessionStorage.setItem("resetEmail", email);
      router.push("/auth/verify-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim kode OTP, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      curtainLabel="Lupa Sandi"
      kicker="Pulihkan akun"
      title="Lupa Sandi"
      tagline="Lupa kata sandi bisa terjadi pada siapa saja."
      blurb="Kami bantu kamu masuk kembali ke akun DR Star dalam beberapa langkah singkat."
      perks={PERKS}
      ticketTag="Atur ulang sandi"
    >
      <h1 className={`${styles.display} ${styles.heading}`}>Lupa Kata Sandi?</h1>
      <span className={styles.bar} aria-hidden="true" />
      <p className={styles.sub}>
        Masukkan alamat email yang terdaftar. Kami akan mengirimkan kode verifikasi untuk mengatur
        ulang kata sandi kamu.
      </p>

      {error && <FormAlert>{error}</FormAlert>}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <Field
          id="email"
          type="email"
          label="Alamat Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="kamu@contoh.com"
          icon={<Mail size={18} />}
        />

        <SubmitButton loading={loading} loadingText="Mengirim kode...">
          Kirim Kode OTP
        </SubmitButton>
      </form>

      <p className={styles.switch}>
        Ingat kata sandi kamu?
        <Link href="/auth/login" className={styles.switchLink}>
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
}