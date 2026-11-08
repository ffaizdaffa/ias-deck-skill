// IAS Deck — template layout. Setiap fungsi menerima (slide, ctx) dan mengembalikan HTML isi .frame.
// Aturan: setiap teks yang harus bisa diedit di PPTX dibungkus elemen ber-atribut data-t.

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// **teks** = sorotan aksen, \n = baris baru
export const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>').replace(/\n/g, '<br>');

let RV = 0; // urutan animasi masuk per slide
const rv = () => `rv" style="--d:${RV++}`;
const T = (tag, cls, text, attrs = '') => (text === undefined || text === null || text === '' ? '' : `<${tag} class="${cls} ${rv()}" data-t${attrs ? ' ' + attrs : ''}>${rich(text)}</${tag}>`);
const pad = (n) => String(n).padStart(2, '0');
const arr = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const item = (x) => (typeof x === 'string' ? { title: x } : x || {});
const head = (s) => `<header class="hd">${T('div', 'kicker', s.kicker)}${T('h2', 'title', s.title)}${T('p', 'lead', s.subtitle)}</header>`;
const img = (src, ctx, cls = 'img') => (src ? `<div class="${cls} ${rv()}"><img src="${ctx.asset(src)}" alt=""></div>` : '');

const L = {
  cover(s, ctx) {
    const sp = ctx.deck.speaker || {};
    const meta = [sp.name && `<div class="m">${T('span', 'who', sp.name)}${T('span', 'role', sp.role)}</div>`, ctx.deck.event && `<div class="m">${T('span', 'ev', ctx.deck.event)}</div>`].filter(Boolean).join('<i class="sep"></i>');
    return `${T('div', 'kicker', s.kicker)}${T('h1', 'title', s.title)}${T('p', 'lead', s.subtitle)}${meta ? `<div class="meta ${rv()}">${meta}</div>` : ''}`;
  },
  agenda(s) {
    return `<div class="col-l">${T('div', 'kicker', s.kicker || 'Agenda')}${T('h2', 'title', s.title)}</div>
    <ol class="list">${arr(s.items).map(item).map((it, i) => `<li class="row ${rv()}"><span class="ix" data-t>${pad(i + 1)}</span><div>${T('div', 'it', it.title)}${T('div', 'ds', it.desc)}</div></li>`).join('')}</ol>`;
  },
  section(s) {
    return `${T('div', 'num', s.number ?? '')}<div class="txt">${T('div', 'kicker', s.kicker)}${T('h2', 'title', s.title)}${T('p', 'lead', s.subtitle)}</div>`;
  },
  statement(s) {
    return `${T('div', 'kicker', s.kicker)}${T('p', 'big', s.text || s.title)}${T('div', 'src', s.source)}`;
  },
  kpi(s) {
    const it = arr(s.items);
    return `${head(s)}<div class="cards n${it.length}">${it.map((k) => `<div class="card ${rv()}"><div class="val">${T('span', 'v', k.value)}${T('span', 'u', k.unit)}</div>${T('div', 'lb', k.label)}${T('div', `dl ${String(k.delta || '').trim().startsWith('-') ? 'neg' : ''}`, k.delta)}</div>`).join('')}</div>`;
  },
  bullets(s) {
    const p = arr(s.points).map(item);
    return `${head(s)}<ul class="pts ${p.length > 4 ? 'two' : ''}">${p.map((x, i) => `<li class="pt ${rv()}"><span class="ix" data-t>${pad(i + 1)}</span><div>${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div></li>`).join('')}</ul>`;
  },
  split(s, ctx) {
    const p = arr(s.points).map(item);
    const text = `<div class="tx">${T('div', 'kicker', s.kicker)}${T('h2', 'title', s.title)}${T('p', 'body', s.text)}${p.length ? `<ul class="mini">${p.map((x) => `<li class="${rv()}">${T('span', 'it', x.title)}${T('span', 'ds', x.desc)}</li>`).join('')}</ul>` : ''}</div>`;
    const vis = s.image ? img(s.image, ctx, 'vis card') : `<div class="vis card ${rv()}">${T('div', 'bigv', s.visualValue || '')}${T('div', 'lb', s.visualLabel || '')}</div>`;
    return s.side === 'left' ? vis + text : text + vis;
  },
  compare(s) {
    const side = (x, cls) => `<div class="card ${cls} ${rv()}">${T('div', 'tag', x.label)}${T('h3', 'ct', x.title)}<ul>${arr(x.points).map((p) => T('li', '', p)).join('')}</ul></div>`;
    return `${head(s)}<div class="duo">${side(s.left || {}, 'l')}<div class="vs ${rv()}" data-t>${esc(s.vs || 'VS')}</div>${side(s.right || {}, 'r')}</div>`;
  },
  beforeafter(s) {
    const side = (x, cls, lab) => `<div class="card ${cls} ${rv()}">${T('div', 'tag', x.label || lab)}${T('h3', 'ct', x.title)}<ul>${arr(x.points).map((p) => T('li', '', p)).join('')}</ul>${x.metric ? `<div class="mt">${T('span', 'v', x.metric)}${T('span', 'lb', x.metricLabel)}</div>` : ''}</div>`;
    return `${head(s)}<div class="duo">${side(s.before || {}, 'b', 'Before')}<div class="arrow ${rv()}"><svg viewBox="0 0 120 40"><path d="M0 20H110M92 4l18 16-18 16"/></svg></div>${side(s.after || {}, 'a', 'After')}</div>`;
  },
  timeline(s) {
    const it = arr(s.items).map(item);
    return `${head(s)}<div class="tl n${it.length}"><i class="rail ${rv()}"></i>${it.map((x, i) => `<div class="st ${i % 2 ? 'dn' : 'up'} ${rv()}"><i class="dot"></i>${T('div', 'wh', x.when)}${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div>`).join('')}</div>`;
  },
  cycle(s) {
    const it = arr(s.items).map(item), n = it.length || 4;
    const nodes = it.map((x, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, X = 50 + Math.cos(a) * 34, Y = 50 + Math.sin(a) * 38;
      return `<div class="nd card rv" style="--d:${RV++};left:${X.toFixed(2)}%;top:${Y.toFixed(2)}%">${T('div', 'ix', x.tag || pad(i + 1))}${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div>`;
    }).join('');
    return `<div class="side">${T('div', 'kicker', s.kicker)}${T('h2', 'title', s.title)}${T('p', 'lead', s.subtitle)}</div>
    <div class="ring"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="50" cy="50" rx="34" ry="38"/></svg>${T('div', 'ctr', s.center)}${nodes}</div>`;
  },
  grid(s) {
    const it = arr(s.items).map(item), c = s.columns || (it.length <= 4 ? it.length : Math.ceil(it.length / 2));
    return `${head(s)}<div class="tiles" style="--c:${c}">${it.map((x, i) => `<div class="card tile ${rv()}">${T('div', 'tg', x.tag || pad(i + 1))}${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div>`).join('')}</div>`;
  },
  vsm(s) {
    const st = arr(s.steps), inv = arr(s.inventory), sum = s.summary || {};
    const flow = st.map((p, i) => `<div class="pr card ${rv()}">${T('div', 'nm', p.name)}<dl>${p.ct ? `<dt>C/T</dt>${T('dd', '', p.ct)}` : ''}${p.co ? `<dt>C/O</dt>${T('dd', '', p.co)}` : ''}${p.up ? `<dt>Uptime</dt>${T('dd', '', p.up)}` : ''}${p.ops ? `<dt>Operator</dt>${T('dd', '', p.ops)}` : ''}</dl></div>${i < st.length - 1 ? `<div class="inv ${rv()}"><svg viewBox="0 0 40 36"><path d="M20 2 38 34H2Z"/></svg>${T('span', '', inv[i] ?? '')}</div>` : ''}`).join('');
    const cell = (cls, v) => (v ? T('span', cls, v) : `<span class="${cls}"></span>`);
    const ladder = st.map((p, i) => `<div class="lg">${cell('nva', inv[i])}${cell('va', p.va ?? p.ct)}</div>`).join('');
    return `${head(s)}<div class="flow">${flow}</div>
    <div class="lad ${rv()}"><div class="steps">${ladder}</div><div class="sum card">${T('div', 'lb', 'Lead time')}${T('div', 'v', sum.leadTime)}${T('div', 'lb', 'Value-added')}${T('div', 'v va', sum.valueAdded)}${T('div', 'lb', 'PCE')}${T('div', 'v ac', sum.pce)}</div></div>`;
  },
  chart(s, ctx) {
    return `${head(s)}<div class="cw"><div class="chart card ${rv()}" data-chart="${ctx.chart(s.chart)}">${ctx.svgChart(s.chart)}</div>${s.insight ? `<div class="ins card ${rv()}">${T('div', 'kicker', s.insightLabel || 'Insight')}${T('p', 'body', s.insight)}</div>` : ''}</div>`;
  },
  layers(s) {
    return `${head(s)}<div class="stack">${arr(s.layers).map((ly, i) => `<div class="band card ${rv()}">${T('div', 'nm', ly.name)}<div class="chips">${arr(ly.items).map((x) => T('span', 'chip', x)).join('')}</div>${T('div', 'lv', ly.tag || `L${arr(s.layers).length - i}`)}</div>`).join('')}</div>`;
  },
  process(s) {
    const it = arr(s.steps).map(item);
    return `${head(s)}<div class="chev n${it.length}">${it.map((x, i) => `<div class="cv ${rv()}">${T('div', 'ix', x.tag || pad(i + 1))}${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div>`).join('')}</div>`;
  },
  table(s) {
    return `${head(s)}<div class="tbw card ${rv()}"><table><thead><tr>${arr(s.columns).map((c) => T('th', '', c)).join('')}</tr></thead><tbody>${arr(s.rows).map((r) => `<tr>${arr(r).map((c, j) => T('td', j === 0 ? 'k' : '', c)).join('')}</tr>`).join('')}</tbody></table></div>`;
  },
  quote(s) {
    return `<div class="qm ${rv()}">“</div>${T('blockquote', 'q', s.text)}<div class="by">${T('span', 'who', s.author)}${T('span', 'role', s.role)}</div>`;
  },
  speaker(s, ctx) {
    const sp = { ...(ctx.deck.speaker || {}), ...s };
    return `${sp.photo ? img(sp.photo, ctx, 'ph') : `<div class="ph ${rv()}"><span>${esc((sp.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join(''))}</span></div>`}
    <div class="tx">${T('div', 'kicker', s.kicker || 'Pembicara')}${T('h2', 'title', sp.name)}${T('p', 'lead', sp.role)}<ul class="mini">${arr(s.points).map((p) => `<li class="${rv()}">${T('span', 'it', p)}</li>`).join('')}</ul></div>`;
  },
  image(s, ctx) {
    return `${img(s.image, ctx, 'full')}<div class="cap">${T('div', 'kicker', s.kicker)}${T('h2', 'title', s.title)}${T('p', 'lead', s.caption)}</div>`;
  },
  closing(s) {
    return `${T('div', 'kicker', s.kicker)}${T('h1', 'title', s.title || 'Terima kasih')}${T('p', 'lead', s.subtitle)}<ul class="ct">${arr(s.contact).map((c) => T('li', '', c)).join('')}</ul>`;
  },
  html(s) {
    return String(s.html || ''); // jalan terakhir: HTML bebas dari agent (gunakan class & data-t yang sama)
  },
};
L['before-after'] = L.beforeafter;

export const LAYOUTS = Object.keys(L);

export function renderSlide(s, i, total, ctx) {
  RV = 0;
  const fn = L[s.layout];
  if (!fn) throw new Error(`Slide ${i + 1}: layout "${s.layout}" tidak dikenal. Pilihan: ${Object.keys(L).join(', ')}`);
  const body = fn(s, ctx);
  const brand = ctx.deck.brand || {};
  const foot = `<footer class="foot"><span class="br">${brand.logo ? `<img src="${ctx.asset(brand.logo)}" alt="">` : ''}${esc(brand.name || '')}</span><span class="pg">${pad(i + 1)} / ${pad(total)}</span></footer>`;
  return `<section class="slide L-${s.layout === 'before-after' ? 'beforeafter' : s.layout}${s.align ? ' al-' + esc(s.align) : ''}" data-i="${i}">
<canvas class="fx" width="1920" height="1080"></canvas><div class="decor" data-code="${esc(ctx.code)}" data-n="${pad(i + 1)}"></div>
<div class="frame">${body}</div>${foot}
<aside class="notes">${esc(s.notes || '')}</aside></section>`;
}
