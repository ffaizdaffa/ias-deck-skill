#!/usr/bin/env node
// Uji tema: struktur lengkap, font terdaftar, efek ada, kontras WCAG. Keluar kode 1 kalau ada yang gagal.
import fs from 'node:fs';
const TH = JSON.parse(fs.readFileSync(new URL('./themes.json', import.meta.url), 'utf8'));
const fx = fs.readFileSync(new URL('./fx.js', import.meta.url), 'utf8');
const lum = (h) => { const n = parseInt(h.slice(1), 16); return [16, 8, 0].map((s) => ((n >> s) & 255) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0); };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const need = ['id', 'name', 'family', 'mode', 'bg', 'fg', 'muted', 'accent', 'accent2', 'fx', 'fd', 'fb', 'fm', 'card', 'decor'];
let fail = 0; const ids = new Set();
for (const t of TH.themes) {
  const err = [];
  need.forEach((k) => t[k] === undefined && err.push(`tanpa ${k}`));
  if (ids.has(t.id)) err.push('id ganda'); ids.add(t.id);
  if (!TH.families[t.family]) err.push(`keluarga ${t.family} tak dikenal`);
  [t.fd, t.fb, t.fm].forEach((f) => !TH.fonts[f] && err.push(`font ${f} tidak terdaftar`));
  if (!new RegExp(`\\b${t.fx}\\s*\\(`).test(fx) && t.fx !== 'none') err.push(`efek ${t.fx} tidak ada`);
  const c = { fg: cr(t.fg, t.bg), muted: cr(t.muted, t.bg), accent: cr(t.accent, t.bg) };
  if (c.fg < 7) err.push(`kontras teks ${c.fg.toFixed(2)} < 7`);
  if (c.muted < 4.5) err.push(`kontras teks sekunder ${c.muted.toFixed(2)} < 4.5`);
  if (c.accent < 3) err.push(`kontras aksen ${c.accent.toFixed(2)} < 3`);
  if (err.length) { fail++; console.log(`✖ ${t.id}: ${err.join('; ')}`); }
}
console.log(`${TH.themes.length} tema diperiksa · ${TH.themes.length - fail} lolos · ${fail} gagal`);
process.exit(fail ? 1 : 0);
