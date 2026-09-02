"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Mail } from "lucide-react";
import { Outfit } from "next/font/google";
import { forgotPassword } from "@/utils/api";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

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
      setError(
        err instanceof Error ? err.message : "Gagal mengirim kode OTP, coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${outfit.variable} relative min-h-screen overflow-hidden bg-[#FFFBF5] font-[family-name:var(--font-outfit),Plus_Jakarta_Sans,sans-serif]`}
    >
      <div className="pointer-events-none absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#0F766E] opacity-[0.07] blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[600px] w-[600px] rounded-full bg-[#F59E0B] opacity-[0.07] blur-[120px]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        <div className="hidden items-center justify-center p-16 lg:flex">
          <div className="relative aspect-[4/5] w-full max-w-[520px]">
            <Image
              src="/ballonbaru1.png"
              alt="Ilustrasi DR Star"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-16 sm:px-10">
          <Link href="/" className="mb-8 flex shrink-0 items-center">
            <Image
              src="/logobaru.png"
              alt="DR Star"
              width={160}
              height={160}
              priority
              className="h-11 w-auto object-contain"
            />
          </Link>

          <div className="w-full max-w-[480px] rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-[0_20px_60px_rgba(31,41,55,0.08)] sm:p-10">
            <Link
              href="/auth/login"
              className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#0F766E]"
            >
              <ArrowLeft size={15} />
              Kembali ke Masuk
            </Link>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F766E]/[0.08] text-[#0F766E]">
              <Mail size={22} strokeWidth={1.75} />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[#1F2937] sm:text-[28px]">
              Lupa kata sandi?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Masukkan alamat email yang terdaftar. Kami akan mengirimkan kode
              verifikasi untuk mengatur ulang kata sandi kamu.
            </p>

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-[#1F2937]"
                >
                  Alamat Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamu@contoh.com"
                  className="h-[52px] w-full rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-[52px] w-full rounded-xl bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Mengirim kode..." : "Kirim Kode OTP"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#6B7280]">
              Ingat kata sandi kamu?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-[#F59E0B] transition-all hover:underline"
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}