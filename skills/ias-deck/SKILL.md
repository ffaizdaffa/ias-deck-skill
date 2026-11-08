---
name: ias-deck
description: Bikin presentasi/deck/PPT/slide futuristik berkelas dunia bergaya CERAH (cinematic tech, panel kaca putih, HUD tipis, gradien aurora) — 40 tema (HUD, blueprint, digital twin, smart factory, data terminal, clean future), 100 gambar hero AI (manufaktur, AI, robotik, IT, Indonesia/Kemenperin) & 21 layout industri (KPI, value stream map, PDCA, TIMWOODS, roadmap, arsitektur, grafik). Keluaran HTML live beranimasi + PDF + PPTX yang bisa diedit. Pakai saat diminta "buat deck/PPT/slide/presentasi/materi pembicara/keynote", terutama topik lean manufacturing, industri 4.0, transformasi digital, IT.
---

# IAS Deck

Skill pembuat deck untuk pembicara teknologi & industri. Arah visual: **cerah, futuristik, sinematik** — latar putih/pucat dengan gradien aurora, panel kaca putih, garis HUD tipis, tipografi display besar, dan gambar hero render AI. Isi deck ditulis sebagai **satu file JSON**, lalu engine merender:
- **HTML live** — tampil di browser, animasi masuk, efek latar bergerak, presenter mode, ganti tema dengan tombol `T`.
- **PDF** — untuk dibagikan.
- **PPTX editable** — teks & grafik asli PowerPoint/Keynote; efek futuristik jadi gambar latar.

`SKILL_DIR` = folder tempat file ini berada. Engine ada di `SKILL_DIR/engine/`.

## Alur kerja (ikuti berurutan)

### 1. Pahami kebutuhan — maksimal 3 pertanyaan, satu kali tanya
Jika belum jelas dari permintaan, tanyakan sekaligus:
1. Topik, acara, dan audiens (mis. "Forum Kemenperin, 200 pelaku industri").
2. Durasi bicara → jumlah slide (≈ 1 slide per 1–2 menit).
3. Tema/nuansa (atau "pilihkan") dan logo yang dipakai (path file).
Kalau user sudah memberi cukup info, **jangan bertanya** — langsung kerjakan.

### 2. Susun alur cerita dulu (tampilkan ke user dalam 1 tabel singkat)
Baca `references/storytelling.md`. Aturan inti:
- **Judul slide = kesimpulan**, bukan topik ("OEE naik 18% dalam 6 bulan", bukan "Data OEE").
- Satu slide satu gagasan; maksimal 5 poin; kalimat pendek.
- Struktur keynote: pembuka kuat → masalah → kerangka/konsep → bukti/studi kasus → cara mulai/roadmap → ajakan.
- **Jangan mengarang angka.** Pakai angka dari user. Jika belum ada, tulis contoh dan beri label "(data ilustrasi)" di kicker + catatan pembicara "ganti dengan data asli".
- Isi `notes` (catatan pembicara) di setiap slide penting.

### 3. Pilih tema & gambar hero
Lihat `references/themes.md` (40 tema cerah, 6 keluarga, rekomendasi per acara). Default yang aman:
- Forum resmi kementerian/board → `clean-nusantara` (navy-hijau, gaya poster Kemenperin), `clean-merahputih`, `clean-porcelain`, `hud-arctic`.
- Keynote teknologi/IT/AI → `hud-cobalt`, `hud-ion`, `twin-hologram`, `term-mainframe`.
- Materi shop-floor/lean/kaizen → `bp-classic`, `fac-safety`, `fac-andon`.

**Gambar hero** (`references/heroes.md`, galeri `assets/heroes/index.html`): slide `cover`, `section`, `closing` otomatis diberi gambar yang cocok dengan kata kunci judul. Untuk hasil terbaik, pilih sendiri: `"heroes": ["mfg-digital-twin", "lean-kaizen", ...]` di akar deck (dipakai berurutan) atau `"hero": "<id>"` per slide; `"hero": false` untuk mematikan. Layout `split` dan `image` juga menerima `"hero": "<id>"`.
**Jika kamu punya tool pembuat gambar** (mis. Codex image generation), boleh buat 1–3 gambar khusus topik dengan gaya yang sama: *bright high-key, white/pale with electric-blue accents, premium futuristic, subject in right 60%, left 40% empty bright space, no text/logos* — simpan di folder deck lalu isi `"hero": "nama-file.png"`.
Galeri visual tema: `node SKILL_DIR/engine/render.mjs --gallery --out ./out` lalu buka `out/gallery.html`.

