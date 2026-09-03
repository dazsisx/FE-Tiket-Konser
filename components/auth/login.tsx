"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Outfit } from "next/font/google";
import { loginUser } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import TextField from "@/components/ui/TextField";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

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
      // rememberMe dicentang -> sesi disimpan permanen (localStorage), tetap
      // login walau browser ditutup. Tidak dicentang -> sesi hanya bertahan
      // selama tab/browser masih terbuka (sessionStorage).
      login(data, rememberMe);
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
      className={`${outfit.variable} relative h-screen overflow-hidden bg-[#FFFBF5] font-[family-name:var(--font-outfit),Plus_Jakarta_Sans,sans-serif]`}
    >
      {/* Subtle ambient background */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#0F766E] opacity-[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[600px] w-[600px] rounded-full bg-[#F59E0B] opacity-[0.06] blur-[130px]" />

      <div className="relative mx-auto grid h-full max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        {/* Left: brand panel */}
        <div className="relative hidden flex-col items-start justify-center gap-8 overflow-hidden p-10 lg:flex xl:p-16">
          <Link href="/" className="absolute top-10 left-10 flex w-fit shrink-0 items-center xl:top-16 xl:left-16">
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
              Nikmati pengalaman konser terbaik, tanpa ribet.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Satu akun untuk memesan tiket ke seluruh konser favoritmu di DR
              Star.
            </p>
          </div>
        </div>

        {/* Right: login card */}
        <div className="flex h-full flex-col items-center justify-center overflow-y-auto px-6 py-6 sm:px-10">
          {/* Logo, mobile only */}
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
            {/* Heading */}
            <h1 className="text-2xl font-bold tracking-tight text-[#1F2937] sm:text-[28px]">
              Selamat Datang Kembali
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Masuk untuk melanjutkan pemesanan konser favoritmu.
            </p>

            {/* Error message */}
            {error && (
              <div className="mt-5">
                <Alert variant="error">{error}</Alert>
              </div>
            )}

            {/* Form */}
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

              <TextField
                id="password"
                type={showPassword ? "text" : "password"}
                label="Kata Sandi"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi kamu"
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

              {/* Remember me / Forgot password */}
              <div className="flex items-center justify-between">
                <Checkbox
                  id="rememberMe"
                  label="Ingat Saya"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-semibold text-[#F59E0B] transition-colors hover:text-[#D97706] hover:underline"
                >
                  Lupa Kata Sandi?
                </Link>
              </div>

              {/* Login button */}
              <Button type="submit" loading={loading} className="mt-2">
                Masuk
              </Button>
            </form>

            {/* Register text */}
            <p className="mt-5 text-center text-sm text-[#6B7280]">
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