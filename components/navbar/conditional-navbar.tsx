"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar, { NavLogo } from "@/components/navbar";
import BackToTop from "@/components/navbar/BackToTop";

const HIDDEN_ROUTES = ["/auth/login", "/auth/register", "/terms", "/privacy", "/auth/forgot-password",
  "/auth/reset-password", "/auth/verify-otp", "/pembelian/email", "/pembelian/nomor", "/profile"];

// Halaman dengan bilah aksi menempel di bawah (beli tiket, checkout) atau bukan halaman baca: tombol "ke atas" disembunyikan
const NO_BACK_TO_TOP = ["/auth", "/admin", "/pembelian", "/profile", "/events/"];

/** Kerangka setinggi navbar sementara useSearchParams menunggu (mencegah loncatan layout). */
function NavbarFallback() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E7E2D6] bg-[#FFFBF5]">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center px-4 sm:px-6">
        <NavLogo />
      </div>
    </header>
  );
}

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const isHidden = HIDDEN_ROUTES.includes(pathname) || pathname.startsWith("/admin") || pathname.startsWith("/kategori") || pathname.startsWith("/events/") || pathname.startsWith("/pembelian/")
  || pathname.startsWith("/wishlist")|| pathname.startsWith("/pembelian");

  const showBackToTop = !NO_BACK_TO_TOP.some((p) => pathname.startsWith(p));

  return (
    <>
      {!isHidden && (
        // useSearchParams (filter ?kota=) wajib berada di dalam Suspense
        <Suspense fallback={<NavbarFallback />}>
          <Navbar />
        </Suspense>
      )}
      {showBackToTop && <BackToTop />}
    </>
  );
}
