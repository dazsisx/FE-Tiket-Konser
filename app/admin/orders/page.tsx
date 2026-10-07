"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ClipboardList, ExternalLink, Search, X } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAdminOrders, formatRupiah, getImageUrl, verifyAdminOrder, type PesananAdmin } from "@/utils/api";

type OrderFilter = "semua" | PesananAdmin["status_bayar"];

const filters: Array<{ key: OrderFilter; label: string }> = [
  { key: "semua", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "lunas", label: "Lunas" },
  { key: "ditolak", label: "Ditolak" },
  { key: "kadaluarsa", label: "Kedaluwarsa" },
];

const statusStyle: Record<PesananAdmin["status_bayar"], string> = {
  pending: "bg-amber-50 text-amber-800",
  lunas: "bg-emerald-50 text-emerald-800",
  ditolak: "bg-red-50 text-red-700",
  kadaluarsa: "bg-gray-100 text-gray-600",
};

function formatDate(value?: string) {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<PesananAdmin[]>([]);
  const [filter, setFilter] = useState<OrderFilter>("semua");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadOrders() {
    setOrders(await fetchAdminOrders());
  }

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
    let cancelled = false;
    fetchAdminOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Pesanan gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authLoading, router, user]);

  const visibleOrders = orders.filter((order) => {
    const matchesFilter = filter === "semua" || order.status_bayar === filter;
    const searchText = `${order.id} ${order.user?.nama ?? ""} ${order.user?.email ?? ""} ${order.event?.nama_event ?? ""} ${order.kode_tiket ?? ""}`.toLowerCase();
    return matchesFilter && searchText.includes(search.toLowerCase());
  });

  async function verify(order: PesananAdmin, action: "setujui" | "tolak") {
    const actionLabel = action === "setujui" ? "menyetujui" : "menolak";
    if (!window.confirm(`Yakin ${actionLabel} pembayaran pesanan #${order.id}?`)) return;
    setWorkingId(order.id);
    setError(null);
    setNotice(null);
    try {
      await verifyAdminOrder(order.id, action);
      await loadOrders();
      setNotice(action === "setujui" ? `Pesanan #${order.id} telah disetujui.` : `Pesanan #${order.id} telah ditolak.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verifikasi pesanan gagal.");
    } finally {
      setWorkingId(null);
    }
  }

  if (authLoading || !user || user.role !== "admin") return <main className="min-h-screen bg-[#F7FAF8]" />;

  const pendingCount = orders.filter((order) => order.status_bayar === "pending").length;
  const paidTotal = orders.filter((order) => order.status_bayar === "lunas").reduce((total, order) => total + Number(order.total_harga), 0);

  return (
    <AdminShell active="orders" userName={user.nama} onLogout={logout}>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B7791F]">TRANSAKSI</p><h2 className="mt-1 text-3xl font-bold tracking-tight">Pesanan</h2><p className="mt-2 text-sm text-[#6B7280]">Tinjau pembayaran dan pantau tiket yang sudah terbit.</p></div>
        <button type="button" onClick={() => { setLoading(true); loadOrders().catch((err) => setError(err instanceof Error ? err.message : "Pesanan gagal dimuat.")).finally(() => setLoading(false)); }} className="flex w-fit items-center gap-2 rounded-lg border border-[#D8DEDA] bg-white px-3.5 py-2.5 text-sm font-semibold hover:bg-[#F4F8F6]"><ClipboardList size={16} /> Muat ulang</button>
      </div>

      {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button type="button" aria-label="Tutup notifikasi" onClick={() => setNotice(null)}><X size={16} /></button></div>}
      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4"><p className="text-xs font-semibold text-[#6B7280]">Total pesanan</p><p className="mt-2 text-2xl font-bold">{orders.length.toLocaleString("id-ID")}</p></div>
        <div className="rounded-lg border border-amber-200 bg-[#FFFCF4] p-4"><p className="text-xs font-semibold text-[#8A5A13]">Menunggu verifikasi</p><p className="mt-2 text-2xl font-bold text-[#8A5A13]">{pendingCount.toLocaleString("id-ID")}</p></div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4"><p className="text-xs font-semibold text-[#6B7280]">Nilai pesanan lunas</p><p className="mt-2 text-2xl font-bold text-[#0F766E]">{formatRupiah(paidTotal)}</p></div>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg bg-[#F1F4F2] p-1" role="tablist" aria-label="Filter status pesanan">
              {filters.map(({ key, label }) => <button key={key} type="button" role="tab" aria-selected={filter === key} onClick={() => setFilter(key)} className={`shrink-0 rounded-md px-3 py-2 text-xs font-bold transition-colors ${filter === key ? "bg-white text-[#0F766E] shadow-sm" : "text-[#6B7280] hover:text-[#1F2937]"}`}>{label}{key === "pending" && pendingCount > 0 ? ` · ${pendingCount}` : ""}</button>)}
            </div>
            <label className="flex h-10 items-center gap-2 rounded-lg border border-[#D8DEDA] px-3 text-[#6B7280] focus-within:border-[#0F766E]"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, acara, kode" className="w-full bg-transparent text-sm outline-none md:w-56" /></label>
          </div>
          <p className="text-xs text-[#6B7280]">Menampilkan {visibleOrders.length} dari {orders.length} pesanan</p>
        </div>

        {loading ? <div className="space-y-3 p-5">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-md bg-[#F1F4F2]" />)}</div> : visibleOrders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead><tr className="bg-[#F8FAF9] text-[11px] uppercase tracking-[0.08em] text-[#6B7280]"><th className="px-5 py-3 font-bold">Pesanan</th><th className="px-4 py-3 font-bold">Pelanggan</th><th className="px-4 py-3 font-bold">Acara & tiket</th><th className="px-4 py-3 font-bold">Pembayaran</th><th className="px-4 py-3 font-bold">Status</th><th className="px-5 py-3 text-right font-bold">Tindakan</th></tr></thead>
              <tbody className="divide-y divide-[#EEF0EF]">
                {visibleOrders.map((order) => {
                  const receiptUrl = getImageUrl(order.bukti_bayar);
                  return <tr key={order.id} className="align-top hover:bg-[#FCFDFC]">
                    <td className="px-5 py-4"><p className="text-sm font-bold">#{order.id}</p><p className="mt-1 text-xs text-[#6B7280]">{formatDate(order.created_at)}</p>{order.kode_tiket && <p className="mt-1 font-mono text-[11px] text-[#6B7280]">{order.kode_tiket}</p>}</td>
                    <td className="px-4 py-4"><p className="text-sm font-semibold">{order.user?.nama ?? "Pelanggan"}</p><p className="mt-1 text-xs text-[#6B7280]">{order.user?.email ?? "Email tidak tersedia"}</p></td>
                    <td className="px-4 py-4"><p className="max-w-52 truncate text-sm font-semibold">{order.event?.nama_event ?? "Acara"}</p><p className="mt-1 text-xs text-[#6B7280]">{order.kategori_tiket?.nama_kelas ?? "Kategori"} · {order.jumlah} tiket</p><p className="mt-1 text-xs font-bold text-[#1F2937]">{formatRupiah(order.total_harga)}</p></td>
                    <td className="px-4 py-4">{receiptUrl ? <a href={receiptUrl} target="_blank" rel="noreferrer" className="group relative block h-14 w-20 overflow-hidden rounded-md border border-[#E5E7EB] bg-[#F1F4F2]" aria-label={`Lihat bukti pembayaran pesanan ${order.id}`}><Image src={receiptUrl} alt="Bukti pembayaran" fill unoptimized sizes="80px" className="object-cover transition-transform group-hover:scale-105" /><span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white transition-colors group-hover:bg-black/30"><ExternalLink size={16} /></span></a> : <span className="text-xs text-[#9CA3AF]">Belum ada bukti</span>}</td>
                    <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[order.status_bayar]}`}>{order.status_bayar === "pending" ? "Menunggu" : order.status_bayar === "lunas" ? "Lunas" : order.status_bayar === "ditolak" ? "Ditolak" : "Kedaluwarsa"}</span></td>
                    <td className="px-5 py-4 text-right">{order.status_bayar === "pending" ? <div className="flex justify-end gap-2"><button type="button" disabled={workingId === order.id} onClick={() => void verify(order, "tolak")} className="rounded-md border border-red-200 px-2.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">Tolak</button><button type="button" disabled={workingId === order.id} onClick={() => void verify(order, "setujui")} className="flex items-center gap-1 rounded-md bg-[#0F766E] px-2.5 py-2 text-xs font-bold text-white hover:bg-[#0D625B] disabled:opacity-50">{workingId === order.id ? "Proses..." : <><Check size={14} /> Setujui</>}</button></div> : <span className="text-xs text-[#9CA3AF]">Selesai</span>}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="px-5 py-14 text-center"><ClipboardList className="mx-auto text-[#8CA59A]" size={26} /><p className="mt-3 font-semibold">{search || filter !== "semua" ? "Tidak ada pesanan yang cocok" : "Belum ada pesanan"}</p><p className="mt-1 text-sm text-[#6B7280]">{search || filter !== "semua" ? "Ubah filter atau kata pencarian." : "Pesanan pelanggan akan muncul di sini."}</p></div>}
      </section>
    </AdminShell>
  );
}