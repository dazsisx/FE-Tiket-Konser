"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { OFFLINE_BASE } from "@/components/offline/config";
import TicketScanner from "@/components/scanner/TicketScanner";
import AdminShell from "./AdminShell";

/** Halaman pemindai untuk role admin. Guard ini hanya untuk UX; otorisasi sebenarnya di backend. */
export default function AdminScanPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    if (user.role === "admin_offline") router.replace(`${OFFLINE_BASE}/scan`);
    else if (user.role !== "admin") router.replace("/");
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== "admin") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#6B7280]">Memuat…</div>;
  }

  return (
    <AdminShell active="scan" userName={user.nama} onLogout={logout}>
      <TicketScanner onLogout={logout} />
    </AdminShell>
  );
}