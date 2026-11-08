#!/usr/bin/env python3
"""Bangun pustaka gambar hero: PNG hasil generate -> JPEG terkompresi + heroes.json (tag untuk pemilihan otomatis).
Pakai: python3 tools/build_heroes.py <folder-png> <prompts.txt>"""
import json, re, sys, os
from PIL import Image

SRC, PROMPTS = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.path.dirname(__file__), '..', 'skills', 'ias-deck', 'assets', 'heroes')
SYN = {'robotic': 'robot', 'robots': 'robot', 'humanoid': 'robot', 'cobot': 'robot', 'hologram': 'twin', 'holographic': 'twin', 'government': 'gov', 'ministry': 'gov', 'official': 'gov',
       'indonesian': 'indonesia', 'jakarta': 'indonesia', 'sulawesi': 'indonesia', 'servers': 'server', 'datacenter': 'server', 'inspection': 'quality', 'inspecting': 'quality',
       'welding': 'factory', 'plant': 'factory', 'production': 'factory', 'manufacturing': 'factory', 'assembly': 'factory', 'factories': 'factory', 'machines': 'machine',
       'engineers': 'engineer', 'worker': 'workers', 'technicians': 'workers', 'students': 'training', 'school': 'training', 'teaching': 'training', 'containers': 'port',
       'cars': 'car', 'scooters': 'ev', 'motorcycle': 'ev', 'cells': 'battery', 'cybersecurity': 'cyber', 'shield': 'cyber', 'maintenance': 'maintenance', 'predictive': 'predictive',
       'drone': 'drone', 'dashboard': 'data', 'graphs': 'data', 'chart': 'data', 'charts': 'data', 'network': 'network', 'neural': 'ai', 'brain': 'ai', 'llm': 'ai', 'model': 'ai'}
VOCAB = set('factory car battery ev robot ai data predictive maintenance machine warehouse logistics cyber cloud network sensor twin digital lean kaizen kanban andon 5s smed pdca quality gov industrial estate port indonesia nickel umkm training workers team safety semicon chip pharma food textile steel chemical solar industry erp 5g city drone cnc conveyor engineer meeting server satellite quantum blockchain agriculture batik conference skyline gemba'.split())
CAT = {'mfg': 'factory', 'rob': 'robot', 'ai': 'ai', 'it': 'digital', 'lean': 'lean', 'id': 'indonesia', 'abs': 'abstract'}

os.makedirs(OUT, exist_ok=True)
meta = []
for line in open(PROMPTS, encoding='utf-8'):
    parts = line.strip().split('|')
    if len(parts) != 3:
        continue
    _, hid, prompt = parts
    png = os.path.join(SRC, f'{hid}.png')
    if not os.path.exists(png):
        continue
    words = re.findall(r'[a-z0-9]+', (prompt + ' ' + hid.replace('-', ' ')).lower())
    tags = sorted({SYN.get(w, w.rstrip('s') if w.rstrip('s') in VOCAB else w) for w in words} & VOCAB | {CAT.get(hid.split('-')[0], '')} - {''})
    im = Image.open(png).convert('RGB')
    if im.width > 1920:
        im = im.resize((1920, round(im.height * 1920 / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, f'{hid}.jpg'), quality=80, optimize=True, progressive=True)
    meta.append({'id': hid, 'file': f'{hid}.jpg', 'cat': hid.split('-')[0], 'tags': tags, 'desc': prompt})
json.dump(meta, open(os.path.join(OUT, 'heroes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{len(meta)} gambar -> {OUT}')

# galeri & referensi untuk agent
names = {'mfg': 'Manufaktur & Industri 4.0', 'rob': 'Robotik & otomasi', 'ai': 'AI & data', 'it': 'IT, cloud, keamanan siber', 'lean': 'Lean & orang di lantai produksi', 'id': 'Indonesia & pemerintah', 'abs': 'Latar abstrak & 3D'}
md = ['# Pustaka gambar hero', '', f'{len(meta)} gambar cerah (render AI, tanpa teks/logo). Dipilih otomatis untuk `cover`, `section`, `closing` berdasarkan kata kunci judul.',
      'Pakai manual: `"hero": "<id>"` di slide, `"heroes": ["id1","id2"]` di akar deck (urutan prioritas), atau `"hero": false` untuk mematikan.',
      'Galeri visual: buka `assets/heroes/index.html`.', '']
cards = []
for cat, label in names.items():
    rows = [m for m in meta if m['cat'] == cat]
    if not rows:
        continue
    md += [f'## {label}', '', '| id | isi |', '|---|---|'] + [f"| `{m['id']}` | {m['desc'][:110]} |" for m in rows] + ['']
    cards.append(f'<h2>{label}</h2><div class="g">' + ''.join(f'<figure><img loading="lazy" src="{m["file"]}"><figcaption>{m["id"]}</figcaption></figure>' for m in rows) + '</div>')
open(os.path.join(OUT, '..', '..', 'references', 'heroes.md'), 'w', encoding='utf-8').write('\n'.join(md))
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write('<!doctype html><meta charset="utf-8"><title>IAS Deck — Pustaka Gambar Hero</title><style>body{margin:0;padding:32px 40px;background:#f5f7fb;color:#0b1a33;font:15px system-ui}h1{margin:0 0 6px}h2{margin:34px 0 12px;font-size:20px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}figure{margin:0;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px -18px #1f5bff55}img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}figcaption{padding:8px 12px;font:13px ui-monospace,monospace;color:#1f5bff}</style><h1>Pustaka Gambar Hero</h1><p>Sebut id gambar ke Claude/Codex, mis. "pakai hero mfg-digital-twin di sampul".</p>' + ''.join(cards))
