"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";

const HIDDEN_ROUTES = ["/auth/login", "/auth/register", "/terms", "/privacy", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-reset-otp"];

export default function ConditionalNavbar() {
  const pathname = usePathname();

  const isHidden = HIDDEN_ROUTES.includes(pathname);

  if (isHidden) return null;

  return <Navbar />;
}