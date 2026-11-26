"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight, Guitar, LayoutGrid, MapPin, Mic2, Music2, PartyPopper, type LucideIcon } from "lucide-react";
import {
  fetchEvents,
  formatRupiah,
  getImageUrl,
  type EventItem,
  type KategoriTiket,
} from "@/utils/api";
import {
  KATEGORI,
  KATEGORI_BY_SLUG,
  PAGE_BY_SLUG,
  PAGE_KATEGORI,
  bandingTerbaru,
  bandingTerlaris,
  formatHariTanggal,
  formatJamWib,
  isPageSlug,
  kategoriOf,
  potongTanggal,
  rentangHarga,
  tampilPublik,
  type PageSlug,
  type SortKey,
} from "@/utils/kategori";
import { cocokKota, kotaLabelDariSlug, kotaOf } from "@/utils/kota";
import styles from "./kategori.module.css";

const ICONS: Record<PageSlug, LucideIcon> = {
  semua: LayoutGrid,
  konser: Music2,
  festival: PartyPopper,
  "musik-live": Mic2,
  akustik: Guitar,
};

/** Berapa kelas tiket yang langsung terlihat; sisanya dilipat. */
const TIER_PREVIEW = 4;

/** Data event dipakai ulang saat pengguna bolak-balik antar kategori. */
let eventCache: EventItem[] | null = null;

const SORT_KEYS: SortKey[] = ["terdekat", "termurah", "terlaris", "terbaru"];
const SORT_LABEL: Record<SortKey, string> = {
  terdekat: "Terdekat",
  termurah: "Termurah",
  terlaris: "Terlaris",
  terbaru: "Terbaru",
};

// warna penegas di atas kertas tiket: pakai warna kategori yang cukup gelap
const TICKET_ACCENT: Record<PageSlug, string> = {
  semua: "#0F766E",
  konser: "#0F766E",
  festival: "#C42E16",
  "musik-live": "#0B7A5A",
  akustik: "#B4501E",
};

/** Cocokkan kata kunci pencarian dengan nama acara, artis, tempat, atau kota. */
function cocokKata(e: EventItem, q: string): boolean {
  const kata = q.trim().toLowerCase();
  if (!kata) return true;
  return `${e.nama_event} ${e.artis?.nama ?? ""} ${e.lokasi ?? ""} ${kotaOf(e) ?? ""}`.toLowerCase().includes(kata);
}

const pad = (n: number) => String(n).padStart(2, "0");

