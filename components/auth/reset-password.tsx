"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { Outfit } from "next/font/google";
import { resetPassword } from "@/utils/api";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");
    const storedToken = sessionStorage.getItem("resetToken");
    if (!storedEmail || !storedToken) {
      router.replace("/auth/forgot-password");
      return;
    }
    setEmail(storedEmail);
    setResetToken(storedToken);
  }, [router]);

  const checks = useMemo(() => getPasswordChecks(password), [password]);
  const strengthScore = Object.values(checks).filter(Boolean).length;
  const strengthLabel =
    strengthScore <= 1
      ? "Lemah"
      : strengthScore <= 3
      ? "Sedang"
      : "Kuat";
  const strengthColor =
    strengthScore <= 1
      ? "bg-red-500"
      : strengthScore <= 3
      ? "bg-[#F59E0B]"
      : "bg-[#0F766E]";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (!Object.values(checks).every(Boolean)) {
      setError("Kata sandi belum memenuhi seluruh syarat.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (!email || !resetToken) return;

    try {
      setLoading(true);
      await resetPassword({ email, resetToken, password });
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetToken");
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengatur ulang kata sandi."
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
            {success ? (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F766E]/[0.08] text-[#0F766E]">
                  <CheckCircle2 size={26} strokeWidth={1.75} />
                </div>
                <h1 className="mt-4 text-xl font-bold text-[#1F2937]">
                  Kata sandi berhasil diatur ulang
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  Kata sandi kamu telah berhasil diperbarui. Kamu sekarang
                  bisa masuk dengan kata sandi baru.
                </p>
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F766E]/[0.08] text-[#0F766E]">
                  <KeyRound size={22} strokeWidth={1.75} />
                </div>

                <h1 className="mt-4 text-2xl font-bold text-[#1F2937] sm:text-[28px]">
                  Buat kata sandi baru
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  Kata sandi baru harus berbeda dari kata sandi yang pernah
                  kamu gunakan sebelumnya.
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
                      htmlFor="password"
                      className="text-sm font-semibold text-[#1F2937]"
                    >
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Buat kata sandi baru"
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

                    {password && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                            style={{ width: `${(strengthScore / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#6B7280]">
                          {strengthLabel}
                        </span>
                      </div>
                    )}

                    <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {[
                        { key: "length", label: "Minimal 8 karakter" },
                        { key: "uppercase", label: "1 huruf besar" },
                        { key: "lowercase", label: "1 huruf kecil" },
                        { key: "number", label: "1 angka" },
                      ].map((item) => {
                        const ok = checks[item.key as keyof typeof checks];
                        return (
                          <li
                            key={item.key}
                            className={`flex items-center gap-1.5 text-xs ${
                              ok ? "text-[#0F766E]" : "text-[#9CA3AF]"
                            }`}
                          >
                            <CheckCircle2
                              size={13}
                              className={ok ? "opacity-100" : "opacity-40"}
                            />
                            {item.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-[#1F2937]"
                    >
                      Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Masukkan ulang kata sandi baru"
                        className="h-[52px] w-full rounded-xl border border-[#E5E7EB] bg-white px-4 pr-12 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={
                          showConfirmPassword
                            ? "Sembunyikan password"
                            : "Tampilkan password"
                        }
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-[#9CA3AF] transition-colors hover:text-[#0F766E]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-[52px] w-full rounded-xl bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading ? "Menyimpan..." : "Atur Ulang Kata Sandi"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}