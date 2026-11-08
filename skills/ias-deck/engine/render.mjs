#!/usr/bin/env node
// IAS Deck — renderer. deck.json -> deck.html (+ PDF, + PPTX editable).
// Pakai: node render.mjs <deck.json> [--out DIR] [--theme ID] [--pdf] [--pptx] [--all]
//        node render.mjs --gallery [--out DIR]      (galeri 40 tema)
//        node render.mjs --list                     (daftar tema & layout)
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderSlide, LAYOUTS, esc } from './layouts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TH = JSON.parse(fs.readFileSync(path.join(HERE, 'themes.json'), 'utf8'));
const HERO_DIR = path.join(HERE, '..', 'assets', 'heroes');
const HEROES = fs.existsSync(path.join(HERO_DIR, 'heroes.json')) ? JSON.parse(fs.readFileSync(path.join(HERO_DIR, 'heroes.json'), 'utf8')) : [];
// kata Indonesia -> tag gambar
const KW = { pabrik: 'factory', manufaktur: 'factory', produksi: 'factory', otomotif: 'car', mobil: 'car', baterai: 'battery', listrik: 'ev', robot: 'robot', robotik: 'robot', otomasi: 'robot',
  kecerdasan: 'ai', ai: 'ai', data: 'data', analitik: 'data', prediktif: 'predictive', perawatan: 'maintenance', mesin: 'machine', gudang: 'warehouse', logistik: 'logistics',
  siber: 'cyber', keamanan: 'cyber', cloud: 'cloud', jaringan: 'network', iot: 'sensor', sensor: 'sensor', kembar: 'twin', twin: 'twin', digital: 'digital',
  lean: 'lean', kaizen: 'kaizen', kanban: 'kanban', andon: 'andon', '5s': '5s', smed: 'smed', pdca: 'pdca', mutu: 'quality', kualitas: 'quality', inspeksi: 'quality',
  kementerian: 'gov', kemenperin: 'gov', pemerintah: 'gov', industri: 'industrial', kawasan: 'estate', pelabuhan: 'port', ekspor: 'port', indonesia: 'indonesia', nikel: 'nickel',
  umkm: 'umkm', vokasi: 'training', pelatihan: 'training', sdm: 'workers', tenaga: 'workers', pekerja: 'workers', tim: 'team', keselamatan: 'safety', k3: 'safety',
  semikonduktor: 'semicon', chip: 'chip', farmasi: 'pharma', makanan: 'food', tekstil: 'textile', baja: 'steel', kimia: 'chemical', energi: 'solar', surya: 'solar', hijau: 'solar',
  '4.0': 'industry', transformasi: 'digital', erp: 'erp', '5g': '5g', kota: 'city' };
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
const die = (m) => { console.error(`✖ ${m}`); process.exit(1); };

