import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Info,
  MapPin,
  Ticket,
  Upload,
  XCircle,
} from "lucide-react";
import { formatJam, formatRupiah, formatTanggal } from "@/utils/api";
import type { HasilCekPembelian } from "@/utils/cekPembelian";

// Hasil "cek pembelian" untuk pengunjung (tanpa login).
// Semua data berasal dari backend. Status pembayaran dan QR tidak pernah ditentukan di sini.

type Stage = "bayar" | "verifikasi" | "lunas" | "ditolak" | "kadaluarsa";

function stageOf(data: HasilCekPembelian): Stage {
  if (data.status_bayar === "lunas") return "lunas";
  if (data.status_bayar === "ditolak") return "ditolak";
  if (data.status_bayar === "kadaluarsa") return "kadaluarsa";
  return data.bukti_bayar_terunggah ? "verifikasi" : "bayar";
}

const stageInfo: Record<
  Stage,
  { title: string; desc: string; tone: string; box: string; Icon: typeof CheckCircle2 }
> = {
  bayar: {
    title: "Menunggu Pembayaran",
    desc: "Pesanan ini belum dibayar. Masuk ke akun yang dipakai saat memesan, lalu unggah bukti pembayaran.",
    tone: "bg-[#F59E0B]",
    box: "border-[#F59E0B]/20 bg-[#FFFBEB]",
    Icon: Upload,
  },
  verifikasi: {
    title: "Menunggu Verifikasi",
    desc: "Bukti pembayaran sudah diterima dan sedang diperiksa admin. QR tiket akan muncul di sini setelah disetujui.",
    tone: "bg-[#F59E0B]",
    box: "border-[#F59E0B]/20 bg-[#FFFBEB]",
    Icon: Clock,
  },
  lunas: {
    title: "Pembayaran Berhasil",
    desc: "Pembayaran sudah terkonfirmasi. Setiap tiket punya QR sendiri, tunjukkan QR-nya saat masuk venue.",
    tone: "bg-[#0F766E]",
    box: "border-[#0F766E]/20 bg-[#ECFDF5]",
    Icon: CheckCircle2,
  },
  ditolak: {
    title: "Pembayaran Ditolak",
    desc: "Pembayaran tidak dapat diverifikasi dan tiket dikembalikan ke stok. Silakan pesan ulang.",
    tone: "bg-red-500",
    box: "border-red-200 bg-red-50",
    Icon: XCircle,
  },
  kadaluarsa: {
    title: "Pesanan Kedaluwarsa",
    desc: "Batas waktu pesanan ini sudah lewat. Silakan pesan ulang.",
    tone: "bg-red-500",
    box: "border-red-200 bg-red-50",
    Icon: XCircle,
  },
};

const statusTiket = {
  aktif: { label: "Aktif", cls: "bg-[#ECFDF5] text-[#0F766E]" },
  terpakai: { label: "Sudah digunakan", cls: "bg-[#F3F4F6] text-[#6B7280]" },
  dibatalkan: { label: "Dibatalkan", cls: "bg-red-50 text-red-600" },
} as const;