function themeVars(slug: PageSlug): CSSProperties {
  const t = PAGE_BY_SLUG[slug].theme;
  return {
    "--bg": t.bg,
    "--ink": t.ink,
    "--muted": t.muted,
    "--accent": t.accent,
    "--on-accent": t.onAccent,
    "--line": t.line,
    "--ticket-accent": TICKET_ACCENT[slug],
    "--ticket-on": "#FFF8EA",
  } as CSSProperties;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export default function KategoriExplorer({
  initialSlug,
  initialSort,
  initialKota,
  initialQ,
}: {
  initialSlug: PageSlug;
  initialSort?: SortKey;
  /** slug kota dari ?kota= (null/undefined = semua lokasi) */
  initialKota?: string | null;
  /** kata kunci dari ?q= (pencarian di navbar) */
  initialQ?: string;
}) {
  const pathname = usePathname();
  const [slug, setSlug] = useState<PageSlug>(initialSlug);
  const [sort, setSort] = useState<SortKey>(initialSort ?? "terdekat");
  const [kota, setKota] = useState<string | null>(initialKota ?? null);
  const [q, setQ] = useState(initialQ ?? "");
  const [events, setEvents] = useState<EventItem[] | null>(eventCache);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const slugRef = useRef(slug);
  const busyRef = useRef(false);
  const curtainRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  /* ---------- data ---------- */

  const load = useCallback(() => {
    setError(null);
    fetchEvents()
      .then((data) => {
        eventCache = data;
        setEvents(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Acara gagal dimuat."));
  }, []);

  useEffect(() => {
    if (!eventCache) load();
  }, [load]);

  // Tombol back/forward browser: ikuti URL tanpa menunggu tirai
  useEffect(() => {
    const last = pathname.split("/").filter(Boolean).pop() ?? "";
    if (isPageSlug(last) && last !== slugRef.current && !busyRef.current) {
      slugRef.current = last;
      setSlug(last);
    }
  }, [pathname]);

  const grouped = useMemo(() => {
    const map: Record<PageSlug, EventItem[]> = { semua: [], konser: [], festival: [], "musik-live": [], akustik: [] };
    (events ?? [])
      // draft belum boleh tampil publik; "selesai" sudah lewat
      .filter(tampilPublik)
      .filter((e) => cocokKota(e, kota))
      .filter((e) => cocokKata(e, q))
      .forEach((e) => {
        map[kategoriOf(e)].push(e);
        map.semua.push(e);
      });
    return map;
  }, [events, kota, q]);

  // Chip filter bisa dilepas; URL ikut dibersihkan tanpa memuat ulang halaman
  const lepas = useCallback((key: "kota" | "q") => {
    const params = new URLSearchParams(window.location.search);
    params.delete(key);
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    if (key === "kota") setKota(null);
    else setQ("");
  }, []);

  const list = useMemo(() => {
    const rows = [...grouped[slug]];
    if (sort === "termurah") {
      rows.sort((a, b) => (rentangHarga(a)?.min ?? Infinity) - (rentangHarga(b)?.min ?? Infinity));
    } else if (sort === "terlaris") {
      rows.sort(bandingTerlaris);
    } else if (sort === "terbaru") {
      rows.sort(bandingTerbaru);
    } else {
      rows.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    }
    return rows;
  }, [grouped, slug, sort]);

  /* ---------- transisi tirai ---------- */

  const go = useCallback(async (target: PageSlug) => {
    if (busyRef.current || target === slugRef.current) return;
    const curtain = curtainRef.current;
    const back = backRef.current;
    const front = frontRef.current;
    const label = labelRef.current;

    const swap = () => {
      slugRef.current = target;
      setSlug(target);
      window.scrollTo({ top: 0, behavior: "instant" });
      // ?kota= dan ?q= ikut terbawa saat pindah kategori
      window.history.pushState(null, "", `/kategori/${target}${window.location.search}`);
    };

    if (!curtain || !back || !front || !label) {
      swap();
      return;
    }

    busyRef.current = true;
    setBusy(true);
    curtain.classList.remove(styles.intro); // kalau pembuka halaman belum selesai

    const to = PAGE_BY_SLUG[target];
    const from = PAGE_BY_SLUG[slugRef.current];
    const dir = PAGE_KATEGORI.findIndex((k) => k.slug === target) > PAGE_KATEGORI.findIndex((k) => k.slug === from.slug) ? 1 : -1;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // panel belakang = warna penegas tujuan, panel depan = warna halaman tujuan
    back.style.background = to.theme.accent;
    front.style.background = to.theme.bg;
    label.textContent = to.label;
    label.style.color = to.theme.ink;

    curtain.style.visibility = "visible";
    curtain.style.opacity = "1";

    const SLIDE = 800;
    const ease = "cubic-bezier(0.77, 0, 0.175, 1)";
    const anims: Animation[] = [];
    const run = (el: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      const a = el.animate(keyframes, { fill: "both", ...options });
      anims.push(a);
      return a;
    };

    try {
      if (reduced) {
        const a = run(curtain, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
        run(back, [{ transform: "none" }, { transform: "none" }], { duration: 1 });
        run(front, [{ transform: "none" }, { transform: "none" }], { duration: 1 });
        await a.finished;
        swap();
        await nextFrame();
        await run(curtain, [{ opacity: 1 }, { opacity: 0 }], { duration: 400, easing: "ease-in" }).finished;
      } else {
        // 1) layar bergeser menutup, dua lapis agar terasa berlapis
        const off = `translateX(${dir * 100}%)`;
        const a1 = run(back, [{ transform: off }, { transform: "translateX(0)" }], { duration: SLIDE, easing: ease });
        const a2 = run(front, [{ transform: off }, { transform: "translateX(0)" }], { duration: SLIDE, easing: ease, delay: 130 });
        await Promise.all([a1.finished, a2.finished]);

        // 2) nama kategori tujuan muncul sebentar
        const lab = run(
          label,
          [
            { opacity: 0, transform: "translateY(1.5rem)", letterSpacing: "0.04em" },
            { opacity: 1, transform: "translateY(0)", letterSpacing: "0em" },
          ],
          { duration: 520, easing: "cubic-bezier(0.16, 0.84, 0.3, 1)" }
        );
        await lab.finished;
        await wait(260);

        // 3) ganti isi halaman saat tertutup sepenuhnya
        swap();
        await nextFrame();
        await nextFrame();

        // 4) tirai memudar perlahan, isi baru naik di baliknya
        run(label, [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-1.25rem)" }], {
          duration: 520,
          easing: "ease-in",
        });
        await run(curtain, [{ opacity: 1 }, { opacity: 0 }], {
          duration: 1100,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          delay: 120,
        }).finished;
      }
    } catch {
      // animasi dibatalkan (mis. tab ditutup): pastikan halaman tetap berganti
      if (slugRef.current !== target) swap();
    } finally {
      anims.forEach((a) => a.cancel());
      curtain.style.visibility = "";
      curtain.style.opacity = "";
      label.style.color = "";
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  /* ---------- tampilan ---------- */

  const def = PAGE_BY_SLUG[slug];
  const isSemua = slug === "semua";
  const idx = PAGE_KATEGORI.findIndex((k) => k.slug === slug);
  const nextIdx = (idx + 1) % PAGE_KATEGORI.length;
  const nextDef = PAGE_KATEGORI[nextIdx];
  const nextName = nextDef.slug === "semua" ? "semua acara" : nextDef.label;
  const loading = events === null && !error;
  const jumlahKelas = list.reduce((n, e) => n + (e.kategori_tiket?.length ?? 0), 0);
  const termurah = list.reduce<number | null>((min, e) => {
    const r = rentangHarga(e);
    return r && (min === null || r.min < min) ? r.min : min;
  }, null);

  return (
    <div className={styles.root} style={themeVars(slug)} data-kategori={slug}>
      <div className={styles.grain} aria-hidden="true" />
      {/* Pengaman: sembunyikan navbar global selama halaman ini tampil, apa pun layout induknya */}
      <style>{`header:has(.navbar-liquid-glass), nav.navbar-liquid-glass, .navbar-liquid-glass { display: none !important; }`}</style>

      <div className={styles.wrap}>
        {/* ===== kembali ke beranda (navbar sengaja disembunyikan di halaman ini) ===== */}
        <Link href="/" className={styles.back}>
          <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" />
          Beranda
        </Link>

        {/* ===== pemilih kategori ===== */}
        <nav className={styles.switcher} aria-label="Kategori acara">
          {PAGE_KATEGORI.map((k, i) => {
            const Icon = ICONS[k.slug];
            const active = k.slug === slug;
            return (
              <button
                key={k.slug}
                type="button"
                className={`${styles.tab} ${k.slug === "semua" ? styles.tabAll : ""}`}
                aria-current={active ? "true" : undefined}
                aria-busy={busy || undefined}
                disabled={busy && !active}
                onClick={() => void go(k.slug)}
              >
                <span className={styles.tabTop}>
                  <span>{pad(i)}</span>
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className={`${styles.display} ${styles.tabLabel}`}>{k.label}</span>
                <span className={styles.tabCount}>
                  {events ? `${grouped[k.slug].length} acara` : "memuat…"}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ===== isi: di-remount tiap ganti kategori supaya animasi masuk diputar ulang ===== */}
        <div key={slug}>
          <header className={styles.hero}>
            <p className={styles.kicker}>{isSemua ? "Semua kategori" : `Kategori ${pad(idx)} / ${pad(KATEGORI.length)}`}</p>

            <h1 className={`${styles.display} ${styles.title}`} aria-label={def.label}>
              {Array.from(def.label).map((ch, i) =>
                ch === " " ? (
                  <span key={i} className={styles.space} aria-hidden="true" />
                ) : (
                  <span key={i} className={styles.letter} style={{ "--d": i } as CSSProperties} aria-hidden="true">
                    {ch}
                  </span>
                )
              )}
            </h1>

            <svg className={styles.stamp} viewBox="0 0 200 200" aria-hidden="true">
              <defs>
                <path id={`ring-${slug}`} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
              </defs>
              <g className={styles.stampRing}>
                <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 6" />
                <text fontSize="17" fontWeight="700" letterSpacing="4.2" fill="currentColor" style={{ textTransform: "uppercase" }}>
                  <textPath href={`#ring-${slug}`}>Tiket Konser • {def.label} • Tiket Konser • {def.label} •</textPath>
                </text>
              </g>
              <text className={styles.stampNum} x="100" y="118" textAnchor="middle" fontSize="64">
                {loading ? "…" : pad(list.length)}
              </text>
            </svg>

            <p className={styles.tagline}>{def.tagline}</p>
            <p className={styles.blurb}>{def.blurb}</p>

            <ul className={styles.stats} aria-label={`Ringkasan ${def.label}`}>
              <li className={styles.stat}>
                <div className={`${styles.display} ${styles.statValue}`}>{loading ? "—" : list.length}</div>
                <div className={styles.statLabel}>Acara</div>
              </li>
              <li className={styles.stat}>
                <div className={`${styles.display} ${styles.statValue}`}>{loading ? "—" : jumlahKelas}</div>
                <div className={styles.statLabel}>Kelas tiket</div>
              </li>
              <li className={styles.stat}>
                <div className={`${styles.display} ${styles.statValue}`}>
                  {termurah === null ? "—" : formatRupiah(termurah)}
                </div>
                <div className={styles.statLabel}>Harga mulai</div>
              </li>
            </ul>
          </header>

          <div className={styles.ribbon} aria-hidden="true">
            <div className={`${styles.display} ${styles.ribbonTrack}`}>
              {[0, 1].map((n) => (
                <span key={n} className={styles.ribbonItem}>
                  {Array.from({ length: 8 }, () => `${def.label}   /   `).join("")}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.toolbar}>
            <div>
              <h2 className={`${styles.display} ${styles.toolbarTitle}`}>{isSemua ? "Semua acara" : `Tiket ${def.label}`}</h2>
              <p className={styles.toolbarSub} role="status" aria-live="polite">
                {loading ? "Memuat acara…" : `${list.length} acara, lengkap dengan kelas tiketnya`}
              </p>
              {(kota || q) && (
                <div className={styles.filters}>
                  {kota && (
                    <button type="button" className={styles.filterChip} onClick={() => lepas("kota")} aria-label={`Hapus filter lokasi ${kotaLabelDariSlug(kota)}`}>
                      Lokasi: {kotaLabelDariSlug(kota)} <span aria-hidden="true">×</span>
                    </button>
                  )}
                  {q && (
                    <button type="button" className={styles.filterChip} onClick={() => lepas("q")} aria-label={`Hapus pencarian ${q}`}>
                      Pencarian: “{q}” <span aria-hidden="true">×</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className={styles.sort} role="group" aria-label="Urutkan acara">
              {SORT_KEYS.map((key) => (
                <button key={key} type="button" className={styles.sortBtn} aria-pressed={sort === key} onClick={() => setSort(key)}>
                  {SORT_LABEL[key]}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className={styles.empty} role="alert">
              <p className={`${styles.display} ${styles.emptyTitle}`}>Acara gagal dimuat</p>
              <p className={styles.emptyText}>{error}</p>
              <button type="button" className={styles.retry} onClick={load}>Coba lagi</button>
            </div>
          ) : loading ? (
            <div className={styles.list} aria-hidden="true">
              {[0, 1, 2].map((n) => <div key={n} className={styles.skeleton} />)}
            </div>
          ) : list.length === 0 ? (
            <div className={styles.empty}>
              <p className={`${styles.display} ${styles.emptyTitle}`}>{isSemua ? "Belum ada acara" : `Belum ada acara ${def.label}`}</p>
              <p className={styles.emptyText}>
                {kota || q
                  ? "Tidak ada acara yang cocok dengan filter ini. Lepas filter di atas untuk melihat semuanya."
                  : isSemua
                    ? "Belum ada acara yang dijadwalkan. Silakan cek lagi nanti."
                    : `Acara untuk kategori ini belum dijadwalkan. Coba lihat ${nextName}.`}
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {list.map((event, i) => (
                <li key={event.id} className={styles.rise} style={{ "--i": Math.min(i, 6) } as CSSProperties}>
                  <TicketCard event={event} index={Math.min(i, 6)} />
                </li>
              ))}
            </ul>
          )}

          <div className={styles.next}>
            <button type="button" className={styles.nextBtn} disabled={busy} onClick={() => void go(nextDef.slug)}>
              <span>
                <span className={styles.nextHint}>{nextIdx === 0 ? "Kembali ke" : `Lanjut ke kategori ${pad(nextIdx)}`}</span>
                <span className={`${styles.display} ${styles.nextLabel}`}>{nextDef.label}</span>
              </span>
              <ArrowRight className={styles.nextArrow} size={56} strokeWidth={1.4} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== tirai transisi: tampil saat halaman dimuat (memudar) dan saat ganti kategori ===== */}
      <div ref={curtainRef} className={`${styles.curtain} ${styles.intro}`} data-busy={busy} aria-hidden="true">
        <div ref={backRef} className={styles.panelBack} style={{ background: def.theme.accent }} />
        <div ref={frontRef} className={styles.panelFront} style={{ background: def.theme.bg }}>
          <span ref={labelRef} className={`${styles.display} ${styles.curtainLabel}`} style={{ color: def.theme.ink }}>
            {def.label}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Satu acara = satu tiket: poster | info | kelas tiket
   ============================================================ */

function TicketCard({ event, index }: { event: EventItem; index: number }) {
  const [open, setOpen] = useState(false);
  const poster = getImageUrl(event.poster);
  const { hari, bulan } = potongTanggal(event.tanggal);
  const tiers = useMemo(
    () => [...(event.kategori_tiket ?? [])].sort((a, b) => parseFloat(a.harga) - parseFloat(b.harga)),
    [event.kategori_tiket]
  );
  const visible = tiers.slice(0, TIER_PREVIEW);
  const hidden = tiers.slice(TIER_PREVIEW);
  const range = rentangHarga(event);
  const saleOpen = event.status === "aktif";

  return (
    <article className={styles.ticket} style={{ "--i": index } as CSSProperties}>
      {!saleOpen && <span className={styles.closedTag}>Penjualan ditutup</span>}

      <div className={styles.poster}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.posterImg} src={poster} alt={`Poster ${event.nama_event}`} loading="lazy" />
        ) : (
          <div className={`${styles.display} ${styles.posterEmpty}`} aria-hidden="true">{KATEGORI_BY_SLUG[kategoriOf(event)].label}</div>
        )}
        <div className={styles.dateChip} aria-hidden="true">
          <span className={`${styles.display} ${styles.dateDay}`}>{hari}</span>
          <span className={styles.dateMonth}>{bulan}</span>
        </div>
      </div>

      <div className={styles.main}>
        <p className={styles.when}>{formatHariTanggal(event.tanggal)}{formatJamWib(event.tanggal) ? ` · ${formatJamWib(event.tanggal)}` : ""}</p>
        <h3 className={`${styles.display} ${styles.evTitle}`}>{event.nama_event}</h3>
        <ul className={styles.meta}>
          {event.artis?.nama && (
            <li className={styles.metaRow}><Mic2 size={15} aria-hidden="true" /><span>{event.artis.nama}</span></li>
          )}
          <li className={styles.metaRow}><MapPin size={15} aria-hidden="true" /><span>{event.lokasi}</span></li>
        </ul>
        {event.artis?.genre && (
          <div className={styles.genre}><span className={styles.genreTag}>{event.artis.genre}</span></div>
        )}
      </div>

      <div className={styles.stub}>
        <div className={styles.stubHead}>
          <span className={styles.stubTitle}>Kelas tiket</span>
          <span className={styles.stubCount}>{tiers.length} kelas</span>
        </div>

        {tiers.length === 0 ? (
          <p className={styles.noTier}>Kelas tiket belum diumumkan.</p>
        ) : (
          <>
            <ul className={styles.tiers}>
              {visible.map((t) => <Tier key={t.id} tier={t} />)}
            </ul>
            {hidden.length > 0 && (
              <>
                <div className={styles.more} data-open={open}>
                  <div className={styles.moreInner}>
                    <ul className={styles.tiers} style={{ marginTop: 0 }}>
                      {hidden.map((t) => <Tier key={t.id} tier={t} />)}
                    </ul>
                  </div>
                </div>
                <button type="button" className={styles.moreBtn} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                  {open ? "Ringkas daftar kelas" : `Lihat ${hidden.length} kelas lainnya`}
                </button>
              </>
            )}
          </>
        )}

        <div className={styles.buy}>
          <div>
            <div className={styles.from}>{range && range.min !== range.max ? "Mulai dari" : "Harga"}</div>
            <div className={`${styles.display} ${styles.fromPrice}`}>{range ? formatRupiah(range.min) : "—"}</div>
          </div>
          {saleOpen ? (
            <Link href={`/events/${event.id}`} className={styles.cta}>
              Pilih tiket <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <span className={`${styles.cta} ${styles.ctaOff}`} aria-disabled="true">Ditutup</span>
          )}
        </div>
      </div>
    </article>
  );
}

function Tier({ tier }: { tier: KategoriTiket }) {
  const sisa = Math.max(0, tier.sisa_kuota ?? tier.kuota - tier.terjual);
  const habis = sisa === 0;
  const persen = tier.kuota > 0 ? Math.min(100, (sisa / tier.kuota) * 100) : 0;
  return (
    <li className={`${styles.tier} ${habis ? styles.tierSoldOut : ""}`}>
      <div className={styles.tierLine}>
        <span className={styles.tierName}>{tier.nama_kelas}</span>
        <span className={styles.tierPrice}>{habis ? "Habis" : formatRupiah(tier.harga)}</span>
      </div>
      <div className={styles.tierBar}>
        <div className={styles.tierTrack} aria-hidden="true">
          <span className={styles.tierFill} style={{ width: `${persen}%` }} />
        </div>
        <span className={styles.tierLeft}>{habis ? "0 tersisa" : `${sisa.toLocaleString("id-ID")} tersisa`}</span>
      </div>
    </li>
  );
}