#!/usr/bin/env python3
"""Lembar pratinjau tema: python3 tools/theme_sheets.py themes.json <folder-screenshot {id}-1.png,{id}-2.png> <folder-output>"""
import sys, json
from PIL import Image, ImageDraw, ImageFont
T = json.load(open(sys.argv[1])); S = sys.argv[2]; O = sys.argv[3]
def font(sz, b=False):
    try: return ImageFont.truetype(f"/System/Library/Fonts/Supplemental/Arial{' Bold' if b else ''}.ttf", sz)
    except OSError: return ImageFont.load_default()
BG, FG, MU = (244, 246, 250), (12, 20, 40), (100, 110, 130)
W, H, LB, cols = 480, 270, 44, 5; rows = (len(T['themes']) + cols - 1) // cols
sh = Image.new('RGB', (cols * W + (cols + 1) * 12, 90 + rows * (H + LB + 12)), BG); d = ImageDraw.Draw(sh)
d.text((12, 22), f"IAS Deck · {len(T['themes'])} tema cerah (slide sampul)", font=font(34, True), fill=FG)
for i, t in enumerate(T['themes']):
    x = 12 + (i % cols) * (W + 12); y = 90 + (i // cols) * (H + LB + 12)
    sh.paste(Image.open(f"{S}/{t['id']}-1.png").convert('RGB').resize((W, H), Image.LANCZOS), (x, y))
    d.text((x, y + H + 8), t['name'], font=font(18, True), fill=FG)
    d.text((x + d.textlength(t['name'], font=font(18, True)) + 10, y + H + 10), t['id'], font=font(15), fill=MU)
sh.save(f"{O}/00-semua-tema.jpg", quality=86)
for n, (fam, desc) in enumerate(T['families'].items(), 1):
    ts = [t for t in T['themes'] if t['family'] == fam]; W2, H2 = 720, 405; r2 = (len(ts) + 1) // 2
    im = Image.new('RGB', (2 * (2 * W2 + 12) + 3 * 24, 100 + r2 * (H2 + 60)), BG); d = ImageDraw.Draw(im)
    d.text((24, 26), desc.replace(' — ', '  —  '), font=font(26, True), fill=FG)
    for i, t in enumerate(ts):
        x = 24 + (i % 2) * (2 * W2 + 12 + 24); y = 100 + (i // 2) * (H2 + 60)
        for j in (1, 2): im.paste(Image.open(f"{S}/{t['id']}-{j}.png").convert('RGB').resize((W2, H2), Image.LANCZOS), (x + (j - 1) * (W2 + 12), y))
        d.text((x, y + H2 + 12), t['name'], font=font(22, True), fill=FG)
        d.text((x + d.textlength(t['name'], font=font(22, True)) + 12, y + H2 + 15), f"{t['id']}  ·  font {t['fd']}  ·  efek {t['fx']}", font=font(17), fill=MU)
    im.save(f"{O}/{n:02d}-{fam}.jpg", quality=86)
print('ok')
