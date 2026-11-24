"use client";

import { useId } from "react";
import { formatRupiah, type KategoriTiket } from "@/utils/api";
import type { RectDef, VenueLayout } from "@/utils/venueLayouts";

/**
 * Denah per venue. Bentuk denah (zona, panggung, gate) datang dari `layout`
 * (lihat utils/venueLayouts.ts), jadi tiap event bisa punya denah berbeda.
 *
 * Tiap zona dipetakan ke satu kategori tiket dari API lewat kata kunci pada
 * `nama_kelas` (lihat GROUPS). Kategori yang namanya tidak cocok mengisi zona
 * kosong sesuai `layout.fallbackOrder`. Kategori yang tidak kebagian zona
 * (atau yang grupnya tidak ada di layout ini) muncul sebagai tombol
 * "Kategori lain" di bawah denah, jadi tidak ada kategori yang hilang.
 */

type Selection = { id: number; qty: number } | null;

type Props = {
  layout: VenueLayout;
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

function Block({ r }: { r: RectDef }) {
  return (
    <g>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={r.rx} fill={r.fill ?? INK} opacity={r.opacity} />
      {r.label && (
        <text
          x={r.x + r.w / 2}
          y={r.y + r.label.dy}
          textAnchor="middle"
          fontSize={r.label.size}
          fontWeight={700}
          letterSpacing={r.label.spacing}
          fill="#F9FAFB"
        >
          {r.label.text}
        </text>
      )}
    </g>
  );
}

export default function VenueMap({ layout, tiers, selected, onSelect, saleOpen = true }: Props) {
  const uid = useId().replace(/:/g, "");

  // Grup zona yang benar-benar ada di layout ini
  const layoutGroups = new Set(layout.zones.map((z) => z.group));

  // 1) Tiap grup zona mengambil kategori pertama yang namanya cocok.
  const groupTier = new Map<string, KategoriTiket>();
  const leftovers: KategoriTiket[] = [];
  for (const t of tiers) {
    const name = t.nama_kelas.toLowerCase();
    const g = GROUPS.find((x) => x.match.some((m) => name.includes(m)));
    if (g && layoutGroups.has(g.key) && !groupTier.has(g.key)) groupTier.set(g.key, t);
    else leftovers.push(t);
  }
  // 2) Sisanya mengisi zona yang masih kosong di layout ini.
  for (const t of leftovers) {
    const free = layout.fallbackOrder.find((k) => layoutGroups.has(k) && !groupTier.has(k));
    if (free) groupTier.set(free, t);
  }
  const onMapIds = new Set(Array.from(groupTier.values()).map((t) => t.id));
  const offMap = tiers.filter((t) => !onMapIds.has(t.id));

  return (
    <div>
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="block h-auto w-full"
        role="group"
        aria-label={`Denah zona ${layout.name}`}
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
          <path d={layout.stage.d} fill={INK} />
          <text
            x={layout.stage.label.x}
            y={layout.stage.label.y}
            textAnchor="middle"
            fontSize={layout.stage.label.size}
            fontWeight={700}
            letterSpacing={layout.stage.label.spacing}
            fill="#F9FAFB"
          >
            PANGGUNG
          </text>
          {layout.stage.blocks?.map((r, i) => (
            <Block key={`stage-${i}`} r={r} />
          ))}
        </g>

        {/* Zona */}
        {layout.zones.map((zone) => {
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

        {/* Elemen di atas zona (runway, FOH) + pintu masuk */}
        <g aria-hidden="true" pointerEvents="none">
          {layout.blocks?.map((r, i) => (
            <Block key={`block-${i}`} r={r} />
          ))}
        </g>
        {layout.gates.map((g) => (
          <Gate key={g.text} x={g.x} y={g.y} text={g.text} />
        ))}

        {/* Jumlah tiket yang dipilih */}
        {layout.zones.map((zone) => {
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