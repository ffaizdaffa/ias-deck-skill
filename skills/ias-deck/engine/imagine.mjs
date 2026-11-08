// IAS Deck — lapisan VISUAL per slide lewat Codex CLI (GPT Image, login OAuth akun ChatGPT).
// Mode HYBRID: GPT Image membuat visual TANPA teks; engine menggambar judul, angka, grafik, ikon di atasnya (editable).
// Pakai: node render.mjs deck.json --hybrid            (semua slide diberi visual yang sesuai layout-nya)
//        node render.mjs deck.json --imagine           (hanya slide dengan "imagine" atau "imagine": true di akar deck)
//        [--slides 1,3,7] [--force]
// Hasil disimpan di <folder deck>/images/ dan path-nya dicatat ke "hero" (atau "visual") di file JSON → tidak dibuat ulang.
import fs from 'node:fs';
import path from 'node:path';
import { execFile, execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

// layout → cara visual dipakai: full (foto penuh dengan area teks), backdrop (latar redup di belakang data), panel (foto berbingkai di samping)
export const VISUAL_ROLE = {
  cover: 'full', closing: 'full', image: 'full', scene: 'full', section: 'panel', split: 'panel', statement: 'panel', quote: 'panel', agenda: 'panel', bullets: 'panel', infographic: 'illus',
  kpi: 'backdrop', number: 'backdrop', chart: 'backdrop', grid: 'backdrop', process: 'backdrop', timeline: 'backdrop', layers: 'backdrop', cycle: 'backdrop',
  compare: 'backdrop', beforeafter: 'backdrop', vsm: 'backdrop', table: 'backdrop', pillars: 'backdrop', showcase: 'backdrop',
};
const ROLE = {
  cover: 'presentation cover key visual; main subject in the right 60 percent, the left 40 percent calm empty bright space for a large title',
  closing: 'closing slide wide visual, optimistic; left half calm and empty for the closing words',
  image: 'full-bleed storytelling photo; keep the lower-left area calm for a caption',
  scene: 'immersive wide photoreal scene that tells the story of the slide; several calm open areas (sky, walls, floor) where floating glass data panels will be placed; top band calm for a title',
  panel: 'editorial photo with ONE strong subject centered so it can be cropped to a portrait or square panel; uncluttered background',
  backdrop: 'wide atmospheric BACKGROUND scene that will be shown softly faded behind charts and data cards: low contrast, calm, bright, subject toward the edges and corners, the large central area simple and uniform (floor, sky, wall); evokes the slide topic without competing with data',
  illus: 'clean premium 3D isometric INFOGRAPHIC ILLUSTRATION (not a photo) on a pure white background, soft shadows, glossy white and light materials with the accent color; depict each listed element as a distinct visual object connected by subtle flow arrows; centered, filling the frame',
};
const STYLE = 'Bright high-key, airy, optimistic premium technology look; predominantly white, pale grey and light sky tones with restrained accents in HEX; soft natural daylight or soft studio light; photoreal unless stated otherwise; Indonesian context and Southeast Asian people with natural faces and poses where people appear; the real-world setting must MATCH THE TOPIC of each slide — e.g. modern office, boardroom or workshop for strategy/people/business; data center, control room or developer space for IT/AI/digital; smart city, retail or services for digitalization; mining site, plantation, construction, logistics hub or field operations for those industries; government hall for policy; campus/training room for skills; factory only when the content is about manufacturing — never default to a factory. Anti-AI-slop: one clear focal point, realistic proportions and materials, no decorative glow or lens flare, no floating random icons, no fake UI, no purple gradients. Absolutely no text, letters, numbers, logos, emblems, watermarks or readable UI labels.';

const plain = (t) => String(t || '').replace(/\*\*|==/g, '').replace(/\n/g, ' ').trim();

function codexReady() {
  try { execFileSync('codex', ['--version'], { stdio: 'ignore' }); } catch { return 'Codex CLI belum terpasang. Pasang: npm i -g @openai/codex, lalu jalankan: codex login'; }
  const st = spawnSync('codex', ['login', 'status'], { encoding: 'utf8' }); // status ditulis ke stderr
  if (!/logged in/i.test(`${st.stdout || ''}${st.stderr || ''}`)) return 'Codex belum login. Jalankan: codex login (pilih Sign in with ChatGPT)';
  return '';
}

function run(jobs, dir, style, log) {
  const list = jobs.map((j) => `- ${j.name} : ${j.prompt}`).join('\n');
  const prompt = `Use your image generation tool to create the following images, one image per line, and save each one in the current directory under the given filename (16:9 landscape, highest quality). Shared style for EVERY image: ${style}\n${list}\nWhen all are saved, list the filenames.`;
  return new Promise((res) => {
    const child = execFile('codex', ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', dir, prompt], { cwd: dir, timeout: (jobs.length * 150 + 180) * 1000, maxBuffer: 64 << 20 }, (err, so, se) => {
      fs.writeFileSync(path.join(dir, `${log}.txt`), `${so || ''}\n${se || ''}`); if (err) console.warn(`⚠ Codex berhenti: ${err.message.split('\n')[0]}`); res(); });
    child.stdin.end(); // Codex menunggu stdin bila dibiarkan terbuka
  });
}

