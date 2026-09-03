"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Outfit } from "next/font/google";
import { registerUser } from "@/utils/api";
import TextField from "@/components/ui/TextField";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setError(
        err instanceof Error ? err.message : "Registrasi gagal, coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${outfit.variable} relative h-screen overflow-hidden bg-[#FFFBF5] font-[family-name:var(--font-outfit),Plus_Jakarta_Sans,sans-serif]`}
    >
      {/* Subtle ambient background */}
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
              Gabung dan jangan lewatkan konser favoritmu.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Satu akun untuk memesan tiket ke seluruh konser favoritmu di DR
              Star.
            </p>
          </div>
        </div>

        {/* Right: register card */}
        <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-6 py-6 sm:px-10">
          {/* Logo, mobile only */}
          <Link href="/" className="mb-4 flex shrink-0 items-center lg:hidden">
            <Image
              src="/logobaru.png"
              alt="DR Star"
              width={160}
              height={160}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="w-full max-w-[440px] rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_60px_rgba(31,41,55,0.08)]">
            {/* Heading */}
            <h1 className="text-xl font-bold tracking-tight text-[#1F2937] sm:text-2xl">
              Buat Akun
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">
              Daftar untuk mulai memesan konser favoritmu.
            </p>

            {/* Error message */}
            {error && (
              <div className="mt-3">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-4 flex flex-col gap-3"
            >
              <TextField
                id="fullName"
                type="text"
                size="sm"
                label="Nama Lengkap"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap kamu"
                icon={<User size={18} />}
              />

              <TextField
                id="email"
                type="email"
                size="sm"
                label="Alamat Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@contoh.com"
                icon={<Mail size={18} />}
              />

              <TextField
                id="password"
                type={showPassword ? "text" : "password"}
                size="sm"
                label="Kata Sandi"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat kata sandi"
                icon={<Lock size={18} />}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    className="text-[#9CA3AF] transition-colors hover:text-[#0F766E] focus-visible:outline-none focus-visible:text-[#0F766E]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <TextField
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                size="sm"
                label="Konfirmasi Kata Sandi"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Masukkan ulang kata sandi kamu"
                icon={<Lock size={18} />}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    className="text-[#9CA3AF] transition-colors hover:text-[#0F766E] focus-visible:outline-none focus-visible:text-[#0F766E]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                }
              />

              {/* Terms & Conditions */}
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                label={
                  <>
                    Saya menyetujui{" "}
                    <Link
                      href="/terms"
                      className="font-semibold text-[#0F766E] hover:underline"
                    >
                      Syarat & Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-[#0F766E] hover:underline"
                    >
                      Kebijakan Privasi
                    </Link>
                  </>
                }
              />

              {/* Register button */}
              <Button type="submit" size="sm" loading={loading} loadingText="Memproses..." className="mt-1">
                Buat Akun
              </Button>
            </form>

            {/* Login text */}
            <p className="mt-4 text-center text-sm text-[#6B7280]">
              Sudah punya akun?{" "}
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