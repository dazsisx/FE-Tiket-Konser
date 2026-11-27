"use client";

import Link from "next/link";
import FlyerShell from "@/components/flyer/FlyerShell";
import FlyerHero from "@/components/flyer/FlyerHero";
import { THEME_PEMBELIAN } from "@/components/flyer/theme";
import styles from "@/components/flyer/flyer.module.css";
import { useAuth } from "@/contexts/AuthContext";
import GuestLookup from "./guest-lookup";
import RiwayatSaya from "./riwayat";

/**
 * Histori Pembelian Tiket.
 * - Sudah login: daftar transaksi milik akun (GET /api/pesanan/riwayat).
 * - Belum login: cek pesanan lewat OTP (email / nomor HP, kode dikirim ke email) via POST /api/pesanan/cek/kirim-otp dan /cek/verifikasi.
 */
export default function HistoriPembelian() {
  const { user, isLoading } = useAuth();
  const isCustomer = user?.role === "pelanggan";

  return (
    <FlyerShell theme={THEME_PEMBELIAN} curtainLabel="Pembelian">
      {isLoading ? (
        <>
          <FlyerHero kicker="Riwayat transaksi" title="Pembelian" tagline="Semua tiket yang pernah kamu pesan, di satu tempat." />
          <div className={styles.list} aria-busy="true" aria-label="Memuat">
            {[0, 1].map((n) => (
              <div key={n} className={styles.skeleton} />
            ))}
          </div>
        </>
      ) : !user ? (
        <>
          <FlyerHero
            kicker="Tanpa akun juga bisa"
            title="Cek Pesanan"
            stampLabel="Cek Pesanan"
            tagline="Tanpa akun pun, tiketmu tetap bisa dilihat."
            blurb="Masukkan email yang dipakai saat membeli, lalu isi kode OTP yang kami kirim ke emailmu."
          />
          <GuestLookup />
        </>
      ) : isCustomer ? (
        <RiwayatSaya />
      ) : (
        <>
          <FlyerHero kicker="Riwayat transaksi" title="Pembelian" tagline="Semua tiket yang pernah kamu pesan, di satu tempat." />
          <div className={styles.empty}>
            <p className={`${styles.display} ${styles.emptyTitle}`}>Histori khusus akun pelanggan</p>
            <p className={styles.emptyText}>Akun ini adalah akun petugas. Transaksi dikelola lewat dashboard admin.</p>
            <div className={styles.emptyActions}>
              <Link href={user.role === "admin" ? "/admin/orders" : "/admin/offline/riwayat"} className={styles.btn}>
                Buka dashboard
              </Link>
            </div>
          </div>
        </>
      )}
    </FlyerShell>
  );
}