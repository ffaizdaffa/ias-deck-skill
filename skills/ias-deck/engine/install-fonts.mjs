#!/usr/bin/env node
// Pasang semua font tema IAS Deck (Google Fonts, lisensi OFL) ke komputer, supaya PPTX tampil persis di PowerPoint/Keynote.
// Mac: ~/Library/Fonts/IAS-Deck · Linux: ~/.local/share/fonts/IAS-Deck
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const TH = JSON.parse(fs.readFileSync(new URL('./themes.json', import.meta.url), 'utf8'));
const dir = path.join(os.homedir(), process.platform === 'darwin' ? 'Library/Fonts' : '.local/share/fonts', 'IAS-Deck');
fs.mkdirSync(dir, { recursive: true });
const UA = 'Mozilla/4.0'; // UA lama -> Google Fonts memberi file .ttf
let ok = 0, skip = 0, fail = 0;

for (const [family, weights] of Object.entries(TH.fonts)) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weights}`;
    const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
    const faces = [...css.matchAll(/font-weight:\s*(\d+);[\s\S]*?url\((https:[^)]+\.ttf)\)/g)];
    if (!faces.length) throw new Error('tidak ada file ttf');
    for (const [, w, src] of faces) {
      const file = path.join(dir, `${family.replace(/ /g, '')}-${w}.ttf`);
      if (fs.existsSync(file)) { skip++; continue; }
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      ok++;
    }
  } catch (e) { fail++; console.log(`  ⚠ ${family}: ${e.message}`); }
}
console.log(`✔ Font: ${ok} dipasang, ${skip} sudah ada, ${fail} gagal → ${dir}`);
