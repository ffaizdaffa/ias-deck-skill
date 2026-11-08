// IAS Deck — Design Picker: satu halaman untuk memilih tema + gambar hero, lalu menyalin pilihan ke chat AI.
import fs from 'node:fs';
import path from 'node:path';

export function buildPicker(outDir, { TH, HEROES, HERO_DIR }) {
  const rel = path.relative(outDir, HERO_DIR).split(path.sep).join('/');
  const themes = TH.themes.map((t) => ({ id: t.id, name: t.name, family: t.family, fd: t.fd, bg: t.bg, a: t.accent, b: t.accent2 }));
  const heroes = HEROES.map((h) => ({ id: h.id, cat: h.cat, src: `${rel}/${h.file}`, desc: h.desc }));
  const fam = Object.fromEntries(Object.entries(TH.families).map(([k, v]) => [k, v.split(' — ')[0]]));
  const cats = { mfg: 'Manufaktur', rob: 'Robotik', ai: 'AI & data', it: 'IT & cloud', lean: 'Lean & SDM', id: 'Indonesia', abs: 'Abstrak 3D' };
  const data = JSON.stringify({ themes, heroes, fam, cats }).replace(/</g, '\\u003c');
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>IAS Deck — Pilih Desain</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Manrope:wght@400;500;600;700&display=swap">
<style>
:root{--ink:#0b1a33;--mu:#5a6785;--ac:#1f5bff;--ln:#dfe5f0;--bg:#f4f7fc}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 Manrope,system-ui,sans-serif}
header{padding:34px 40px 10px;background:radial-gradient(60% 120% at 90% 0,#dfe8ff,transparent 70%)}
h1{font:700 34px Sora,sans-serif;margin:0 0 6px;letter-spacing:-.01em}h2{font:700 22px Sora,sans-serif;margin:34px 0 4px}
.step{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--ac);color:#fff;font:700 15px Sora;margin-right:10px;vertical-align:2px}
p.h{color:var(--mu);margin:4px 0 14px;max-width:900px}
main{padding:0 40px 260px}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 18px}.chips button{border:1px solid var(--ln);background:#fff;border-radius:999px;padding:7px 15px;cursor:pointer;font:600 13px Manrope;color:var(--ink)}
.chips button.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.grid{display:grid;gap:18px}.tg{grid-template-columns:repeat(auto-fill,minmax(330px,1fr))}.hg{grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.card{position:relative;background:#fff;border-radius:14px;overflow:hidden;cursor:pointer;box-shadow:0 10px 30px -20px #1f5bff66;outline:3px solid transparent;transition:transform .15s,outline-color .15s}
.card:hover{transform:translateY(-3px)}.card.sel{outline-color:var(--ac)}
.sh{position:relative;aspect-ratio:16/9;overflow:hidden;background:#e9eef7}.sh iframe{position:absolute;left:0;top:0;width:1920px;height:1080px;border:0;transform-origin:0 0;pointer-events:none}
.sh img{width:100%;height:100%;object-fit:cover;display:block}
.cap{padding:10px 14px 12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.cap b{font-weight:700}.cap code{font:12px ui-monospace,monospace;color:var(--ac);background:#eef3ff;padding:2px 7px;border-radius:5px}
.cap .sw{display:flex;gap:4px;margin-left:auto}.cap .sw i{width:14px;height:14px;border-radius:50%;border:1px solid #0001}
.badge{position:absolute;top:10px;right:10px;min-width:34px;height:34px;padding:0 8px;border-radius:17px;background:var(--ac);color:#fff;font:700 15px Sora;display:none;place-items:center;box-shadow:0 6px 16px -4px #1f5bff}
.card.sel .badge{display:grid}
.hint{font-size:12.5px;color:var(--mu);padding:0 14px 12px;margin-top:-6px}
.dock{position:fixed;left:0;right:0;bottom:0;background:#0b1a33;color:#fff;padding:16px 40px 18px;display:grid;grid-template-columns:1fr auto;gap:10px 24px;box-shadow:0 -20px 50px -20px #0b1a3380;z-index:9}
.dock .sum{font-size:14px;color:#b9c6e4}.dock .sum b{color:#fff}
.dock textarea{grid-column:1;width:100%;height:84px;border-radius:10px;border:0;padding:10px 12px;font:13px/1.45 ui-monospace,monospace;resize:none;background:#16264a;color:#e6edff}
.dock .act{grid-row:1/3;grid-column:2;display:flex;flex-direction:column;gap:10px;justify-content:center}
.dock button{border:0;border-radius:10px;padding:13px 22px;font:700 15px Manrope;cursor:pointer}
.go{background:var(--ac);color:#fff}.go.ok{background:#16a34a}.rs{background:#22355f;color:#cfd8ef}
label.opt{display:inline-flex;gap:8px;align-items:center;margin-right:18px;color:#cfd8ef;font-size:14px}
@media (max-width:700px){header,main{padding-left:16px;padding-right:16px}.dock{grid-template-columns:1fr;padding:12px 16px}.dock .act{grid-row:auto;grid-column:1;flex-direction:row}}
</style></head><body>
<header><h1>Pilih desain presentasi</h1><p class="h">Klik <b>satu tema</b>, lalu klik <b>gambar</b> yang disukai sesuai urutan pemakaian (1 = sampul, berikutnya untuk pembatas bagian & penutup). Setelah itu tekan <b>Salin pilihan</b> dan tempel ke chat Claude / Codex.</p></header>
<main>
<h2><span class="step">1</span>Tema <small id="tc" style="color:var(--mu);font:500 14px Manrope"></small></h2>
<p class="h">Pratinjau sampul & slide KPI. Semua tema cerah dan lolos uji keterbacaan proyektor.</p>
<div class="chips" id="ff"></div><div class="grid tg" id="tgrid"></div>
<h2><span class="step">2</span>Gambar hero <small id="hc" style="color:var(--mu);font:500 14px Manrope"></small></h2>
<p class="h">Pilih 1–6 gambar. Urutan klik menentukan pemakaian. Pilih 3–4 gambar dan centang <b>sampul kolase</b> untuk gaya poster Kemenperin.</p>
<div class="chips" id="hf"></div><div class="grid hg" id="hgrid"></div>
</main>
<div class="dock"><div class="sum" id="sum"></div>
<div><label class="opt"><input type="checkbox" id="col"> Sampul kolase (3–4 gambar)</label><label class="opt"><input type="checkbox" id="auto" checked> Gambar lain dipilih otomatis</label></div>
<textarea id="out" readonly></textarea>
<div class="act"><button class="go" id="copy">Salin pilihan</button><button class="rs" id="reset">Ulangi</button></div></div>
<script>
const D=${data};
const S={theme:null,heroes:[]};try{Object.assign(S,JSON.parse(localStorage.getItem('ias-picker')||'{}'))}catch(e){}
const $=(q)=>document.querySelector(q),save=()=>{try{localStorage.setItem('ias-picker',JSON.stringify(S))}catch(e){}};
function chips(el,map,cb){el.innerHTML='<button class="on" data-k="">Semua</button>'+Object.entries(map).map(([k,v])=>'<button data-k="'+k+'">'+v+'</button>').join('');
 el.onclick=(e)=>{const b=e.target.closest('button');if(!b)return;el.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));cb(b.dataset.k)}}
const tg=$('#tgrid'),hg=$('#hgrid');
tg.innerHTML=D.themes.map(t=>'<div class="card" data-id="'+t.id+'" data-f="'+t.family+'"><span class="badge">✓</span><div class="sh"><iframe loading="lazy" src="gallery-'+t.family+'.html?static=1&theme='+t.id+'&slide=1"></iframe></div><div class="cap"><b>'+t.name+'</b><code>'+t.id+'</code><span class="sw"><i style="background:'+t.bg+'"></i><i style="background:'+t.a+'"></i><i style="background:'+t.b+'"></i></span></div><div class="hint">'+D.fam[t.family]+' · '+t.fd+'</div></div>').join('');
hg.innerHTML=D.heroes.map(h=>'<div class="card" data-id="'+h.id+'" data-c="'+h.cat+'" title="'+h.desc.replace(/"/g,'&quot;')+'"><span class="badge"></span><div class="sh"><img loading="lazy" src="'+h.src+'" alt=""></div><div class="cap"><code>'+h.id+'</code></div></div>').join('');
chips($('#ff'),D.fam,k=>{tg.querySelectorAll('.card').forEach(c=>c.style.display=!k||c.dataset.f===k?'':'none');fit()});
chips($('#hf'),D.cats,k=>hg.querySelectorAll('.card').forEach(c=>c.style.display=!k||c.dataset.c===k?'':'none'));
tg.onclick=(e)=>{const c=e.target.closest('.card');if(!c)return;S.theme=S.theme===c.dataset.id?null:c.dataset.id;render()};
hg.onclick=(e)=>{const c=e.target.closest('.card');if(!c)return;const i=S.heroes.indexOf(c.dataset.id);i>=0?S.heroes.splice(i,1):S.heroes.length<6&&S.heroes.push(c.dataset.id);render()};
$('#col').onchange=render;$('#auto').onchange=render;
$('#reset').onclick=()=>{S.theme=null;S.heroes=[];$('#col').checked=false;render()};
$('#copy').onclick=async()=>{const t=$('#out');try{await navigator.clipboard.writeText(t.value)}catch(e){t.select();document.execCommand('copy')}const b=$('#copy');b.textContent='Tersalin ✓';b.classList.add('ok');setTimeout(()=>{b.textContent='Salin pilihan';b.classList.remove('ok')},1800)};
function render(){
 tg.querySelectorAll('.card').forEach(c=>c.classList.toggle('sel',c.dataset.id===S.theme));
 hg.querySelectorAll('.card').forEach(c=>{const i=S.heroes.indexOf(c.dataset.id);c.classList.toggle('sel',i>=0);c.querySelector('.badge').textContent=i+1});
 const th=D.themes.find(t=>t.id===S.theme),col=$('#col').checked&&S.heroes.length>=2;
 $('#tc').textContent=th?'— dipilih: '+th.name:'— belum dipilih';$('#hc').textContent='— '+S.heroes.length+' dipilih (maks 6)';
 $('#sum').innerHTML='Tema: <b>'+(th?th.name+' ('+th.id+')':'—')+'</b> · Gambar: <b>'+(S.heroes.length||'otomatis')+'</b>'+(col?' · <b>sampul kolase</b>':'');
 const L=['[IAS DECK — PILIHAN DESAIN]','Tema: '+(th?th.id:'(pilihkan yang paling cocok)')];
 if(S.heroes.length){if(col){L.push('Sampul: kolase dari '+S.heroes.slice(0,4).join(', ')+' (field "collage")');if(S.heroes.length>4)L.push('Gambar untuk pembatas bagian & penutup: '+S.heroes.slice(4).join(', ')+' (field "heroes")')}
  else L.push('Gambar hero berurutan (sampul, pembatas bagian, penutup): '+S.heroes.join(', ')+' (field "heroes")')}
 L.push($('#auto').checked?'Slide lain yang butuh gambar: pilih otomatis dari pustaka.':'Jangan tambah gambar selain yang dipilih.');
 L.push('Lanjutkan membuat deck dengan pilihan ini.');
 $('#out').value=L.join('\\n');save()}
function fit(){document.querySelectorAll('.tg .sh').forEach(s=>s.firstElementChild.style.transform='scale('+s.clientWidth/1920+')')}
addEventListener('resize',fit);fit();render();
</script></body></html>`;
  fs.writeFileSync(path.join(outDir, 'picker.html'), html);
  return path.join(outDir, 'picker.html');
}