### 4. Tulis file deck JSON
Simpan di folder kerja user, mis. `./deck/<nama-acara>.json`. Skema & semua layout: `references/layouts.md`. Contoh lengkap: `SKILL_DIR/examples/lean-kemenperin.json` (22 slide, keynote lean) dan `SKILL_DIR/examples/forum-industri-nasional.json` (7 slide gaya poster Kemenperin: kolase, deret ikon, band, pita).
- `**teks**` = sorotan warna aksen. `\n` = baris baru.
- Logo/foto: path relatif terhadap file JSON (otomatis ditanam ke HTML).
- Variasikan layout — jangan 5 slide `bullets` berturut-turut.
- **Banyak visual, sedikit teks**: setiap slide wajib punya visual utama (grafik, diagram, hero, angka besar, ikon) dan teks isi ≤ 40 kata. Slide data ditutup `takeaway` satu kalimat + `source`. Ikon: `references/icons.md`. Detail aturan: bagian "Aturan visual" di `references/layouts.md`.

### 5. Render
```bash
node SKILL_DIR/engine/render.mjs ./deck/acara.json --out ./out --all     # HTML + PDF + PPTX + cek overflow
node SKILL_DIR/engine/render.mjs ./deck/acara.json --out ./out           # HTML saja (cepat, untuk iterasi)
node SKILL_DIR/engine/render.mjs ./deck/acara.json --check               # cek teks yang meluber
node SKILL_DIR/engine/render.mjs ./deck/acara.json --theme bp-classic    # coba tema lain tanpa ubah JSON
node SKILL_DIR/engine/render.mjs --list                                  # daftar tema & layout
```
Butuh: Node 18+, Google Chrome, Python 3 + `python-pptx` (untuk PPTX), internet (font Google).

### 6. Verifikasi sebelum lapor selesai
- Jalankan `--check`. Jika ada peringatan **overflow**, persingkat teks / pecah slide, render ulang.
- Lihat hasilnya: buat screenshot beberapa slide, lalu periksa secara visual:
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1920,1080 --virtual-time-budget=6000 --screenshot=out/s3.png "file://$PWD/out/acara.html?export=3"`
- Pastikan tidak ada teks terpotong, tumpang tindih, atau kontras buruk.

### 7. Serahkan
Nama file keluaran mengikuti nama JSON (`deck/acara.json` → `out/acara.html|pdf|pptx`). Beri path file + cara pakai singkat:
- Buka `out/<nama>.html` di Chrome → `F` layar penuh, `→/←` pindah, `P` presenter mode (catatan + timer), `G` ikhtisar, `T` ganti tema, `B` layar gelap.
- `out/<nama>.pptx` untuk panitia / edit di PowerPoint/Keynote. Untuk tampilan font yang sama persis, font tema perlu terpasang (`install.sh` sudah memasangnya).

## Aturan desain (jangan dilanggar)
- Hanya pakai tema dari `themes.json`. Warna merek → `brand.accent` (satu warna aksen), bukan ganti seluruh palet.
- Jangan tambah gradien ungu generik, emoji dekoratif, atau clip-art.
- Teks isi minimal setara 24px di kanvas 1920 — engine sudah mengatur; jangan menjejalkan teks.
- Layout `html` (HTML bebas) hanya jalan terakhir; tetap pakai class & atribut `data-t` agar bisa diekspor.
- Menambah tema baru: tambah satu entri di `engine/themes.json`, lalu jalankan `node engine/check-themes.mjs` (uji kontras).

## Alternatif (skill bundel, lisensi MIT)
Jika user minta gaya di luar IAS Deck, folder `vendor/` di repo berisi: `html-ppt-skill` (36 tema HTML), `frontend-slides` (deck HTML gaya bebas), `ppt-master` (PPTX native dari dokumen). Lihat README repo.
