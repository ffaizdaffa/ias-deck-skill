// IAS Deck — buat gambar khusus per slide lewat Codex CLI (GPT Image, login OAuth akun ChatGPT).
// Pakai: node render.mjs deck.json --imagine [--slides 1,3,7] [--force]
// Slide yang dibuatkan gambar:
//   - slide dengan field "imagine": "deskripsi gambar"   (prompt manual)
//   - jika akar deck berisi "imagine": true → cover, section, closing, split, image yang belum punya "hero"/"image"
// Hasil disimpan di <folder deck>/images/ dan path-nya ditulis ke field "hero" di file JSON (supaya tidak dibuat ulang).
import fs from 'node:fs';
import path from 'node:path';
import { execFile, execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const AUTO = ['cover', 'section', 'closing', 'split', 'image', 'infographic', 'scene'];
const ROLE = {
  cover: 'presentation cover key visual; main subject in the right 60 percent, the left 40 percent is calm empty bright space for a large title',
  section: 'editorial photo for a section divider panel; strong single subject centered so it can be cropped to a near-square panel',
  split: 'supporting photo beside text; clear single subject centered, uncluttered background',
  closing: 'closing slide full-bleed visual, optimistic and wide; left half calm and empty for the closing words',
  image: 'full-bleed storytelling photo; keep the lower-left area calm for a caption',
  scene: 'immersive wide photoreal scene that tells the story of the slide; leave several calm open areas (sky, walls, floor) where floating glass data panels will be placed; top band calm for a title',
  infographic: 'clean premium 3D isometric INFOGRAPHIC ILLUSTRATION (not a photo) on a pure white background, soft shadows, glossy white and light-blue materials with the accent color; depict each listed element as a distinct, clearly separated visual object connected by subtle flow arrows or lines, like a NotebookLM / Apple keynote explainer graphic; centered composition filling the frame, generous but not empty; absolutely no words or numbers',
};
const STYLE = 'Bright high-key, airy, optimistic premium futuristic technology look; predominantly white, pale grey and light sky tones with clean accents in the color HEX; soft natural daylight or soft studio light; photoreal unless stated otherwise; Indonesian context and Southeast Asian people where people appear. Absolutely no text, letters, numbers, logos, emblems, watermarks or readable UI labels.';

const plain = (t) => String(t || '').replace(/\*\*|==/g, '').replace(/\n/g, ' ').trim();

function codexReady() {
  try { execFileSync('codex', ['--version'], { stdio: 'ignore' }); } catch { return 'Codex CLI belum terpasang. Pasang: npm i -g @openai/codex, lalu jalankan: codex login'; }
  const st = spawnSync('codex', ['login', 'status'], { encoding: 'utf8' }); // status ditulis ke stderr
  if (!/logged in/i.test(`${st.stdout || ''}${st.stderr || ''}`)) return 'Codex belum login. Jalankan: codex login (pilih Sign in with ChatGPT)';
  return '';
}

export async function imagine(file, deck, { only, force } = {}) {
  const dir = path.dirname(path.resolve(file)), imgDir = path.join(dir, 'images'), base = path.basename(file, '.json');
  const pick = only ? new Set(String(only).split(',').map((n) => parseInt(n, 10) - 1)) : null;
  const TH = JSON.parse(fs.readFileSync(new URL('./themes.json', import.meta.url), 'utf8'));
  const theme = TH.themes.find((t) => t.id === deck.theme) || TH.themes[0];
  const topic = plain(deck.topic || deck.title);
  const jobs = [];
  deck.slides.forEach((s, i) => {
    if (pick && !pick.has(i)) return;
    const manual = typeof s.imagine === 'string' && s.imagine.trim();
    const auto = deck.imagine && AUTO.includes(s.layout) && s.imagine !== false && !Array.isArray(s.collage);
    if (!manual && !auto) return;
    const key = createHash('sha1').update(`${s.layout}|${s.imagine || ''}|${s.title || ''}`).digest('hex').slice(0, 6);
    const name = `${base}-s${String(i + 1).padStart(2, '0')}-${key}.png`; // nama unik: slide bisa digeser tanpa menimpa gambar lain
    if (!force && (s.hero || s.visual) === `images/${name.replace(/\.png$/, '.jpg')}` && fs.existsSync(path.join(imgDir, name.replace(/\.png$/, '.jpg')))) return;
    if (!force && !manual && (s.hero || s.image || s.visual)) return;
    const parts = (s.items || s.steps || s.layers || []).map((x) => plain(typeof x === 'string' ? x : x.title || x.name)).filter(Boolean);
    const what = manual || `${plain(s.title)}${s.subtitle || s.text ? ' — ' + plain(s.subtitle || s.text) : ''}${parts.length ? `. Visual elements to show: ${parts.join('; ')}` : ''} (presentation about: ${topic})`;
    jobs.push({ i, name, prompt: `${what}. Purpose: ${ROLE[s.layout] || ROLE.split}.` });
  });
  if (!jobs.length) { console.log('✔ Imagine: tidak ada slide yang perlu dibuatkan gambar (isi "imagine" di slide atau "imagine": true di akar deck).'); return deck; }
  const why = codexReady();
  if (why) { console.warn(`⚠ Imagine dilewati — ${why}`); return deck; }
  fs.mkdirSync(imgDir, { recursive: true });
  console.log(`… Membuat ${jobs.length} gambar lewat Codex (GPT Image), ±1 menit per gambar. Log: images/codex-log.txt`);
  const list = jobs.map((j) => `- ${j.name} : ${j.prompt}`).join('\n');
  const prompt = `Use your image generation tool to create the following images, one image per line, and save each one in the current directory under the given filename (16:9 landscape, highest quality). Shared style for EVERY image: ${STYLE.replace('HEX', theme.accent)}\n${list}\nWhen all are saved, list the filenames and pixel sizes.`;
  await new Promise((res) => {
    const child = execFile('codex', ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', imgDir, prompt], { cwd: imgDir, timeout: (jobs.length * 120 + 180) * 1000, maxBuffer: 64 << 20 }, (err, so, se) => {
      fs.writeFileSync(path.join(imgDir, 'codex-log.txt'), `${so || ''}\n${se || ''}`);
      if (err) console.warn(`⚠ Codex berhenti: ${err.message.split('\n')[0]}`);
      res();
    });
    child.stdin.end(); // Codex menunggu stdin bila dibiarkan terbuka
    const tick = setInterval(() => { const n = jobs.filter((j) => fs.existsSync(path.join(imgDir, j.name))).length; process.stdout.write(`\r  ${n}/${jobs.length} gambar selesai`); }, 5000);
    child.on('exit', () => { clearInterval(tick); process.stdout.write('\n'); });
  });
  let ok = 0;
  const next = { ...deck, slides: deck.slides.map((s) => ({ ...s })) };
  for (const j of jobs) {
    const png = path.join(imgDir, j.name);
    if (!fs.existsSync(png)) { console.warn(`⚠ Gambar slide ${j.i + 1} tidak terbentuk`); continue; }
    const jpg = png.replace(/\.png$/, '.jpg');
    try { execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', png, '--out', jpg], { stdio: 'ignore' }); fs.rmSync(png); } catch { /* bukan Mac: pakai PNG apa adanya */ }
    next.slides[j.i][next.slides[j.i].layout === 'infographic' ? 'visual' : 'hero'] = `images/${path.basename(fs.existsSync(jpg) ? jpg : png)}`;
    ok++;
  }
  fs.writeFileSync(path.resolve(file), JSON.stringify(next, null, 1));
  console.log(`✔ Imagine: ${ok}/${jobs.length} gambar dibuat → ${imgDir} (path disimpan ke field "hero" di ${path.basename(file)})`);
  return next;
}
