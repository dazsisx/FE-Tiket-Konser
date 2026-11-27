"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, MapPin, Mic2, RefreshCw, Search, Ticket, X } from "lucide-react";
import FlyerHero from "@/components/flyer/FlyerHero";
import styles from "@/components/flyer/flyer.module.css";
import { fetchOrderHistory, formatJam, formatRupiah, formatTanggal, getImageUrl, type PesananRiwayat } from "@/utils/api";
import { formatHariTanggal, potongTanggal } from "@/utils/kategori";
import { STATUS_ORDER, statusOf, waktuPesanan, type StatusKey } from "@/utils/pesanan";
import DetailTransaksi from "./detail-transaksi";
import { TONE } from "./tone";

type Filter = "semua" | StatusKey;

const pad = (n: number) => String(n).padStart(2, "0");

/** Label pendek untuk tab (nama panjang tetap dipakai di lencana status). */
const TAB_LABEL: Record<Filter, string> = {
  semua: "Semua",
  "menunggu-pembayaran": "Belum bayar",
  "menunggu-verifikasi": "Diperiksa",
  berhasil: "Berhasil",
  ditolak: "Ditolak",
  kedaluwarsa: "Kedaluwarsa",
};

function Skeleton() {
  return (
    <div className={styles.list} aria-busy="true" aria-label="Memuat histori pembelian">
      {[0, 1, 2].map((n) => (
        <div key={n} className={styles.skeleton} />
      ))}
    </div>
  );
}

