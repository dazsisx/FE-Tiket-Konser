"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 right-0 left-0 z-50 flex justify-center px-4 transition-all duration-500 ${
          scrolled ? "pt-3" : "pt-4"
        }`}
      >
        <nav
          className={`relative flex h-16 items-center gap-4 overflow-hidden transition-all duration-500 ${
            scrolled
              ? "w-[95%] max-w-[1000px] rounded-full border border-[#E2E8F0] bg-[#F8FAFC]/[0.88] px-6 shadow-[0_4px_24px_rgba(59,130,246,0.10)] backdrop-blur-md"
              : "w-full max-w-[1200px] bg-transparent px-5"
          }`}
        >
          {/* Logo */}
                <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                <Image
          src="/DRStar-baru.png"
          alt="DRStar"
          width={180}      
          height={180}      
          priority
          className="h-34 w-34 object-contain transition-transform duration-200 group-hover:scale-105"
        />
        </Link>

          {/* Search bar */}
          <div className="hidden flex-1 items-center justify-between rounded-full bg-[#EEF4FF] pl-5 pr-1.5 md:flex">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Cari di DRStar"
              className="w-full bg-transparent py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              aria-label="Cari"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-transform hover:scale-105 hover:from-[#1D4ED8] hover:to-[#0891B2]"
            >
              <Search size={15} />
            </button>
          </div>

          {/* Right menu */}
          <div className="hidden shrink-0 items-center gap-4 md:flex">
            <Link
              href="/pembelian"
              className="text-sm font-semibold text-gray-700 transition-colors hover:text-[#14213D]"
            >
              Pembelian
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full border-[1.5px] border-[#2563EB] px-5 py-2 text-sm font-semibold text-[#081B4B] transition-all duration-200 hover:border-[#06B6D4] hover:bg-[#EFFBFF] hover:text-[#06B6D4]"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] px-5 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#1D4ED8] hover:to-[#0891B2] hover:shadow-[0_10px_26px_rgba(37,99,235,0.30)]"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="ml-auto flex flex-col items-center justify-center gap-1.5 p-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block h-0.5 w-6 rounded-full bg-[#14213D] transition-all duration-300 ${
                mobileMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 rounded-full bg-[#14213D] transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-6 rounded-full bg-[#14213D] transition-all duration-300 ${
                mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-[#14213D]/[0.08] backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-20 right-4 left-4 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC]/[0.96] p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            mobileMenuOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-4 scale-95 opacity-0"
          }`}
        >
          <div className="mb-4 flex items-center rounded-full bg-[#EEF4FF] px-4 py-2">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Cari di DRStar"
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
            <Search size={16} className="text-gray-400" />
          </div>

          <Link
            href="/pembelian  "
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full rounded-2xl px-5 py-3.5 text-left text-base font-semibold text-gray-700 transition-colors duration-150 hover:bg-[#EEF2FF] hover:text-[#14213D]"
          >
            Pembelian
          </Link>

          <div className="mt-4 flex flex-col gap-3 border-t border-[#E2E8F0] pt-4">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full rounded-2xl border-[1.5px] border-[#2563EB] px-5 py-3 text-center text-base font-semibold text-[#081B4B] transition-all duration-200 hover:border-[#06B6D4] hover:bg-[#EFFBFF] hover:text-[#06B6D4]"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] px-5 py-3 text-center text-base font-bold text-white shadow-[0_10px_26px_rgba(37,99,235,0.30)] transition-all duration-200 hover:from-[#1D4ED8] hover:to-[#0891B2]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}