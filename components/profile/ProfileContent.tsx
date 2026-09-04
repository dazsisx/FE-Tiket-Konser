"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Ticket,
  LogOut,
  ShieldCheck,
  LayoutGrid,
  BadgeCheck,
  CheckCircle2,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadAvatar } from "@/utils/api";

type TabId = "overview" | "info" | "riwayat" | "keamanan";

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: "overview", label: "Ringkasan", icon: LayoutGrid },
  { id: "info", label: "Info Akun", icon: User },
  { id: "riwayat", label: "Riwayat Pembelian", icon: Ticket },
  { id: "keamanan", label: "Keamanan", icon: ShieldCheck },
];

// TODO: ganti dengan jumlah tiket asli dari endpoint riwayat pembelian user
// begitu backend-nya siap.
const JUMLAH_TIKET = 0;

export default function ProfileContent() {
  const { user, isLoading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFFBF5]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#0F766E]" />
      </div>
    );
  }

  const initials = user.nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleLabel = user.role === "admin" ? "Administrator" : "Pelanggan DR Star";

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return;
    setAvatarError(null);
    if (!file.type.startsWith("image/")) {
      setAvatarError("Pilih file gambar yang valid.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Ukuran avatar maksimal 5MB.");
      return;
    }
    try {
      setAvatarLoading(true);
      updateUser(await uploadAvatar(file));
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "Avatar gagal diperbarui.");
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFBF5] px-4 pb-16 pt-8 sm:pt-10">
      <div className="mx-auto max-w-5xl">
        {/* ===== Profile Hero ===== */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_4px_24px_rgba(15,118,110,0.06)] sm:p-10">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#6EE7B7]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-[#0F766E]/5 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarLoading} className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0F766E] text-2xl font-bold text-white shadow-[0_10px_30px_rgba(15,118,110,0.25)] ring-4 ring-white sm:h-24 sm:w-24 sm:text-3xl">
                {user.avatar_url ? <img src={user.avatar_url} alt="Avatar profil" className="h-full w-full object-cover" /> : initials}
                <span className="absolute inset-0 flex items-center justify-center bg-[#1F2937]/65 text-[10px] font-bold opacity-0 transition-opacity group-hover:opacity-100">Ganti foto</span>
              </button>
              <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { void handleAvatarChange(e.target.files?.[0]); e.target.value = ""; }} />
              <div>
                <h1 className="text-2xl font-bold text-[#1F2937] sm:text-3xl">
                  {user.nama}
                </h1>
                <p className="mt-1 text-sm font-semibold text-[#0F766E]">
                  {roleLabel}
                </p>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-[#6B7280] sm:justify-start">
                  <Mail size={14} />
                  {user.email}
                </p>
                {user.role === "admin" && (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#F59E0B]/10 px-3 py-1 text-xs font-bold text-[#D97706]">
                    <BadgeCheck size={13} />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
          {avatarError && <p className="mt-3 text-center text-sm font-medium text-red-600">{avatarError}</p>}
        </div>

        {/* ===== Tabs ===== */}
        <div className="mt-6 border-b border-[#E5E7EB]">
          <div className="hide-scrollbar -mb-px flex gap-6 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                    active
                      ? "border-[#0F766E] text-[#0F766E]"
                      : "border-transparent text-[#6B7280] hover:text-[#1F2937]"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== Tab content ===== */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Ringkasan akun */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm lg:col-span-2">
                <h2 className="text-base font-bold text-[#1F2937]">
                  Ringkasan Akun
                </h2>
                <div className="mt-4 divide-y divide-[#E5E7EB]/70">
                  <InfoRow icon={User} label="Nama Lengkap" value={user.nama} />
                  <InfoRow icon={Mail} label="Email" value={user.email} />
                  <InfoRow
                    icon={BadgeCheck}
                    label="Tipe Akun"
                    value={roleLabel}
                  />
                </div>
              </div>

              {/* Stat cards */}
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                  <p className="text-xs font-medium text-[#9CA3AF]">
                    Status Akun
                  </p>
                  <p className="mt-2 text-lg font-bold text-[#1F2937]">
                    {roleLabel}
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {user.role === "admin"
                      ? "Kamu punya akses untuk mengelola event dan tiket."
                      : "Akun kamu aktif dan siap dipakai untuk memesan tiket."}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[#9CA3AF]">
                      Tiket Dibeli
                    </p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F766E]/8 text-[#0F766E]">
                      <Ticket size={15} />
                    </div>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-[#1F2937]">
                    {JUMLAH_TIKET}
                  </p>
                  <button
                    onClick={() => setActiveTab("riwayat")}
                    className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#0F766E] transition-colors hover:text-[#0D9488]"
                  >
                    Lihat riwayat
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "info" && (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-base font-bold text-[#1F2937]">
                Informasi Dasar
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#FFFBF5] p-4">
                  <p className="text-xs font-medium text-[#9CA3AF]">
                    Nama Lengkap
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#1F2937]">
                    {user.nama}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#FFFBF5] p-4">
                  <p className="text-xs font-medium text-[#9CA3AF]">Email</p>
                  <p className="mt-1 text-sm font-semibold text-[#1F2937]">
                    {user.email}
                  </p>
                </div>
              </div>
              {/* TODO: tambahkan field nomor HP / lokasi di sini begitu
                  backend menyediakan data & endpoint update profil. */}
              <p className="mt-5 text-sm text-[#6B7280]">
                Informasi tambahan seperti nomor HP dan lokasi akan tersedia
                setelah kamu melengkapi profil.
              </p>
            </div>
          )}

          {activeTab === "riwayat" && (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="flex items-center gap-2 text-base font-bold text-[#1F2937]">
                <Ticket size={18} className="text-[#0F766E]" />
                Riwayat Pembelian
              </h2>
              {/* TODO: map dari data order user setelah endpoint backend siap */}
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-[#FFFBF5] py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6EE7B7]/20 text-[#0F766E]">
                  <Ticket size={20} />
                </div>
                <p className="mt-3 text-sm font-medium text-[#6B7280]">
                  Belum ada tiket yang dibeli
                </p>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Tiket yang kamu beli akan muncul di sini
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0D9488]"
                >
                  Jelajahi Event
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {activeTab === "keamanan" && (
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-base font-bold text-[#1F2937]">
                  Keamanan Akun
                </h2>

                <div className="mt-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F766E]/8 text-[#0F766E]">
                        <KeyRound size={16} />
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-[#1F2937]">
                          Kata Sandi
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#0F766E]/10 px-2 py-0.5 text-[11px] font-bold text-[#0F766E]">
                            <CheckCircle2 size={11} />
                            Terlindungi
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-[#6B7280]">
                          Atur ulang kata sandi kapan saja lewat verifikasi
                          email.
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/auth/forgot-password"
                      className="inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#1F2937] transition-all duration-200 hover:border-[#0F766E] hover:text-[#0F766E]"
                    >
                      Ubah Kata Sandi
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1F2937]">
                      Keluar dari Akun
                    </p>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      Kamu akan keluar dari sesi ini di perangkat ini.
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-[1.5px] border-[#DC2626] px-5 py-2.5 text-sm font-semibold text-[#DC2626] transition-all duration-200 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F766E]/8 text-[#0F766E]">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-medium text-[#9CA3AF]">{label}</p>
        <p className="text-sm font-semibold text-[#1F2937]">{value}</p>
      </div>
    </div>
  );
}