function OrderTicket({ order, index, onDetail }: { order: PesananRiwayat; index: number; onDetail: (o: PesananRiwayat) => void }) {
  const status = statusOf(order);
  const event = order.event;
  const poster = getImageUrl(event?.image_url);
  const dibuat = waktuPesanan(order);
  const date = event ? potongTanggal(event.tanggal) : null;
  const bisaPesanUlang = (status.key === "ditolak" || status.key === "kedaluwarsa") && event?.status === "aktif";

  return (
    <article className={`${styles.ticket} ${styles.ticketCompact}`} style={{ "--i": index } as CSSProperties}>
      <div className={styles.poster}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.posterImg} src={poster} alt="" loading="lazy" />
        ) : (
          <div className={`${styles.display} ${styles.posterEmpty}`} aria-hidden="true">
            {event?.nama_event ?? "Event"}
          </div>
        )}
        {date && (
          <div className={styles.dateChip} aria-hidden="true">
            <span className={`${styles.display} ${styles.dateDay}`}>{date.hari}</span>
            <span className={styles.dateMonth}>{date.bulan}</span>
          </div>
        )}
      </div>

      <div className={styles.main}>
        <div className={styles.statusRow}>
          <span className={styles.status} data-tone={TONE[status.key]}>
            {status.label}
          </span>
          {order.kode_tiket && <span className={styles.code}>{order.kode_tiket}</span>}
        </div>
        <h2 className={`${styles.display} ${styles.evTitle}`} style={{ marginTop: "0.8rem" }}>
          {event?.nama_event ?? "Event tidak tersedia"}
        </h2>
        {event && (
          <ul className={styles.meta}>
            {event.artis?.nama && (
              <li className={styles.metaRow}>
                <Mic2 size={15} aria-hidden="true" />
                <span>{event.artis.nama}</span>
              </li>
            )}
            <li className={styles.metaRow}>
              <MapPin size={15} aria-hidden="true" />
              <span>
                {formatHariTanggal(event.tanggal)} · {event.lokasi}
              </span>
            </li>
          </ul>
        )}
        <div className={styles.foot}>
          <span className={styles.tag}>
            {order.kategori_tiket?.nama_kelas ?? "Tiket"} × {order.jumlah}
          </span>
          {dibuat && (
            <span className={styles.tag}>
              Dipesan {formatTanggal(dibuat)}, {formatJam(dibuat)}
            </span>
          )}
        </div>
      </div>

      <div className={styles.stub}>
        <div className={styles.stubHead}>
          <span className={styles.stubTitle}>Total pembayaran</span>
          <span className={styles.stubCount}>{order.jumlah} tiket</span>
        </div>
        <div className={`${styles.display} ${styles.fromPrice}`} style={{ marginTop: "0.6rem" }}>
          {formatRupiah(order.total_harga)}
        </div>

        <div className={styles.buy}>
          <div className={styles.actions}>
            <button type="button" className={`${styles.cta} ${styles.ctaGhost}`} onClick={() => onDetail(order)}>
              {status.key === "berhasil" ? "Detail & tiket" : "Detail"}
            </button>
            {status.key === "menunggu-pembayaran" && (
              <Link href={`/pembelian/sukses?order=${order.id}`} className={styles.cta}>
                Bayar <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
            {bisaPesanUlang && (
              <Link href={`/pembelian/tiket/${order.event_id}`} className={styles.cta}>
                Pesan ulang <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Histori pembelian milik user yang login. Data dari GET /api/pesanan/riwayat (BE memfilter per user). */
export default function RiwayatSaya() {
  const [orders, setOrders] = useState<PesananRiwayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("semua");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PesananRiwayat | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchOrderHistory()
      .then((data) => {
        if (cancelled) return;
        setOrders(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Histori pembelian gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { semua: orders.length };
    for (const o of orders) {
      const k = statusOf(o).key;
      c[k] = (c[k] ?? 0) + 1;
    }
    return c;
  }, [orders]);

  const { tiketBerhasil, totalBelanja } = useMemo(() => {
    let tiket = 0;
    let belanja = 0;
    for (const o of orders) {
      if (statusOf(o).key !== "berhasil") continue;
      tiket += o.jumlah;
      belanja += parseFloat(o.total_harga) || 0;
    }
    return { tiketBerhasil: tiket, totalBelanja: belanja };
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "semua" && statusOf(o).key !== filter) return false;
      if (!q) return true;
      return [o.event?.nama_event, o.event?.artis?.nama, o.kode_tiket, o.kategori_tiket?.nama_kelas, `#${o.id}`]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [orders, filter, query]);

  const closeDetail = useCallback(() => setSelected(null), []);
  const ready = !loading && !error;
  const filterAktif = filter !== "semua" || query.trim() !== "";

  const tabs: Filter[] = ["semua", ...STATUS_ORDER.filter((k) => counts[k])];

  return (
    <>
      <FlyerHero
        kicker="Riwayat transaksi"
        title="Pembelian"
        stampLabel="Pembelian"
        stampValue={ready ? pad(orders.length) : "…"}
        tagline={ready && orders.length > 0 ? "Semua tiket yang pernah kamu pesan, di satu tempat." : "Setiap transaksi akan tercatat di sini."}
        blurb="Pantau status pembayaran, lanjutkan yang belum dibayar, dan buka QR tiket yang sudah lunas."
        statsLabel="Ringkasan pembelian"
        stats={[
          { value: ready ? orders.length : "—", label: "Transaksi" },
          { value: ready ? tiketBerhasil : "—", label: "Tiket berhasil" },
          { value: ready ? formatRupiah(totalBelanja) : "—", label: "Total belanja" },
        ]}
      />

      {loading ? (
        <Skeleton />
      ) : error ? (
        <div className={styles.empty} role="alert">
          <AlertTriangle className={styles.emptyIcon} size={40} strokeWidth={1.5} aria-hidden="true" />
          <p className={`${styles.display} ${styles.emptyTitle}`}>Histori gagal dimuat</p>
          <p className={styles.emptyText}>{error}</p>
          <div className={styles.emptyActions}>
            <button type="button" className={styles.btn} onClick={retry}>
              <RefreshCw size={16} aria-hidden="true" />
              Coba lagi
            </button>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <Ticket className={styles.emptyIcon} size={40} strokeWidth={1.5} aria-hidden="true" />
          <p className={`${styles.display} ${styles.emptyTitle}`}>Belum ada pembelian</p>
          <p className={styles.emptyText}>Kamu belum pernah memesan tiket. Temukan konser favoritmu, dan setiap transaksi akan tercatat di sini.</p>
          <div className={styles.emptyActions}>
            <Link href="/kategori/konser" className={styles.btn}>
              Cari konser <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.switcher} role="group" aria-label="Filter status transaksi">
            {tabs.map((key, i) => (
              <button
                key={key}
                type="button"
                className={`${styles.tab} ${key === "semua" ? styles.tabAll : ""}`}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                <span className={styles.tabTop}>
                  <span>{pad(i)}</span>
                </span>
                <span className={`${styles.display} ${styles.tabLabel}`}>{TAB_LABEL[key]}</span>
                <span className={styles.tabCount}>{counts[key] ?? 0} transaksi</span>
              </button>
            ))}
          </div>

          <div className={styles.search}>
            <Search size={18} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama event, artis, atau kode booking"
              aria-label="Cari transaksi"
              className={styles.searchInput}
            />
            {query && (
              <button type="button" className={styles.searchClear} onClick={() => setQuery("")} aria-label="Hapus pencarian">
                <X size={16} />
              </button>
            )}
          </div>

          <div className={styles.toolbar}>
            <div>
              <h2 className={`${styles.display} ${styles.toolbarTitle}`}>{filter === "semua" ? "Semua transaksi" : `Transaksi ${TAB_LABEL[filter].toLowerCase()}`}</h2>
              <p className={styles.toolbarSub} role="status" aria-live="polite">
                Menampilkan {visible.length} dari {orders.length} transaksi
              </p>
            </div>
            {filterAktif && (
              <button
                type="button"
                className={styles.chip}
                onClick={() => {
                  setQuery("");
                  setFilter("semua");
                }}
              >
                Reset filter <span aria-hidden="true">×</span>
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <div className={styles.empty}>
              <Search className={styles.emptyIcon} size={40} strokeWidth={1.5} aria-hidden="true" />
              <p className={`${styles.display} ${styles.emptyTitle}`}>Tidak ada yang cocok</p>
              <p className={styles.emptyText}>Coba kata kunci lain atau ubah filter status.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {visible.map((o, i) => (
                <li key={o.id} className={styles.rise} style={{ "--i": Math.min(i, 6) } as CSSProperties}>
                  <OrderTicket order={o} index={Math.min(i, 6)} onDetail={setSelected} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selected && <DetailTransaksi order={selected} onClose={closeDetail} />}
    </>
  );
}
