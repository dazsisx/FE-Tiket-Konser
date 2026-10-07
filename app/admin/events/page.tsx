"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, ChevronDown, CirclePlus, Edit3, ImagePlus, MapPin, Plus, Search, Ticket, Trash2, X } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteAdminEvent,
  deleteTicketCategory,
  fetchArtists,
  fetchEvents,
  formatRupiah,
  formatTanggal,
  getImageUrl,
  saveAdminEvent,
  saveTicketCategory,
  setAdminEventStatus,
  type Artis,
  type EventItem,
  type KategoriTiket,
} from "@/utils/api";

type EventDraft = { nama_event: string; deskripsi: string; tanggal: string; lokasi: string; artis_id: string };
type TicketDraft = { nama_kelas: string; harga: string; kuota: string };

const emptyEvent: EventDraft = { nama_event: "", deskripsi: "", tanggal: "", lokasi: "", artis_id: "" };
const emptyTicket: TicketDraft = { nama_kelas: "", harga: "", kuota: "" };

function toDateTimeInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default function AdminEventsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [artists, setArtists] = useState<Artis[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [eventDialog, setEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [eventDraft, setEventDraft] = useState<EventDraft>(emptyEvent);
  const [poster, setPoster] = useState<File | null>(null);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState<KategoriTiket | null>(null);
  const [ticketDraft, setTicketDraft] = useState<TicketDraft>(emptyTicket);

  async function loadData() {
    const [eventData, artistData] = await Promise.all([fetchEvents(), fetchArtists()]);
    setEvents(eventData);
    setArtists(artistData);
    setSelectedId((current) => eventData.some((event) => event.id === current) ? current : eventData[0]?.id ?? null);
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
    Promise.all([fetchEvents(), fetchArtists()])
      .then(([eventData, artistData]) => {
        if (cancelled) return;
        setEvents(eventData);
        setArtists(artistData);
        setSelectedId((current) => eventData.some((event) => event.id === current) ? current : eventData[0]?.id ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Data acara gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authLoading, router, user]);

  const selectedEvent = events.find((event) => event.id === selectedId) ?? null;
  const filteredEvents = events.filter((event) =>
    `${event.nama_event} ${event.lokasi} ${event.artis?.nama ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  function openNewEvent() {
    setEditingEvent(null);
    setEventDraft({ ...emptyEvent, artis_id: artists[0] ? String(artists[0].id) : "" });
    setPoster(null);
    setEventDialog(true);
    setError(null);
  }

  function openEditEvent(event: EventItem) {
    setEditingEvent(event);
    setEventDraft({
      nama_event: event.nama_event,
      deskripsi: event.deskripsi ?? "",
      tanggal: toDateTimeInput(event.tanggal),
      lokasi: event.lokasi,
      artis_id: String(event.artis_id),
    });
    setPoster(null);
    setEventDialog(true);
    setError(null);
  }

  async function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const body = new FormData();
    Object.entries(eventDraft).forEach(([key, value]) => body.append(key, value));
    if (poster) body.append("poster", poster);

    try {
      const saved = await saveAdminEvent(editingEvent?.id ?? null, body);
      await loadData();
      setSelectedId(saved.id);
      setEventDialog(false);
      setNotice(editingEvent ? "Perubahan acara tersimpan." : "Acara baru berhasil dibuat.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Acara gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function changeEventStatus(event: EventItem) {
    setError(null);
    try {
      await setAdminEventStatus(event.id, event.status === "buka" ? "tutup" : "buka");
      await loadData();
      setNotice(event.status === "buka" ? "Penjualan tiket ditutup." : "Penjualan tiket dibuka kembali.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status acara gagal diubah.");
    }
  }

  async function removeEvent(event: EventItem) {
    if (!window.confirm(`Hapus acara “${event.nama_event}”? Tindakan ini tidak dapat dibatalkan.`)) return;
    setError(null);
    try {
      await deleteAdminEvent(event.id);
      await loadData();
      setNotice("Acara berhasil dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Acara gagal dihapus.");
    }
  }

  function openNewTicket() {
    setEditingTicket(null);
    setTicketDraft(emptyTicket);
    setTicketDialog(true);
    setError(null);
  }

  function openEditTicket(ticket: KategoriTiket) {
    setEditingTicket(ticket);
    setTicketDraft({ nama_kelas: ticket.nama_kelas, harga: String(ticket.harga), kuota: String(ticket.kuota) });
    setTicketDialog(true);
    setError(null);
  }

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEvent) return;
    setSaving(true);
    setError(null);
    try {
      await saveTicketCategory(selectedEvent.id, editingTicket?.id ?? null, {
        nama_kelas: ticketDraft.nama_kelas,
        harga: Number(ticketDraft.harga),
        kuota: Number(ticketDraft.kuota),
      });
      await loadData();
      setTicketDialog(false);
      setNotice(editingTicket ? "Kategori tiket diperbarui." : "Kategori tiket ditambahkan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kategori tiket gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTicket(ticket: KategoriTiket) {
    if (!window.confirm(`Hapus kategori tiket ${ticket.nama_kelas}?`)) return;
    setError(null);
    try {
      await deleteTicketCategory(ticket.id);
      await loadData();
      setNotice("Kategori tiket berhasil dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kategori tiket gagal dihapus.");
    }
  }

  if (authLoading || !user || user.role !== "admin") return <main className="min-h-screen bg-[#F7FAF8]" />;

  return (
    <AdminShell active="events" userName={user.nama} onLogout={logout}>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B7791F]">KATALOG</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Acara & tiket</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Atur jadwal acara, penjualan, harga, dan kuota.</p>
        </div>
        <button type="button" onClick={openNewEvent} className="flex w-fit items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-3 text-sm font-bold text-white hover:bg-[#0D625B]"><Plus size={17} /> Buat acara</button>
      </div>

      {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button type="button" aria-label="Tutup notifikasi" onClick={() => setNotice(null)}><X size={16} /></button></div>}
      {error && !eventDialog && !ticketDialog && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)]">
        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="text-lg font-bold">Daftar acara</h3><p className="mt-1 text-sm text-[#6B7280]">{events.length} acara tersimpan</p></div>
            <label className="flex h-10 items-center gap-2 rounded-lg border border-[#D8DEDA] bg-white px-3 text-[#6B7280] focus-within:border-[#0F766E]">
              <Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari acara" className="w-full bg-transparent text-sm outline-none sm:w-48" />
            </label>
          </div>
          {loading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-lg bg-white" />)}</div> : filteredEvents.length ? (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const posterUrl = getImageUrl(event.poster);
                const isSelected = event.id === selectedEvent?.id;
                return (
                  <article key={event.id} className={`rounded-lg border bg-white p-4 transition-colors ${isSelected ? "border-[#0F766E] shadow-[0_0_0_1px_#0F766E]" : "border-[#E5E7EB] hover:border-[#A7C7C0]"}`}>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setSelectedId(event.id)} aria-label={`Pilih ${event.nama_event}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#E8F3EF]">
                        {posterUrl ? <Image src={posterUrl} alt="" fill unoptimized sizes="64px" className="object-cover" /> : <CalendarDays className="absolute inset-0 m-auto text-[#0F766E]" size={22} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <button type="button" onClick={() => setSelectedId(event.id)} className="block max-w-full truncate text-left font-bold hover:text-[#0F766E]">{event.nama_event}</button>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#6B7280]"><CalendarDays size={13} />{formatTanggal(event.tanggal)} <span aria-hidden="true">·</span><MapPin size={13} />{event.lokasi}</p>
                        <p className="mt-1 truncate text-xs text-[#6B7280]">{event.artis?.nama ?? artists.find((artist) => artist.id === event.artis_id)?.nama ?? "Artis"} · {event.kategori_tiket?.length ?? 0} kategori tiket</p>
                      </div>
                      <span className={`h-fit shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${event.status === "buka" ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>{event.status === "buka" ? "Dijual" : "Ditutup"}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#EEF0EF] pt-3">
                      <button type="button" onClick={() => setSelectedId(event.id)} className="mr-auto flex items-center gap-1 text-xs font-semibold text-[#0F766E]">Kelola tiket <ChevronDown size={14} /></button>
                      <button type="button" onClick={() => openEditEvent(event)} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#475569] hover:bg-gray-100"><Edit3 size={14} /> Edit</button>
                      <button type="button" onClick={() => void changeEventStatus(event)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#0F766E] hover:bg-[#ECFDF5]">{event.status === "buka" ? "Tutup penjualan" : "Buka penjualan"}</button>
                      <button type="button" aria-label={`Hapus ${event.nama_event}`} onClick={() => void removeEvent(event)} className="rounded-md p-1.5 text-[#B91C1C] hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <div className="rounded-lg border border-dashed border-[#C9D2CD] bg-white px-5 py-12 text-center"><CalendarDays className="mx-auto text-[#8CA59A]" size={24} /><p className="mt-3 font-semibold">{search ? "Acara tidak ditemukan" : "Belum ada acara"}</p><p className="mt-1 text-sm text-[#6B7280]">{search ? "Coba kata pencarian lain." : "Buat acara pertama untuk mulai menjual tiket."}</p></div>}
        </section>

        <section className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#B7791F]">INVENTARIS</p><h3 className="mt-1 text-lg font-bold">Kategori tiket</h3></div><button type="button" disabled={!selectedEvent} onClick={openNewTicket} className="flex items-center gap-1.5 rounded-lg border border-[#B7D3CB] bg-white px-3 py-2 text-sm font-bold text-[#0F766E] hover:bg-[#ECFDF5] disabled:cursor-not-allowed disabled:opacity-50"><CirclePlus size={16} /> Tambah</button></div>
          {selectedEvent ? (
            <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#E5E7EB] bg-[#F4F8F6] px-4 py-3"><p className="truncate text-sm font-bold">{selectedEvent.nama_event}</p><p className="mt-1 text-xs text-[#6B7280]">Pilih acara lain dari daftar untuk mengubah inventaris.</p></div>
              {selectedEvent.kategori_tiket?.length ? <div className="divide-y divide-[#EEF0EF]">
                {selectedEvent.kategori_tiket.map((ticket) => {
                  const remaining = ticket.kuota - ticket.terjual;
                  return <div key={ticket.id} className="flex items-center gap-3 px-4 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#EAF4F0] text-[#0F766E]"><Ticket size={17} /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{ticket.nama_kelas}</p><p className="mt-1 text-xs text-[#6B7280]">{formatRupiah(ticket.harga)} · {ticket.terjual} terjual</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E7ECE9]"><div className="h-full rounded-full bg-[#0F766E]" style={{ width: `${ticket.kuota ? Math.min(100, (ticket.terjual / ticket.kuota) * 100) : 0}%` }} /></div><p className="mt-1 text-[11px] text-[#6B7280]">Sisa {remaining.toLocaleString("id-ID")} dari {ticket.kuota.toLocaleString("id-ID")}</p></div>
                    <div className="flex shrink-0"><button type="button" aria-label={`Edit ${ticket.nama_kelas}`} onClick={() => openEditTicket(ticket)} className="rounded-md p-2 text-[#475569] hover:bg-gray-100"><Edit3 size={15} /></button><button type="button" aria-label={`Hapus ${ticket.nama_kelas}`} onClick={() => void removeTicket(ticket)} className="rounded-md p-2 text-[#B91C1C] hover:bg-red-50"><Trash2 size={15} /></button></div>
                  </div>;
                })}
              </div> : <div className="px-4 py-12 text-center"><Ticket className="mx-auto text-[#8CA59A]" size={24} /><p className="mt-3 text-sm font-semibold">Belum ada kategori tiket</p><p className="mt-1 text-xs text-[#6B7280]">Tambahkan kelas dan kuota untuk acara ini.</p></div>}
            </div>
          ) : <div className="rounded-lg border border-dashed border-[#C9D2CD] bg-white px-5 py-12 text-center text-sm text-[#6B7280]">Pilih atau buat acara untuk mengelola tiket.</div>}
        </section>
      </div>

      {eventDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12231F]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEventDialog(false); }}>
        <form onSubmit={submitEvent} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#B7791F]">ACARA</p><h3 className="mt-1 text-lg font-bold">{editingEvent ? "Edit acara" : "Buat acara"}</h3></div><button type="button" aria-label="Tutup" onClick={() => setEventDialog(false)} className="rounded-md p-2 hover:bg-gray-100"><X size={18} /></button></div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="sm:col-span-2 text-sm font-semibold">Nama acara<input required value={eventDraft.nama_event} onChange={(event) => setEventDraft({ ...eventDraft, nama_event: event.target.value })} className="mt-1.5 w-full rounded-md border border-[#D8DEDA] px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]" /></label>
            <label className="text-sm font-semibold">Tanggal dan waktu<input required type="datetime-local" value={eventDraft.tanggal} onChange={(event) => setEventDraft({ ...eventDraft, tanggal: event.target.value })} className="mt-1.5 w-full rounded-md border border-[#D8DEDA] px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]" /></label>
            <label className="text-sm font-semibold">Artis<select required value={eventDraft.artis_id} onChange={(event) => setEventDraft({ ...eventDraft, artis_id: event.target.value })} className="mt-1.5 w-full rounded-md border border-[#D8DEDA] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]"><option value="">Pilih artis</option>{artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.nama}</option>)}</select>{artists.length === 0 && <span className="mt-1 block text-xs font-normal text-amber-700">Tambahkan data artis terlebih dahulu.</span>}</label>
            <label className="sm:col-span-2 text-sm font-semibold">Lokasi<input required value={eventDraft.lokasi} onChange={(event) => setEventDraft({ ...eventDraft, lokasi: event.target.value })} className="mt-1.5 w-full rounded-md border border-[#D8DEDA] px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]" /></label>
            <label className="sm:col-span-2 text-sm font-semibold">Deskripsi<textarea rows={4} value={eventDraft.deskripsi} onChange={(event) => setEventDraft({ ...eventDraft, deskripsi: event.target.value })} className="mt-1.5 w-full resize-y rounded-md border border-[#D8DEDA] px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]" /></label>
            <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[#B7C8BF] p-3 text-sm text-[#475569]"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#EAF4F0] text-[#0F766E]"><ImagePlus size={18} /></span><span className="min-w-0 flex-1"><span className="block font-semibold">Poster acara</span><span className="block truncate text-xs text-[#6B7280]">{poster?.name ?? "PNG, JPG, WEBP hingga 5 MB"}</span></span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setPoster(event.target.files?.[0] ?? null)} className="sr-only" /></label>
            {error && <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4"><button type="button" onClick={() => setEventDialog(false)} className="rounded-md px-4 py-2.5 text-sm font-semibold text-[#475569] hover:bg-gray-100">Batal</button><button type="submit" disabled={saving || artists.length === 0} className="flex items-center gap-2 rounded-md bg-[#0F766E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0D625B] disabled:opacity-60">{saving ? "Menyimpan..." : <><Check size={16} /> Simpan acara</>}</button></div>
        </form>
      </div>}

      {ticketDialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12231F]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setTicketDialog(false); }}>
        <form onSubmit={submitTicket} className="w-full max-w-md rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#B7791F]">{selectedEvent?.nama_event}</p><h3 className="mt-1 text-lg font-bold">{editingTicket ? "Edit kategori tiket" : "Kategori tiket baru"}</h3></div><button type="button" aria-label="Tutup" onClick={() => setTicketDialog(false)} className="rounded-md p-2 hover:bg-gray-100"><X size={18} /></button></div>
          <div className="space-y-4 p-5">
            <label className="block text-sm font-semibold">Nama kelas<input required value={ticketDraft.nama_kelas} onChange={(event) => setTicketDraft({ ...ticketDraft, nama_kelas: event.target.value })} placeholder="Contoh: Festival" className="mt-1.5 w-full rounded-md border border-[#D8DEDA] px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]" /></label>
            <label className="block text-sm font-semibold">Harga<input required type="number" min="0" step="1000" value={ticketDraft.harga} onChange={(event) => setTicketDraft({ ...ticketDraft, harga: event.target.value })} className="mt-1.5 w-full rounded-md border border-[#D8DEDA] px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]" /></label>
            <label className="block text-sm font-semibold">Kuota<input required type="number" min={editingTicket?.terjual ?? 1} step="1" value={ticketDraft.kuota} onChange={(event) => setTicketDraft({ ...ticketDraft, kuota: event.target.value })} className="mt-1.5 w-full rounded-md border border-[#D8DEDA] px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]" />{editingTicket && <span className="mt-1 block text-xs font-normal text-[#6B7280]">Minimal kuota {editingTicket.terjual}, sesuai jumlah tiket terjual.</span>}</label>
            {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4"><button type="button" onClick={() => setTicketDialog(false)} className="rounded-md px-4 py-2.5 text-sm font-semibold text-[#475569] hover:bg-gray-100">Batal</button><button type="submit" disabled={saving} className="rounded-md bg-[#0F766E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0D625B] disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan tiket"}</button></div>
        </form>
      </div>}
    </AdminShell>
  );
}