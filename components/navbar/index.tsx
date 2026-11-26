"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Big_Shoulders } from "next/font/google";
import { Check, ChevronDown, Heart, History, LayoutDashboard, LogOut, Search, User } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { KATEGORI } from "@/utils/kategori";
import { kotaOptions, toKotaParam } from "@/utils/kota";
import SearchBox from "./SearchBox";
import { KategoriMenu, LokasiMenu, type Panel } from "./FilterMenus";
import { useNavEvents } from "./useNavEvents";

// Font judul yang sama dengan landing & halaman kategori
const display = Big_Shoulders({ subsets: ["latin"], variable: "--font-display", display: "swap" });

/** Logo. Dipakai juga oleh kerangka sementara saat navbar dimuat. */
export function NavLogo() {
  return (
    <Link href="/" aria-label="DRStar, ke beranda" className="flex shrink-0 items-center">
      <Image src="/logobaru.png" alt="DRStar" width={707} height={353} priority className="h-9 w-auto" />
    </Link>
  );
}

/**
 * Link teks dengan garis emas yang "menarik" masuk saat hover / aktif.
 * Dengan `icon`, label disembunyikan di bawah breakpoint lg (tinggal ikon) supaya navbar tidak sesak di tablet.
 */
function NavLink({
  href,
  active,
  icon,
  title,
  children,
}: {
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex items-center gap-1.5 py-1 text-sm font-semibold transition-colors hover:text-[#0F766E] after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:rounded-full after:bg-[#F59E0B] after:transition-transform after:duration-300 ${
        active ? "text-[#0F766E] after:scale-x-100" : "text-[#1F2937] after:scale-x-0 hover:after:scale-x-100"
      }`}
    >
      {icon}
      <span className={icon ? "hidden lg:inline" : undefined}>{children}</span>
    </Link>
  );
}

/** Item menu mobile: penanda aktif = latar emerald muda + garis emas di kiri. */
function MobileLink({
  href,
  active,
  onClick,
  icon,
  children,
}: {
  href: string;
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative flex w-full items-center gap-2.5 rounded-2xl px-5 py-3.5 text-left text-base font-semibold transition-colors duration-150 hover:bg-[#ECFDF5] hover:text-[#0F766E] ${
        active
          ? "bg-[#ECFDF5] text-[#0F766E] before:absolute before:top-1/2 before:left-0 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-[#F59E0B]"
          : "text-[#1F2937]"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const events = useNavEvents();

  const [panel, setPanel] = useState<Panel>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const kota = toKotaParam(searchParams.get("kota"));
  const kotaList = kotaOptions(events);
  const kotaQs = kota ? `?kota=${kota}` : "";
  const profileOpen = panel === "profile";

  // Klik di luar navbar menutup kartu yang terbuka
  useEffect(() => {
    if (!panel) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [panel]);

  // Esc menutup semua kartu, menu mobile, dan pencarian layar penuh
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel(null);
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Pindah halaman: tutup semuanya (disesuaikan saat render, bukan lewat effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setPanel(null);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }

  function pilihKota(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("kota", slug);
    else params.delete("kota");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setPanel(null);
    setMobileMenuOpen(false);
  }

  // Wishlist & histori adalah fitur pelanggan. Tamu juga melihatnya (histori bisa dicek tanpa login,
  // wishlist mengarahkan ke login). Akun petugas memakai dashboard sendiri.
  const showCustomerLinks = !user || user.role === "pelanggan";
  const wishlistActive = pathname.startsWith("/wishlist");
  const historiActive = pathname.startsWith("/pembelian");

  const initials = user?.nama
    ? user.nama
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <>
      {/* Latar buram di belakang kartu yang terbuka (kategori, lokasi, pencarian, profil) */}
      {panel && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Tutup"
          onClick={() => setPanel(null)}
          className="fixed inset-0 z-40 hidden cursor-default bg-[#1F2937]/25 backdrop-blur-[6px] md:block"
        />
      )}

      <header
        ref={navRef}
        className={`${display.variable} fixed inset-x-0 top-0 z-50 border-b border-[#E7E2D6] bg-[#FFFBF5]`}
      >
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 sm:px-6"
        >
          <NavLogo />

          {/* Kategori & lokasi */}
          <div className="flex shrink-0 items-center gap-2 md:ml-1">
            <KategoriMenu panel={panel} setPanel={setPanel} events={events} kota={kota} />
            <LokasiMenu panel={panel} setPanel={setPanel} events={events} kota={kota} onPick={pilihKota} />
          </div>

          {/* Pencarian (desktop). Di mobile diganti ikon yang membuka layar penuh. */}
          <div className="hidden min-w-0 flex-1 md:flex">
            <SearchBox
              events={events}
              kota={kota}
              open={panel === "search"}
              onOpenChange={(o) => setPanel((p) => (o ? "search" : p === "search" ? null : p))}
            />
          </div>

          {/* Menu kanan */}
          <div className="hidden shrink-0 items-center gap-4 md:flex">
            {showCustomerLinks && (
              <>
                <NavLink href="/wishlist" active={wishlistActive} title="Wishlist" icon={<Heart size={16} aria-hidden="true" />}>
                  Wishlist
                </NavLink>
                <NavLink
                  href="/pembelian"
                  active={historiActive}
                  title="Histori Pembelian"
                  icon={<History size={16} aria-hidden="true" />}
                >
                  Histori
                </NavLink>
              </>
            )}

            {isLoading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-[#E5E7EB]" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setPanel(profileOpen ? null : "profile")}
                  aria-expanded={profileOpen}
                  className="flex items-center gap-2 rounded-full border-[1.5px] border-[#DAD3C2] py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:border-[#0F766E]"
                >
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt="Avatar" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-white">{initials}</span>
                  )}
                  <span className="max-w-[100px] truncate text-sm font-semibold text-[#1F2937]">{user.nama}</span>
                  <ChevronDown
                    size={14}
                    className={`text-[#6B7280] transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`absolute right-0 top-full z-50 mt-2 w-52 origin-top-right rounded-2xl border border-[#E7E2D6] bg-white p-2 shadow-[0_18px_40px_rgba(31,41,55,0.14)] transition-all duration-200 ${
                    profileOpen
                      ? "translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                  }`}
                >
                  <Link
                    href="/profile"
                    onClick={() => setPanel(null)}
                    className="mb-1 flex items-center gap-3 rounded-xl border-b border-[#E5E7EB] px-3 py-3 transition-colors hover:bg-[#ECFDF5]"
                  >
                    {user.avatar_url ? (
                      <Image src={user.avatar_url} alt="Avatar" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F766E] text-sm font-bold text-white">{initials}</span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#1F2937]">{user.nama}</p>
                      <p className="truncate text-xs text-[#9CA3AF]">Lihat profil kamu</p>
                    </div>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setPanel(null)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1F2937] transition-colors hover:bg-[#ECFDF5] hover:text-[#0F766E]"
                  >
                    <User size={16} />
                    Profil Saya
                  </Link>
                  {user.role === "pelanggan" && (
                    <>
                      <Link
                        href="/wishlist"
                        onClick={() => setPanel(null)}
                        aria-current={wishlistActive ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#ECFDF5] hover:text-[#0F766E] ${
                          wishlistActive ? "bg-[#ECFDF5] text-[#0F766E]" : "text-[#1F2937]"
                        }`}
                      >
                        <Heart size={16} />
                        Wishlist
                      </Link>
                      <Link
                        href="/pembelian"
                        onClick={() => setPanel(null)}
                        aria-current={historiActive ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#ECFDF5] hover:text-[#0F766E] ${
                          historiActive ? "bg-[#ECFDF5] text-[#0F766E]" : "text-[#1F2937]"
                        }`}
                      >
                        <History size={16} />
                        Histori Pembelian
                      </Link>
                    </>
                  )}
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setPanel(null)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1F2937] transition-colors hover:bg-[#ECFDF5] hover:text-[#0F766E]"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setPanel(null);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#DC2626] transition-colors hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              // Satu pintu masuk. Halaman login punya tautan "Daftar" untuk pengguna baru.
              <Link
                href="/auth/login"
                className="inline-flex h-10 items-center rounded-full bg-[#0F766E] px-5 text-sm font-bold text-white transition-colors hover:bg-[#0D9488]"
              >
                Masuk<span className="hidden xl:inline">&nbsp;/ Daftar</span>
              </Link>
            )}
          </div>

          {/* Mobile: cari + hamburger */}
          <div className="ml-auto flex items-center gap-1 md:hidden">
            <button
              type="button"
              aria-label="Cari"
              onClick={() => {
                setMobileMenuOpen(false);
                setMobileSearchOpen(true);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#1F2937] hover:bg-[#F6F1E4]"
            >
              <Search size={20} aria-hidden="true" />
            </button>
            <button
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full hover:bg-[#F6F1E4]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Buka atau tutup menu"
              aria-expanded={mobileMenuOpen}
            >
              <span
                className={`block h-0.5 w-5 rounded-full bg-[#1F2937] transition-all duration-300 ${
                  mobileMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-[#1F2937] transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-[#1F2937] transition-all duration-300 ${
                  mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile: pencarian layar penuh */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#FFFBF5] p-4 md:hidden" role="dialog" aria-label="Pencarian">
          <div className="flex items-center gap-2">
            <SearchBox
              variant="sheet"
              events={events}
              kota={kota}
              open
              onOpenChange={() => {}}
              onDone={() => setMobileSearchOpen(false)}
            />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="shrink-0 px-2 py-2 text-sm font-semibold text-[#0F766E]"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Mobile menu overlay */}
      <div
        className={`${display.variable} fixed inset-0 z-40 transition-all duration-300 md:hidden ${
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-[#1F2937]/25 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div
          className={`absolute top-[4.5rem] right-4 left-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-3xl border border-[#E7E2D6] bg-[#FFFBF5] p-6 shadow-2xl transition-all duration-300 ${
            mobileMenuOpen ? "translate-y-0 scale-100 opacity-100" : "-translate-y-4 scale-95 opacity-0"
          }`}
        >
          <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Kategori</p>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {KATEGORI.map((k) => (
              <Link
                key={k.slug}
                href={`/kategori/${k.slug}${kotaQs}`}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border-[1.5px] border-[#E5E7EB] px-4 py-3 text-xl font-extrabold uppercase leading-none text-[#1F2937] transition-colors [font-family:var(--font-display),'Arial_Narrow',Impact,sans-serif] hover:border-[#F59E0B] hover:bg-[#FFFBEB]"
              >
                {k.label}
              </Link>
            ))}
          </div>

          {kotaList.length > 0 && (
            <>
              <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Lokasi</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {[{ slug: null as string | null, label: "Semua" }, ...kotaList].map((o) => {
                  const on = (o.slug ?? null) === kota;
                  return (
                    <button
                      key={o.slug ?? "semua"}
                      type="button"
                      onClick={() => pilihKota(o.slug)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${
                        on
                          ? "border-[#0F766E] bg-[#ECFDF5] text-[#0F766E]"
                          : "border-[#DAD3C2] text-[#1F2937] hover:border-[#B9B09A]"
                      }`}
                    >
                      {on && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {showCustomerLinks && (
            <>
              <MobileLink
                href="/wishlist"
                active={wishlistActive}
                onClick={() => setMobileMenuOpen(false)}
                icon={<Heart size={18} aria-hidden="true" />}
              >
                Wishlist
              </MobileLink>
              <MobileLink
                href="/pembelian"
                active={historiActive}
                onClick={() => setMobileMenuOpen(false)}
                icon={<History size={18} aria-hidden="true" />}
              >
                Histori Pembelian
              </MobileLink>
            </>
          )}

          {user && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-2xl px-5 py-3.5 text-left text-base font-semibold text-[#1F2937] transition-colors duration-150 hover:bg-[#ECFDF5] hover:text-[#0F766E]"
            >
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt="Avatar" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-white">{initials}</span>
              )}
              Profil Saya
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-2xl px-5 py-3.5 text-left text-base font-semibold text-[#1F2937] transition-colors duration-150 hover:bg-[#ECFDF5] hover:text-[#0F766E]"
            >
              <LayoutDashboard size={18} />
              Dashboard Admin
            </Link>
          )}

          <div className="mt-4 flex flex-col gap-3 border-t border-[#E5E7EB] pt-4">
            {isLoading ? null : user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-[#DC2626] px-5 py-3 text-center text-base font-semibold text-[#DC2626] transition-all duration-200 hover:bg-red-50"
              >
                <LogOut size={16} />
                Keluar
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-2xl bg-[#0F766E] px-5 py-3 text-center text-base font-bold text-white transition-colors duration-200 hover:bg-[#0D9488]"
                >
                  Masuk
                </Link>
                <p className="text-center text-sm text-[#6B7280]">
                  Belum punya akun?{" "}
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-bold text-[#0F766E] underline-offset-2 hover:underline"
                  >
                    Daftar
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
