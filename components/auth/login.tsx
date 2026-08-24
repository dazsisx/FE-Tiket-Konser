"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Outfit } from "next/font/google";
import { loginUser, saveAuth } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
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
      login(data);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Email atau password salah."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${outfit.variable} relative min-h-screen overflow-hidden bg-[#FFFBF5] font-[family-name:var(--font-outfit),Plus_Jakarta_Sans,sans-serif]`}
    >
      {/* Subtle ambient background */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#0F766E] opacity-[0.07] blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[600px] w-[600px] rounded-full bg-[#F59E0B] opacity-[0.07] blur-[120px]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        {/* Left: illustration */}
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

        {/* Right: login card */}
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

          <div className="w-full max-w-[480px] rounded-[24px] border border-[#E5E7EB] bg-white p-8 shadow-[0_20px_60px_rgba(31,41,55,0.08)] sm:p-10">
            {/* Heading */}
            <h1 className="text-2xl font-bold text-[#1F2937] sm:text-[28px]">
              Selamat Datang Kembali
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Masuk untuk melanjutkan pemesanan konser favoritmu.
            </p>

            {/* Error message */}
            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              {/* Email */}
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

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-[#1F2937]"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi kamu"
                    className="h-[52px] w-full rounded-xl border border-[#E5E7EB] bg-white px-4 pr-12 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#0F766E]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember me / Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-[#E5E7EB] accent-[#0F766E]"
                  />
                  Ingat Saya
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-semibold text-[#F59E0B] transition-colors hover:text-[#D97706] hover:underline"
                >
                  Lupa Kata Sandi?
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-[52px] w-full rounded-xl bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            {/* Register text */}
            <p className="mt-7 text-center text-sm text-[#6B7280]">
              Belum punya akun?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-[#F59E0B] transition-all hover:underline"
              >
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}