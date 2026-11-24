/**
 * Preset denah venue. Tiap event memilih satu layout lewat `venue_layout`
 * (dari BE) atau, kalau kosong, ditebak dari nama lokasi (lihat resolveLayout).
 *
 * Semua koordinat dalam ruang viewBox `width x height` milik layout masing-masing.
 * Untuk menambah venue baru: salin satu preset, ubah path zona, lalu daftarkan
 * di LAYOUTS. Field `group` harus salah satu key di GROUPS (VenueMap.tsx):
 * lounge | pit | balkon | sayap | festival.
 */

export type LabelDef = {
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

export type ZoneDef = {
  id: string;
  group: string;
  d: string;
  badge: [number, number];
  label: LabelDef;
};

export type RectDef = {
  x: number;
  y: number;
  w: number;
  h: number;
  rx?: number;
  fill?: string;
  opacity?: number;
  label?: { text: string; size: number; spacing?: number; dy: number };
};

export type VenueLayout = {
  key: string;
  name: string;
  width: number;
  height: number;
  stage: {
    d: string;
    label: { x: number; y: number; size: number; spacing: number };
    blocks?: RectDef[];
  };
  /** Digambar DI ATAS zona (runway, FOH, dll). */
  blocks?: RectDef[];
  gates: { x: number; y: number; text: string }[];
  zones: ZoneDef[];
  /** Urutan zona yang diisi kategori yang namanya tidak cocok kata kunci. */
  fallbackOrder: string[];
};

/* ------------------------------------------------------------------ */
/* 1. ARENA — panggung dengan runway, pit depan, tribun sayap & balkon */
/* ------------------------------------------------------------------ */
const arena: VenueLayout = {
  key: "arena",
  name: "Arena",
  width: 900,
  height: 650,
  stage: {
    d: "M300,22 L600,22 L648,94 L252,94 Z",
    label: { x: 450, y: 60, size: 24, spacing: 7 },
    blocks: [
      { x: 214, y: 28, w: 18, h: 62, rx: 2, opacity: 0.9 },
      { x: 668, y: 28, w: 18, h: 62, rx: 2, opacity: 0.9 },
      { x: 330, y: 76, w: 240, h: 3, fill: "#F9FAFB", opacity: 0.5 },
    ],
  },
  blocks: [
    { x: 438, y: 94, w: 24, h: 104 },
    { x: 408, y: 198, w: 84, h: 22, rx: 3 },
    { x: 410, y: 394, w: 80, h: 28, rx: 3, label: { text: "FOH", size: 15, spacing: 1.5, dy: 19 } },
  ],
  gates: [
    { x: 118, y: 444, text: "GATE A" },
    { x: 694, y: 444, text: "GATE B" },
    { x: 406, y: 498, text: "GATE C" },
  ],
  zones: [
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
  ],
  fallbackOrder: ["festival", "pit", "sayap", "balkon", "lounge"],
};

/* ------------------------------------------------------------------ */
/* 2. STADION — lapangan luas, tribun mengelilingi                      */
/* ------------------------------------------------------------------ */
const stadium: VenueLayout = {
  key: "stadium",
  name: "Stadion",
  width: 900,
  height: 650,
  stage: {
    d: "M320,20 L580,20 L612,84 L288,84 Z",
    label: { x: 450, y: 58, size: 22, spacing: 6 },
    blocks: [
      { x: 232, y: 26, w: 16, h: 56, rx: 2, opacity: 0.9 },
      { x: 652, y: 26, w: 16, h: 56, rx: 2, opacity: 0.9 },
    ],
  },
  blocks: [
    { x: 410, y: 390, w: 80, h: 26, rx: 3, label: { text: "FOH", size: 14, spacing: 1.5, dy: 18 } },
  ],
  gates: [
    { x: 60, y: 452, text: "GATE A" },
    { x: 752, y: 452, text: "GATE B" },
    { x: 406, y: 610, text: "GATE C" },
  ],
  zones: [
    { id: "pit", group: "pit", d: "M290,94 L610,94 L630,186 L270,186 Z", badge: [598, 118],
      label: { type: "line2", x: 450, y: 138, ns: 20, py: 17, ps: 12 } },
    { id: "festival", group: "festival", d: "M198,194 L702,194 L702,420 L198,420 Z", badge: [676, 222],
      label: { type: "stack", x: 450, y: 292, ns: 40, py: 30, ps: 18, sy: 52, ss: 14 } },
    { id: "tribun-kiri", group: "sayap", d: "M52,100 L186,100 L186,420 L52,420 Z", badge: [168, 124],
      label: { type: "stack", x: 112, y: 260, rot: -90, ns: 24, py: 22, ps: 14, sy: 39, ss: 13 } },
    { id: "tribun-kanan", group: "sayap", d: "M714,100 L848,100 L848,420 L714,420 Z", badge: [732, 124],
      label: { type: "stack", x: 788, y: 260, rot: 90, ns: 24, py: 22, ps: 14, sy: 39, ss: 13 } },
    { id: "lounge", group: "lounge", d: "M198,430 L702,430 L702,490 L198,490 Z", badge: [682, 452],
      label: { type: "line2", x: 450, y: 455, ns: 18, py: 16, ps: 12 } },
    { id: "balkon", group: "balkon", d: "M52,500 L848,500 L848,598 L52,598 Z", badge: [820, 530],
      label: { type: "stack", x: 450, y: 546, ns: 26, py: 24, ps: 15, sy: 42, ss: 13 } },
  ],
  fallbackOrder: ["festival", "pit", "sayap", "balkon", "lounge"],
};

/* ------------------------------------------------------------------ */
/* 3. TEATER / GEDUNG PERTUNJUKAN — baris melengkung, box samping, balkon */
/* ------------------------------------------------------------------ */
const theater: VenueLayout = {
  key: "theater",
  name: "Teater",
  width: 900,
  height: 520,
  stage: {
    d: "M240,24 L660,24 L690,92 L210,92 Z",
    label: { x: 450, y: 66, size: 24, spacing: 7 },
  },
  gates: [
    { x: 106, y: 470, text: "PINTU A" },
    { x: 706, y: 470, text: "PINTU B" },
  ],
  zones: [
    { id: "orkestra", group: "pit", d: "M250,108 Q450,134 650,108 L672,190 Q450,218 228,190 Z", badge: [628, 128],
      label: { type: "line2", x: 450, y: 158, ns: 20, py: 18, ps: 12 } },
    { id: "tengah", group: "festival", d: "M224,200 Q450,228 676,200 L702,300 Q450,332 198,300 Z", badge: [672, 230],
      label: { type: "stack", x: 450, y: 250, ns: 28, py: 24, ps: 15, sy: 42, ss: 13 } },
    { id: "box-kiri", group: "sayap", d: "M120,110 L220,110 L190,300 L90,300 Z", badge: [196, 140],
      label: { type: "stack", x: 140, y: 205, rot: -81, ns: 22, py: 20, ps: 13, sy: 37, ss: 12 } },
    { id: "box-kanan", group: "sayap", d: "M780,110 L680,110 L710,300 L810,300 Z", badge: [704, 140],
      label: { type: "stack", x: 752, y: 205, rot: 81, ns: 22, py: 20, ps: 13, sy: 37, ss: 12 } },
    { id: "balkon", group: "balkon", d: "M110,330 Q450,372 790,330 L820,440 Q450,500 80,440 Z", badge: [740, 384],
      label: { type: "stack", x: 450, y: 405, ns: 26, py: 24, ps: 15, sy: 42, ss: 13 } },
  ],
  fallbackOrder: ["festival", "pit", "sayap", "balkon"],
};

/* ------------------------------------------------------------------ */
/* 4. CLUB / LIVE HOUSE — lantai standing, panggung kecil, bar VIP       */
/* ------------------------------------------------------------------ */
const club: VenueLayout = {
  key: "club",
  name: "Club / Live House",
  width: 900,
  height: 500,
  stage: {
    d: "M300,24 L600,24 L630,88 L270,88 Z",
    label: { x: 450, y: 62, size: 22, spacing: 6 },
  },
  blocks: [
    { x: 412, y: 340, w: 76, h: 24, rx: 3, label: { text: "FOH", size: 13, spacing: 1.5, dy: 16 } },
  ],
  gates: [
    { x: 86, y: 398, text: "PINTU A" },
    { x: 726, y: 398, text: "PINTU B" },
    { x: 406, y: 462, text: "PINTU C" },
  ],
  zones: [
    { id: "pit", group: "pit", d: "M290,98 L610,98 L632,176 L268,176 Z", badge: [594, 124],
      label: { type: "line2", x: 450, y: 136, ns: 18, py: 16, ps: 11 } },
    { id: "festival", group: "festival", d: "M262,184 L638,184 L668,380 L232,380 Z", badge: [624, 218],
      label: { type: "stack", x: 450, y: 268, ns: 34, py: 28, ps: 18, sy: 48, ss: 14 } },
    { id: "sayap-kiri", group: "sayap", d: "M126,104 L254,104 L222,380 L94,380 Z", badge: [232, 128],
      label: { type: "stack", x: 166, y: 242, rot: -83, ns: 22, py: 20, ps: 13, sy: 37, ss: 12 } },
    { id: "sayap-kanan", group: "sayap", d: "M774,104 L646,104 L678,380 L806,380 Z", badge: [668, 128],
      label: { type: "stack", x: 734, y: 242, rot: 83, ns: 22, py: 20, ps: 13, sy: 37, ss: 12 } },
    { id: "lounge", group: "lounge", d: "M232,392 L668,392 L690,452 L210,452 Z", badge: [655, 414],
      label: { type: "line2", x: 450, y: 418, ns: 18, py: 16, ps: 12 } },
  ],
  fallbackOrder: ["festival", "pit", "sayap", "lounge"],
};

/* ------------------------------------------------------------------ */

export const LAYOUTS: Record<string, VenueLayout> = {
  arena,
  stadium,
  theater,
  club,
};

/** Untuk dropdown di form admin: <option value={value}>{label}</option> */
export const LAYOUT_OPTIONS = Object.values(LAYOUTS).map((l) => ({
  value: l.key,
  label: l.name,
}));

// Tebakan dari nama lokasi, dipakai kalau BE belum mengisi venue_layout.
const GUESS: [string, string[]][] = [
  ["stadium", ["stadion", "stadium", "gelora", "gbk", "jakarta international", "jis"]],
  ["theater", ["teater", "theater", "theatre", "auditorium", "balai", "concert hall", "gedung kesenian"]],
  ["club", ["club", "klub", "cafe", "kafe", "pub", "live house", "livehouse", "rooftop", "lounge"]],
];

export function resolveLayout(
  event?: { venue_layout?: string | null; lokasi?: string | null } | null,
): VenueLayout {
  const key = event?.venue_layout?.trim().toLowerCase();
  if (key && LAYOUTS[key]) return LAYOUTS[key];

  const lokasi = (event?.lokasi ?? "").toLowerCase();
  for (const [layoutKey, words] of GUESS) {
    if (words.some((w) => lokasi.includes(w))) return LAYOUTS[layoutKey];
  }
  return LAYOUTS.arena;
}