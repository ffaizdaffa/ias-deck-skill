# Skema deck & 21 layout

## Akar file
```json
{
  "title": "Judul deck (untuk tab browser & properti PPTX)",
  "code": "LEAN-4.0",                       // label pendek di dekorasi (opsional)
  "theme": "hud-cobalt",                    // id dari references/themes.md
  "speaker": { "name": "Nama", "role": "Jabatan", "photo": "foto.jpg" },
  "event": "Nama acara · Kota · Tanggal",
  "brand": { "name": "Teks footer kiri bawah (mis. nama instansi/acara)", "logo": "logo.png", "accent": "#0057B8" },  // accent opsional
  "slides": [ { "layout": "...", "notes": "catatan pembicara", "align": "center" } ]
}
```
Semua field teks mendukung `**sorotan**` (warna aksen) dan `\n` (baris baru). Gambar: path relatif ke file JSON, atau URL.
Field `kicker` = label kecil di atas judul (kategori / konteks). Field `notes` muncul di presenter mode & catatan PPTX.

## Layout

| layout | kapan dipakai | field |
|---|---|---|
| `cover` | sampul | `kicker`, `title`, `subtitle` (+ `speaker`, `event` dari akar) |
| `agenda` | daftar isi | `kicker`, `title`, `items[]` (string atau `{title, desc}`, 3–6) |
| `section` | pembatas bagian | `number` ("01"), `kicker` (mis. "Bagian dua"), `title`, `subtitle` |
| `statement` | satu kalimat kunci besar | `kicker`, `text`, `source` |
| `kpi` | 1–4 angka besar | `kicker`, `title`, `subtitle`, `items[{value, unit, label, delta}]` — `delta` = keterangan kecil di bawah (mis. "▲ dari 61%"); kalau diawali `-` diberi warna netral |
| `bullets` | poin-poin (≤ 4 = 1 kolom, 5–8 = 2 kolom) | `kicker`, `title`, `subtitle`, `points[]` (string atau `{title, desc}`) |
| `split` | teks + visual | `kicker`, `title`, `text`, `points[]`, `image` **atau** `visualValue` + `visualLabel`, `side`: `"left"` (visual di kiri) |
| `compare` | dua opsi berdampingan | `kicker`, `title`, `left{label, title, points[]}`, `right{...}`, `vs` |
| `beforeafter` | sebelum → sesudah | `kicker`, `title`, `before{label, title, points[], metric, metricLabel}`, `after{...}` |
| `timeline` | roadmap / milestone (3–6) | `kicker`, `title`, `items[{when, title, desc}]` |
| `cycle` | siklus (PDCA, DMAIC, 3–6 node) | `kicker`, `title`, `subtitle`, `center`, `items[{tag, title, desc}]` |
| `grid` | 3–8 ubin (TIMWOODS, 5S, pilar) | `kicker`, `title`, `items[{tag, title, desc}]`, `columns` (opsional) |
| `vsm` | value stream map | `kicker`, `title`, `steps[{name, ct, co, up, ops, va}]`, `inventory[]` (antar proses), `summary{leadTime, valueAdded, pce}` |
| `chart` | grafik | `kicker`, `title`, `chart{type: "bar" \| "line" \| "donut", labels[], series[{name, data[]}], unit}`, `insight`, `insightLabel` |
| `layers` | arsitektur berlapis (atas = paling dekat pengguna) | `kicker`, `title`, `layers[{name, items[], tag}]` |
| `process` | langkah berurutan (chevron, 3–6) | `kicker`, `title`, `steps[{tag, title, desc}]` |
| `table` | tabel ≤ 6 baris | `kicker`, `title`, `columns[]`, `rows[][]` (kolom pertama ditebalkan) |
| `quote` | kutipan | `text`, `author`, `role` |
| `speaker` | profil pembicara | `kicker`, `name`, `role`, `photo`, `points[]` (default dari `speaker` akar) |
| `image` | foto penuh layar | `image`, `kicker`, `title`, `caption` |
| `closing` | penutup | `kicker`, `title`, `subtitle`, `contact[]` |
| `html` | jalan terakhir — HTML bebas | `html` (pakai class yang ada; beri `data-t` pada teks agar ikut ke PPTX) |

## Batas isi supaya tidak meluber
- Judul ≤ 60 karakter (cover, section, closing ≤ 45). Lead/subtitle ≤ 140 karakter.
- `desc` ≤ 70 karakter. `bullets` ≤ 8 poin, `grid` ≤ 8, `timeline`/`process` ≤ 6, `table` ≤ 6 baris × 5 kolom.
- Selalu jalankan `render.mjs --check`; perbaiki semua peringatan. Render juga memperingatkan judul yang terlalu panjang. `--check` mendeteksi teks meluber, tetapi tidak menilai kepadatan, jadi tetap lihat screenshot.

## Contoh singkat
```json
{ "layout": "kpi", "kicker": "Hasil pilot (data ilustrasi)", "title": "OEE naik **18 poin** dalam 6 bulan",
  "items": [ { "value": "79", "unit": "%", "label": "OEE lini A", "delta": "▲ dari 61%" },
             { "value": "-42", "unit": "%", "label": "Waktu changeover", "delta": "▲ SMED" } ] }
```
Contoh lengkap semua layout: `examples/lean-kemenperin.json`.
