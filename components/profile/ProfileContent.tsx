"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Ticket, LogOut, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileContent() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFBF5]">
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

  return (
    <main className="min-h-screen bg-[#FFFBF5] px-4 pb-20 pt-32">
      <div className="mx-auto max-w-3xl">
        {/* Header card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-[0_4px_24px_rgba(15,118,110,0.08)]">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#6EE7B7]/20 blur-2xl" />
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-2xl font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)]">
              {initials}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-[#1F2937]">{user.nama}</h1>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-[#6B7280] sm:justify-start">
                <Mail size={14} />
                {user.email}
              </p>
              {user.role === "admin" && (
                <span className="mt-2 inline-block rounded-full bg-[#F59E0B]/15 px-3 py-1 text-xs font-bold text-[#D97706]">
                  Admin
                </span>
              )}
            </div>
            <button
              className="mt-2 flex items-center gap-1.5 rounded-full border-[1.5px] border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#1F2937] transition-all duration-200 hover:border-[#0F766E] hover:text-[#0F766E] sm:ml-auto sm:mt-0"
            >
              <Pencil size={14} />
              Edit Profil
            </button>
          </div>
        </div>

        {/* Info akun */}
        <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#1F2937]">
            <User size={18} className="text-[#0F766E]" />
            Info Akun
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#FFFBF5] p-4">
              <p className="text-xs font-medium text-[#9CA3AF]">Nama Lengkap</p>
              <p className="mt-1 text-sm font-semibold text-[#1F2937]">{user.nama}</p>
            </div>
            <div className="rounded-2xl bg-[#FFFBF5] p-4">
              <p className="text-xs font-medium text-[#9CA3AF]">Email</p>
              <p className="mt-1 text-sm font-semibold text-[#1F2937]">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Riwayat pembelian */}
        <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#1F2937]">
            <Ticket size={18} className="text-[#0F766E]" />
            Riwayat Pembelian
          </h2>
          {/* TODO: map dari data order user setelah endpoint backend siap */}
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FFFBF5] py-10 text-center">
            <p className="text-sm font-medium text-[#6B7280]">
              Belum ada tiket yang dibeli
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Tiket yang kamu beli akan muncul di sini
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-[#DC2626] px-5 py-3 text-sm font-semibold text-[#DC2626] transition-all duration-200 hover:bg-red-50"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </main>
  );
}