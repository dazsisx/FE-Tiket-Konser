"use client";

import { useId } from "react";
import { formatRupiah, type KategoriTiket } from "@/utils/api";

/**
 * Denah arena per zona. Setiap zona dipetakan ke satu kategori tiket dari API
 * lewat kata kunci pada `nama_kelas` (lihat GROUPS). Klik zona = tambah 1 tiket.
 *
 * Kategori yang namanya tidak cocok dengan kata kunci apa pun mengisi zona yang
 * masih kosong (FALLBACK_ORDER). Kalau kategori lebih banyak dari zona, sisanya
 * muncul sebagai tombol "Kategori lain" di bawah denah.
 */

type Selection = { id: number; qty: number } | null;

type Props = {
  tiers: KategoriTiket[];
  selected: Selection;
  onSelect: (tier: KategoriTiket) => void;
  saleOpen?: boolean;
};

const sisaOf = (k: KategoriTiket) =>
  Math.max(0, k.sisa_kuota ?? k.kuota - k.terjual);

// ---------------------------------------------------------------------------
// Pemetaan nama kategori → grup zona. Urutan penting: kata kunci yang lebih
// spesifik ditaruh lebih dulu. SESUAIKAN dengan nama kategori di databasemu.
// ---------------------------------------------------------------------------
type Pattern = "dots" | "rows";

const GROUPS: {
  key: string;
  title: string; // dipakai kalau zona belum punya kategori
  match: string[];
  fill: string;
  text: string;
  pattern: Pattern;
}[] = [
  { key: "lounge",   title: "LOUNGE",    match: ["lounge", "platinum"],                          fill: "#8B5CF6", text: "#FFFFFF", pattern: "rows" },
  { key: "pit",      title: "FRONT PIT", match: ["pit", "vip", "diamond", "front"],              fill: "#E0475B", text: "#FFFFFF", pattern: "dots" },
  { key: "balkon",   title: "BALKON",    match: ["balkon", "balcony", "upper", "cat 2", "cat2"], fill: "#4F6FB5", text: "#FFFFFF", pattern: "rows" },
  { key: "sayap",    title: "TRIBUNE",   match: ["sayap", "wing", "tribune", "tribun", "cat 1", "cat1"], fill: "#F59E0B", text: "#3B2A00", pattern: "rows" },
  { key: "festival", title: "FESTIVAL",  match: ["festival", "general", "reguler", "regular", "umum", "standing"], fill: "#0F766E", text: "#FFFFFF", pattern: "dots" },
];

// Urutan zona yang diisi kategori "sisa" (nama tidak cocok kata kunci mana pun).
const FALLBACK_ORDER = ["festival", "pit", "sayap", "balkon", "lounge"];

type LabelDef = {
  type: "line2" | "stack";
  x: number;
  y: number;
  rot?: number;
  ns: number; // ukuran nama
  py: number; // posisi y baris harga
  ps: number; // ukuran harga
  sy?: number; // posisi y baris sisa (stack)
  ss?: number; // ukuran sisa (stack)
};

// Bentuk zona: path SVG di viewBox 900x650.
const ZONES: { id: string; group: string; d: string; badge: [number, number]; label: LabelDef }[] = [
  { id: "pit", group: "pit", d: "M300,104 L600,104 L640,270 L260,270 Z", badge: [582, 142],
    label: { type: "line2", x: 450, y: 248, ns: 20, py: 17, ps: 12 } },
  { id: "festival", group: "festival", d: "M258,278 L642,278 L678,430 L222,430 Z", badge: [622, 312],
    label: { type: "stack", x: 450, y: 338, ns: 36, py: 28, ps: 18, sy: 50, ss: 14 } },
  { id: "sayap-kiri", group: "sayap", d: "M286,120 L212,430 L102,430 L176,120 Z", badge: [221, 165],
    label: { type: "stack", x: 194, y: 290, rot: -76.6, ns: 24, py: 22, ps: 14, sy: 41, ss: 13 } },
  { id: "sayap-kanan", group: "sayap", d: "M614,120 L688,430 L798,430 L724,120 Z", badge: [679, 165],
    label: { type: "stack", x: 706, y: 290, rot: 76.6, ns: 24, py: 22, ps: 14, sy: 41, ss: 13 } },
  { id: "lounge", group: "lounge", d: "M222,438 L678,438 L689,484 L211,484 Z", badge: [650, 461],
    label: { type: "line2", x: 450, y: 457, ns: 18, py: 16, ps: 12 } },
  { id: "balkon", group: "balkon", d: "M130,514 Q450,556 770,514 L792,598 Q450,648 108,598 Z", badge: [700, 566],
    label: { type: "stack", x: 450, y: 572, ns: 24, py: 22, ps: 15, sy: 40, ss: 13 } },
];

