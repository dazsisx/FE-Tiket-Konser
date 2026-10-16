"use client";

import TicketScanner from "@/components/scanner/TicketScanner";
import OfflineShell from "./OfflineShell";
import { useOfflineGuard } from "./useOfflineGuard";

/** Halaman pemindai untuk role admin_offline (guard memakai useOfflineGuard yang sudah ada). */
export default function OfflineScanPage() {
  const { user, ready, logout } = useOfflineGuard();

  if (!ready || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#6B7280]">Memuat…</div>;
  }

  return (
    <OfflineShell active="scan" userName={user.nama} onLogout={logout}>
      <TicketScanner onLogout={logout} />
    </OfflineShell>
  );
}