export async function imagine(file, deck, { only, force, hybrid } = {}) {
  const dir = path.dirname(path.resolve(file)), imgDir = path.join(dir, 'images'), base = path.basename(file, '.json');
  const pick = only ? new Set(String(only).split(',').map((n) => parseInt(n, 10) - 1)) : null;
  const TH = JSON.parse(fs.readFileSync(new URL('./themes.json', import.meta.url), 'utf8'));
  const theme = TH.themes.find((t) => t.id === deck.theme) || TH.themes[0];
  const topic = plain(deck.topic || deck.title);
  const all = hybrid || deck.hybrid;
  const legacy = ['cover', 'section', 'closing', 'split', 'image', 'infographic', 'scene'];
  const jobs = [];
  deck.slides.forEach((s, i) => {
    if (pick && !pick.has(i)) return;
    const manual = typeof s.imagine === 'string' && s.imagine.trim();
    const role = VISUAL_ROLE[s.layout];
    const auto = role && s.imagine !== false && !Array.isArray(s.collage) && (all || (deck.imagine && legacy.includes(s.layout)));
    if (!manual && !auto) return;
    if (!force && !manual && (s.hero || s.image || s.visual)) return;
    const key = createHash('sha1').update(`${s.layout}|${s.imagine || ''}|${s.title || ''}`).digest('hex').slice(0, 6);
    const name = `${base}-s${String(i + 1).padStart(2, '0')}-${key}.png`; // nama unik: slide bisa digeser tanpa menimpa gambar lain
    const done = `images/${name.replace(/\.png$/, '.jpg')}`;
    if (!force && (s.hero === done || s.visual === done) && fs.existsSync(path.join(dir, done))) return;
    const parts = (s.items || s.steps || s.layers || s.callouts || []).map((x) => plain(typeof x === 'string' ? x : [x.title || x.name || x.label, x.desc].filter(Boolean).join(': '))).filter(Boolean);
    const what = manual || `${plain(s.title || s.text)}${s.subtitle ? ' — ' + plain(s.subtitle) : ''}${parts.length ? `. Subject matter to depict (visually, no words): ${parts.join('; ')}` : ''}${s.notes ? `. Context: ${plain(s.notes).slice(0, 200)}` : ''} (presentation about: ${topic})`;
    const r = ROLE[s.layout] || ROLE[role] || ROLE.panel;
    jobs.push({ i, name, prompt: `${what}. Purpose: ${r}.`, slot: role === 'illus' ? 'visual' : 'hero' });
  });
  if (!jobs.length) { console.log('✔ Visual: semua slide sudah punya gambar (pakai --force untuk membuat ulang).'); return deck; }
  const why = codexReady();
  if (why) { console.warn(`⚠ Visual AI dilewati — ${why}`); return deck; }
  fs.mkdirSync(imgDir, { recursive: true });
  const per = Math.max(1, Math.ceil(jobs.length / 4)), chunks = [];
  for (let k = 0; k < jobs.length; k += per) chunks.push(jobs.slice(k, k + per));
  console.log(`… Visual AI: ${jobs.length} gambar lewat GPT Image (Codex), ${chunks.length} sesi paralel`);
  const tick = setInterval(() => process.stdout.write(`\r  ${jobs.filter((j) => fs.existsSync(path.join(imgDir, j.name))).length}/${jobs.length} gambar selesai`), 5000);
  await Promise.all(chunks.map((c, k) => run(c, imgDir, STYLE.replace('HEX', theme.accent), `codex-log-${k}`)));
  clearInterval(tick); process.stdout.write('\n');
  let ok = 0;
  const next = { ...deck, slides: deck.slides.map((s) => ({ ...s })) };
  for (const j of jobs) {
    const png = path.join(imgDir, j.name);
    if (!fs.existsSync(png)) { console.warn(`⚠ Gambar slide ${j.i + 1} tidak terbentuk`); continue; }
    const jpg = png.replace(/\.png$/, '.jpg');
    try { execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', png, '--out', jpg], { stdio: 'ignore' }); fs.rmSync(png); } catch { /* bukan Mac: pakai PNG apa adanya */ }
    next.slides[j.i][j.slot] = `images/${path.basename(fs.existsSync(jpg) ? jpg : png)}`;
    ok++;
  }
  fs.writeFileSync(path.resolve(file), JSON.stringify(next, null, 1));
  console.log(`✔ Visual AI: ${ok}/${jobs.length} gambar → ${imgDir} (dicatat ke file deck, tidak dibuat ulang)`);
  return next;
}
