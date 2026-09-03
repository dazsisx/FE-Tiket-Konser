"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Outfit } from "next/font/google";
import { verifyResetOtp, resendResetOtp } from "@/utils/api";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

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
      className={`${outfit.variable} relative h-screen overflow-hidden bg-[#FFFBF5] font-[family-name:var(--font-outfit),Plus_Jakarta_Sans,sans-serif]`}
    >
      <div className="pointer-events-none absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#0F766E] opacity-[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[600px] w-[600px] rounded-full bg-[#F59E0B] opacity-[0.06] blur-[130px]" />

      <div className="relative mx-auto grid h-full max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        {/* Left: brand panel */}
        <div className="relative hidden flex-col items-start justify-center gap-8 overflow-hidden p-10 lg:flex xl:p-16">
          <Link
            href="/"
            className="absolute top-10 left-10 flex w-fit shrink-0 items-center xl:top-16 xl:left-16"
          >
            <Image
              src="/logobaru.png"
              alt="DR Star"
              width={160}
              height={160}
              priority
              className="h-11 w-auto object-contain"
            />
          </Link>

          <div className="relative mx-auto aspect-[4/5] h-[38vh] max-h-[380px] w-auto">
            <Image
              src="/ballonbaru1.png"
              alt="Ilustrasi DR Star"
              fill
              priority
              className="object-contain"
            />
          </div>

          <div className="mx-auto max-w-sm">
            <p className="text-lg font-semibold leading-snug text-[#1F2937]">
              Hampir selesai, tinggal satu langkah lagi.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Verifikasi email kamu untuk melanjutkan proses pengaturan
              ulang kata sandi.
            </p>
          </div>
        </div>

        {/* Right: form card */}
        <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-6 py-6 sm:px-10">
          <Link href="/" className="mb-6 flex shrink-0 items-center lg:hidden">
            <Image
              src="/logobaru.png"
              alt="DR Star"
              width={160}
              height={160}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="w-full max-w-[440px] rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_60px_rgba(31,41,55,0.08)] sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F766E]/[0.08] text-[#0F766E]">
              <ShieldCheck size={22} strokeWidth={1.75} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1F2937] sm:text-[28px]">
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
              <div className="mt-5">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleVerify} className="mt-6 flex flex-col gap-5">
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

              <Button type="submit" loading={loading} loadingText="Memverifikasi...">
                Verifikasi Kode
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-[#6B7280]">
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