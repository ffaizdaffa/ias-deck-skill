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
  "heroes": ["mfg-digital-twin", "lean-kaizen"],
  "imagine": true,          // opsional: buat gambar khusus per slide via Codex (render.mjs --imagine)
  "icons": true,            // opsional: false mematikan ikon otomatis  // opsional: urutan gambar hero untuk cover/section/closing (lihat references/heroes.md)
  "slides": [ { "layout": "...", "notes": "catatan pembicara", "align": "center", "hero": "id-atau-path | false", "ghost": "TEKS LATAR",
                "takeaway": "Satu kalimat kesimpulan (bar bawah)", "imagine": "deskripsi gambar khusus slide ini", "takeawayIcon": "lightbulb", "source": "Sumber data (footer)" } ]
}
```
Semua field teks mendukung `**sorotan**` (warna aksen; **jika berisi angka otomatis tampil besar**, mis. `**42%**`), `==pita==` (frasa kunci dengan pita warna di belakangnya, gaya poster Kemenperin) dan `\n` (baris baru). Gambar: path relatif ke file JSON, atau URL.
Field `kicker` = label kecil di atas judul (kategori / konteks). Field `notes` muncul di presenter mode & catatan PPTX.

## Layout

| layout | kapan dipakai | field |
|---|---|---|
| `cover` | sampul | `kicker`, `pretitle` (baris kecil di atas judul), `title`, `subtitle`, `pillars[{icon, title}]` (deret ikon bulat, ≤ 5), `collage[id…]` (2–4 gambar hero jadi kolase bersudut di kanan), `band` (tagline di band navy bawah, pakai `brand.name`/`logo`) (+ `speaker`, `event` dari akar) |
| `agenda` | daftar isi | `kicker`, `title`, `items[]` (string atau `{title, desc}`, 3–6) |
| `section` | pembatas bagian | `number` ("01"), `kicker` (mis. "Bagian dua"), `title`, `subtitle` |
| `statement` | satu kalimat kunci besar | `kicker`, `text`, `source` |
| `kpi` | 1–4 angka besar | `kicker`, `title`, `subtitle`, `items[{value, unit, label, delta, icon, gauge (0–100, hanya jika memang persentase), trend [angka…] (sparkline)}]` — `delta` = keterangan kecil di bawah (mis. "▲ dari 61%"); kalau diawali `-` diberi warna netral |
| `bullets` | poin-poin (≤ 4 = 1 kolom, 5–8 = 2 kolom) | `kicker`, `title`, `subtitle`, `points[]` (string atau `{title, desc}`) |
| `split` | teks + visual | `kicker`, `title`, `text`, `points[]`, `image`/`hero` (foto berbingkai, `imageLabel` opsional) **atau** `visualValue` + `visualLabel`, `side`: `"left"` (visual di kiri) |
| `compare` | dua opsi berdampingan | `kicker`, `title`, `left{label, title, points[]}`, `right{...}`, `vs` |
| `beforeafter` | sebelum → sesudah | `kicker`, `title`, `before{label, title, points[], metric, metricLabel}`, `after{...}` |
| `timeline` | roadmap / milestone (3–6) | `kicker`, `title`, `items[{when, title, desc}]` |
| `cycle` | siklus / rantai sebab-akibat bernomor berpanah (PDCA, DMAIC, 3–7 node) | `kicker`, `title`, `subtitle`, `center`, `items[{tag, title, desc}]` |
| `grid` | 3–8 ubin (TIMWOODS, 5S, pilar) | `kicker`, `title`, `items[{tag atau icon, title, desc}]`, `columns` (opsional) |
| `vsm` | value stream map | `kicker`, `title`, `steps[{name, ct, co, up, ops, va}]`, `inventory[]` (antar proses), `summary{leadTime, valueAdded, pce}` |
| `chart` | grafik | `kicker`, `title`, `chart{type: "bar" \| "line" \| "hbar" (Pareto/peringkat) \| "waterfall" (bridge) \| "donut", labels[], series[{name, data[]}], unit, highlight (indeks/label disorot), avg (garis rata-rata), waterfall: values[], totals[], groups[{from,to,label}]}`, panel gelap: `insightValue` (angka besar), `insightLabel`, `insight` |
| `layers` | arsitektur berlapis (atas = paling dekat pengguna) | `kicker`, `title`, `layers[{name, items[], tag}]` |
| `process` | langkah berurutan (chevron, 3–6) | `kicker`, `title`, `steps[{tag, title, desc}]` |
| `table` | tabel ≤ 6 baris | `kicker`, `title`, `columns[]`, `rows[][]` (kolom pertama ditebalkan), `bar` (indeks kolom angka → bar mini) |
| `pillars` | deret 3–6 pilar berikon + strip foto | `kicker`, `title`, `items[{icon, title, desc}]`, `photos[id…]` (≤ 3, strip miring) |
| `showcase` | strip foto miring + panel daftar berikon | `kicker`, `title`, `photos[id…]` (3), `items[{icon, title, desc}]` (≤ 5) |
| `scene` | foto AI penuh + angka di panel kaca mengambang (gaya Genspark) | `kicker`, `title`, `subtitle`, `imagine` (deskripsi adegan) atau `hero`, `callouts[{icon, value, label, x, y, px, py}]` (≤ 4) |
| `infographic` | ilustrasi 3D AI + kartu penjelasan (gaya NotebookLM) | `kicker`, `title`, `items[{icon, value, title, desc}]` (3–4), `visual` (path; diisi otomatis oleh `--imagine`) |
| `number` | satu angka raksasa + konteks | `kicker`, `value`, `unit`, `title`, `text`, `items[{value, label}]` (≤ 4 angka pendukung) |
| `quote` | kutipan | `text`, `author`, `role` |
| `speaker` | profil pembicara | `kicker`, `name`, `role`, `photo`, `points[]` (default dari `speaker` akar) |
| `image` | foto penuh layar | `hero` (id pustaka) atau `image` (path), `kicker`, `title`, `caption` |
| `closing` | penutup | `kicker`, `title`, `subtitle`, `contact[]` |
| `html` | jalan terakhir — HTML bebas | `html` (pakai class yang ada; beri `data-t` pada teks agar ikut ke PPTX) |

## Aturan visual (wajib)
- **Setiap slide punya satu visual utama**: grafik, diagram, gambar hero, angka besar, atau ikon. Hindari slide yang isinya hanya teks.
- **Teks isi ≤ 40 kata per slide** (di luar judul). Kalau lebih, pecah slide atau pindahkan detail ke `notes`.
- Data → pilih grafik yang pas: tren `line`, perbandingan `bar` + `highlight`, peringkat/Pareto `hbar`, komposisi perubahan `waterfall`, porsi `donut`, satu angka penting `number`/`kpi`.
- Tutup slide data dengan `takeaway` (satu kalimat "jadi apa") dan isi `source` bila ada angka.

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
