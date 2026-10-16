"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Scanner,
  setZXingModuleOverrides,
  type IDetectedBarcode,
  type IScannerError,
} from "@yudiel/react-qr-scanner";
import { CameraOff, CircleCheck, CircleX, LoaderCircle, ScanLine, TriangleAlert } from "lucide-react";
import { formatJam, formatTanggal, validateTicket, type HasilValidasiTiket } from "@/utils/api";

type Mode = "gunakan" | "cek";
type Phase = "idle" | "scanning" | "validating" | "result";
type Tone = "success" | "warning" | "danger";
type Outcome =
  | { kind: "hasil"; hasil: HasilValidasiTiket; mode: Mode }
  | { kind: "error"; message: string; sessionProblem: boolean };

/**
 * Library pemindai memuat decoder WASM dari CDN jsDelivr secara default.
 * Supaya tetap jalan tanpa internet, file-nya disajikan dari /public (lihat langkah instalasi).
 */
const WASM_URL = "/zxing_reader.wasm";
let wasmConfigured = false;
function configureWasmOnce() {
  if (wasmConfigured) return;
  wasmConfigured = true;
  setZXingModuleOverrides({
    locateFile: (path: string, prefix: string) => (path.endsWith(".wasm") ? WASM_URL : prefix + path),
  });
}

const HASIL_UI: Record<HasilValidasiTiket["hasil"], { title: string; tone: Tone }> = {
  valid: { title: "Tiket valid", tone: "success" },
  sudah_digunakan: { title: "Tiket sudah digunakan", tone: "warning" },
  bukan_hari_event: { title: "Bukan hari event", tone: "warning" },
  belum_lunas: { title: "Pesanan belum lunas", tone: "danger" },
  dibatalkan: { title: "Tiket dibatalkan", tone: "danger" },
  tidak_valid: { title: "QR tidak valid", tone: "danger" },
};

const TONE_STYLE: Record<Tone, { box: string; text: string; Icon: typeof CircleCheck }> = {
  success: { box: "border-[#A7F3D0] bg-[#ECFDF5]", text: "text-[#065F46]", Icon: CircleCheck },
  warning: { box: "border-[#FDE68A] bg-[#FFFBEB]", text: "text-[#92400E]", Icon: TriangleAlert },
  danger: { box: "border-[#FECACA] bg-[#FEF2F2]", text: "text-[#B91C1C]", Icon: CircleX },
};

function describeCameraError(error: IScannerError): string {
  switch (error.kind) {
    case "permission-denied":
      return "Izin kamera ditolak. Klik ikon kamera/gembok di address bar, izinkan kamera untuk situs ini, lalu tekan Mulai pindai lagi.";
    case "no-camera":
      return "Kamera tidak ditemukan di perangkat ini.";
    case "in-use":
      return "Kamera sedang dipakai aplikasi atau tab lain. Tutup yang lain lalu coba lagi.";
    case "insecure-context":
      return "Browser hanya mengizinkan kamera lewat HTTPS atau http://localhost.";
    case "unsupported":
      return "Browser ini tidak mendukung akses kamera. Coba Chrome, Edge, atau Firefox versi terbaru.";
    case "overconstrained":
      return "Kamera tidak cocok dengan pengaturan yang diminta. Coba perangkat atau kamera lain.";
    default:
      return `Pemindai gagal berjalan: ${error.message || "kesalahan tidak diketahui"}.`;
  }
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-[#6B7280]">{label}</dt>
      <dd className="text-right font-semibold text-[#1F2937]">{value}</dd>
    </div>
  );
}

