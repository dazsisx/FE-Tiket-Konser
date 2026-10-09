"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Penjaga halaman Admin Offline (hanya untuk UX/redirect).
 * Pembatasan akses yang sebenarnya tetap dilakukan backend (/api/offline/*).
 */
export function useOfflineGuard() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/admin/login");
      return;
    }
    if (user.role === "admin") router.replace("/admin");
    else if (user.role !== "admin_offline") router.replace("/");
  }, [isLoading, router, user]);

  const ready = !isLoading && !!user && user.role === "admin_offline";
  return { user: ready ? user : null, ready, logout };
}