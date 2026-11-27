"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Heart, MapPin, Mic2, RefreshCw, Ticket } from "lucide-react";
import FlyerShell from "@/components/flyer/FlyerShell";
import FlyerHero from "@/components/flyer/FlyerHero";
import { Tier } from "@/components/flyer/Tiers";
import { THEME_WISHLIST } from "@/components/flyer/theme";
import styles from "@/components/flyer/flyer.module.css";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchWishlist,
  formatRupiah,
  formatTanggal,
  getImageUrl,
  removeFromWishlist,
  type EventItem,
  type WishlistItem,
} from "@/utils/api";
import { formatHariTanggal, formatJamWib, potongTanggal, rentangHarga } from "@/utils/kategori";

/** Berapa kelas tiket yang ditampilkan di sobekan; selebihnya cukup dihitung. */
const TIER_PREVIEW = 3;

type SortKey = "disimpan" | "terdekat" | "termurah";
const SORT_KEYS: SortKey[] = ["disimpan", "terdekat", "termurah"];
const SORT_LABEL: Record<SortKey, string> = {
  disimpan: "Terakhir disimpan",
  terdekat: "Terdekat",
  termurah: "Termurah",
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Apakah event masih bisa dibeli: penjualan dibuka, belum lewat, dan masih ada sisa kuota. */
function ketersediaan(event: EventItem): { bisaBeli: boolean; label: string } {
  if (event.status === "selesai" || new Date(event.tanggal).getTime() < Date.now()) {
    return { bisaBeli: false, label: "Acara selesai" };
  }
  if (event.status === "draft") return { bisaBeli: false, label: "Belum dibuka" };
  if (event.status === "ditutup") return { bisaBeli: false, label: "Penjualan ditutup" };

  const tiers = event.kategori_tiket ?? [];
  if (tiers.length === 0) return { bisaBeli: false, label: "Tiket belum tersedia" };
  const sisa = tiers.reduce((sum, t) => sum + Math.max(0, t.sisa_kuota ?? t.kuota - t.terjual), 0);
  if (sisa === 0) return { bisaBeli: false, label: "Tiket habis" };
  return { bisaBeli: true, label: "Tiket tersedia" };
}

function Skeleton() {
  return (
    <div className={styles.list} aria-busy="true" aria-label="Memuat wishlist">
      {[0, 1, 2].map((n) => (
        <div key={n} className={styles.skeleton} />
      ))}
    </div>
  );
}

function Empty({
  title,
  text,
  children,
  role,
}: {
  title: string;
  text: string;
  children?: React.ReactNode;
  role?: "alert";
}) {
  return (
    <div className={styles.empty} role={role}>
      <Heart className={styles.emptyIcon} size={40} strokeWidth={1.5} aria-hidden="true" />
      <p className={`${styles.display} ${styles.emptyTitle}`}>{title}</p>
      <p className={styles.emptyText}>{text}</p>
      {children && <div className={styles.emptyActions}>{children}</div>}
    </div>
  );
}

function WishlistTicket({
  item,
  index,
  removing,
  onRemove,
}: {
  item: WishlistItem;
  index: number;
  removing: boolean;
  onRemove: (eventId: number) => void;
}) {
  const { event } = item;
  const poster = getImageUrl(event.poster);
  const { bisaBeli, label } = ketersediaan(event);
  const { hari, bulan } = potongTanggal(event.tanggal);
  const jam = formatJamWib(event.tanggal);
  const range = rentangHarga(event);
  const tiers = useMemo(
    () => [...(event.kategori_tiket ?? [])].sort((a, b) => parseFloat(a.harga) - parseFloat(b.harga)),
    [event.kategori_tiket]
  );
  const visible = tiers.slice(0, TIER_PREVIEW);
  const sisaKelas = tiers.length - visible.length;

  return (
    <article className={`${styles.ticket} ${removing ? styles.ticketBusy : ""}`} style={{ "--i": index } as CSSProperties}>
      <div className={styles.poster}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.posterImg} src={poster} alt={`Poster ${event.nama_event}`} loading="lazy" />
        ) : (
          <div className={`${styles.display} ${styles.posterEmpty}`} aria-hidden="true">
            {event.nama_event}
          </div>
        )}
        <div className={styles.dateChip} aria-hidden="true">
          <span className={`${styles.display} ${styles.dateDay}`}>{hari}</span>
          <span className={styles.dateMonth}>{bulan}</span>
        </div>
        <button
          type="button"
          className={styles.heart}
          onClick={() => onRemove(event.id)}
          disabled={removing}
          aria-label={`Hapus ${event.nama_event} dari wishlist`}
          title="Hapus dari wishlist"
        >
          <Heart size={18} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.main}>
        <span className={styles.status} data-tone={bisaBeli ? "ok" : "off"}>
          {label}
        </span>
        <p className={styles.when} style={{ marginTop: "0.8rem" }}>
          {formatHariTanggal(event.tanggal)}
          {jam ? ` · ${jam}` : ""}
        </p>
        <h2 className={`${styles.display} ${styles.evTitle}`}>{event.nama_event}</h2>
        <ul className={styles.meta}>
          {event.artis?.nama && (
            <li className={styles.metaRow}>
              <Mic2 size={15} aria-hidden="true" />
              <span>{event.artis.nama}</span>
            </li>
          )}
          <li className={styles.metaRow}>
            <MapPin size={15} aria-hidden="true" />
            <span>{event.lokasi}</span>
          </li>
        </ul>
        <div className={styles.foot}>
          {event.artis?.genre && <span className={styles.tag}>{event.artis.genre}</span>}
          <span className={styles.tag}>Disimpan {formatTanggal(item.ditambahkan_pada)}</span>
        </div>
      </div>

      <div className={styles.stub}>
        <div className={styles.stubHead}>
          <span className={styles.stubTitle}>Kelas tiket</span>
          <span className={styles.stubCount}>{tiers.length} kelas</span>
        </div>

        {tiers.length === 0 ? (
          <p className={styles.noTier}>Kelas tiket belum diumumkan.</p>
        ) : (
          <ul className={styles.tiers}>
            {visible.map((t) => (
              <Tier key={t.id} tier={t} />
            ))}
            {sisaKelas > 0 && (
              <li className={styles.tier}>
                <Link href={`/events/${event.id}`} className={styles.link} style={{ fontSize: "0.84rem" }}>
                  + {sisaKelas} kelas lainnya
                </Link>
              </li>
            )}
          </ul>
        )}

        <div className={styles.buy}>
          <div>
            <div className={styles.from}>{range && range.min !== range.max ? "Mulai dari" : "Harga"}</div>
            <div className={`${styles.display} ${styles.fromPrice}`}>{range ? formatRupiah(range.min) : "—"}</div>
          </div>
          <div className={styles.actions}>
            <Link href={`/events/${event.id}`} className={`${styles.cta} ${styles.ctaGhost}`}>
              Detail
            </Link>
            {bisaBeli ? (
              <Link href={`/pembelian/tiket/${event.id}`} className={styles.cta}>
                Beli tiket <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ) : (
              <span className={`${styles.cta} ${styles.ctaOff}`} aria-disabled="true">
                Tidak tersedia
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Wishlist() {
  const { user, isLoading: authLoading } = useAuth();
  const isCustomer = user?.role === "pelanggan";

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [sort, setSort] = useState<SortKey>("disimpan");
  const [hanyaBisaBeli, setHanyaBisaBeli] = useState(false);

  useEffect(() => {
    if (authLoading || !isCustomer) return;
    let cancelled = false;
    fetchWishlist()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Wishlist gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isCustomer, reloadKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleRemove = useCallback(async (eventId: number) => {
    setRemovingId(eventId);
    try {
      await removeFromWishlist(eventId);
      setItems((prev) => prev.filter((i) => i.event_id !== eventId));
      setToast("Dihapus dari wishlist");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Gagal menghapus dari wishlist.");
    } finally {
      setRemovingId(null);
    }
  }, []);

  const total = items.length;
  const bisaDibeli = useMemo(() => items.filter((i) => ketersediaan(i.event).bisaBeli).length, [items]);
  const termurah = useMemo(
    () =>
      items.reduce<number | null>((min, i) => {
        if (!ketersediaan(i.event).bisaBeli) return min;
        const r = rentangHarga(i.event);
        return r && (min === null || r.min < min) ? r.min : min;
      }, null),
    [items]
  );

  const list = useMemo(() => {
    const rows = hanyaBisaBeli ? items.filter((i) => ketersediaan(i.event).bisaBeli) : [...items];
    if (sort === "termurah") {
      rows.sort((a, b) => (rentangHarga(a.event)?.min ?? Infinity) - (rentangHarga(b.event)?.min ?? Infinity));
    } else if (sort === "terdekat") {
      // acara yang masih akan datang dulu, yang sudah lewat di belakang
      const lewat = (i: WishlistItem) => (new Date(i.event.tanggal).getTime() < Date.now() ? 1 : 0);
      rows.sort((a, b) => lewat(a) - lewat(b) || new Date(a.event.tanggal).getTime() - new Date(b.event.tanggal).getTime());
    } else {
      rows.sort((a, b) => new Date(b.ditambahkan_pada).getTime() - new Date(a.ditambahkan_pada).getTime());
    }
    return rows;
  }, [items, sort, hanyaBisaBeli]);

  const heroBase = { kicker: "Koleksi kamu", title: "Wishlist", stampLabel: "Wishlist" };

  // ===== Menunggu status login =====
  if (authLoading) {
    return (
      <FlyerShell theme={THEME_WISHLIST} curtainLabel="Wishlist">
        <FlyerHero {...heroBase} tagline="Simpan yang kamu incar, pesan kapan saja." />
        <Skeleton />
      </FlyerShell>
    );
  }

  // ===== Belum login =====
  if (!user) {
    return (
      <FlyerShell theme={THEME_WISHLIST} curtainLabel="Wishlist">
        <FlyerHero {...heroBase} tagline="Simpan yang kamu incar, pesan kapan saja." />
        <Empty
          title="Masuk untuk melihat wishlist"
          text="Wishlist tersimpan di akunmu, jadi bisa dibuka dari perangkat mana saja. Masuk dulu untuk melihat event yang sudah kamu simpan."
        >
          <Link href="/auth/login" className={styles.btn}>
            Masuk
          </Link>
          <Link href="/auth/register" className={`${styles.btn} ${styles.btnGhost}`}>
            Daftar
          </Link>
        </Empty>
      </FlyerShell>
    );
  }

  // ===== Akun staf (admin) tidak punya wishlist =====
  if (!isCustomer) {
    return (
      <FlyerShell theme={THEME_WISHLIST} curtainLabel="Wishlist">
        <FlyerHero {...heroBase} tagline="Simpan yang kamu incar, pesan kapan saja." />
        <Empty
          title="Wishlist khusus akun pelanggan"
          text="Akun ini adalah akun petugas, jadi tidak memiliki wishlist. Gunakan akun pelanggan untuk menyimpan event."
        >
          <Link href="/" className={styles.btn}>
            Kembali ke Beranda
          </Link>
        </Empty>
      </FlyerShell>
    );
  }

  const ready = !loading && !error;

  return (
    <FlyerShell theme={THEME_WISHLIST} curtainLabel="Wishlist">
      <FlyerHero
        {...heroBase}
        stampValue={ready ? pad(total) : "…"}
        tagline={
          ready && total > 0
            ? `${total} event kamu simpan. Pesan sebelum kehabisan.`
            : "Simpan yang kamu incar, pesan kapan saja."
        }
        blurb="Tekan ikon hati di halaman event untuk menyimpannya di sini."
        statsLabel="Ringkasan wishlist"
        stats={[
          { value: ready ? total : "—", label: "Disimpan" },
          { value: ready ? bisaDibeli : "—", label: "Bisa dibeli" },
          { value: termurah === null ? "—" : formatRupiah(termurah), label: "Harga mulai" },
        ]}
      />

      {ready && total > 0 && (
        <div className={styles.toolbar}>
          <div>
            <h2 className={`${styles.display} ${styles.toolbarTitle}`}>Event tersimpan</h2>
            <p className={styles.toolbarSub} role="status" aria-live="polite">
              {hanyaBisaBeli ? `${list.length} dari ${total} event bisa dibeli sekarang` : `${total} event, lengkap dengan kelas tiketnya`}
            </p>
          </div>
          <div className={styles.toolbarEnd}>
            <button type="button" className={styles.chip} aria-pressed={hanyaBisaBeli} onClick={() => setHanyaBisaBeli((v) => !v)}>
              <Ticket size={15} aria-hidden="true" />
              Bisa dibeli
            </button>
            <div className={styles.sort} role="group" aria-label="Urutkan wishlist">
              {SORT_KEYS.map((key) => (
                <button key={key} type="button" className={styles.sortBtn} aria-pressed={sort === key} onClick={() => setSort(key)}>
                  {SORT_LABEL[key]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className={styles.empty} role="alert">
          <AlertTriangle className={styles.emptyIcon} size={40} strokeWidth={1.5} aria-hidden="true" />
          <p className={`${styles.display} ${styles.emptyTitle}`}>Wishlist gagal dimuat</p>
          <p className={styles.emptyText}>{error}</p>
          <div className={styles.emptyActions}>
            <button type="button" className={styles.btn} onClick={retry}>
              <RefreshCw size={16} aria-hidden="true" />
              Coba lagi
            </button>
          </div>
        </div>
      ) : total === 0 ? (
        <Empty
          title="Wishlist masih kosong"
          text="Belum ada event yang kamu simpan. Jelajahi konser dan festival, lalu tekan ikon hati di halaman event untuk menyimpannya di sini."
        >
          <Link href="/kategori/konser" className={styles.btn}>
            Jelajahi konser <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/" className={`${styles.btn} ${styles.btnGhost}`}>
            Ke beranda
          </Link>
        </Empty>
      ) : list.length === 0 ? (
        <Empty title="Belum ada yang bisa dibeli" text="Semua event di wishlist sedang tidak dijual atau sudah lewat. Matikan filter untuk melihat semuanya.">
          <button type="button" className={styles.btn} onClick={() => setHanyaBisaBeli(false)}>
            Tampilkan semua
          </button>
        </Empty>
      ) : (
        <ul className={styles.list}>
          {list.map((item, i) => (
            <li key={item.id} className={styles.rise} style={{ "--i": Math.min(i, 6) } as CSSProperties}>
              <WishlistTicket item={item} index={Math.min(i, 6)} removing={removingId === item.event_id} onRemove={handleRemove} />
            </li>
          ))}
        </ul>
      )}

      {toast && (
        <div role="status" className={styles.toast}>
          {toast}
        </div>
      )}
    </FlyerShell>
  );
}
