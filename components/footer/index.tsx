import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, MapPin, Phone, ShieldCheck, Ticket } from "lucide-react";
import { Big_Shoulders, Instrument_Sans } from "next/font/google";
import { KATEGORI } from "@/utils/kategori";
import styles from "./footer.module.css";

// Font yang sama dengan halaman kategori & pembelian.
const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

/* Ikon sosial dibuat manual (lucide-react tidak punya X dan TikTok). */
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.6-6.7L4.2 22H1l8.1-9.3L1 2h7.3l5.1 6.2L18.9 2Zm-1.2 18h1.7L7.4 4H5.6l12.1 16Z" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 2h-3.2v13.4a3.1 3.1 0 1 1-2.2-2.97V9.1a6.3 6.3 0 1 0 5.4 6.24V8.42a8.3 8.3 0 0 0 4.9 1.58V6.78a5 5 0 0 1-4.9-4.78Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.2C15.9 4.1 15 4 13.9 4c-2.24 0-3.77 1.37-3.77 3.87V10.4H7.5v3h2.63V21h3.37Z" />
    </svg>
  );
}

// Hanya halaman yang benar-benar ada di app/.
const exploreLinks = [
  { label: "Beranda", href: "/" },
  ...KATEGORI.map((k) => ({ label: k.label, href: `/kategori/${k.slug}` })),
];

const orderLinks = [
  { label: "Cek Pembelian", href: "/pembelian" },
  { label: "Masuk", href: "/auth/login" },
  { label: "Daftar", href: "/auth/register" },
  { label: "Profil Saya", href: "/profile" },
];

const infoLinks = [
  { label: "Syarat & Ketentuan", href: "/terms" },
  { label: "Kebijakan Privasi", href: "/privacy" },
];

// Ganti href dengan akun resmi kalian.
const socials = [
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "TikTok", href: "https://tiktok.com", Icon: TikTokIcon },
  { label: "X", href: "https://x.com", Icon: XIcon },
];

/**
 * Pilihan pembayaran (Midtrans). Sesuaikan dengan metode yang aktif di dashboard Midtrans.
 * Logo resmi: taruh file di public/payment/<file> (nama persis seperti di bawah).
 * Kalau file belum ada, kartu menampilkan nama teks sebagai cadangan.
 */
const paymentMethods = [
  { name: "QRIS", file: "qris.svg" },
  { name: "BCA", file: "bca.svg" },
  { name: "Mandiri", file: "mandiri.svg" },
  { name: "BRI", file: "bri.svg" },
  { name: "BNI", file: "bni.svg" },
  { name: "BTN", file: "btn.svg" },
  { name: "BSI", file: "bsi.svg" },
  { name: "Permata", file: "permata.svg" },
  { name: "Visa", file: "visa.svg" },
  { name: "Mastercard", file: "mastercard.svg" },
  { name: "ShopeePay", file: "shopeepay.svg" },
  { name: "GoPay", file: "gopay.svg" },
  { name: "Indodana", file: "indodana.svg" },
  { name: "Indomaret", file: "indomaret.svg" },
  { name: "Alfamart", file: "alfamart.svg" },
].map((m) => ({
  ...m,
  // Footer adalah server component, jadi aman cek file di disk.
  hasLogo: fs.existsSync(path.join(process.cwd(), "public", "payment", m.file)),
}));

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h3 className={`${styles.display} ${styles.colTitle}`}>{title}</h3>
      <ul className={styles.list}>
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.link}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Footer() {
  return (
    <footer className={`${display.variable} ${body.variable} ${styles.root}`}>
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.wrap}>
        {/* ===== tiket ajakan ===== */}
        <section className={styles.stub} aria-label="Cari event">
          <div>
            <p className={styles.stubKicker}>DR Star · Tiket Konser</p>
            <h2 className={`${styles.display} ${styles.stubTitle}`}>Panggung berikutnya menunggumu.</h2>
          </div>
          <div className={styles.stubActions}>
            <Link href="/kategori/konser" className={`${styles.btn} ${styles.btnSolid}`}>
              Cari Event <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/pembelian" className={`${styles.btn} ${styles.btnGhost}`}>
              <Ticket size={16} aria-hidden="true" /> Cek Pembelian
            </Link>
          </div>
        </section>

        {/* ===== kolom ===== */}
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="DR Star — ke beranda">
              <Image src="/logobaru.png" alt="DR Star" width={240} height={68} className={styles.logoImg} />
            </Link>
            <p className={styles.tagline}>
              Temukan dan pesan konser favoritmu dengan pengalaman yang cepat, aman, dan nyaman.
            </p>

            <ul className={styles.contact}>
              <li>
                <a href="mailto:support@drstar.id" className={styles.contactRow}>
                  <span className={styles.contactIcon}><Mail size={15} aria-hidden="true" /></span>
                  <span className={styles.contactText}>support@drstar.id</span>
                </a>
              </li>
              <li>
                <a href="tel:+6281234567890" className={styles.contactRow}>
                  <span className={styles.contactIcon}><Phone size={15} aria-hidden="true" /></span>
                  <span className={styles.contactText}>+62 812-3456-7890</span>
                </a>
              </li>
              <li className={styles.contactRow}>
                <span className={styles.contactIcon}><MapPin size={15} aria-hidden="true" /></span>
                <span className={styles.contactText}>Depok, Indonesia</span>
              </li>
            </ul>
          </div>

          <LinkColumn title="Jelajahi" links={exploreLinks} />
          <LinkColumn title="Pesanan & Akun" links={orderLinks} />

          <div>
            <LinkColumn title="Informasi" links={infoLinks} />
            <h3 className={`${styles.display} ${styles.colTitle}`} style={{ marginTop: "2rem" }}>
              Ikuti Kami
            </h3>
            <div className={styles.socials}>
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.social}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ===== pembayaran ===== */}
        <section className={styles.pay} aria-labelledby="pay-title">
          <div className={styles.payInfo}>
            <h3 id="pay-title" className={`${styles.display} ${styles.colTitle}`}>
              Pilihan Pembayaran
            </h3>
            <p className={styles.payNote}>
              <ShieldCheck size={15} aria-hidden="true" /> Transaksi diproses aman oleh Midtrans.
            </p>
          </div>
          <ul className={styles.payGrid}>
            {paymentMethods.map((m) => (
              <li key={m.name} className={styles.payCard}>
                {m.hasLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/payment/${m.file}`}
                    alt={m.name}
                    loading="lazy"
                    className={styles.payLogo}
                  />
                ) : (
                  <span className={styles.payName}>{m.name}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ===== bawah ===== */}
        <div className={styles.bottom}>
          <p>© 2026 DR Star. Hak cipta dilindungi.</p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.bottomLink}>Kebijakan Privasi</Link>
            <Link href="/terms" className={styles.bottomLink}>Ketentuan Layanan</Link>
            <Link href="/admin/login" className={styles.bottomLink}>Portal Petugas</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}