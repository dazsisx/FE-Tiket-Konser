"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAllOfflineOrders, type PesananOffline } from "@/utils/api";

/** Memuat seluruh transaksi offline milik akun yang login (sekali, plus reload manual). */
export function useOfflineOrders(enabled: boolean) {
  const [orders, setOrders] = useState<PesananOffline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await fetchAllOfflineOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaksi gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) void reload();
  }, [enabled, reload]);

  return { orders, loading, error, reload };
}