/* ---------- grafik SVG (pratinjau HTML; di PPTX diganti grafik asli) ---------- */
function svgChart(c = {}) {
  const W = 1000, H = 560, P = { l: 70, r: 20, t: 30, b: 60 }, labels = c.labels || [], series = c.series || [];
  const cols = ['var(--a)', 'var(--a2)', 'var(--m)', 'var(--f)'];
  if (c.type === 'donut') {
    const s = series[0] || { data: [] }, tot = s.data.reduce((a, b) => a + b, 0) || 1, cx = 300, cy = H / 2, R = 220, r = 140;
    let a0 = -Math.PI / 2;
    const arcs = s.data.map((v, i) => { const a1 = a0 + (v / tot) * Math.PI * 2, lg = a1 - a0 > Math.PI ? 1 : 0, p = (a, rr) => `${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr}`;
      const d = `M${p(a0, R)}A${R} ${R} 0 ${lg} 1 ${p(a1, R)}L${p(a1, r)}A${r} ${r} 0 ${lg} 0 ${p(a0, r)}Z`; a0 = a1;
      return `<path d="${d}" fill="${cols[i % 4]}" opacity="${1 - Math.floor(i / 4) * 0.35}" stroke="var(--bg)" stroke-width="4"/>`; }).join('');
    const leg = labels.map((l, i) => `<rect x="620" y="${130 + i * 56}" width="22" height="22" fill="${cols[i % 4]}"/><text x="656" y="${148 + i * 56}">${esc(l)}</text><text class="vl" x="980" y="${148 + i * 56}" text-anchor="end">${esc(s.data[i])}${esc(c.unit || '')}</text>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${arcs}${leg}</svg>`;
  }
  const all = series.flatMap((s) => s.data), max = Math.max(...all, 0) * 1.12 || 1, iw = W - P.l - P.r, ih = H - P.t - P.b;
  const y = (v) => P.t + ih - (v / max) * ih, n = labels.length || 1;
  let g = '';
  for (let k = 0; k <= 4; k++) { const v = (max / 4) * k; g += `<line class="gl" x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${P.l - 12}" y="${y(v) + 6}" text-anchor="end">${Math.round(v)}</text>`; }
  g += labels.map((l, i) => `<text x="${P.l + (iw / n) * (i + 0.5)}" y="${H - 22}" text-anchor="middle">${esc(l)}</text>`).join('');
  let marks = '';
  if (c.type === 'line') {
    series.forEach((s, si) => { const pts = s.data.map((v, i) => `${P.l + (iw / n) * (i + 0.5)},${y(v)}`);
      if (si === 0) marks += `<defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--a)" stop-opacity=".28"/><stop offset="1" stop-color="var(--a)" stop-opacity="0"/></linearGradient></defs><path d="M${pts[0].split(',')[0]},${P.t + ih} L${pts.join(' L')} L${pts[pts.length - 1].split(',')[0]},${P.t + ih}Z" fill="url(#ar)"/>`;
      marks += `<polyline class="ln" points="${pts.join(' ')}" fill="none" stroke="${cols[si % 4]}" stroke-width="5" stroke-linejoin="round"/>` + s.data.map((v, i) => `<circle cx="${P.l + (iw / n) * (i + 0.5)}" cy="${y(v)}" r="7" fill="var(--bg)" stroke="${cols[si % 4]}" stroke-width="3"/>`).join('');
      const last = s.data.length - 1; marks += `<text class="vl" x="${P.l + (iw / n) * (last + 0.5)}" y="${y(s.data[last]) - 18}" text-anchor="middle">${esc(s.data[last])}${esc(c.unit || '')}</text>`; });
  } else {
    const bw = (iw / n) * 0.7 / series.length;
    series.forEach((s, si) => s.data.forEach((v, i) => { const x = P.l + (iw / n) * i + (iw / n) * 0.15 + si * bw;
      if (!marks.includes('id="bg${si}"')) marks += `<defs><linearGradient id="bg${si}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cols[si % 4]}"/><stop offset="1" stop-color="${cols[si % 4]}" stop-opacity=".25"/></linearGradient></defs>`;
      marks += `<rect x="${x}" y="${y(v)}" width="${bw - 6}" height="${P.t + ih - y(v)}" rx="4" fill="url(#bg${si})"/><rect x="${x}" y="${y(v)}" width="${bw - 6}" height="4" fill="${cols[si % 4]}" class="ln"/>`;
      if (series.length === 1) marks += `<text class="vl" x="${x + (bw - 6) / 2}" y="${y(v) - 12}" text-anchor="middle">${esc(v)}${esc(c.unit || '')}</text>`; }));
  }
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet"><line class="ax" x1="${P.l}" x2="${W - P.r}" y1="${P.t + ih}" y2="${P.t + ih}"/>${g}${marks}</svg>`;
}

/* ---------- validasi ringan ---------- */
function validate(deck, file) {
  if (!deck || !Array.isArray(deck.slides) || !deck.slides.length) die(`${file}: butuh "slides" (array, minimal 1).`);
  if (deck.theme && !TH.themes.some((t) => t.id === deck.theme)) die(`Tema "${deck.theme}" tidak ada. Jalankan: node render.mjs --list`);
  deck.slides.forEach((s, i) => { if (!LAYOUTS.includes(s.layout)) die(`Slide ${i + 1}: layout "${s.layout}" tidak dikenal. Pilihan: ${LAYOUTS.join(', ')}`); });
  deck.slides.forEach((s, i) => {
    const max = ['cover', 'closing', 'section'].includes(s.layout) ? 45 : 60, t = String(s.title || '').replace(/\*\*/g, '');
    if (t.length > max) console.warn(`⚠ Slide ${i + 1}: judul ${t.length} karakter (saran ≤ ${max}) — persingkat agar tidak 2–3 baris.`);
  });
}

/* ---------- bangun HTML ---------- */
function heroSrc(id, baseDir) {
  if (!id) return '';
  const h = HEROES.find((x) => x.id === id);
  const f = h ? path.join(HERO_DIR, h.file) : path.resolve(baseDir, id);
  if (/^(https?:|data:)/.test(id)) return id;
  if (!fs.existsSync(f)) { console.warn(`⚠ gambar hero tidak ditemukan: ${id}`); return ''; }
  const ext = path.extname(f).toLowerCase();
  return `data:image/${ext === '.png' ? 'png' : ext === '.webp' ? 'webp' : 'jpeg'};base64,${fs.readFileSync(f).toString('base64')}`;
}
function pickHero(deck, s, i, baseDir, used) {
  if (s.hero === false || deck.autoHero === false) return '';
  if (typeof s.hero === 'string') { used.add(s.hero); return heroSrc(s.hero, baseDir); }
  if (s.layout === 'image') return s.image ? heroSrc(s.image, baseDir) : '';
  if (!['cover', 'section', 'closing'].includes(s.layout) || !HEROES.length) return '';
  const pref = (deck.heroes || []).find((id) => !used.has(id));
  if (pref) { used.add(pref); return heroSrc(pref, baseDir); }
  const words = `${deck.title || ''} ${deck.topic || ''} ${s.title || ''} ${s.kicker || ''} ${s.subtitle || ''}`.toLowerCase().replace(/\*\*/g, '').split(/[^a-z0-9.]+/);
  const tags = new Set(words.flatMap((w) => [w, KW[w]]).filter(Boolean));
  const catBonus = { cover: { mfg: 2, rob: 2, ai: 1, id: 1 }, section: { mfg: 1, lean: 1, abs: 1, it: 1, ai: 1, rob: 1 }, closing: { id: 2, abs: 2 } }[s.layout] || {};
  const fam = (TH.themes.find((t) => t.id === deck.theme) || {}).family;
  const famBonus = { hud: { ai: 2.5, rob: 2.5, it: 1 }, blueprint: { mfg: 2.5, abs: 1.5 }, twin: { mfg: 2, abs: 2, ai: 1.5 }, factory: { mfg: 2.5, lean: 2.5, rob: 1 }, terminal: { it: 3, ai: 2 }, clean: { id: 2.5, abs: 2.5 } }[fam] || {};
  let seed = [...`${deck.title}${i}`].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const ranked = HEROES.filter((h) => !used.has(h.id)).map((h) => { seed = (seed * 1664525 + 1013904223) >>> 0;
    return { h, sc: h.tags.filter((t) => tags.has(t)).length * 2 + (catBonus[h.cat] || 0) + (famBonus[h.cat] || 0) + (seed / 4294967296) * 2 }; }).sort((a, b) => b.sc - a.sc);
  if (!ranked.length) return '';
  used.add(ranked[0].h.id); return heroSrc(ranked[0].h.id, baseDir);
}

function buildHtml(deck, baseDir, themeId) {
  const charts = [], used = new Set();
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif' };
  const ctx = {
    deck, code: deck.code || (deck.title || 'DECK').replace(/[^A-Za-z0-9]+/g, '-').slice(0, 18).toUpperCase(),
    chart: (c) => (charts.push(c), charts.length - 1), svgChart,
    clock: new Date().toTimeString().slice(0, 8), date: new Date().toISOString().slice(0, 10), tint: '',
    hero: (id) => heroSrc(id, baseDir),
    heroFor: (s, i) => pickHero(deck, s, i, baseDir, used),
    asset: (p) => {
      if (/^(https?:|data:)/.test(p)) return p;
      const f = path.resolve(baseDir, p);
      if (!fs.existsSync(f)) { console.warn(`⚠ gambar tidak ditemukan: ${p}`); return ''; }
      return `data:${mime[path.extname(f).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(f).toString('base64')}`;
    },
  };
  const theme = TH.themes.find((t) => t.id === (themeId || deck.theme)) || TH.themes[0];
  const html = deck.slides.map((s, i) => renderSlide(s, i, deck.slides.length, ctx)).join('\n');
  const data = { themes: TH.themes, families: TH.families, fonts: TH.fonts, theme: theme.id, brand: deck.brand || {}, charts };
  const fontLinks = [theme.fd, theme.fb, theme.fm].filter((f, i, a) => a.indexOf(f) === i && TH.fonts[f])
    .map((f) => `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${f.replace(/ /g, '+')}:wght@${TH.fonts[f]}&display=swap">`).join('');
  const read = (f) => fs.readFileSync(path.join(HERE, f), 'utf8');
  return { charts, theme, html: `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(deck.title || 'IAS Deck')}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>${fontLinks}
<style>${read('deck.css')}</style></head><body><div class="stage">${html}</div><div class="ui-bar"></div><div class="ui-toast"></div>
<script>window.IAS=${JSON.stringify(data).replace(/</g, '\\u003c')};</script><script>${read('fx.js')}</script><script>${read('deck.js')}</script></body></html>` };
}

/* ---------- Chrome headless ---------- */
function chromePath() {
  const c = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const f = c.find((p) => p && fs.existsSync(p));
  if (!f) die('Chrome tidak ditemukan. Pasang Google Chrome atau set env CHROME=/path/ke/chrome');
  return f;
}
const chrome = (extra, url) => new Promise((res, rej) => execFile(chromePath(), ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--force-device-scale-factor=1', '--window-size=1920,1080', '--virtual-time-budget=8000', '--run-all-compositor-stages-before-draw', ...extra, url], { maxBuffer: 64 << 20, timeout: 120000 }, (e, out) => (e ? rej(e) : res(out))));
async function pool(items, n, fn) { const q = [...items]; await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(q.shift()); })); }

