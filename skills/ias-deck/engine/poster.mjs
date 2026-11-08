// IAS Deck — MODE POSTER: setiap slide dirender UTUH oleh GPT Image lewat Codex,
// termasuk judul, angka, dan infografisnya. Hasil paling memukau, tetapi teks di dalam gambar TIDAK bisa diedit.
// Pakai: node render.mjs deck.json --poster [--slides 1,3] [--force]
// Keluaran: out/<nama>-poster/ (PNG per slide) + <nama>-poster.html (pemutar) + .pdf + .pptx (gambar per slide + catatan pembicara)
import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const plain = (t) => String(t ?? '').replace(/\*\*|==/g, '').replace(/\n/g, ' ').trim();
const q = (t) => `"${plain(t)}"`;
const arr = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const nm = (x) => (typeof x === 'string' ? x : x.title || x.name || x.label || '');

// Terjemahkan isi slide JSON menjadi arahan visual + teks persis yang harus tertulis.
function brief(s, deck) {
  const T = [], add = (t) => t && T.push(q(t));
  let v = '';
  switch (s.layout) {
    case 'cover': add(s.title); add(s.subtitle); add([deck.speaker?.name, deck.speaker?.role].filter(Boolean).join(' · ')); add(deck.event);
      v = 'cinematic title slide: one powerful hero image of the topic filling the frame, the title large and elegant on the left over a soft bright gradient, subtitle smaller below, speaker line small at the bottom'; break;
    case 'section': add(s.number); add(s.title); add(s.subtitle);
      v = 'chapter divider: giant section number, bold chapter title, a striking image that sets the mood of this chapter'; break;
    case 'statement': case 'quote': add(s.text || s.title); add(s.author || s.source);
      v = 'one large elegant statement as the centerpiece typography, key phrase highlighted in the accent color, supported by an atmospheric image'; break;
    case 'kpi': case 'number': add(s.title); (s.items || []).forEach((k) => add(`${plain(k.value)}${plain(k.unit)} ${plain(k.label)}`)); if (s.value) add(`${plain(s.value)}${plain(s.unit)}`);
      v = 'the key numbers shown HUGE inside floating frosted-glass panels integrated into a realistic scene of the topic (like holographic AR cards with icons), each number with its short label'; break;
    case 'chart': { const c = s.chart || {}; add(s.title); (c.labels || []).forEach((l, i) => add(`${plain(l)}: ${plain(((c.values || c.series?.[0]?.data || [])[i]))}${plain(c.unit)}`)); add(s.insightValue);
      v = `a clean, accurate ${c.type === 'line' ? 'line chart' : c.type === 'waterfall' ? 'waterfall bridge chart' : c.type === 'hbar' ? 'horizontal bar ranking chart' : 'bar chart'} rendered as a premium 3D/glass infographic with EXACT values and labels as listed, highlight the most important bar in the accent color, plus one short insight callout`; break; }
    case 'process': case 'timeline': case 'cycle': case 'layers': case 'grid': case 'pillars': case 'infographic': case 'vsm':
      add(s.title); arr(s.items || s.steps || s.layers).forEach((x, i) => add(`${x.when ? plain(x.when) + ' ' : ''}${x.tag && s.layout === 'grid' ? plain(x.tag) + ' ' : ''}${plain(nm(x))}`));
      v = `an explainer infographic: ${s.layout === 'cycle' ? 'a circular cycle with arrows' : s.layout === 'layers' ? 'stacked 3D layers from bottom to top' : s.layout === 'timeline' ? 'a horizontal roadmap path with milestones' : 'a left-to-right flow of 3D isometric stations connected by arrows'}, each element with an icon-like 3D object and its short label exactly as listed`; break;
    case 'compare': case 'beforeafter': { const a = s.left || s.before || {}, b = s.right || s.after || {}; add(s.title); add(a.title); add(a.metric); add(b.title); add(b.metric);
      v = 'split-screen comparison: left side muted/old way, right side bright/new way, each with its title and big metric, a clear arrow or VS between them'; break; }
    case 'scene': add(s.title); arr(s.callouts).forEach((c) => add(`${plain(c.value)} ${plain(c.label)}`));
      v = 'immersive photoreal scene with the numbers shown inside glowing frosted-glass AR panels placed in the scene, thin leader lines pointing to the relevant objects'; break;
    case 'closing': add(s.title); add(s.subtitle); arr(s.contact).forEach(add);
      v = 'closing slide: inspiring wide image, the closing words large and elegant'; break;
    default: add(s.title); arr(s.points || s.items).slice(0, 4).forEach((x) => add(nm(x)));
      v = 'a visual-first slide: strong image or illustration with the title and a few short labeled callouts with icons';
  }
  if (s.imagine && typeof s.imagine === 'string') v += `. Scene/imagery: ${plain(s.imagine)}`;
  // isi lengkap materi sebagai petunjuk visual (TIDAK ditulis sebagai teks) agar gambar spesifik terhadap materi
  const det = [];
  arr(s.items || s.steps || s.layers || s.points || s.callouts).forEach((x) => { if (typeof x !== 'string') { const d = [plain(nm(x)), plain(x.desc), arr(x.items).map(plain).join(', ')].filter(Boolean).join(' — '); if (d) det.push(d); } });
  [s.subtitle, s.text, s.insight, s.takeaway, (s.left || s.before || {}).points && `before/left: ${arr((s.left || s.before).points).map(plain).join('; ')}`, (s.right || s.after || {}).points && `after/right: ${arr((s.right || s.after).points).map(plain).join('; ')}`, s.notes && plain(s.notes).slice(0, 240)].filter(Boolean).forEach((x) => det.push(plain(x)));
  const COMP = { cover: 'photo-led hero', section: 'big-number + single striking photo', statement: 'typography-led with one supporting photo', quote: 'typography-led with one supporting photo',
    kpi: 'data cards integrated in a real scene', number: 'one giant number with a close-up detail photo', chart: 'chart-led on a clean background, small contextual photo strip at most',
    process: '3D isometric diagram', cycle: 'diagram on clean background', layers: '3D layered diagram', timeline: 'roadmap path illustration', grid: 'icon/object grid on clean background',
    pillars: 'icon row + photo strip', infographic: '3D isometric diagram', compare: 'split-screen photo comparison', beforeafter: 'split-screen photo comparison', scene: 'immersive photo with AR data callouts', closing: 'wide photo-led' };
  return { text: T.filter((t) => t !== '""'), visual: `${v}. Composition type: ${COMP[s.layout] || 'balanced photo + data'}`, detail: det.join(' | ') };
}

