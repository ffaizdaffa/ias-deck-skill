#!/usr/bin/env python3
"""IAS Deck — ekspor PPTX yang bisa diedit.
Masukan: export.json (hasil pengukuran Chrome: posisi & gaya setiap teks, grafik, catatan) + gambar latar per slide.
Keluaran: .pptx 16:9 — latar = gambar (efek futuristik), teks = text box asli, grafik = chart asli PowerPoint.
"""
import json
import re
import sys

try:
    from pptx import Presentation
    from pptx.chart.data import CategoryChartData
    from pptx.dml.color import RGBColor
    from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION
    from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
    from pptx.util import Emu, Pt
except ImportError:
    sys.exit("✖ python-pptx belum terpasang. Jalankan: pip3 install --user python-pptx")

PX = 6350  # 1 px kanvas 1920 = 6350 EMU (13,333 in / 1920)
ALIGN = {"center": PP_ALIGN.CENTER, "right": PP_ALIGN.RIGHT, "end": PP_ALIGN.RIGHT, "justify": PP_ALIGN.JUSTIFY}


def rgb(css):
    """'rgb(1, 2, 3)' / 'rgba(1,2,3,.5)' / '#aabbcc' -> RGBColor (alpha diabaikan)."""
    if not css:
        return None
    if css.startswith("#"):
        h = css[1:]
        return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
    m = re.findall(r"[\d.]+", css)
    if len(m) >= 3:
        if len(m) == 4 and float(m[3]) == 0:
            return None
        return RGBColor(int(float(m[0])), int(float(m[1])), int(float(m[2])))
    return None


def set_spacing(run, ls_px):
    if ls_px:
        run._r.get_or_add_rPr().set("spc", str(int(ls_px * 0.5 * 100)))  # 1px = 0,5pt; spc dalam 1/100 pt


def add_text(slide, t):
    runs = [r for r in t["runs"] if r.get("t")]
    if not runs:
        return
    first = next((r for r in runs if r["t"] != "\n"), None)
    if first is None:
        return
    size = first["s"]
    single = t["h"] < t["lh"] * 1.6
    slack = 1.06 if single else 1.03  # beri ruang agar metrik font PowerPoint tidak memotong baris
    w = t["w"] * slack
    x = t["x"] - (w - t["w"]) / 2 if t["align"] == "center" else t["x"] - (w - t["w"]) if t["align"] in ("right", "end") else t["x"]
    box = slide.shapes.add_textbox(Emu(int(x * PX)), Emu(int(t["y"] * PX)), Emu(int(w * PX)), Emu(int(max(t["h"], t["lh"]) * PX)))
    tf = box.text_frame
    tf.word_wrap = not single
    tf.auto_size = None
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = Emu(int(t.get("pl", 0) * PX))
    tf.margin_top = Emu(int(t.get("pt", 0) * PX))
    tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]

    def style_para(par):
        par.alignment = ALIGN.get(t["align"], PP_ALIGN.LEFT)
        if size:
            par.line_spacing = round(t["lh"] / size, 2)

    style_para(p)
    for r in runs:
        if r["t"] == "\n":
            p = tf.add_paragraph()
            style_para(p)
            continue
        run = p.add_run()
        run.text = r["t"]
        f = run.font
        f.size = Pt(r["s"] * 0.5)
        f.bold = r.get("w", 400) >= 600
        f.italic = r.get("i", False)
        f.name = r.get("f") or None
        col = rgb(r.get("c"))
        if col is not None:
            f.color.rgb = col
        set_spacing(run, t.get("ls", 0))


def add_chart(slide, c, theme):
    spec = c.get("spec") or {}
    labels = spec.get("labels") or []
    series = spec.get("series") or []
    if not labels or not series:
        return
    data = CategoryChartData()
    data.categories = labels
    for s in series:
        data.add_series(s.get("name", ""), s.get("data", []))
    kind = {"line": XL_CHART_TYPE.LINE_MARKERS, "donut": XL_CHART_TYPE.DOUGHNUT}.get(spec.get("type"), XL_CHART_TYPE.COLUMN_CLUSTERED)
    gf = slide.shapes.add_chart(kind, Emu(int(c["x"] * PX)), Emu(int(c["y"] * PX)), Emu(int(c["w"] * PX)), Emu(int(c["h"] * PX)), data)
    ch = gf.chart
    ch.has_title = False
    fg, muted = rgb(theme["fg"]), rgb(theme["muted"])
    palette = [rgb(theme["accent"]), rgb(theme["accent2"]), muted, fg]
    ch.font.size = Pt(11)
    ch.font.color.rgb = muted
    ch.font.name = theme.get("fm")
    ch.has_legend = len(series) > 1 or kind == XL_CHART_TYPE.DOUGHNUT
    if ch.has_legend:
        ch.legend.position = XL_LEGEND_POSITION.RIGHT if kind == XL_CHART_TYPE.DOUGHNUT else XL_LEGEND_POSITION.TOP
        ch.legend.include_in_layout = False
        ch.legend.font.color.rgb = fg
    plot = ch.plots[0]
    if kind == XL_CHART_TYPE.DOUGHNUT:
        for i, pt in enumerate(plot.series[0].points):
            pt.format.fill.solid()
            pt.format.fill.fore_color.rgb = palette[i % 4]
        return
    if kind == XL_CHART_TYPE.COLUMN_CLUSTERED:
        plot.gap_width = 60
        if len(series) == 1:
            plot.has_data_labels = True
            plot.data_labels.font.color.rgb = fg
            plot.data_labels.font.size = Pt(12)
    for i, s in enumerate(plot.series):
        col = palette[i % 4]
        if kind == XL_CHART_TYPE.LINE_MARKERS:
            s.format.line.color.rgb = col
            s.format.line.width = Pt(2.5)
            s.smooth = False
        else:
            s.format.fill.solid()
            s.format.fill.fore_color.rgb = col
    va = ch.value_axis
    va.major_gridlines.format.line.color.rgb = muted
    va.major_gridlines.format.line.width = Pt(0.5)
    va.format.line.fill.background()
    ch.category_axis.format.line.color.rgb = muted


def main(spec_file, out_file):
    spec = json.load(open(spec_file, encoding="utf-8"))
    theme = spec["theme"]
    prs = Presentation()
    prs.slide_width, prs.slide_height = Emu(1920 * PX), Emu(1080 * PX)
    blank = prs.slide_layouts[6]
    for s in spec["slides"]:
        sl = prs.slides.add_slide(blank)
        sl.shapes.add_picture(s["bg"], 0, 0, prs.slide_width, prs.slide_height)
        for t in s["texts"]:
            add_text(sl, t)
        for c in s["charts"]:
            add_chart(sl, c, theme)
        if s.get("notes"):
            sl.notes_slide.notes_text_frame.text = s["notes"]
    prs.core_properties.title = spec.get("title", "")
    prs.core_properties.author = "IAS Deck"
    prs.save(out_file)
    print(f"✔ PPTX  {out_file}  ({len(spec['slides'])} slide, teks & grafik bisa diedit)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("Pakai: python3 export_pptx.py export.json out.pptx")
    main(sys.argv[1], sys.argv[2])
