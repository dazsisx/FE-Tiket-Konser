"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { Outfit } from "next/font/google";
import { forgotPassword } from "@/utils/api";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

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
              Lupa kata sandi bisa terjadi pada siapa saja.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Kami bantu kamu masuk kembali ke akun DR Star dalam beberapa
              langkah singkat.
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

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1F2937] sm:text-[28px]">
              Lupa kata sandi?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Masukkan alamat email yang terdaftar. Kami akan mengirimkan
              kode verifikasi untuk mengatur ulang kata sandi kamu.
            </p>

            {error && (
              <div className="mt-5">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-6 flex flex-col gap-4"
            >
              <TextField
                id="email"
                type="email"
                label="Alamat Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@contoh.com"
                icon={<Mail size={18} />}
              />

              <Button type="submit" loading={loading} loadingText="Mengirim kode..." className="mt-1">
                Kirim Kode OTP
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-[#6B7280]">
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