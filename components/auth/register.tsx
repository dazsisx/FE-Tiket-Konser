"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Mail, Ticket, User, Zap } from "lucide-react";
import { registerUser } from "@/utils/api";
import type { LegalVariant } from "@/components/legal";
import AuthShell from "./AuthShell";
import LegalDialog from "./LegalDialog";
import { CheckField, Field, FormAlert, Hint, PasswordField, StrengthMeter, SubmitButton } from "./fields";
import styles from "./auth.module.css";

const PERKS = [
  { icon: Zap, text: "Pesan tiket dalam hitungan menit" },
  { icon: Ticket, text: "E-tiket langsung ada di akunmu" },
  { icon: Heart, text: "Simpan event favorit ke wishlist" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // dialog Syarat & Ketentuan / Kebijakan Privasi (null = tertutup)
  const [legal, setLegal] = useState<LegalVariant | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (!agreeTerms) {
      setError("Kamu harus menyetujui Syarat & Ketentuan terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      await registerUser({ nama: fullName, email, password });
      router.push("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrasi gagal, coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      curtainLabel="Daftar"
      kicker="Anggota baru"
      title="Daftar"
      tagline="Gabung dan jangan lewatkan konser favoritmu."
      blurb="Satu akun untuk memesan tiket ke seluruh konser favoritmu di DR Star."
      perks={PERKS}
      ticketTag="Akun baru"
    >
      <h1 className={`${styles.display} ${styles.heading}`}>Buat Akun</h1>
      <span className={styles.bar} aria-hidden="true" />
      <p className={styles.sub}>Daftar untuk mulai memesan konser favoritmu.</p>

      {error && <FormAlert>{error}</FormAlert>}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <Field
          id="fullName"
          type="text"
          label="Nama Lengkap"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Masukkan nama lengkap kamu"
          icon={<User size={18} />}
        />

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

        <div className={styles.field}>
          <PasswordField
            id="password"
            label="Kata Sandi"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Buat kata sandi"
          />
          {password ? <StrengthMeter password={password} /> : <Hint>Minimal 6 karakter.</Hint>}
        </div>

        <div className={styles.field}>
          <PasswordField
            id="confirmPassword"
            label="Konfirmasi Kata Sandi"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Masukkan ulang kata sandi kamu"
          />
          {confirmPassword && (
            <Hint tone={confirmPassword === password ? "ok" : "bad"}>
              {confirmPassword === password ? "Kata sandi cocok." : "Kata sandi belum cocok."}
            </Hint>
          )}
        </div>

        <CheckField
          id="agreeTerms"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          label={
            <>
              Saya menyetujui{" "}
              <button
                type="button"
                onClick={() => setLegal("terms")}
                className={`${styles.textLink} ${styles.linkBtn}`}
              >
                Syarat &amp; Ketentuan
              </button>{" "}
              dan{" "}
              <button
                type="button"
                onClick={() => setLegal("privacy")}
                className={`${styles.textLink} ${styles.linkBtn}`}
              >
                Kebijakan Privasi
              </button>
            </>
          }
        />

        <SubmitButton loading={loading} loadingText="Memproses...">
          Buat Akun
        </SubmitButton>
      </form>

      <p className={styles.switch}>
        Sudah punya akun?
        <Link href="/auth/login" className={styles.switchLink}>
          Masuk
        </Link>
      </p>

      <LegalDialog
        open={legal !== null}
        tab={legal ?? "terms"}
        onTabChange={setLegal}
        onClose={() => setLegal(null)}
        onAgree={() => {
          setAgreeTerms(true);
          setLegal(null);
        }}
      />
    </AuthShell>
  );
}