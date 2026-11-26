"use client";

import { useEffect, useState } from "react";
import { fetchEvents, type EventItem } from "@/utils/api";
import { tampilPublik } from "@/utils/kategori";

/**
 * Daftar acara publik untuk navbar (saran pencarian, jumlah per kategori, daftar kota).
 * Diambil sekali per sesi tab dan dipakai bersama; kalau gagal, navbar tetap jalan dengan daftar kosong
 * dan mencoba lagi pada pemuatan berikutnya.
 */
let cache: EventItem[] | null = null;
let pending: Promise<EventItem[]> | null = null;

export function useNavEvents(): EventItem[] {
  const [events, setEvents] = useState<EventItem[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    let batal = false;
    if (!pending) {
      pending = fetchEvents()
        .then((data) => {
          cache = data.filter(tampilPublik);
          return cache;
        })
        .finally(() => {
          pending = null;
        });
    }
    pending
      .then((data) => {
        if (!batal) setEvents(data);
      })
      .catch(() => {
        // BE belum jalan: biarkan kosong
      });
    return () => {
      batal = true;
    };
  }, []);

  return events;
}
