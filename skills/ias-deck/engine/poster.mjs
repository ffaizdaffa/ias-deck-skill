// IAS Deck — MODE POSTER (gaya Genspark Creative / NotebookLM): setiap slide dirender UTUH oleh GPT Image lewat Codex,
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
      v = 'cinematic title slide: one powerful hero image of the topic filling the frame, the title huge and bold on the left over a soft bright gradient, subtitle smaller below, speaker line small at the bottom'; break;
    case 'section': add(s.number); add(s.title); add(s.subtitle);
      v = 'chapter divider: giant section number, bold chapter title, a striking image that sets the mood of this chapter'; break;
    case 'statement': case 'quote': add(s.text || s.title); add(s.author || s.source);
      v = 'one big bold statement as the centerpiece typography, key phrase highlighted in the accent color, supported by an atmospheric image'; break;
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
      v = 'closing slide: inspiring wide image, the closing words large and confident'; break;
    default: add(s.title); arr(s.points || s.items).slice(0, 4).forEach((x) => add(nm(x)));
      v = 'a visual-first slide: strong image or illustration with the title and a few short labeled callouts with icons';
  }
  if (s.imagine && typeof s.imagine === 'string') v += `. Scene/imagery: ${plain(s.imagine)}`;
  return { text: T.filter((t) => t !== '""'), visual: v };
}

export async function poster(file, deck, outDir, { only, force } = {}) {
  const name = path.basename(file, '.json'), dir = path.join(outDir, `${name}-poster`);
  fs.mkdirSync(dir, { recursive: true });
  const TH = JSON.parse(fs.readFileSync(new URL('./themes.json', import.meta.url), 'utf8'));
  const th = TH.themes.find((t) => t.id === deck.theme) || TH.themes[0];
  const pick = only ? new Set(String(only).split(',').map((n) => parseInt(n, 10) - 1)) : null;
  const STYLE = `ONE CONSISTENT DECK STYLE for every slide: 16:9 presentation slide, bright high-key premium futuristic technology look like a top keynote (Apple / Genspark / NotebookLM quality); white and pale sky-blue base, accent color ${th.accent}, secondary ${th.accent2}, dark text ${th.fg}; photoreal imagery mixed with clean 3D glass/isometric elements; bold modern geometric sans-serif typography with strong hierarchy (huge headline, short labels); generous but purposeful layout, no empty areas, no clutter; Indonesian industrial context, Southeast Asian people where people appear. Render ONLY the quoted texts, spelled EXACTLY as given (Indonesian), no other words, no fake text, no logos, no watermark, no slide numbers.`;
  const jobs = deck.slides.map((s, i) => ({ s, i })).filter(({ i }) => !pick || pick.has(i)).map(({ s, i }) => {
    const b = brief(s, deck), key = createHash('sha1').update(JSON.stringify([b, th.id])).digest('hex').slice(0, 6);
    return { i, file: `slide-${String(i + 1).padStart(2, '0')}-${key}.png`, b };
  }).filter((j) => force || !fs.existsSync(path.join(dir, j.file)));
  if (jobs.length) {
    const st = spawnSync('codex', ['login', 'status'], { encoding: 'utf8' });
    if (!/logged in/i.test(`${st.stdout || ''}${st.stderr || ''}`)) throw new Error('Mode poster butuh Codex yang sudah login: jalankan  codex login  (Sign in with ChatGPT)');
    const list = jobs.map((j) => `- ${j.file}\n  Layout & visual: ${j.b.visual}\n  Texts to render exactly: ${j.b.text.join(' | ') || '(none)'}`).join('\n');
    const prompt = `Use your image generation tool to create the following presentation slides, one image per item, saved in the current directory with the given filename (16:9 landscape, highest quality). Generate them in order and keep the visual style IDENTICAL across all of them so they look like one designed deck.\n${STYLE}\n${list}\nWhen all are saved, list the filenames.`;
    console.log(`… Mode poster: merender ${jobs.length} slide lewat GPT Image (Codex), ±1 menit per slide`);
    await new Promise((res) => {
      const child = execFile('codex', ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', dir, prompt], { cwd: dir, timeout: (jobs.length * 150 + 180) * 1000, maxBuffer: 64 << 20 }, (err, so, se) => {
        fs.writeFileSync(path.join(dir, 'codex-log.txt'), `${so || ''}\n${se || ''}`); if (err) console.warn(`⚠ Codex berhenti: ${err.message.split('\n')[0]}`); res(); });
      child.stdin.end();
      const tick = setInterval(() => process.stdout.write(`\r  ${jobs.filter((j) => fs.existsSync(path.join(dir, j.file))).length}/${jobs.length} slide selesai`), 5000);
      child.on('exit', () => { clearInterval(tick); process.stdout.write('\n'); });
    });
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
