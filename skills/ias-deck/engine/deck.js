/* IAS Deck — runtime browser: tema, efek, navigasi, presenter, mode ekspor. Data dari window.IAS. */
(function () {
  const D = window.IAS, Q = new URLSearchParams(location.search);
  const root = document.documentElement, body = document.body;
  const slides = [...document.querySelectorAll('.slide')], N = slides.length;
  const MODE = Q.get('presenter') ? 'presenter' : Q.has('measure') ? 'measure' : Q.has('print') ? 'print' : Q.has('export') ? 'export' : 'live';
  const STATIC = MODE !== 'live' || Q.has('static');
  let cur = Math.min(N - 1, Math.max(0, (parseInt(Q.get('slide') || Q.get('export') || '1', 10) || 1) - 1));
  let theme = null, fxs = [], raf = 0;

  /* ---------- tema ---------- */
  const fontsLoaded = new Set();
  function loadFont(name) {
    if (!name || fontsLoaded.has(name) || !D.fonts[name]) return;
    fontsLoaded.add(name);
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@${D.fonts[name]}&display=swap`;
    document.head.appendChild(l);
  }
  function applyTheme(id) {
    const t = D.themes.find(x => x.id === id) || D.themes[0];
    theme = { ...t, accent: (D.brand && D.brand.accent) || t.accent };
    const v = { '--bg': theme.bg, '--f': theme.fg, '--m': theme.muted, '--a': theme.accent, '--a2': theme.accent2,
      '--fd': `"${theme.fd}"`, '--fb': `"${theme.fb}"`, '--fm': `"${theme.fm}"`, '--tw': theme.weight || 700,
      '--tu': theme.upper ? 'uppercase' : 'none', '--tt': theme.upper ? '.01em' : '-.015em', '--title-scale': theme.titleScale || (theme.upper ? .92 : 1) };
    Object.entries(v).forEach(([k, val]) => root.style.setProperty(k, val));
    Object.assign(root.dataset, { theme: theme.id, family: theme.family, card: theme.card, decor: theme.decor, mode: theme.mode });
    [theme.fd, theme.fb, theme.fm].forEach(loadFont);
    initFx();
  }

  /* ---------- efek latar ---------- */
  function initFx() {
    const c = { a: theme.accent, b: theme.accent2, f: theme.fg, light: theme.mode === 'light' };
    fxs = slides.map((s, i) => { const cv = s.querySelector('.fx'); return { cv, ctx: cv.getContext('2d'), fx: window.IAS_FX.make(theme.fx, 1920, 1080, c, 11 + i * 17) }; });
    if (STATIC) fxs.forEach((o, i) => drawFx(o, 3.2 + i * 0.7)); else loop();
  }
  function drawFx(o, t) { o.ctx.clearRect(0, 0, 1920, 1080); o.fx.draw(o.ctx, t); }
  function loop() {
    cancelAnimationFrame(raf);
    let last = 0; const t0 = performance.now();
    const tick = (now) => { raf = requestAnimationFrame(tick); if (now - last < 33) return; last = now; const o = fxs[cur]; if (o) drawFx(o, (now - t0) / 1000); };
    raf = requestAnimationFrame(tick);
  }

  /* ---------- navigasi ---------- */
  function fit() {
    if (MODE !== 'live' && MODE !== 'export') return;
    const st = document.querySelector('.stage');
    if (body.classList.contains('overview')) return layoutOverview();
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    st.style.transform = `scale(${k}) translate(-50%, -50%)`; st.style.transformOrigin = '0 0';
    st.style.left = '50%'; st.style.top = '50%';
    st.style.transform = `translate(-50%, -50%) scale(${k})`; st.style.transformOrigin = 'center';
  }
  function go(i, from) {
    cur = Math.max(0, Math.min(N - 1, i));
    slides.forEach((s, k) => s.classList.toggle('on', k === cur));
    if (STATIC) drawFx(fxs[cur], 3.2 + cur * 0.7);
    const bar = document.querySelector('.ui-bar'); if (bar) bar.style.width = `${((cur + 1) / N) * 100}%`;
    if (MODE === 'live') {
      history.replaceState(null, '', `?slide=${cur + 1}${Q.get('theme') ? '' : ''}&theme=${theme.id}`);
      if (from !== 'remote' && pres && !pres.closed) pres.postMessage({ ias: 'go', i: cur }, '*');
    }
  }
  let toastT;
  function toast(msg) { const el = document.querySelector('.ui-toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 1800); }
  function layoutOverview() {
    const cols = 5, w = (innerWidth - 60) / cols, k = w / 1920 * 0.94;
    slides.forEach((s, i) => { s.style.transform = `translate(${30 + (i % cols) * w}px, ${30 + Math.floor(i / cols) * (1080 * k + 24)}px) scale(${k})`; });
  }
  function toggleOverview() {
    const on = body.classList.toggle('overview');
    if (!on) slides.forEach(s => (s.style.transform = ''));
    fit();
  }
  function cycleTheme(dir) {
    const i = D.themes.findIndex(x => x.id === theme.id), t = D.themes[(i + dir + D.themes.length) % D.themes.length];
    applyTheme(t.id); go(cur); toast(`Tema: ${t.name} (${t.id}) · ${D.families[t.family].split(' — ')[0]}`);
  }

  /* ---------- presenter (jendela kedua, sinkron via postMessage) ---------- */
  let pres = null;
  function openPresenter() {
    pres = window.open(`${location.pathname}?presenter=1&theme=${theme.id}&slide=${cur + 1}`, 'ias-presenter', 'width=1280,height=800');
  }
  window.addEventListener('message', (e) => {
    const d = e.data || {}; if (!d.ias) return;
    if (d.ias === 'go') go(d.i, 'remote');
    if (d.ias === 'nav' && MODE === 'live') go(cur + d.d);
  });

  function presenterView() {
    const notes = slides.map(s => s.querySelector('.notes').textContent);
    const base = `${location.pathname}?static=1&theme=${theme.id}`;
    body.className = 'presenter';
    body.innerHTML = `<div><div class="lbl">Sekarang</div><iframe id="pc"></iframe></div>
      <div><div class="lbl">Berikutnya</div><iframe id="pn" class="nx"></iframe><div class="lbl" style="margin-top:18px">Waktu</div><div class="clk" id="tm">00:00</div><div class="ct2" id="pg"></div></div>
      <div class="nt" id="nt"></div>`;
    const t0 = Date.now(), pc = document.getElementById('pc'), pn = document.getElementById('pn');
    const show = (i) => { cur = i; pc.src = `${base}&slide=${i + 1}`; pn.src = `${base}&slide=${Math.min(N, i + 2)}`;
      document.getElementById('nt').textContent = notes[i] || '(tidak ada catatan pembicara)'; document.getElementById('pg').textContent = `Slide ${i + 1} / ${N}`; };
    show(cur);
    setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); document.getElementById('tm').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 500);
    const nav = (d) => { const i = Math.max(0, Math.min(N - 1, cur + d)); show(i); if (window.opener) window.opener.postMessage({ ias: 'go', i }, '*'); };
    addEventListener('keydown', (e) => { if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) nav(1); if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) nav(-1); });
    addEventListener('message', (e) => { if (e.data && e.data.ias === 'go') show(e.data.i); });
  }

  /* ---------- ekspor PPTX: ukur posisi & gaya setiap teks ---------- */
  function measure() {
    const out = slides.map((s) => {
      const R = s.getBoundingClientRect();
      const texts = [...s.querySelectorAll('[data-t]')].filter(el => el.offsetParent !== null && el.textContent.trim()).map((el) => {
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        const runs = []; const walk = (n) => n.childNodes.forEach((k) => {
          if (k.nodeType === 3) { const p = getComputedStyle(k.parentElement); let tx = k.textContent.replace(/\s+/g, ' ');
            if (p.textTransform === 'uppercase') tx = tx.toUpperCase();
            const outline = p.color === 'rgba(0, 0, 0, 0)' && parseFloat(p.webkitTextStrokeWidth) > 0; const col = outline ? p.webkitTextStrokeColor : p.color;
            if (tx) runs.push({ t: tx, c: col, o: outline, w: parseInt(p.fontWeight, 10), f: p.fontFamily.split(',')[0].replace(/["']/g, '').trim(), s: parseFloat(p.fontSize), i: p.fontStyle === 'italic' }); }
          else if (k.nodeName === 'BR') runs.push({ t: '\n' });
          else if (k.nodeType === 1 && !k.hasAttribute('data-t')) walk(k);
        }); walk(el);
        if (runs.length && runs[0].t) runs[0].t = runs[0].t.replace(/^ /, '');
        if (runs.length && runs[runs.length - 1].t) runs[runs.length - 1].t = runs[runs.length - 1].t.replace(/ $/, '');
        return { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height, align: cs.textAlign, lh: parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2, ls: parseFloat(cs.letterSpacing) || 0, pl: parseFloat(cs.paddingLeft) || 0, pt: parseFloat(cs.paddingTop) || 0, runs };
      });
      const charts = [...s.querySelectorAll('[data-chart]')].map((el) => { const r = el.querySelector('svg').getBoundingClientRect(); return { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height, k: +el.dataset.chart }; });
      const fr = s.querySelector('.frame'), over = [];
      if (fr.scrollHeight > fr.clientHeight + 4) over.push(`isi melebihi area (${fr.scrollHeight}px > ${fr.clientHeight}px)`);
      texts.forEach((t) => { if (t.y + t.h > 1050 || t.x + t.w > 1880 || t.x < 30) over.push(`teks keluar slide: "${t.runs.map((r) => r.t).join('').slice(0, 40)}"`); });
      [...s.querySelectorAll('[data-t]')].forEach((el) => { if (el.scrollWidth > el.clientWidth + 4 && getComputedStyle(el).overflow !== 'visible') over.push(`teks terpotong: "${el.textContent.slice(0, 40)}"`); });
      return { texts, charts, over, notes: s.querySelector('.notes').textContent };
    });
    const sc = document.createElement('script'); sc.type = 'application/json'; sc.id = 'ias-measure';
    sc.textContent = JSON.stringify({ theme, slides: out }); document.body.appendChild(sc);
  }

  /* ---------- start ---------- */
  applyTheme(Q.get('theme') || D.theme);
  if (MODE === 'presenter') return presenterView();
  body.classList.add(MODE);
  if (MODE === 'live' && !STATIC) body.classList.add('anim');
  if (Q.has('bg')) body.classList.add('bgonly');
  if (MODE === 'print' || MODE === 'measure') slides.forEach(s => s.classList.add('on'));
  else go(cur);
  fit(); addEventListener('resize', fit);
  if (MODE === 'measure') document.fonts.ready.then(() => setTimeout(measure, 300));
  if (MODE !== 'live') return;

  addEventListener('keydown', (e) => {
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') go(0); else if (k === 'End') go(N - 1);
    else if (k === 'f' || k === 'F') (document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen());
    else if (k === 'g' || k === 'G' || k === 'Escape') toggleOverview();
    else if (k === 't') cycleTheme(1); else if (k === 'T') cycleTheme(-1);
    else if (k === 'p' || k === 'P') openPresenter();
    else if (k === 'b' || k === 'B') body.classList.toggle('blackout');
    else if (k === '?') toast('→/← pindah · F layar penuh · G ikhtisar · T ganti tema · P presenter · B layar gelap');
  });
  slides.forEach((s, i) => s.addEventListener('click', () => { if (body.classList.contains('overview')) { toggleOverview(); go(i); } }));
  document.querySelector('.stage').addEventListener('click', (e) => { if (!body.classList.contains('overview') && e.clientX > innerWidth * 0.5) go(cur + 1); else if (!body.classList.contains('overview')) go(cur - 1); });
  setTimeout(() => toast('Tekan ? untuk bantuan · T untuk ganti tema'), 600);
})();
