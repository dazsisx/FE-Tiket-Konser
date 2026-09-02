"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Outfit } from "next/font/google";
import { verifyResetOtp, resendResetOtp } from "@/utils/api";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // detik

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");
    if (!storedEmail) {
      router.replace("/auth/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }
    setDigits((prev) => {
      const next = [...prev];
      next[index] = clean[clean.length - 1];
      return next;
    });
    if (index < OTP_LENGTH - 1) focusInput(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setDigits(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const code = digits.join("");

  const handleVerify = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setError(null);

      if (code.length !== OTP_LENGTH) {
        setError("Masukkan 6 digit kode OTP.");
        return;
      }
      if (!email) return;

      try {
        setLoading(true);
        const res = await verifyResetOtp({ email, otp: code });
        // Simpan reset token sementara untuk halaman reset password
        if (res?.resetToken) {
          sessionStorage.setItem("resetToken", res.resetToken);
        }
        router.push("/auth/reset-password");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Kode OTP tidak valid atau kedaluwarsa."
        );
      } finally {
        setLoading(false);
      }
    },
    [code, email, router]
  );

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setError(null);
    try {
      setResending(true);
      await resendResetOtp({ email });
      setCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(""));
      focusInput(0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengirim ulang kode OTP."
      );
    } finally {
      setResending(false);
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F766E]/[0.08] text-[#0F766E]">
              <ShieldCheck size={22} strokeWidth={1.75} />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[#1F2937] sm:text-[28px]">
              Verifikasi email kamu
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Masukkan 6 digit kode verifikasi yang kami kirim ke{" "}
              <span className="font-semibold text-[#1F2937]">
                {email ?? "email kamu"}
              </span>
              .
            </p>

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-6">
              <div className="flex justify-between gap-2 sm:gap-3">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="h-14 w-full max-w-[52px] rounded-xl border border-[#E5E7EB] bg-white text-center text-xl font-bold text-[#1F2937] transition-all duration-200 focus:border-[#0F766E] focus:shadow-[0_0_0_4px_rgba(15,118,110,0.12)] focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-[52px] w-full rounded-xl bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Memverifikasi..." : "Verifikasi Kode"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#6B7280]">
              {cooldown > 0 ? (
                <span>
                  Kirim ulang kode dalam{" "}
                  <span className="font-semibold text-[#1F2937]">
                    {cooldown}s
                  </span>
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="font-semibold text-[#F59E0B] transition-all hover:underline disabled:opacity-60"
                >
                  {resending ? "Mengirim ulang..." : "Kirim Ulang Kode OTP"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}