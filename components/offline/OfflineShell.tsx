"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, LayoutDashboard, LogOut, Menu, Receipt, Ticket, X } from "lucide-react";
import { OFFLINE_BASE } from "./config";

type OfflineSection = "dashboard" | "jual" | "riwayat" | "laporan";

const navigation = [
  { label: "Ringkasan", href: OFFLINE_BASE, icon: LayoutDashboard, section: "dashboard" as const },
  { label: "Jual Tiket", href: `${OFFLINE_BASE}/jual`, icon: Ticket, section: "jual" as const },
  { label: "Riwayat Transaksi", href: `${OFFLINE_BASE}/riwayat`, icon: Receipt, section: "riwayat" as const },
  { label: "Laporan Penjualan", href: `${OFFLINE_BASE}/laporan`, icon: FileText, section: "laporan" as const },
];

/** Layout Admin Offline: sama dengan AdminShell (Admin Online), menu disesuaikan untuk penjualan di lokasi. */
export default function OfflineShell({
  active,
  userName,
  onLogout,
  children,
}: {
  active: OfflineSection;
  userName: string;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initials = userName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#1F2937]">
      {sidebarOpen && <button type="button" aria-label="Tutup menu" className="fixed inset-0 z-30 bg-[#1F2937]/30 lg:hidden print:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#E5E7EB] bg-white px-5 py-6 transition-transform lg:translate-x-0 print:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <Link href={OFFLINE_BASE} aria-label="DR Star Admin Offline" className="flex items-center gap-2">
            <Image src="/logobaru.png" alt="DR Star" width={180} height={180} priority className="h-12 w-auto object-contain" />
            <span className="text-xs font-bold tracking-[0.16em] text-[#9CA3AF]">OFFLINE</span>
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Tutup sidebar"><X size={20} /></button>
        </div>
        <p className="mt-12 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Workspace</p>
        <nav aria-label="Navigasi admin offline" className="mt-3 space-y-1">
          {navigation.map(({ label, href, icon: Icon, section }) => {
            const isActive = section === active;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isActive ? "bg-[#0F766E] text-white" : "text-[#6B7280] hover:bg-[#ECFDF5] hover:text-[#0F766E]"}`}
              >
                <Icon size={18} />{label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl bg-[#FFFBEB] p-4">
          <p className="text-xs font-bold text-[#92400E]">Loket penjualan</p>
          <p className="mt-1 text-xs leading-relaxed text-[#A16207]">Jual tiket langsung di lokasi konser dan pantau rekap penjualan.</p>
        </div>
        <button type="button" onClick={onLogout} className="mt-4 flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[#DC2626]"><LogOut size={17} /> Keluar</button>
      </aside>

      <main className="lg:ml-64 print:ml-0">
        <header className="flex h-20 items-center justify-between border-b border-[#E5E7EB] bg-white px-5 sm:px-8 print:hidden">
          <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Buka menu"><Menu size={22} /></button>
          <div className="hidden lg:block"><p className="text-sm text-[#6B7280]">Panel penjualan offline</p><h1 className="text-lg font-bold">DR Star Admin Offline</h1></div>
          <div className="ml-auto flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-bold">{userName}</p><p className="text-xs text-[#9CA3AF]">Admin Offline</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F766E] text-sm font-bold text-white">{initials}</span></div>
        </header>
        <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 print:p-0">{children}</div>
      </main>
    </div>
  );
}
