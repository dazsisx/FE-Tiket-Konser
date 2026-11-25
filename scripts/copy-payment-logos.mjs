import { copyFileSync, existsSync, mkdirSync } from "node:fs";

const SRC = "node_modules/idn-finlogos/dist/icons";
const DEST = "public/payment";

const files = [
  ["qris", "qris"], ["bca", "bca"], ["mandiri", "mandiri"], ["bri", "bri"],
  ["bni", "bni"], ["btn", "btn"], ["bsi", "bsi"], ["permata", "permata"],
  ["visa", "visa"], ["mastercard", "mastercard"], ["shopee-pay", "shopeepay"],
  ["gopay", "gopay"], ["indodana", "indodana"], ["indomaret", "indomaret"],
  ["alfamart", "alfamart"],
];

if (!existsSync(SRC)) {
  console.error("Folder " + SRC + " tidak ada.");
  process.exit(1);
}
mkdirSync(DEST, { recursive: true });
for (const [from, to] of files) {
  const src = SRC + "/" + from + ".svg";
  if (!existsSync(src)) { console.warn("Lewati (tidak ada): " + from); continue; }
  copyFileSync(src, DEST + "/" + to + ".svg");
  console.log("OK  " + to + ".svg");
}
