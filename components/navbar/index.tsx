"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
    setProfileMenuOpen(false);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <div
        className={`fixed top-0 right-0 left-0 z-50 flex justify-center px-4 transition-all duration-500 ${
          scrolled ? "pt-3" : "pt-4"
        }`}
      >
        <nav
          className={`relative flex h-16 items-center gap-4 transition-all duration-500 ${
            scrolled
              ? "w-[95%] max-w-[1000px] rounded-full bg-white/[0.92] px-6 shadow-[0_4px_24px_rgba(15,118,110,0.10)] backdrop-blur-md"
              : "w-full max-w-[1200px] bg-transparent px-5"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <Image
              src="/logobaru.png"
              alt="DRStar"
              width={180}
              height={180}
              priority
              className="h-34 w-34 object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Search bar */}
          <div className="hidden flex-1 items-center justify-between rounded-full border border-[#E5E7EB] bg-white pl-5 pr-1.5 shadow-sm md:flex">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Cari di DRStar"
              className="w-full bg-transparent py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none"
            />
            <button
              aria-label="Cari"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white shadow-[0_8px_20px_rgba(15,118,110,0.25)] transition-transform hover:scale-105 hover:bg-[#0D9488]"
            >
              <Search size={15} />
            </button>
          </div>

          {/* Right menu */}
          <div className="hidden shrink-0 items-center gap-4 md:flex">
            <Link
              href="/pembelian"
              className="text-sm font-semibold text-[#1F2937] transition-colors hover:text-[#6EE7B7]"
            >
              Pembelian
            </Link>

            {isLoading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-[#E5E7EB]" />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 rounded-full border-[1.5px] border-[#E5E7EB] py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:border-[#0F766E]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-white">
                    {initials}
                  </span>
                  <span className="max-w-[100px] truncate text-sm font-semibold text-[#1F2937]">
                    {user.nama}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-[#6B7280] transition-transform duration-200 ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute right-0 top-full mt-2 w-52 origin-top-right rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-[0_12px_32px_rgba(15,118,110,0.15)] transition-all duration-200 ${
                    profileMenuOpen
                      ? "translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                  }`}
                >
                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1F2937] transition-colors hover:bg-[#ECFDF5] hover:text-[#0F766E]"
                  >
                    <User size={16} />
                    Profil Saya
                  </Link>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#DC2626] transition-colors hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-full border-[1.5px] border-[#0F766E] px-5 py-2 text-sm font-semibold text-[#0F766E] transition-all duration-200 hover:border-[#F59E0B] hover:bg-[#FFFBEB] hover:text-[#F59E0B]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-[#0F766E] px-5 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(15,118,110,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488] hover:shadow-[0_10px_26px_rgba(15,118,110,0.30)]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="ml-auto flex flex-col items-center justify-center gap-1.5 p-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block h-0.5 w-6 rounded-full bg-[#1F2937] transition-all duration-300 ${
                mobileMenuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 rounded-full bg-[#1F2937] transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-6 rounded-full bg-[#1F2937] transition-all duration-300 ${
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
          className="absolute inset-0 bg-[#1F2937]/[0.08] backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-20 right-4 left-4 rounded-3xl border border-[#E5E7EB] bg-white/[0.97] p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            mobileMenuOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-4 scale-95 opacity-0"
          }`}
        >
          <div className="mb-4 flex items-center rounded-full bg-[#FFFBF5] px-4 py-2">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Cari di DRStar"
              className="w-full bg-transparent text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none"
            />
            <Search size={16} className="text-[#9CA3AF]" />
          </div>

          <Link
            href="/pembelian"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full rounded-2xl px-5 py-3.5 text-left text-base font-semibold text-[#1F2937] transition-colors duration-150 hover:bg-[#ECFDF5] hover:text-[#0F766E]"
          >
            Pembelian
          </Link>

          {user && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-2xl px-5 py-3.5 text-left text-base font-semibold text-[#1F2937] transition-colors duration-150 hover:bg-[#ECFDF5] hover:text-[#0F766E]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F766E] text-xs font-bold text-white">
                {initials}
              </span>
              Profil Saya
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
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-2xl border-[1.5px] border-[#0F766E] px-5 py-3 text-center text-base font-semibold text-[#0F766E] transition-all duration-200 hover:border-[#F59E0B] hover:bg-[#FFFBEB] hover:text-[#F59E0B]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-2xl bg-[#0F766E] px-5 py-3 text-center text-base font-bold text-white shadow-[0_10px_26px_rgba(15,118,110,0.30)] transition-all duration-200 hover:bg-[#0D9488]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}