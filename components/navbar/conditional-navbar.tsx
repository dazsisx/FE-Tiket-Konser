"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";

const HIDDEN_ROUTES = ["/auth/login", "/auth/register", "/terms", "/privacy", "/auth/forgot-password", 
  "/auth/reset-password", "/auth/verify-otp", "/pembelian/email", "/pembelian/nomor", "/profile"];

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const isHidden = HIDDEN_ROUTES.includes(pathname) || pathname.startsWith("/admin") || pathname.startsWith("/kategori") || pathname.startsWith("/events/") || pathname.startsWith("/pembelian/");
;

  if (isHidden) return null;

  return <Navbar />;
}