// Preset gaya poster — ditawarkan sebagai pilihan desain sebelum deck penuh dibuat.
export const STYLES = {
  glass: { name: 'Glass Tech', desc: 'Cerah putih-biru, foto pabrik realistis, panel kaca hologram berangka, ikon 3D',
    text: 'bright high-key premium futuristic technology look; white and pale sky-blue base; photoreal imagery of the real-world setting of the topic mixed with clean 3D glass/holographic panels and 3D icons; refined modern geometric sans-serif typography' },
  editorial: { name: 'Editorial Nasional', desc: 'Gaya poster institusi: navy & hijau, kolase foto bersudut/heksagon, judul tebal, deret ikon bulat',
    text: 'bold national-institution editorial poster look; white base with deep navy and fresh green accents; angled and hexagonal photo collage panels with thin white gaps; confident semibold headline typography with a colored highlight band behind the key phrase; row of round solid icons with short labels' },
  isometric: { name: 'Isometric 3D', desc: 'Ilustrasi dunia 3D isometrik yang bersih, pastel, minim foto',
    text: 'clean premium 3D isometric illustration world (not photos) on a soft white/pastel background; glossy toy-like miniature buildings, devices, data blocks and people matching the topic; soft shadows; friendly rounded modern sans-serif typography in medium weight' },
  cinematic: { name: 'Cinematic Sunrise', desc: 'Fotografi sinematik cahaya pagi keemasan, hangat & megah, teks putih tebal',
    text: 'cinematic photographic look with warm golden sunrise light and lens glow; wide dramatic scenes of the setting of the topic; deep navy translucent title band with elegant semibold white and gold typography; premium documentary feel' },
};
function styleText(key, th) {
  const st = STYLES[key] || STYLES.glass;
  return `ONE CONSISTENT DECK STYLE for every slide: 16:9 presentation slide; ${st.text}; accent color ${th.accent}, secondary ${th.accent2}, dark text ${th.fg}; TYPOGRAPHY: elegant and light — headlines in SEMIBOLD or MEDIUM weight (never black/heavy/ultra-bold, never chunky), clean geometric sans like Inter / SF Pro Display / Manrope, slightly open letter spacing; labels and captions in REGULAR weight; big numbers may be semibold; hierarchy through size and color, not thickness; purposeful layout with no empty areas and no clutter; RICH, SPECIFIC DETAIL: every slide must visualize its own subject matter concretely — show each listed element as a specific, recognizable object, machine, person action or data visual relevant to the topic (never generic stock imagery), with supporting micro-details (devices, documents, data overlays, arrows, people at work) in a realistic setting; Indonesian context, Southeast Asian people where people appear; the real-world setting must MATCH THE TOPIC of each slide — e.g. modern office, boardroom or workshop for strategy/people/business; data center, control room or developer space for IT/AI/digital; smart city, retail or services for digitalization; mining site, plantation, construction, logistics hub or field operations for those industries; government hall for policy; campus/training room for skills; factory only when the content is about manufacturing — never default to a factory. ANTI-AI-SLOP RULES (strict): one clear focal point per slide; realistic proportions, natural light and believable materials; real-looking people with natural faces and poses (no plastic skin, no identical clones, no everyone-smiling-at-camera); holograms/glow only where they explain data — never decorative glow on everything, no lens flares, no sparkles, no random floating icons, no glowing brains or circuits unless the content is about AI models; no fake dashboards or gibberish UI; no purple/pink sci-fi gradients; no cluttered collage; every visual element must mean something in the content; restraint and whitespace balance like a senior human designer. Render ONLY the quoted texts, spelled EXACTLY as given (Indonesian), no other words, no fake text, no logos, no watermark, no slide numbers.`;
}
function runCodex(jobs, dir, STYLE, log) {
  const list = jobs.map((j) => `- ${j.file}\n  Layout & visual: ${j.b.visual}\n  Texts to render exactly: ${j.b.text.join(' | ') || '(none)'}${j.b.detail ? `\n  Content to VISUALIZE in detail (do NOT write these words): ${j.b.detail}` : ''}`).join('\n');
  const prompt = `Use your image generation tool to create the following presentation slides, one image per item, saved in the current directory with the given filename (16:9 landscape, highest quality). Keep the visual style (palette, typography, lighting, rendering quality) IDENTICAL across all of them so they look like one designed deck, but MIX the composition types as specified so consecutive slides never look the same (photo-led, data-led, diagram, typography-led).\n${STYLE}\n${list}\nWhen all are saved, list the filenames.`;
  return new Promise((res) => {
    const child = execFile('codex', ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', dir, prompt], { cwd: dir, timeout: (jobs.length * 150 + 180) * 1000, maxBuffer: 64 << 20 }, (err, so, se) => {
      fs.writeFileSync(path.join(dir, `${log}.txt`), `${so || ''}\n${se || ''}`); if (err) console.warn(`⚠ Codex berhenti: ${err.message.split('\n')[0]}`); res(); });
    child.stdin.end();
  });
}
function codexOk() {
  const st = spawnSync('codex', ['login', 'status'], { encoding: 'utf8' });
  if (!/logged in/i.test(`${st.stdout || ''}${st.stderr || ''}`)) throw new Error('Mode poster butuh Codex yang sudah login: jalankan  codex login  (Sign in with ChatGPT)');
}