async function toPdf(htmlFile, pdfFile) {
  await chrome([`--print-to-pdf=${pdfFile}`, '--no-pdf-header-footer'], pathToFileURL(htmlFile).href + '?print=1');
  console.log(`✔ PDF   ${pdfFile}`);
}

async function measureDeck(htmlFile) {
  const dom = await chrome(['--dump-dom'], pathToFileURL(htmlFile).href + '?measure=1');
  const m = dom.match(/<script type="application\/json" id="ias-measure">([\s\S]*?)<\/script>/);
  if (!m) die('Gagal mengukur layout (Chrome tidak menghasilkan data). Coba ulang, pastikan internet aktif untuk font.');
  const meas = JSON.parse(m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
  const bad = meas.slides.flatMap((s, i) => s.over.map((o) => `  slide ${i + 1}: ${o}`));
  console.log(bad.length ? `⚠ Cek overflow — ${bad.length} masalah:\n${bad.join('\n')}` : '✔ Cek   tidak ada teks meluber');
  return meas;
}

async function toPptx(htmlFile, outFile, deck, built, meas) {
  const work = path.join(path.dirname(outFile), '.build'); fs.mkdirSync(work, { recursive: true });
  const url = pathToFileURL(htmlFile).href;
  const n = deck.slides.length;
  await pool([...Array(n).keys()], 4, (i) => chrome([`--screenshot=${path.join(work, `bg-${i + 1}.png`)}`], `${url}?export=${i + 1}&bg=1`));
  meas.slides.forEach((s, i) => { s.bg = path.join(work, `bg-${i + 1}.png`); s.charts.forEach((c) => (c.spec = built.charts[c.k])); });
  const spec = path.join(work, 'export.json');
  fs.writeFileSync(spec, JSON.stringify({ title: deck.title || 'IAS Deck', ...meas }));
  await new Promise((res, rej) => execFile(process.env.PYTHON || 'python3', [path.join(HERE, 'export_pptx.py'), spec, outFile], (e, so, se) => (e ? rej(new Error(se || e.message)) : (process.stdout.write(so), res()))));
}

/* ---------- galeri tema ---------- */
function gallery(outDir) {
  const ex = path.join(HERE, '..', 'examples', 'gallery-sample.json');
  const deck = JSON.parse(fs.readFileSync(ex, 'utf8'));
  Object.keys(TH.families).forEach((f) => { const first = TH.themes.find((t) => t.family === f);
    const show = { hud: ['rob-humanoid', 'ai-chip'], blueprint: ['abs-blueprint-light', 'mfg-cnc'], twin: ['abs-isometric-city', 'mfg-digital-twin'], factory: ['mfg-car-line', 'lean-andon'], terminal: ['it-datacenter', 'it-noc'], clean: ['id-industrial-estate', 'abs-aurora'] }[f];
    fs.writeFileSync(path.join(outDir, `gallery-${f}.html`), buildHtml({ ...deck, theme: first.id, heroes: show }, path.dirname(ex)).html); });
  const cards = TH.themes.map((t) => `<figure data-f="${t.family}"><div class="sh"><iframe src="gallery-${t.family}.html?static=1&theme=${t.id}&slide=1"></iframe></div><div class="sh"><iframe src="gallery-${t.family}.html?static=1&theme=${t.id}&slide=2"></iframe></div>
<figcaption><b>${esc(t.name)}</b><code>${t.id}</code><span>${esc(t.fd)} · fx ${t.fx} · ${t.mode}</span><i style="background:${t.bg}"></i><i style="background:${t.accent}"></i><i style="background:${t.accent2}"></i></figcaption></figure>`).join('');
  const fam = Object.entries(TH.families).map(([k, v]) => `<button data-k="${k}">${esc(v.split(' — ')[0])}</button>`).join('');
  fs.writeFileSync(path.join(outDir, 'gallery.html'), `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>IAS Deck — Galeri 40 Tema</title>
<style>body{margin:0;background:#0b0c0f;color:#e9e9ea;font:15px/1.5 system-ui,sans-serif}header{padding:32px 40px 8px}h1{font-size:30px;margin:0}p{color:#9a9ca3;margin:6px 0 16px}
nav{display:flex;gap:8px;flex-wrap:wrap;padding:0 40px 20px}nav button{background:#1a1c21;color:#ddd;border:1px solid #2c2f36;border-radius:999px;padding:7px 14px;cursor:pointer}nav button.on{background:#e9e9ea;color:#000}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(560px,1fr));gap:28px;padding:0 40px 60px}figure{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sh{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:6px;background:#000}.sh iframe{position:absolute;left:0;top:0;width:1920px;height:1080px;border:0;transform-origin:0 0;pointer-events:none}
figcaption{grid-column:1/3;display:flex;align-items:center;gap:10px;flex-wrap:wrap}figcaption code{background:#1a1c21;padding:2px 8px;border-radius:4px;color:#9fe}figcaption span{color:#8a8d94;font-size:13px;flex:1}figcaption i{width:18px;height:18px;border-radius:50%;border:1px solid #333}</style></head>
<body><header><h1>IAS Deck · Galeri 40 Tema</h1><p>Sebut ID tema ke Claude/Codex, misalnya: "pakai tema <code>bp-classic</code>". Di deck yang sedang tampil, tekan <b>T</b> untuk mencoba tema lain.</p></header>
<nav><button class="on" data-k="">Semua</button>${fam}</nav><main>${cards}</main>
<script>const fit=()=>document.querySelectorAll('.sh').forEach(s=>s.firstElementChild.style.transform='scale('+s.clientWidth/1920+')');addEventListener('resize',fit);fit();
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('figure').forEach(f=>f.style.display=!b.dataset.k||f.dataset.f===b.dataset.k?'':'none');fit()});</script></body></html>`);
  console.log(`✔ Galeri ${path.join(outDir, 'gallery.html')}`);
}

/* ---------- main ---------- */
async function main() {
  if (flag('--list')) {
    Object.entries(TH.families).forEach(([k, v]) => { console.log(`\n■ ${v}`); TH.themes.filter((t) => t.family === k).forEach((t) => console.log(`  ${t.id.padEnd(18)} ${t.name.padEnd(20)} ${t.mode.padEnd(5)} fx:${t.fx}`)); });
    console.log(`\nLayout: ${LAYOUTS.filter((l) => l !== 'before-after').join(', ')}`);
    return;
  }
  const outDir = path.resolve(opt('--out') || 'out'); fs.mkdirSync(outDir, { recursive: true });
  if (flag('--gallery')) return gallery(outDir);
  const file = args.find((a) => a.endsWith('.json'));
  if (!file) die('Pakai: node render.mjs <deck.json> [--theme ID] [--pdf] [--pptx] [--all] [--out DIR]');
  let deck; try { deck = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { die(`${file}: JSON tidak valid — ${e.message}`); }
  validate(deck, file);
  const name = path.basename(file, '.json');
  const built = buildHtml(deck, path.dirname(path.resolve(file)), opt('--theme'));
  const htmlFile = path.join(outDir, `${name}.html`);
  fs.writeFileSync(htmlFile, built.html);
  console.log(`✔ HTML  ${htmlFile}  (tema ${built.theme.id}, ${deck.slides.length} slide)`);
  const wantPptx = flag('--pptx') || flag('--all');
  const meas = wantPptx || flag('--check') ? await measureDeck(htmlFile) : null;
  if (flag('--pdf') || flag('--all')) await toPdf(htmlFile, path.join(outDir, `${name}.pdf`));
  if (wantPptx) await toPptx(htmlFile, path.join(outDir, `${name}.pptx`), deck, built, meas);
}
main().catch((e) => die(e.message));
