"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, LayoutDashboard, Mail, QrCode, ShieldCheck, Ticket } from "lucide-react";
import { loginUser } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import AuthShell from "./AuthShell";
import { CheckField, Field, FormAlert, PasswordField, SubmitButton } from "./fields";
import styles from "./auth.module.css";

const CUSTOMER_PERKS = [
  { icon: Ticket, text: "E-tiket langsung ada di akunmu" },
  { icon: ShieldCheck, text: "Pembayaran lewat metode pilihanmu" },
  { icon: History, text: "Riwayat pembelian rapi" },
];

const STAFF_PERKS = [
  { icon: LayoutDashboard, text: "Dashboard event & penjualan" },
  { icon: QrCode, text: "Pindai QR tiket di pintu masuk" },
  { icon: History, text: "Laporan transaksi" },
];

export default function LoginPage({ adminOnly = false }: { adminOnly?: boolean }) {
  const router = useRouter();
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser({ email, password });
      // Portal staf: Admin Online dan Admin Offline masuk lewat halaman yang sama.
      if (adminOnly && data.role !== "admin" && data.role !== "admin_offline") {
        throw new Error("Akun ini bukan akun admin.");
      }
      // rememberMe dicentang -> sesi disimpan permanen (localStorage), tetap
      // login walau browser ditutup. Tidak dicentang -> sesi hanya bertahan
      // selama tab/browser masih terbuka (sessionStorage).
      login(data, rememberMe);
      router.push(
        data.role === "admin" ? "/admin" : data.role === "admin_offline" ? "/admin/offline" : "/"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      curtainLabel={adminOnly ? "Portal Staf" : "Masuk"}
      kicker={adminOnly ? "Khusus tim pengelola" : "Selamat datang kembali"}
      title={adminOnly ? "Portal Staf" : "Masuk"}
      tagline={
        adminOnly
          ? "Kelola konser dan penjualan tiket dengan lebih terarah."
          : "Nikmati pengalaman konser terbaik, tanpa ribet."
      }
      blurb={
        adminOnly
          ? "Portal internal DR Star untuk tim pengelola acara."
          : "Satu akun untuk memesan tiket ke seluruh konser favoritmu di DR Star."
      }
      perks={adminOnly ? STAFF_PERKS : CUSTOMER_PERKS}
      ticketTag={adminOnly ? "Portal staf" : "Akun pelanggan"}
    >
      <h1 className={`${styles.display} ${styles.heading}`}>
        {adminOnly ? "Masuk ke Admin Portal" : "Selamat Datang Kembali"}
      </h1>
      <span className={styles.bar} aria-hidden="true" />
      <p className={styles.sub}>
        {adminOnly
          ? "Gunakan akun yang dibuat oleh administrator utama."
          : "Masuk untuk melanjutkan pemesanan konser favoritmu."}
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

        <PasswordField
          id="password"
          label="Kata Sandi"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan kata sandi kamu"
        />

        <div className={styles.row}>
          <CheckField
            id="rememberMe"
            label="Ingat saya"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <Link href="/auth/forgot-password" className={styles.textLink}>
            Lupa kata sandi?
          </Link>
        </div>

        <SubmitButton loading={loading} loadingText="Memproses...">
          Masuk
        </SubmitButton>
      </form>

      {!adminOnly && (
        <p className={styles.switch}>
          Belum punya akun?
          <Link href="/auth/register" className={styles.switchLink}>
            Daftar
          </Link>
        </p>
      )}
    </AuthShell>
  );
}