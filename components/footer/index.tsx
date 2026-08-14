import Link from "next/link";
import { Mail, Phone, MapPin, Apple, PlayCircle } from "lucide-react";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
});

/* Ikon X dan TikTok tidak tersedia di lucide-react, jadi dibuat manual
   sebagai SVG ringan supaya konsisten dengan gaya ikon sosial lainnya. */
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.6-6.7L4.2 22H1l8.1-9.3L1 2h7.3l5.1 6.2L18.9 2Zm-1.2 18h1.7L7.4 4H5.6l12.1 16Z" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 2h-3.2v13.4a3.1 3.1 0 1 1-2.2-2.97V9.1a6.3 6.3 0 1 0 5.4 6.24V8.42a8.3 8.3 0 0 0 4.9 1.58V6.78a5 5 0 0 1-4.9-4.78Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.2C15.9 4.1 15 4 13.9 4c-2.24 0-3.77 1.37-3.77 3.87V10.4H7.5v3h2.63V21h3.37Z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12s0-3.1-.4-4.6a3 3 0 0 0-2.1-2.1C17.9 5 12 5 12 5s-5.9 0-7.5.3a3 3 0 0 0-2.1 2.1C2 8.9 2 12 2 12s0 3.1.4 4.6a3 3 0 0 0 2.1 2.1C6.1 19 12 19 12 19s5.9 0 7.5-.3a3 3 0 0 0 2.1-2.1C22 15.1 22 12 22 12Zm-12.1 3V9l5.2 3-5.2 3Z" />
    </svg>
  );
}

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Categories", href: "/categories" },
  { label: "Promotions", href: "/promotions" },
];

const supportLinks = [
  { label: "Help Center", href: "/help" },
  { label: "Contact Us", href: "/contact" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "X", href: "https://x.com", Icon: XIcon },
  { label: "TikTok", href: "https://tiktok.com", Icon: TikTokIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YoutubeIcon },
];

export default function Footer() {
  return (
    <footer
      className={`${outfit.variable} ${jakarta.variable} relative overflow-hidden border-t border-white/10 bg-[#111827] font-[family-name:var(--font-jakarta)]`}
    >
      {/* Radial glow — biru di kiri atas, cyan di kanan bawah */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-[440px] w-[440px] rounded-full bg-[#2563EB] opacity-[0.14] blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[440px] w-[440px] rounded-full bg-[#06B6D4] opacity-[0.14] blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-10 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-10">
          {/* Kolom 1 — Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center font-[family-name:var(--font-outfit)] text-2xl font-extrabold tracking-tight text-white"
            >
              DR
              <span className="mx-0.5 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent">
                Star
              </span>
            </Link>

            <p className="mt-5 text-[15px] leading-relaxed text-[#CBD5E1]">
              Discover and book your favorite concerts with a fast, secure,
              and seamless experience.
            </p>

            <div className="mt-7 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                  <Mail size={16} />
                </span>
                <div>
                  <p className="text-xs tracking-wide text-slate-500">Email</p>
                  <p className="text-sm text-slate-200">support@drstar.id</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                  <Phone size={16} />
                </span>
                <div>
                  <p className="text-xs tracking-wide text-slate-500">Phone</p>
                  <p className="text-sm text-slate-200">+62 812-3456-7890</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                  <MapPin size={16} />
                </span>
                <div>
                  <p className="text-xs tracking-wide text-slate-500">Location</p>
                  <p className="text-sm text-slate-200">Depok, Indonesia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom 2 — Explore */}
          <nav aria-label="Explore">
            <h3 className="font-[family-name:var(--font-outfit)] text-sm font-semibold tracking-wide text-white">
              Explore
            </h3>
            <ul className="mt-5 flex flex-col gap-3.5">
              {exploreLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 transition-colors duration-300 hover:text-[#06B6D4]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kolom 3 — Support */}
          <nav aria-label="Support">
            <h3 className="font-[family-name:var(--font-outfit)] text-sm font-semibold tracking-wide text-white">
              Support
            </h3>
            <ul className="mt-5 flex flex-col gap-3.5">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-400 transition-colors duration-300 hover:text-[#06B6D4]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kolom 4 — Follow Us + Download App */}
          <div>
            <h3 className="font-[family-name:var(--font-outfit)] text-sm font-semibold tracking-wide text-white">
              Follow Us
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#2563EB] transition-all duration-300 hover:scale-110 hover:border-[#06B6D4]/40 hover:text-[#06B6D4]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <h4 className="mt-9 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Download App
            </h4>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href="#"
                className="flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2.5 text-sm text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#06B6D4]/40 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]"
              >
                <Apple size={16} className="text-[#2563EB]" />
                App Store
              </a>
              <a
                href="#"
                className="flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2.5 text-sm text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#06B6D4]/40 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]"
              >
                <PlayCircle size={16} className="text-[#2563EB]" />
                Google Play
              </a>
            </div>
          </div>
        </div>

        {/* Divider bergaya sobekan tiket — signature element yang
            menghubungkan bentuk footer dengan identitas "tiket konser" */}
        <div className="relative my-14">
          <div className="h-px w-full border-t border-dashed border-white/15" />
          <span className="absolute top-1/2 -left-1 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-white/10 bg-[#111827]" />
          <span className="absolute top-1/2 -right-1 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-white/10 bg-[#111827]" />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <p className="text-slate-500">© 2026 DR Star. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-slate-500 transition-colors duration-300 hover:text-[#06B6D4]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-slate-500 transition-colors duration-300 hover:text-[#06B6D4]"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-slate-500 transition-colors duration-300 hover:text-[#06B6D4]"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}