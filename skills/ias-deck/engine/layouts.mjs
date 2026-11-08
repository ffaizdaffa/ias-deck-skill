// IAS Deck — template layout. Setiap fungsi menerima (slide, ctx) dan mengembalikan HTML isi .frame.
// Aturan: setiap teks yang harus bisa diedit di PPTX dibungkus elemen ber-atribut data-t.

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// **teks** = sorotan aksen, \n = baris baru
export const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>').replace(/==(.+?)==/g, '<mark>$1</mark>').replace(/\n/g, '<br>');

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
    const pil = arr(s.pillars).map(item);
    return `${T('div', 'kicker', s.kicker)}${T('div', 'pre', s.pretitle)}${T('h1', 'title', s.title)}${T('p', 'lead', s.subtitle)}${pil.length ? `<div class="pills ${rv()}">${pil.map((x) => `<div class="pl"><span class="ichip round">${ctx.icon(x.icon || 'target')}</span>${T('span', 'pt2', x.title)}</div>`).join('')}</div>` : ''}${meta ? `<div class="meta ${rv()}">${meta}</div>` : ''}`;
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
  kpi(s, ctx) {
    const it = arr(s.items);
    const gauge = (g) => { const r = 120, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, Number(g) || 0));
      return `<svg class="gauge" viewBox="0 0 300 300"><circle class="tk" cx="150" cy="150" r="${r + 22}"/><circle class="bg" cx="150" cy="150" r="${r}"/><circle class="fg" cx="150" cy="150" r="${r}" stroke-dasharray="${(c * v / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 150 150)"/></svg>`; };
    const spark = (d) => { if (!Array.isArray(d) || d.length < 2) return ''; const mx = Math.max(...d), mn = Math.min(...d), W = 300, H = 60;
      const pts = d.map((v, i) => `${(i / (d.length - 1)) * W},${H - ((v - mn) / (mx - mn || 1)) * (H - 6) - 3}`).join(' ');
      return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="M0,${H} L${pts.replace(/ /g, ' L')} L${W},${H}Z"/><polyline points="${pts}"/></svg>`; };
    return `${head(s)}<div class="cards n${it.length}">${it.map((k, j) => `<div class="card ${rv()}">${k.gauge !== undefined ? gauge(k.gauge) : ''}${k.icon ? `<span class="ichip">${ctx.icon(k.icon)}</span>` : ''}<div class="ch"><b>${esc(k.tag || `Metric ${pad(j + 1)}`)}</b>${k.icon || k.gauge !== undefined ? '' : '<i></i>'}</div><div class="val">${T('span', 'v', k.value)}${T('span', 'u', k.unit)}</div>${T('div', 'lb', k.label)}${T('div', `dl ${String(k.delta || '').trim().startsWith('-') ? 'neg' : ''}`, k.delta)}${spark(k.trend)}</div>`).join('')}</div>`;
  },
  bullets(s, ctx) {
    const p = arr(s.points).map(item);
    return `${head(s)}<ul class="pts ${p.length > 4 ? 'two' : ''}">${p.map((x, i) => `<li class="pt ${rv()}">${x.icon ? `<span class="ichip">${ctx.icon(x.icon)}</span>` : `<span class="ix" data-t>${pad(i + 1)}</span>`}<div>${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div></li>`).join('')}</ul>`;
  },
  split(s, ctx) {
    const p = arr(s.points).map(item);
    const text = `<div class="tx">${T('div', 'kicker', s.kicker)}${T('h2', 'title', s.title)}${T('p', 'body', s.text)}${p.length ? `<ul class="mini">${p.map((x) => `<li class="${rv()}">${T('span', 'it', x.title)}${T('span', 'ds', x.desc)}</li>`).join('')}</ul>` : ''}</div>`;
    const pic = s.image ? ctx.asset(s.image) : s.hero ? ctx.hero(s.hero) : '';
    const vis = pic ? `<div class="photo ${rv()}"><div class="pf"><img src="${pic}" alt=""></div>${s.imageLabel ? `<span class="tagp">${esc(s.imageLabel)}</span>` : ''}</div>` : `<div class="vis card ${rv()}">${T('div', 'bigv', s.visualValue || '')}${T('div', 'lb', s.visualLabel || '')}</div>`;
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
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n, X = 50 + Math.cos(a) * 34, Y = 50 + Math.sin(a) * 35;
      const m = a + Math.PI / n, ax = 50 + Math.cos(m) * 34, ay = 50 + Math.sin(m) * 35, deg = (m * 180) / Math.PI + 90;
      return `<div class="nd card rv" style="--d:${RV++};left:${X.toFixed(2)}%;top:${Y.toFixed(2)}%"><span class="no" data-t>${esc(x.tag || i + 1)}</span>${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div><i class="arw" style="left:${ax.toFixed(2)}%;top:${ay.toFixed(2)}%;transform:translate(-50%,-50%) rotate(${deg.toFixed(1)}deg)"></i>`;
    }).join('');
    return `<div class="side">${T('div', 'kicker', s.kicker)}${T('h2', 'title', s.title)}${T('p', 'lead', s.subtitle)}</div>
    <div class="ring"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="50" cy="50" rx="34" ry="38"/><ellipse class="in" cx="50" cy="50" rx="22" ry="25" style="stroke:var(--ln);stroke-dasharray:none"/></svg>${T('div', 'ctr', s.center)}${nodes}</div>`;
  },
  grid(s, ctx) {
    const it = arr(s.items).map(item), c = s.columns || (it.length <= 4 ? it.length : Math.ceil(it.length / 2));
    return `${head(s)}<div class="tiles" style="--c:${c}">${it.map((x, i) => `<div class="card tile ${rv()}">${x.icon ? `<span class="ichip big">${ctx.icon(x.icon)}</span>` : T('div', 'tg', x.tag || pad(i + 1))}${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div>`).join('')}</div>`;
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
    return `${head(s)}<div class="cw"><div class="chart card ${rv()}" data-chart="${ctx.chart(s.chart)}">${ctx.svgChart(s.chart)}</div>${s.insight || s.insightValue ? `<div class="ins ${rv()}">${T('div', 'kicker', s.insightLabel || 'Artinya')}${T('div', 'iv', s.insightValue)}${T('p', 'body', s.insight)}</div>` : ''}</div>`;
  },
  layers(s) {
    return `${head(s)}<div class="stack">${arr(s.layers).map((ly, i) => `<div class="band card ${rv()}">${T('div', 'nm', ly.name)}<div class="chips">${arr(ly.items).map((x) => T('span', 'chip', x)).join('')}</div>${T('div', 'lv', ly.tag || `L${arr(s.layers).length - i}`)}</div>`).join('')}</div>`;
  },
  process(s) {
    const it = arr(s.steps).map(item);
    return `${head(s)}<div class="chev n${it.length}">${it.map((x, i) => `<div class="cv ${rv()}">${T('div', 'ix', x.tag || pad(i + 1))}${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div>`).join('')}</div>`;
  },
  table(s) {
    const num = (v) => parseFloat(String(v).replace(/[^0-9,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.')) || 0;
    const bc = s.bar, mx = bc !== undefined ? Math.max(...arr(s.rows).map((r) => Math.abs(num(r[bc])))) || 1 : 1;
    const cell = (c, j) => (j === bc ? `<td class="bc"><span class="tbar" style="--w:${((Math.abs(num(c)) / mx) * 100).toFixed(1)}%"></span>${T('span', '', c)}</td>` : T('td', j === 0 ? 'k' : '', c));
    return `${head(s)}<div class="tbw card ${rv()}"><table><thead><tr>${arr(s.columns).map((c) => T('th', '', c)).join('')}</tr></thead><tbody>${arr(s.rows).map((r) => `<tr>${arr(r).map(cell).join('')}</tr>`).join('')}</tbody></table></div>`;
  },
  pillars(s, ctx) {
    const it = arr(s.items).map(item), ph = arr(s.photos);
    return `${head(s)}<div class="pillrow n${it.length}">${it.map((x) => `<div class="pc ${rv()}"><span class="ichip round xl">${ctx.icon(x.icon || 'target')}</span>${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div>`).join('')}</div>${ph.length ? `<div class="strip">${ph.map((id) => `<div class="sp ${rv()}"><img src="${ctx.hero(id)}" alt=""></div>`).join('')}</div>` : ''}`;
  },
  showcase(s, ctx) {
    const it = arr(s.items).map(item), ph = arr(s.photos);
    return `<div class="scl">${T('div', 'kicker', s.kicker)}${T('h2', 'title', s.title)}<div class="strip">${ph.map((id) => `<div class="sp ${rv()}"><img src="${ctx.hero(id)}" alt=""></div>`).join('')}</div></div>
    <div class="scr ${rv()}">${it.map((x) => `<div class="li"><span class="ichip round">${ctx.icon(x.icon || 'check-circle-2')}</span><div>${T('div', 'it', x.title)}${T('div', 'ds', x.desc)}</div></div>`).join('')}</div>`;
  },
  number(s) {
    const it = arr(s.items);
    return `${T('div', 'kicker', s.kicker)}<div class="nb"><div class="nv ${rv()}">${T('span', 'v', s.value)}${T('span', 'u', s.unit)}</div><div class="nt">${T('h2', 'title', s.title)}${T('p', 'lead', s.text)}</div></div>${it.length ? `<div class="ns">${it.map((k) => `<div class="card ${rv()}">${T('div', 'v', k.value)}${T('div', 'lb', k.label)}</div>`).join('')}</div>` : ''}`;
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
    return `<div class="cap">${T('div', 'kicker', s.kicker)}${T('h2', 'title', s.title)}${T('p', 'lead', s.caption)}</div>`;
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
  const foot = brand.logo || brand.name ? `<footer class="foot">${brand.logo ? `<img src="${ctx.asset(brand.logo)}" alt="">` : ''}${esc(brand.name || '')}</footer>` : '';
  const prog = Array.from({ length: total }, (_, k) => `<i${k === i ? ' class="on"' : ''}></i>`).join('');
  const decor = `<div class="decor"><span class="d-cn"></span><span class="d-zn"></span><span class="d-rl"></span><span class="d-scan"></span>
<span class="d-tl"><b>IAS</b> // ${esc(ctx.code)}<i>SEQ ${pad(i + 1)}</i></span><span class="d-tr"><span class="clk">${esc(ctx.clock)}</span><span class="sig"><i></i><i></i><i></i><i></i><i></i></span></span>
<span class="d-bl${s.source ? " src" : ""}">${s.source ? `Sumber: ${esc(s.source)}` : `LAT −6.2088 · LON 106.8456 · ${esc(ctx.date)}`}</span><span class="d-br">${pad(i + 1)} / ${pad(total)}</span><span class="d-prog">${total <= 30 ? prog : ''}</span></div>`;
  const heroSrc = Array.isArray(s.collage) ? '' : ctx.heroFor(s, i);
  const mosaic = Array.isArray(s.collage) ? `<div class="mosaic m${Math.min(4, s.collage.length)}">${s.collage.slice(0, 4).map((id, k) => `<div class="mt t${k + 1}"><img src="${ctx.hero(id)}" alt=""></div>`).join('')}</div>` : '';
  const band = s.band ? `<div class="band2"><span class="bl">${brand.logo ? `<img src="${ctx.asset(brand.logo)}" alt="">` : ''}<b data-t>${esc(brand.name || ctx.deck.event || '')}</b></span><i></i><span class="bt" data-t>${rich(s.band)}</span></div>` : '';
  const full = ['cover', 'closing', 'image', 'statement'].includes(s.layout);
  const hero = !heroSrc ? '' : full
    ? `<div class="hero ${ctx.tint}"><img src="${heroSrc}" alt=""></div>${s.layout === 'cover' ? `<div class="reticle"><i></i><span>Target lock · ${esc(ctx.code)}</span></div>` : ''}`
    : `<div class="photo"><div class="pf"><img src="${heroSrc}" alt=""></div></div>`;
  const ghost = s.ghost !== false && ['cover', 'section', 'closing', 'agenda'].includes(s.layout) ? `<div class="ghost">${esc(s.ghost || (s.layout === 'section' ? s.kicker || s.title : ctx.code).split(/\s+/)[0])}</div>` : '';
  return `<section class="slide L-${s.layout === 'before-after' ? 'beforeafter' : s.layout}${s.align ? ' al-' + esc(s.align) : ''}" data-i="${i}">
<canvas class="fx" width="1920" height="1080"></canvas>${ghost}${hero}${mosaic}${decor}${band}
<div class="frame">${body}${s.takeaway ? `<div class="take rv" style="--d:${RV++}"><span class="ichip">${ctx.icon(s.takeawayIcon || 'lightbulb')}</span><p data-t>${rich(s.takeaway)}</p></div>` : ''}</div>${foot}
<aside class="notes">${esc(s.notes || '')}</aside></section>`;
}
