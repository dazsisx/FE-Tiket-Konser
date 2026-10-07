"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchAdminDashboard,
  formatRupiah,
  getImageUrl,
  type AdminDashboard,
} from "@/utils/api";

const menuItems = [
  { label: "Ringkasan", icon: LayoutDashboard, href: "/admin", active: true },
  { label: "Acara & Tiket", icon: CalendarDays, href: "/admin/events" },
  { label: "Pesanan", icon: ClipboardList, href: "/admin/orders" },
];

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Ticket }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_8px_30px_rgba(31,41,55,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[#1F2937]">{value}</p>
          <p className="mt-1 text-xs text-[#9CA3AF]">{detail}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#0F766E]"><Icon size={19} /></span>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
      return;
    }

    fetchAdminDashboard()
      .then(setDashboard)
      .catch((err) => setError(err instanceof Error ? err.message : "Dashboard gagal dimuat."))
      .finally(() => setLoading(false));
  }, [authLoading, router, user]);

  if (authLoading || !user || user.role !== "admin") {
    return <main className="min-h-screen bg-[#F7FAF8]" />;
  }

  const summary = dashboard?.ringkasan;
  const initials = user.nama.split(" ").map((name) => name[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#1F2937]">
      {sidebarOpen && <button aria-label="Tutup menu" className="fixed inset-0 z-30 bg-[#1F2937]/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#E5E7EB] bg-white px-5 py-6 transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" aria-label="DR Star Admin" className="flex items-center gap-2">
            <Image
              src="/logobaru.png"
              alt="DR Star"
              width={180}
              height={180}
              priority
              className="h-12 w-auto object-contain"
            />
            <span className="text-xs font-bold tracking-[0.16em] text-[#9CA3AF]">ADMIN</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Tutup sidebar"><X size={20} /></button>
        </div>
        <p className="mt-12 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Workspace</p>
        <nav className="mt-3 space-y-1">
          {menuItems.map(({ label, icon: Icon, active, href }) => active ? (
            <span key={label} aria-current="page" className="flex items-center gap-3 rounded-xl bg-[#0F766E] px-3 py-3 text-sm font-semibold text-white"><Icon size={18} />{label}</span>
          ) : (
            <Link key={label} href={href} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#6B7280] transition-colors hover:bg-[#ECFDF5] hover:text-[#0F766E]"><Icon size={18} />{label}</Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-[#FFFBEB] p-4">
          <p className="text-xs font-bold text-[#92400E]">Portal pengelola</p>
          <p className="mt-1 text-xs leading-relaxed text-[#A16207]">Kelola acara, stok tiket, dan pesanan dari satu tempat.</p>
        </div>
        <button onClick={logout} className="mt-4 flex items-center gap-3 px-3 py-2 text-sm font-semibold text-[#DC2626]"><LogOut size={17} /> Keluar</button>
      </aside>

      <main className="lg:ml-64">
        <header className="flex h-20 items-center justify-between border-b border-[#E5E7EB] bg-white px-5 sm:px-8">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Buka menu"><Menu size={22} /></button>
          <div className="hidden lg:block"><p className="text-sm text-[#6B7280]">Selamat datang kembali,</p><h1 className="text-lg font-bold">Panel kendali DR Star</h1></div>
          <div className="ml-auto flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-bold">{user.nama}</p><p className="text-xs text-[#9CA3AF]">Administrator</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F766E] text-sm font-bold text-white">{initials}</span></div>
        </header>

        <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-[#F59E0B]">RINGKASAN OPERASIONAL</p><h2 className="mt-1 text-3xl font-bold tracking-tight">Hari ini di DR Star</h2><p className="mt-2 text-sm text-[#6B7280]">Pantau acara dan transaksi yang perlu ditindaklanjuti.</p></div><Link href="/admin/events" className="flex w-fit items-center gap-2 rounded-xl bg-[#0F766E] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,118,110,0.18)]">Kelola acara <ArrowUpRight size={16} /></Link></div>
          {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />)}</div> : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Pendapatan lunas" value={formatRupiah(summary?.total_pendapatan ?? 0)} detail={`${summary?.pesanan_lunas ?? 0} pesanan berhasil`} icon={Ticket} />
              <StatCard label="Tiket terjual" value={(summary?.total_tiket_terjual ?? 0).toLocaleString("id-ID")} detail="Dari transaksi lunas" icon={CheckCircle2} />
              <StatCard label="Acara aktif" value={`${summary?.event_buka ?? 0}`} detail={`${summary?.total_event ?? 0} total acara`} icon={CalendarDays} />
              <StatCard label="Perlu diverifikasi" value={`${summary?.pesanan_pending ?? 0}`} detail="Pesanan menunggu review" icon={ClipboardList} />
            </div>
          )}

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <section id="acara" className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="font-bold">Acara terdekat</h3><p className="mt-1 text-sm text-[#6B7280]">Event dengan jadwal paling dekat.</p></div><CalendarDays className="text-[#0F766E]" size={20} /></div><div className="mt-5 space-y-3">{dashboard?.top_event?.length ? dashboard.top_event.map((event) => { const posterUrl = getImageUrl(event.poster); return <div key={event.id} className="flex items-center gap-3 rounded-xl border border-[#F0F1F2] p-3"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#ECFDF5]">{posterUrl && <Image src={posterUrl} alt="" width={48} height={48} unoptimized className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{event.nama_event}</p><p className="mt-1 text-xs text-[#6B7280]">{event.lokasi} · {event.status === "buka" ? "Penjualan buka" : "Penjualan tutup"}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${event.status === "buka" ? "bg-[#ECFDF5] text-[#047857]" : "bg-gray-100 text-gray-500"}`}>{event.status}</span></div>; }) : <p className="py-8 text-center text-sm text-[#9CA3AF]">Belum ada data acara.</p>}</div></section>
            <section id="pesanan" className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="font-bold">Menunggu verifikasi</h3><p className="mt-1 text-sm text-[#6B7280]">Pesanan terbaru yang perlu diperiksa.</p></div><Users className="text-[#F59E0B]" size={20} /></div><div className="mt-5 space-y-3">{dashboard?.pesanan_menunggu_verifikasi?.length ? dashboard.pesanan_menunggu_verifikasi.map((order) => <div key={order.id} className="border-b border-[#F0F1F2] pb-3 last:border-0"><div className="flex justify-between gap-3"><p className="truncate text-sm font-bold">{order.user?.nama ?? "Pelanggan"}</p><p className="shrink-0 text-sm font-bold text-[#0F766E]">{formatRupiah(order.total_harga)}</p></div><p className="mt-1 truncate text-xs text-[#6B7280]">{order.event?.nama_event ?? "Event"} · {order.jumlah} tiket</p></div>) : <p className="py-8 text-center text-sm text-[#9CA3AF]">Tidak ada pesanan pending.</p>}</div></section>
          </div>
        </div>
      </main>
    </div>
  );
}