export default function TicketScanner({ onLogout }: { onLogout: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<Mode>("gunakan");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // busyRef: kunci supaya satu QR tidak terkirim berulang selama validasi/hasil masih tampil.
  // runRef: penanda "giliran" agar respons lama diabaikan jika petugas sudah berhenti/lanjut.
  const busyRef = useRef(false);
  const runRef = useRef(0);
  const modeRef = useRef<Mode>("gunakan");
  const lastQrRef = useRef<string | null>(null);

  useEffect(() => {
    configureWasmOnce();
  }, []);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const submit = useCallback(async (qr: string, useMode: Mode) => {
    const run = ++runRef.current;
    busyRef.current = true;
    lastQrRef.current = qr;
    setOutcome(null);
    setPhase("validating");
    try {
      const hasil = await validateTicket(qr, useMode);
      if (run !== runRef.current) return;
      setOutcome({ kind: "hasil", hasil, mode: useMode });
    } catch (err) {
      if (run !== runRef.current) return;
      const message = err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.";
      // Pesan 401 dari BE selalu memuat kata "login" atau "Token".
      setOutcome({ kind: "error", message, sessionProblem: /login|token/i.test(message) });
    }
    setPhase("result");
  }, []);

  const handleScan = useCallback(
    (codes: IDetectedBarcode[]) => {
      if (busyRef.current) return;
      const qr = codes.map((c) => c.rawValue?.trim()).find(Boolean);
      if (!qr) return;
      void submit(qr, modeRef.current);
    },
    [submit]
  );

  const handleError = useCallback((error: IScannerError) => {
    if (error.kind === "aborted") return;
    runRef.current += 1;
    busyRef.current = false;
    setOutcome(null);
    setCameraError(describeCameraError(error));
    setPhase("idle");
  }, []);

  const start = () => {
    runRef.current += 1;
    busyRef.current = false;
    setCameraError(null);
    setOutcome(null);
    setPhase("scanning");
  };

  const stop = () => {
    runRef.current += 1;
    busyRef.current = false;
    setOutcome(null);
    setPhase("idle");
  };

  const scanNext = () => {
    runRef.current += 1;
    busyRef.current = false;
    setOutcome(null);
    setPhase("scanning");
  };

  const markUsed = () => {
    const qr = lastQrRef.current;
    if (qr) void submit(qr, "gunakan");
  };

  const cameraOn = phase !== "idle";

  return (
    <section className="mx-auto max-w-xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#1F2937]">Pindai Tiket</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          Arahkan kamera ke QR tiket. Status tiket ditentukan oleh server, bukan oleh hasil baca QR.
        </p>
      </div>

      <div className="flex rounded-xl border border-[#E5E7EB] bg-white p-1 text-sm font-semibold" role="group" aria-label="Mode pemindaian">
        {(
          [
            { value: "gunakan", label: "Tandai terpakai" },
            { value: "cek", label: "Cek saja" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={phase === "validating"}
            aria-pressed={mode === option.value}
            onClick={() => setMode(option.value)}
            className={`flex-1 rounded-lg px-3 py-2 transition-colors disabled:opacity-60 ${
              mode === option.value ? "bg-[#0F766E] text-white" : "text-[#6B7280] hover:bg-[#ECFDF5] hover:text-[#0F766E]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {cameraError && (
        <div role="alert" className="flex gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
          <CameraOff size={20} className="mt-0.5 shrink-0" />
          <p>{cameraError}</p>
        </div>
      )}

      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-[#1F2937]">
        {cameraOn ? (
          <Scanner
            onScan={handleScan}
            onError={handleError}
            formats={["qr_code"]}
            constraints={{ facingMode: "environment" }}
            paused={phase !== "scanning"}
            components={{ finder: true }}
            sound={false}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-white/80">
            <ScanLine size={44} />
            <p className="text-sm">Kamera belum aktif. Tekan “Mulai pindai” dan izinkan akses kamera di browser.</p>
          </div>
        )}
        {phase === "validating" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1F2937]/70 text-white" role="status">
            <LoaderCircle size={36} className="animate-spin" />
            <p className="text-sm font-semibold">Memeriksa tiket…</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {phase === "idle" ? (
          <button type="button" onClick={start} className="flex-1 rounded-xl bg-[#0F766E] px-4 py-3 text-sm font-bold text-white hover:bg-[#0B5E58]">
            Mulai pindai
          </button>
        ) : (
          <button type="button" onClick={stop} className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#1F2937] hover:bg-[#F3F4F6]">
            Hentikan pemindaian
          </button>
        )}
      </div>

      <div aria-live="polite">
        {phase === "result" && outcome && (
          <ResultCard outcome={outcome} onNext={scanNext} onMarkUsed={markUsed} onLogout={onLogout} />
        )}
      </div>
    </section>
  );
}

function ResultCard({
  outcome,
  onNext,
  onMarkUsed,
  onLogout,
}: {
  outcome: Outcome;
  onNext: () => void;
  onMarkUsed: () => void;
  onLogout: () => void;
}) {
  if (outcome.kind === "error") {
    const { box, text, Icon } = TONE_STYLE.danger;
    return (
      <div role="alert" className={`rounded-2xl border p-5 ${box}`}>
        <div className={`flex items-center gap-2 text-lg font-bold ${text}`}>
          <Icon size={22} /> {outcome.sessionProblem ? "Sesi login bermasalah" : "Validasi gagal"}
        </div>
        <p className="mt-2 text-sm text-[#1F2937]">{outcome.message}</p>
        <div className="mt-4 flex gap-3">
          {outcome.sessionProblem && (
            <button type="button" onClick={onLogout} className="flex-1 rounded-xl bg-[#DC2626] px-4 py-3 text-sm font-bold text-white">
              Login ulang
            </button>
          )}
          <button type="button" onClick={onNext} className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#1F2937]">
            Coba pindai lagi
          </button>
        </div>
      </div>
    );
  }

  const { hasil, mode } = outcome;
  // Valid hanya jika server menyatakan hasil "valid" DAN success true.
  const isValid = hasil.hasil === "valid" && hasil.success === true;
  // Hasil "valid" yang tidak disertai success:true, atau kode hasil yang tak dikenal, dianggap respons tidak sesuai.
  const known = hasil.hasil === "valid" && !isValid ? undefined : HASIL_UI[hasil.hasil];
  const ui = known ?? { title: "Respons tidak sesuai", tone: "danger" as Tone };
  const { box, text, Icon } = TONE_STYLE[ui.tone];
  const data = hasil.data;

  return (
    <div className={`rounded-2xl border p-5 ${box}`}>
      <div className={`flex items-center gap-2 text-xl font-bold ${text}`}>
        <Icon size={26} /> {ui.title}
      </div>
      <p className="mt-2 text-sm text-[#1F2937]">{hasil.message}</p>

      {data && (
        <dl className="mt-4 space-y-2 border-t border-black/10 pt-4">
          {data.event && <InfoRow label="Event" value={data.event.nama_event} />}
          {data.kategori && <InfoRow label="Kategori" value={data.kategori} />}
          <InfoRow label="Tiket" value={`${data.nomor_urut} dari ${data.dari}`} />
          {data.kode_booking && <InfoRow label="Kode booking" value={data.kode_booking} />}
          {data.nama_pembeli && <InfoRow label="Pembeli" value={data.nama_pembeli} />}
          <InfoRow label="Jenis pesanan" value={data.order_type === "offline" ? "Offline" : "Online"} />
          {data.event && <InfoRow label="Tanggal event" value={formatTanggal(data.event.tanggal)} />}
          {data.event && <InfoRow label="Lokasi" value={data.event.lokasi} />}
          {data.digunakan_pada && (
            <InfoRow label="Digunakan pada" value={`${formatTanggal(data.digunakan_pada)} • ${formatJam(data.digunakan_pada)}`} />
          )}
        </dl>
      )}

      {isValid && mode === "cek" && (
        <p className="mt-4 rounded-lg bg-white/70 p-3 text-xs text-[#065F46]">
          Mode “Cek saja”: tiket ini belum ditandai terpakai.
        </p>
      )}

      <div className="mt-4 flex gap-3">
        {isValid && mode === "cek" && (
          <button type="button" onClick={onMarkUsed} className="flex-1 rounded-xl bg-[#0F766E] px-4 py-3 text-sm font-bold text-white">
            Tandai terpakai
          </button>
        )}
        <button type="button" onClick={onNext} className="flex-1 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#1F2937]">
          Pindai tiket berikutnya
        </button>
      </div>
    </div>
  );
}