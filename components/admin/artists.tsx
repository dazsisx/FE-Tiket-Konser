"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Music2, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/contexts/AuthContext";
import { deleteAdminArtist, fetchArtists, getImageUrl, saveAdminArtist, type Artis } from "@/utils/api";

type ArtistDraft = { nama: string; genre: string; bio: string };
const emptyDraft: ArtistDraft = { nama: "", genre: "", bio: "" };

export default function AdminArtists() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [artists, setArtists] = useState<Artis[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artis | null>(null);
  const [draft, setDraft] = useState<ArtistDraft>(emptyDraft);
  const [photo, setPhoto] = useState<File | null>(null);

  async function loadArtists() {
    setArtists(await fetchArtists());
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
    fetchArtists()
      .then((data) => { if (!cancelled) setArtists(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Data artis gagal dimuat."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authLoading, router, user]);

  const filteredArtists = useMemo(() => artists.filter((artist) =>
    `${artist.nama} ${artist.genre ?? ""} ${artist.bio ?? ""}`.toLowerCase().includes(search.toLowerCase())
  ), [artists, search]);

  function openCreateDialog() {
    setEditingArtist(null);
    setDraft(emptyDraft);
    setPhoto(null);
    setError(null);
    setDialogOpen(true);
  }

  function openEditDialog(artist: Artis) {
    setEditingArtist(artist);
    setDraft({ nama: artist.nama, genre: artist.genre ?? "", bio: artist.bio ?? "" });
    setPhoto(null);
    setError(null);
    setDialogOpen(true);
  }

  async function submitArtist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const body = new FormData();
    Object.entries(draft).forEach(([key, value]) => body.append(key, value));
    if (photo) body.append("foto", photo);

    try {
      await saveAdminArtist(editingArtist?.id ?? null, body);
      await loadArtists();
      setDialogOpen(false);
      setNotice(editingArtist ? "Profil artis diperbarui." : "Artis berhasil ditambahkan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profil artis gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function removeArtist(artist: Artis) {
    if (!window.confirm(`Hapus profil ${artist.nama}? Artis yang masih dipakai acara tidak dapat dihapus.`)) return;
    setError(null);
    try {
      await deleteAdminArtist(artist.id);
      await loadArtists();
      setNotice("Profil artis berhasil dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Artis gagal dihapus.");
    }
  }

  if (authLoading || !user || user.role !== "admin") return <main className="min-h-screen bg-[#F7FAF8]" />;

  return (
    <AdminShell active="artists" userName={user.nama} onLogout={logout}>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B7791F]">KATALOG</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">Artis</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">Profil artis ditampilkan di halaman acara dan menjadi penampil yang dipilih saat membuat acara.</p>
        </div>
        <button type="button" onClick={openCreateDialog} className="flex w-fit items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-3 text-sm font-bold text-white hover:bg-[#0D625B]"><Plus size={17} /> Tambah artis</button>
      </div>

      {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button type="button" aria-label="Tutup notifikasi" onClick={() => setNotice(null)}><X size={16} /></button></div>}
      {error && !dialogOpen && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="text-lg font-bold">Daftar artis</h3><p className="mt-1 text-sm text-[#6B7280]">{artists.length} profil tersimpan</p></div>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-[#D8DEDA] bg-white px-3 text-[#6B7280] focus-within:border-[#0F766E]">
            <Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari artis atau genre" className="w-full bg-transparent text-sm outline-none sm:w-56" />
          </label>
        </div>

        {loading ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-lg bg-white" />)}</div> : filteredArtists.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredArtists.map((artist) => {
              const photoUrl = getImageUrl(artist.foto);
              return <article key={artist.id} className="flex min-w-0 gap-4 rounded-lg border border-[#E5E7EB] bg-white p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[#EAF4F0]">
                  {photoUrl ? <Image src={photoUrl} alt={`Foto ${artist.nama}`} fill unoptimized sizes="80px" className="object-cover" /> : <UserRound className="absolute inset-0 m-auto text-[#0F766E]" size={26} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-bold">{artist.nama}</h4>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#0F766E]"><Music2 size={13} />{artist.genre || "Genre belum diisi"}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#6B7280]">{artist.bio || "Belum ada bio."}</p>
                  <div className="mt-3 flex gap-1 border-t border-[#EEF0EF] pt-2">
                    <button type="button" onClick={() => openEditDialog(artist)} className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#475569] hover:bg-gray-100">Edit profil</button>
                    <button type="button" aria-label={`Hapus ${artist.nama}`} onClick={() => void removeArtist(artist)} className="rounded-md p-1.5 text-[#B91C1C] hover:bg-red-50"><Trash2 size={15} /></button>
                  </div>
                </div>
              </article>;
            })}
          </div>
        ) : <div className="rounded-lg border border-dashed border-[#C9D2CD] bg-white px-5 py-12 text-center"><Music2 className="mx-auto text-[#8CA59A]" size={24} /><p className="mt-3 font-semibold">{search ? "Artis tidak ditemukan" : "Belum ada artis"}</p><p className="mt-1 text-sm text-[#6B7280]">{search ? "Coba kata pencarian lain." : "Tambahkan profil artis agar bisa dipilih pada acara."}</p></div>}
      </section>

      {dialogOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12231F]/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialogOpen(false); }}>
        <form onSubmit={submitArtist} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E7EB] bg-white px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#B7791F]">PROFIL PENAMPIL</p><h3 className="mt-1 text-lg font-bold">{editingArtist ? "Edit artis" : "Tambah artis"}</h3></div><button type="button" aria-label="Tutup" onClick={() => setDialogOpen(false)} className="rounded-md p-2 hover:bg-gray-100"><X size={18} /></button></div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <label className="sm:col-span-2 text-sm font-semibold">Nama artis<input required maxLength={100} value={draft.nama} onChange={(event) => setDraft({ ...draft, nama: event.target.value })} className="mt-1.5 w-full rounded-md border border-[#D8DEDA] px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]" /></label>
            <label className="sm:col-span-2 text-sm font-semibold">Genre musik<input maxLength={100} value={draft.genre} onChange={(event) => setDraft({ ...draft, genre: event.target.value })} placeholder="Contoh: Pop, Rock, Jazz" className="mt-1.5 w-full rounded-md border border-[#D8DEDA] px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]" /></label>
            <label className="sm:col-span-2 text-sm font-semibold">Bio<textarea rows={4} value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} className="mt-1.5 w-full resize-y rounded-md border border-[#D8DEDA] px-3 py-2.5 font-normal outline-none focus:border-[#0F766E]" /></label>
            <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-[#B7C8BF] p-3 text-sm text-[#475569]"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#EAF4F0] text-[#0F766E]"><ImagePlus size={18} /></span><span className="min-w-0 flex-1"><span className="block font-semibold">Foto artis</span><span className="block truncate text-xs text-[#6B7280]">{photo?.name ?? (editingArtist?.foto ? "Pilih foto baru untuk mengganti" : "PNG, JPG, WEBP hingga 5 MB")}</span></span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className="sr-only" /></label>
            {error && <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4"><button type="button" onClick={() => setDialogOpen(false)} className="rounded-md px-4 py-2.5 text-sm font-semibold text-[#475569] hover:bg-gray-100">Batal</button><button type="submit" disabled={saving} className="flex items-center gap-2 rounded-md bg-[#0F766E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0D625B] disabled:opacity-60">{saving ? "Menyimpan..." : <><Check size={16} /> Simpan profil</>}</button></div>
        </form>
      </div>}
    </AdminShell>
  );
}