// OPSI DESAIN: sampul + 1 slide isi dalam beberapa gaya, untuk dipilih user sebelum deck penuh dibuat.
export async function posterOptions(file, deck, outDir, { styles } = {}) {
  codexOk();
  const name = path.basename(file, '.json'), base = path.join(outDir, `${name}-opsi`);
  const TH = JSON.parse(fs.readFileSync(new URL('./themes.json', import.meta.url), 'utf8'));
  const th = TH.themes.find((t) => t.id === deck.theme) || TH.themes[0];
  const keys = (styles ? String(styles).split(',') : ['glass', 'editorial', 'isometric']).filter((k) => STYLES[k]);
  const content = deck.slides.findIndex((s, i) => i > 0 && ['kpi', 'scene', 'process', 'infographic', 'pillars', 'chart', 'grid', 'number'].includes(s.layout));
  const idx = [0, content > 0 ? content : Math.min(1, deck.slides.length - 1)];
  console.log(`… Opsi desain: ${keys.length} gaya × ${idx.length} slide, paralel`);
  await Promise.all(keys.map((k) => { const dir = path.join(base, k); fs.mkdirSync(dir, { recursive: true });
    const jobs = idx.map((i) => ({ i, file: `opsi-${k}-${i + 1}.png`, b: brief(deck.slides[i], deck) })).filter((j) => !fs.existsSync(path.join(dir, j.file)));
    return jobs.length ? runCodex(jobs, dir, styleText(k, th), 'log') : null; }));
  const cards = keys.map((k, n) => `<section><h2>Gaya ${String.fromCharCode(65 + n)} — ${STYLES[k].name} <code>${k}</code></h2><p>${STYLES[k].desc}</p><div class="g">${idx.map((i) => `<img src="${name}-opsi/${k}/opsi-${k}-${i + 1}.png" alt="">`).join('')}</div></section>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><title>Pilih gaya desain — ${plain(deck.title)}</title><style>body{margin:0;padding:30px 40px;background:#f3f6fb;color:#0b1a33;font:16px system-ui}h1{margin:0 0 6px}section{background:#fff;border-radius:16px;padding:20px 24px;margin:22px 0;box-shadow:0 10px 30px -20px #1f5bff66}h2{margin:0 0 4px}code{font-size:13px;color:#1f5bff;background:#eef3ff;padding:2px 8px;border-radius:6px}p{color:#5a6785;margin:4px 0 14px}.g{display:grid;grid-template-columns:1fr 1fr;gap:14px}img{width:100%;border-radius:10px;display:block;background:#e8edf5;aspect-ratio:16/9;object-fit:cover}</style>
<h1>Pilih gaya desain</h1><p>Balas ke AI dengan huruf gaya yang dipilih, misalnya: <b>"Pakai Gaya B"</b>. Setelah itu seluruh slide dibuat dengan gaya tersebut.</p>${cards}`;
  const f = path.join(outDir, `${name}-opsi.html`); fs.writeFileSync(f, html);
  keys.forEach((k, n) => idx.forEach((i) => { if (!fs.existsSync(path.join(base, k, `opsi-${k}-${i + 1}.png`))) console.warn(`⚠ Opsi ${k} slide ${i + 1} tidak terbentuk`); }));
  console.log(`✔ Opsi desain ${f}\n  ${keys.map((k, n) => `Gaya ${String.fromCharCode(65 + n)} = ${STYLES[k].name} (posterStyle: "${k}")`).join('\n  ')}\n  Setelah dipilih: isi "posterStyle" di deck JSON lalu jalankan --poster.`);
  return f;
}

export async function poster(file, deck, outDir, { only, force } = {}) {
  const name = path.basename(file, '.json'), dir = path.join(outDir, `${name}-poster`);
  fs.mkdirSync(dir, { recursive: true });
  const TH = JSON.parse(fs.readFileSync(new URL('./themes.json', import.meta.url), 'utf8'));
  const th = TH.themes.find((t) => t.id === deck.theme) || TH.themes[0];
  const pick = only ? new Set(String(only).split(',').map((n) => parseInt(n, 10) - 1)) : null;
  const STYLE = styleText(deck.posterStyle || 'glass', th);
  const jobs = deck.slides.map((s, i) => ({ s, i })).filter(({ i }) => !pick || pick.has(i)).map(({ s, i }) => {
    const b = brief(s, deck), key = createHash('sha1').update(JSON.stringify([b, th.id, deck.posterStyle || 'glass'])).digest('hex').slice(0, 6);
    return { i, file: `slide-${String(i + 1).padStart(2, '0')}-${key}.png`, b };
  }).filter((j) => force || !fs.existsSync(path.join(dir, j.file)));
  if (jobs.length) codexOk();
  if (jobs.length) {
    // dipecah ke beberapa sesi Codex paralel (±3 slide per sesi, maks 4 sesi) supaya cepat
    const per = Math.max(1, Math.ceil(jobs.length / 4)), chunks = [];
    for (let k = 0; k < jobs.length; k += per) chunks.push(jobs.slice(k, k + per));
    console.log(`… Mode poster (${STYLES[deck.posterStyle || 'glass']?.name || 'Glass Tech'}): ${jobs.length} slide, ${chunks.length} sesi GPT Image paralel`);
    const tick = setInterval(() => process.stdout.write(`\r  ${jobs.filter((j) => fs.existsSync(path.join(dir, j.file))).length}/${jobs.length} slide selesai`), 5000);
    await Promise.all(chunks.map((c, k) => runCodex(c, dir, STYLE, `log-${k}`)));
    clearInterval(tick); process.stdout.write('\n');
  }
  // kumpulkan slide terbaru per nomor
  const files = deck.slides.map((s, i) => { const pre = `slide-${String(i + 1).padStart(2, '0')}-`; const f = fs.readdirSync(dir).filter((x) => x.startsWith(pre) && x.endsWith('.png')).map((x) => ({ x, t: fs.statSync(path.join(dir, x)).mtimeMs })).sort((a, b) => b.t - a.t)[0]; return f ? f.x : null; });
  const missing = files.map((f, i) => (f ? 0 : i + 1)).filter(Boolean);
  if (missing.length) console.warn(`⚠ Slide tanpa gambar poster: ${missing.join(', ')} (jalankan ulang --poster --slides ${missing.join(',')})`);
  const notes = deck.slides.map((s) => plain(s.notes));
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${plain(deck.title)} — Poster</title><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}img{position:absolute;inset:0;margin:auto;max-width:100%;max-height:100%;opacity:0;transition:opacity .5s}img.on{opacity:1}@media print{@page{size:1672px 941px;margin:0}html,body{height:auto;overflow:visible;background:#fff}img{position:static;opacity:1;width:1672px;height:941px;page-break-after:always;display:block}}</style></head><body>
${files.filter(Boolean).map((f, i) => `<img src="${name}-poster/${f}"${i ? '' : ' class="on"'} alt="">`).join('\n')}
<script>const S=[...document.images];let c=0;const go=i=>{c=Math.max(0,Math.min(S.length-1,i));S.forEach((s,k)=>s.classList.toggle('on',k===c))};addEventListener('keydown',e=>{if(['ArrowRight',' ','PageDown'].includes(e.key))go(c+1);if(['ArrowLeft','PageUp'].includes(e.key))go(c-1);if(e.key==='f')document.documentElement.requestFullscreen()});addEventListener('click',e=>go(c+(e.clientX>innerWidth/2?1:-1)));</script></body></html>`;
  const htmlFile = path.join(outDir, `${name}-poster.html`);
  fs.writeFileSync(htmlFile, html);
  const spec = path.join(dir, 'poster.json');
  fs.writeFileSync(spec, JSON.stringify({ title: plain(deck.title), slides: files.map((f, i) => (f ? { img: path.join(dir, f), notes: notes[i] } : null)).filter(Boolean) }));
  const py = spawnSync(process.env.PYTHON || 'python3', ['-c', `
import json,sys
from pptx import Presentation
from pptx.util import Emu
d=json.load(open(sys.argv[1])); p=Presentation(); p.slide_width,p.slide_height=Emu(12192000),Emu(6858000)
for s in d['slides']:
    sl=p.slides.add_slide(p.slide_layouts[6]); sl.shapes.add_picture(s['img'],0,0,p.slide_width,p.slide_height)
    if s['notes']: sl.notes_slide.notes_text_frame.text=s['notes']
p.core_properties.title=d['title']; p.save(sys.argv[2])`, spec, path.join(outDir, `${name}-poster.pptx`)], { encoding: 'utf8' });
  if (py.status !== 0) console.warn(`⚠ PPTX poster gagal: ${py.stderr}`);
  console.log(`✔ Poster ${htmlFile}  +  ${name}-poster.pptx  (${files.filter(Boolean).length} slide, gambar utuh — teks tidak bisa diedit)`);
  return htmlFile;
}
