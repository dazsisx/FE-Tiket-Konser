"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { addToWishlist, fetchWishlistIds, removeFromWishlist } from "@/utils/api";

type WishlistButtonProps = {
  eventId: number;
  /** Kelas tombol. Kalau kosong, dipakai gaya bawaan (garis tepi emerald). */
  className?: string;
};

const defaultClass =
  "inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#0F766E] px-4 py-2 text-sm font-semibold text-[#0F766E] transition-colors duration-200 hover:bg-[#ECFDF5] disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Tombol hati untuk menyimpan / menghapus event dari wishlist.
 * Status awal dibaca dari server (GET /api/wishlist/ids), perubahan langsung disimpan ke database.
 * Belum login -> diarahkan ke halaman login. Akun staf (admin) tidak punya wishlist -> tombol tidak tampil.
 */
export default function WishlistButton({ eventId, className }: WishlistButtonProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const isCustomer = user?.role === "pelanggan";

  useEffect(() => {
    if (!isCustomer) return;
    let cancelled = false;
    fetchWishlistIds()
      .then((ids) => {
        if (!cancelled) setSaved(ids.includes(eventId));
      })
      .catch(() => {
        /* status awal gagal dimuat: tombol tetap bisa dipakai */
      });
    return () => {
      cancelled = true;
    };
  }, [isCustomer, eventId]);

  const toggle = useCallback(async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (busy) return;

    const next = !saved;
    setBusy(true);
    setNotice(null);
    setSaved(next); // optimistis, dikembalikan kalau server menolak
    try {
      if (next) await addToWishlist(eventId);
      else await removeFromWishlist(eventId);
    } catch (err) {
      setSaved(!next);
      setNotice(err instanceof Error ? err.message : "Wishlist gagal diperbarui.");
    } finally {
      setBusy(false);
    }
  }, [user, busy, saved, eventId, router]);

  if (isLoading) return null;
  if (user && !isCustomer) return null;

  // Tamu tidak pernah tampil "tersimpan", walau state sisa dari sesi sebelumnya
  const isSaved = isCustomer && saved;

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy}
        aria-pressed={isSaved}
        aria-label={isSaved ? "Hapus dari wishlist" : "Simpan ke wishlist"}
        className={className ?? defaultClass}
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <Heart
            size={16}
            aria-hidden="true"
            className={`transition-transform duration-200 ${isSaved ? "scale-110 fill-[#F59E0B] text-[#F59E0B]" : ""}`}
          />
        )}
        {isSaved ? "Tersimpan" : "Wishlist"}
      </button>
      {notice && (
        <span
          role="alert"
          className="absolute top-full left-0 z-10 mt-2 w-max max-w-[16rem] rounded-xl bg-white px-3 py-2 text-xs font-medium text-red-600 shadow-lg ring-1 ring-red-200"
        >
          {notice}
        </span>
      )}
    </span>
  );
}