const INK = "#1F2937";
const MUTED = "#6B7280";

function Gate({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g pointerEvents="none" aria-hidden="true">
      <rect x={x} y={y} width={88} height={20} rx={10} fill="#FFFFFF" stroke="#9CA3AF" strokeWidth={1.2} />
      <text x={x + 44} y={y + 14} textAnchor="middle" fontSize={11} fontWeight={600} letterSpacing={1.5} fill={MUTED}>
        {text}
      </text>
    </g>
  );
}

export default function VenueMap({ tiers, selected, onSelect, saleOpen = true }: Props) {
  const uid = useId().replace(/:/g, "");

  // 1) Tiap grup zona mengambil kategori pertama yang namanya cocok.
  const groupTier = new Map<string, KategoriTiket>();
  const leftovers: KategoriTiket[] = [];
  for (const t of tiers) {
    const name = t.nama_kelas.toLowerCase();
    const g = GROUPS.find((x) => x.match.some((m) => name.includes(m)));
    if (g && !groupTier.has(g.key)) groupTier.set(g.key, t);
    else leftovers.push(t);
  }
  // 2) Kategori yang tidak cocok kata kunci mengisi zona yang masih kosong,
  //    supaya semua kategori tetap bisa dipilih lewat denah.
  for (const t of leftovers) {
    const free = FALLBACK_ORDER.find((k) => !groupTier.has(k));
    if (free) groupTier.set(free, t);
  }
  const onMapIds = new Set(Array.from(groupTier.values()).map((t) => t.id));
  // Hanya terjadi kalau kategori lebih banyak dari jumlah zona.
  const offMap = tiers.filter((t) => !onMapIds.has(t.id));

  return (
    <div>
      <svg
        viewBox="0 0 900 650"
        className="block h-auto w-full"
        role="group"
        aria-label="Denah zona venue"
      >
        <defs>
          <pattern id={`${uid}-dots`} width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.4" fill="#fff" fillOpacity="0.25" />
            <circle cx="12" cy="12" r="1.4" fill="#fff" fillOpacity="0.25" />
          </pattern>
          <pattern id={`${uid}-rows`} width="20" height="12" patternUnits="userSpaceOnUse">
            <line x1="0" y1="11" x2="20" y2="11" stroke="#fff" strokeOpacity="0.22" strokeWidth="2" />
          </pattern>
          <pattern id={`${uid}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="9" stroke="#6B7280" strokeOpacity="0.45" strokeWidth="2.5" />
          </pattern>
        </defs>

        {/* Panggung */}
        <g aria-hidden="true" pointerEvents="none">
          <rect x={214} y={28} width={18} height={62} rx={2} fill={INK} opacity={0.9} />
          <rect x={668} y={28} width={18} height={62} rx={2} fill={INK} opacity={0.9} />
          <path d="M300,22 L600,22 L648,94 L252,94 Z" fill={INK} />
          <text x={450} y={60} textAnchor="middle" fontSize={24} fontWeight={700} letterSpacing={7} fill="#F9FAFB">
            PANGGUNG
          </text>
          <rect x={330} y={76} width={240} height={3} fill="#F9FAFB" opacity={0.5} />
        </g>

        {/* Zona */}
        {ZONES.map((zone) => {
          const grp = GROUPS.find((g) => g.key === zone.group)!;
          const tier = groupTier.get(zone.group);
          const sisa = tier ? sisaOf(tier) : 0;
          const available = saleOpen && !!tier && sisa > 0;
          const qty = tier && selected?.id === tier.id ? selected.qty : 0;
          const isSelected = qty > 0;

          const status = !tier ? "Tidak dijual" : sisa === 0 ? "Habis" : !saleOpen ? "Ditutup" : `Sisa ${sisa}`;
          const price = tier ? formatRupiah(tier.harga) : "";
          const name = (tier?.nama_kelas ?? grp.title).toUpperCase();
          const l = zone.label;
          const ns = Math.min(l.ns, (l.ns * 11) / Math.max(11, name.length));

          const fill = tier ? grp.fill : "#E5E7EB";
          const textColor = tier ? grp.text : MUTED;
          const sub = l.type === "line2" ? (price ? `${price} · ${status}` : status) : status;

          const activate = () => {
            if (tier && available) onSelect(tier);
          };

          return (
            <g
              key={zone.id}
              role="button"
              tabIndex={0}
              aria-disabled={!available}
              aria-pressed={isSelected}
              aria-label={`${name}${price ? `, ${price}` : ""}, ${status}${isSelected ? `, dipilih ${qty} tiket` : ""}`}
              className={`group outline-none ${available ? "cursor-pointer" : "cursor-not-allowed"}`}
              onClick={activate}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activate();
                }
              }}
            >
              <path
                d={zone.d}
                fill={fill}
                opacity={tier && !available ? 0.55 : 1}
                stroke={isSelected ? INK : "transparent"}
                strokeWidth={4}
                strokeLinejoin="round"
                className={`transition-[filter] duration-150 group-focus-visible:stroke-[#1F2937] group-focus-visible:[stroke-dasharray:7_5] ${
                  available ? "group-hover:brightness-110" : ""
                }`}
              />
              {tier && available && (
                <path d={zone.d} fill={`url(#${uid}-${grp.pattern})`} pointerEvents="none" />
              )}
              {!available && <path d={zone.d} fill={`url(#${uid}-hatch)`} pointerEvents="none" />}

              <g
                transform={`translate(${l.x} ${l.y})${l.rot ? ` rotate(${l.rot})` : ""}`}
                textAnchor="middle"
                fill={textColor}
                pointerEvents="none"
              >
                <text fontSize={ns} fontWeight={800} letterSpacing={1}>
                  {name}
                </text>
                {l.type === "line2" ? (
                  <text y={l.py} fontSize={l.ps} className="hidden sm:inline">
                    {sub}
                  </text>
                ) : (
                  <>
                    {price && (
                      <text y={l.py} fontSize={l.ps} className="hidden sm:inline">
                        {price}
                      </text>
                    )}
                    <text y={price ? l.sy : l.py} fontSize={l.ss} className="hidden sm:inline">
                      {sub}
                    </text>
                  </>
                )}
              </g>
            </g>
          );
        })}

        {/* Runway, FOH, pintu masuk */}
        <g aria-hidden="true" pointerEvents="none">
          <rect x={438} y={94} width={24} height={104} fill={INK} />
          <rect x={408} y={198} width={84} height={22} rx={3} fill={INK} />
          <rect x={410} y={394} width={80} height={28} rx={3} fill={INK} />
          <text x={450} y={413} textAnchor="middle" fontSize={15} fontWeight={700} letterSpacing={1.5} fill="#F9FAFB">
            FOH
          </text>
        </g>
        <Gate x={118} y={444} text="GATE A" />
        <Gate x={694} y={444} text="GATE B" />
        <Gate x={406} y={498} text="GATE C" />

        {/* Jumlah tiket yang dipilih */}
        {ZONES.map((zone) => {
          const tier = groupTier.get(zone.group);
          const qty = tier && selected?.id === tier.id ? selected.qty : 0;
          if (qty === 0) return null;
          return (
            <g key={`badge-${zone.id}`} transform={`translate(${zone.badge[0]} ${zone.badge[1]})`} pointerEvents="none" aria-hidden="true">
              <circle r={15} fill={INK} />
              <text y={6} textAnchor="middle" fontSize={16} fontWeight={700} fill="#FFFFFF">
                {qty}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legenda */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1 text-xs text-[#6B7280]">
        {GROUPS.filter((g) => groupTier.has(g.key)).map((g) => (
          <span key={g.key} className="inline-flex items-center gap-1.5">
            <i className="inline-block h-3 w-3" style={{ background: g.fill }} />
            {groupTier.get(g.key)!.nama_kelas}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 border-2 border-[#1F2937]" />
          Dipilih
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i
            className="inline-block h-3 w-3 border border-[#9CA3AF]"
            style={{ background: "repeating-linear-gradient(45deg,#9CA3AF 0 2px,transparent 2px 5px)" }}
          />
          Habis / tidak dijual
        </span>
      </div>

      <p className="mt-2 px-1 text-xs text-[#9CA3AF]">
        Klik zona untuk memilih kategori. Atur jumlah tiket di Detail Pemesanan.
      </p>

      {offMap.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs text-[#6B7280]">Kategori lain:</span>
          {offMap.map((t) => {
            const ok = saleOpen && sisaOf(t) > 0;
            const active = selected?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={!ok}
                onClick={() => onSelect(t)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                  active
                    ? "border-[#0F766E] bg-[#ECFDF5] text-[#0F766E]"
                    : "border-[#E5E7EB] bg-white text-[#1F2937] hover:border-[#0F766E]"
                }`}
              >
                {t.nama_kelas} · {formatRupiah(t.harga)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}