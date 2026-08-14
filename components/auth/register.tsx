"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div
      className={`${outfit.variable} relative min-h-screen overflow-hidden bg-white font-[family-name:var(--font-outfit),Plus_Jakarta_Sans,sans-serif]`}
    >
      {/* Subtle ambient background */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#2563EB] opacity-[0.06] blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[600px] w-[600px] rounded-full bg-[#06B6D4] opacity-[0.06] blur-[120px]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        {/* Left: illustration */}
        <div className="hidden items-center justify-center p-16 lg:flex">
          <div className="relative aspect-[4/5] w-full max-w-[520px]">
            <Image
              src="/ballon.png"
              alt="Ilustrasi DR Star"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Right: register card */}
        <div className="flex flex-col items-center justify-center px-6 py-16 sm:px-10">
          {/* Logo */}
          <Link href="/" className="mb-8 flex shrink-0 items-center">
            <Image
              src="/DRStar-baru.png"
              alt="DR Star"
              width={160}
              height={160}
              priority
              className="h-11 w-auto object-contain"
            />
          </Link>

          <div className="w-full max-w-[480px] rounded-[24px] border border-[#E6EEF8] bg-white p-8 shadow-[0_20px_60px_rgba(8,27,75,0.08)] sm:p-10">
            {/* Heading */}
            <h1 className="text-2xl font-bold text-[#081B4B] sm:text-[28px]">
              Buat Akun
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
              Daftar untuk mulai memesan konser favoritmu.
            </p>

            {/* Form */}
            <form className="mt-8 flex flex-col gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="fullName"
                  className="text-sm font-semibold text-[#081B4B]"
                >
                  Nama Lengkap
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap kamu"
                  className="h-[52px] w-full rounded-xl border border-[#DCE7F5] bg-white px-4 text-sm text-[#081B4B] placeholder:text-[#94A3B8] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)] focus:outline-none"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-[#081B4B]"
                >
                  Alamat Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamu@contoh.com"
                  className="h-[52px] w-full rounded-xl border border-[#DCE7F5] bg-white px-4 text-sm text-[#081B4B] placeholder:text-[#94A3B8] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)] focus:outline-none"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-[#081B4B]"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Buat kata sandi"
                    className="h-[52px] w-full rounded-xl border border-[#DCE7F5] bg-white px-4 pr-12 text-sm text-[#081B4B] placeholder:text-[#94A3B8] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#2563EB]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-[#081B4B]"
                >
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Masukkan ulang kata sandi kamu"
                    className="h-[52px] w-full rounded-xl border border-[#DCE7F5] bg-white px-4 pr-12 text-sm text-[#081B4B] placeholder:text-[#94A3B8] transition-all duration-200 focus:border-[#2563EB] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#2563EB]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <label className="flex items-start gap-2 text-sm text-[#64748B]">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#DCE7F5] accent-[#2563EB]"
                />
                <span>
                  Saya menyetujui{" "}
                  <Link
                    href="/terms"
                    className="font-semibold text-[#2563EB] hover:underline"
                  >
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-[#2563EB] hover:underline"
                  >
                    Kebijakan Privasi
                  </Link>
                </span>
              </label>

              {/* Register button */}
              <button
                type="submit"
                className="mt-2 h-[52px] w-full rounded-xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-sm font-bold text-white shadow-[0_10px_28px_rgba(37,99,235,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#1D4ED8] hover:to-[#0891B2]"
              >
                Buat Akun
              </button>
            </form>

            {/* Login text */}
            <p className="mt-7 text-center text-sm text-[#64748B]">
              Sudah punya akun?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-[#06B6D4] transition-all hover:underline"
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