export default function HasilPembelian({ data }: { data: HasilCekPembelian }) {
  const stage = stageOf(data);
  const { title, desc, tone, box, Icon } = stageInfo[stage];
  const event = data.event;

  const rows: Array<[string, string]> = [
    ["Kode Booking", data.kode_tiket],
    ["Nama Pemesan", data.nama_pembeli ?? "-"],
    ["Tipe Tiket", data.kategori?.nama_kelas ?? "-"],
    ["Jumlah Tiket", `${data.jumlah} Tiket`],
    [
      "Tanggal Pemesanan",
      data.dibuat_pada ? `${formatTanggal(data.dibuat_pada)}, ${formatJam(data.dibuat_pada)}` : "-",
    ],
  ];

  return (
    <section aria-label="Hasil pembelian" className="mt-8 border-t border-[#E5E7EB] pt-8">
      {/* ===== Status pembayaran ===== */}
      <div className={`flex items-start gap-4 rounded-2xl border p-4 ${box}`}>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white ${tone}`}
        >
          <Icon size={24} />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-[#1F2937]">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">{desc}</p>
        </div>
      </div>

      {/* ===== Event ===== */}
      {event && (
        <div className="mt-6">
          <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#0F766E]">
            Konser
          </span>
          <h3 className="mt-2 text-xl font-extrabold text-[#1F2937]">{event.nama_event}</h3>
          <div className="mt-3 flex flex-col gap-1.5 text-sm text-[#6B7280]">
            <span className="flex items-center gap-2">
              <CalendarDays size={15} className="shrink-0 text-[#9CA3AF]" />
              {formatTanggal(event.tanggal)}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={15} className="shrink-0 text-[#9CA3AF]" />
              {formatJam(event.tanggal)}
            </span>
            <span className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0 text-[#9CA3AF]" />
              <span className="font-medium text-[#1F2937]">{event.lokasi}</span>
            </span>
          </div>
        </div>
      )}

      {/* ===== Rincian pesanan ===== */}
      <dl className="mt-6 flex flex-col gap-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <dt className="text-[#6B7280]">{label}</dt>
            <dd className="text-right font-semibold text-[#1F2937]">{value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3">
          <dt className="font-semibold text-[#1F2937]">Total Harga</dt>
          <dd className="text-lg font-extrabold text-[#F59E0B]">{formatRupiah(data.total_harga)}</dd>
        </div>
      </dl>

      {/* ===== Instruksi sesuai status ===== */}
      {(stage === "bayar" || stage === "verifikasi") && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#F59E0B]/20 bg-[#FFFBEB] px-4 py-3.5 text-xs leading-relaxed text-[#6B7280]">
          <Info size={16} className="mt-0.5 shrink-0 text-[#F59E0B]" />
          <p>
            {stage === "bayar" ? (
              <>
                Lakukan pembayaran sebesar{" "}
                <span className="font-semibold text-[#1F2937]">{formatRupiah(data.total_harga)}</span> sesuai
                instruksi penyelenggara, lalu{" "}
                <Link href="/auth/login" className="font-semibold text-[#0F766E] hover:underline">
                  masuk
                </Link>{" "}
                untuk mengunggah bukti pembayaran. QR tiket tidak akan tampil sebelum pembayaran dikonfirmasi.
              </>
            ) : (
              "Muat ulang halaman ini nanti untuk memeriksa status. QR tiket muncul otomatis setelah admin menyetujui pembayaran."
            )}
          </p>
        </div>
      )}

      {(stage === "ditolak" || stage === "kadaluarsa") && event && (
        <Link
          href={`/pembelian/tiket/${event.id}`}
          className="mt-6 flex h-[52px] items-center justify-center rounded-full bg-[#0F766E] text-sm font-bold text-white shadow-[0_10px_28px_rgba(15,118,110,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0D9488]"
        >
          Pesan Ulang
        </Link>
      )}

      {/* ===== Lunas: satu QR unik per tiket ===== */}
      {stage === "lunas" && (
        <div className="mt-8">
          <div className="flex items-center gap-3 text-xs font-semibold text-[#9CA3AF]">
            <span className="h-px flex-1 bg-[#E5E7EB]" />
            Tunjukkan QR ini saat masuk venue
            <span className="h-px flex-1 bg-[#E5E7EB]" />
          </div>

          {data.tiket.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-[#E5E7EB] px-4 py-10 text-center text-sm text-[#6B7280]">
              Tiketmu sedang disiapkan. Muat ulang halaman ini beberapa saat lagi.
            </p>
          ) : (
            <ul className="mt-5 flex flex-col gap-4">
              {data.tiket.map((t) => {
                const st = statusTiket[t.status];
                return (
                  <li key={t.nomor_urut} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 font-bold text-[#1F2937]">
                        <Ticket size={16} className="text-[#0F766E]" />
                        Tiket {t.nomor_urut} dari {data.jumlah}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>

                    {t.status === "aktif" && t.qr_code ? (
                      <>
                        <div className="mt-3 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={t.qr_code}
                            alt={`QR tiket ${t.nomor_urut} dari ${data.jumlah}, kode booking ${data.kode_tiket}`}
                            className="h-60 w-60 max-w-full"
                          />
                        </div>
                        <a
                          href={t.qr_code}
                          download={`tiket-${data.kode_tiket}-${t.nomor_urut}.png`}
                          className="mt-3 flex items-center justify-center gap-2 rounded-full border border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#1F2937] transition-colors duration-300 hover:bg-[#FFFBF5]"
                        >
                          <Download size={16} />
                          Unduh QR Tiket {t.nomor_urut}
                        </a>
                      </>
                    ) : (
                      <p className="py-8 text-center text-sm text-[#6B7280]">
                        {t.status === "terpakai"
                          ? `Tiket ini sudah dipakai${
                              t.digunakan_pada
                                ? ` pada ${formatTanggal(t.digunakan_pada)}, ${formatJam(t.digunakan_pada)}`
                                : ""
                            }.`
                          : "Tiket ini sudah dibatalkan dan tidak dapat digunakan."}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}