// Jalankan: npm i -D idn-finlogos && node scripts/copy-payment-logos.mjs
// Menyalin logo pembayaran dari paket idn-finlogos ke public/payment/.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SRC = "node_modules/idn-finlogos/dist/icons";
const DEST = "public/payment";

// [nama file di paket, nama file di proyek]
const files = [
  ["qris", "qris"], ["bca", "bca"], ["mandiri", "mandiri"], ["bri", "bri"],
  ["bni", "bni"], ["btn", "btn"], ["bsi", "bsi"], ["permata", "permata"],
  ["visa", "visa"], ["mastercard", "mastercard"], ["shopee-pay", "shopeepay"],
  ["gopay", "gopay"], ["indodana", "indodana"], ["indomaret", "indomaret"],
  ["alfamart", "alfamart"],
];

if (!existsSync(SRC)) {
  console.error("Folder " + SRC + " tidak ada. Jalankan dulu: npm i -D idn-finlogos");
  process.exit(1);
}
mkdirSync(DEST, { recursive: true });
for (const [from, to] of files) {
  const src = SRC + "/" + from + ".svg";
  if (!existsSync(src)) { console.warn("Lewati (tidak ada): " + from); continue; }
  let svg = readFileSync(src, "utf8");
  // SVG dari paket tidak punya xmlns, sehingga gagal dirender lewat <img>.
  if (!/xmlns=/.test(svg)) svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  writeFileSync(DEST + "/" + to + ".svg", svg);
  console.log("OK  " + to + ".svg");
}