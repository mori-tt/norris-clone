// プレースホルダーSVG画像を public/images/ に生成するスクリプト。
// 実際の写真に差し替える際は public/images/ 配下に同名で置き換えるか、
// content/*.json の image パスを変更してください。
//   node scripts/generate-placeholders.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const outDir = path.resolve("public/images");
mkdirSync(outDir, { recursive: true });

const palettes = [
  ["#e8d5c8", "#c9a18a"],
  ["#f0e4dc", "#d4b5a0"],
  ["#e5ddd4", "#bfa58f"],
  ["#f2e8e2", "#cfae97"],
  ["#ece2da", "#c8a893"],
  ["#efe5dd", "#c39d85"],
];

function svg([from, to], label, w = 1200, h = 800) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w * 0.78}" cy="${h * 0.3}" r="${h * 0.28}" fill="#ffffff" opacity="0.18"/>
  <circle cx="${w * 0.15}" cy="${h * 0.8}" r="${h * 0.38}" fill="#ffffff" opacity="0.12"/>
  <text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="${Math.round(w / 22)}" fill="#ffffff" opacity="0.85"
    letter-spacing="4">${label}</text>
</svg>`;
}

const targets = {
  "hero-1.svg": ["HERO IMAGE 1", 1600, 900],
  "hero-2.svg": ["HERO IMAGE 2", 1600, 900],
  "hero-3.svg": ["HERO IMAGE 3", 1600, 900],
  "about.svg": ["CLINIC", 1200, 800],
  "doctor.svg": ["DOCTOR", 800, 1000],
  "facility-1.svg": ["FACILITY 1", 1200, 800],
  "facility-2.svg": ["FACILITY 2", 1200, 800],
  "facility-3.svg": ["FACILITY 3", 1200, 800],
  "menu-1.svg": ["MENU 1", 1200, 800],
  "menu-2.svg": ["MENU 2", 1200, 800],
  "menu-3.svg": ["MENU 3", 1200, 800],
  "menu-4.svg": ["MENU 4", 1200, 800],
  "menu-5.svg": ["MENU 5", 1200, 800],
  "menu-6.svg": ["MENU 6", 1200, 800],
  "menu-7.svg": ["MENU 7", 1200, 800],
  "concern-1.svg": ["CONCERN 1", 1200, 800],
  "concern-2.svg": ["CONCERN 2", 1200, 800],
  "concern-3.svg": ["CONCERN 3", 1200, 800],
  "device-1.svg": ["DEVICE 1", 1200, 800],
  "device-2.svg": ["DEVICE 2", 1200, 800],
  "mens.svg": ["MENS", 1200, 800],
  "news-1.svg": ["NEWS 1", 1200, 800],
  "news-2.svg": ["NEWS 2", 1200, 800],
  "news-3.svg": ["NEWS 3", 1200, 800],
  "column-1.svg": ["COLUMN 1", 1200, 800],
  "column-2.svg": ["COLUMN 2", 1200, 800],
  "insta-1.svg": ["INSTA 1", 800, 800],
  "insta-2.svg": ["INSTA 2", 800, 800],
  "insta-3.svg": ["INSTA 3", 800, 800],
  "insta-4.svg": ["INSTA 4", 800, 800],
  "insta-5.svg": ["INSTA 5", 800, 800],
  "insta-6.svg": ["INSTA 6", 800, 800],
};

let i = 0;
for (const [file, [label, w, h]] of Object.entries(targets)) {
  writeFileSync(path.join(outDir, file), svg(palettes[i % palettes.length], label, w, h));
  i += 1;
}
console.log(`generated ${i} placeholder images in ${outDir}`);
