# IAS Deck Skill

**Skill pembuat presentasi futuristik bergaya cerah untuk Claude Code & Codex.**
Cukup minta dalam bahasa biasa — *"buatkan deck 12 slide untuk Forum Kemenperin tentang lean digital factory"* — dan AI akan menyusun alur cerita, memilih layout, lalu menghasilkan:

| Keluaran | Untuk apa |
|---|---|
| **HTML live** | Tampil di panggung: animasi masuk, efek latar bergerak (HUD, blueprint, wireframe 3D, sirkuit…), presenter mode dengan catatan & timer, ganti tema seketika dengan tombol `T` |
| **PDF** | Dibagikan ke peserta |
| **PPTX** | Dikirim ke panitia / diedit di PowerPoint atau Keynote — teks & grafik asli, efek futuristik ikut sebagai latar |

- **Gaya cinematic tech yang cerah**: latar putih/pucat dengan gradien aurora, panel kaca putih, garis HUD tipis, tipografi display besar
- **41 tema** dalam 6 keluarga: HUD / Command Center · Blueprint / Engineering · Digital Twin · Smart Factory · Data Terminal · Clean Future
- **100 gambar hero render AI** (manufaktur, Industri 4.0, AI, robotik, IT, lean, Indonesia/Kemenperin, latar 3D abstrak), dipilih otomatis sesuai judul slide. Galeri: `skills/ias-deck/assets/heroes/index.html`
- **25 layout** khusus materi industri (termasuk waterfall/bridge, Pareto, angka raksasa, deret pilar berikon, kolase foto gaya poster Kemenperin)
- **102 ikon** (Lucide), dipasang otomatis sesuai kata kunci di kartu, poin, agenda, proses, roadmap
- **Design Picker**: satu halaman untuk klik tema + gambar, lalu salin pilihan ke chat AI
- **Gambar AI khusus per slide** lewat GPT Image (Codex, login akun ChatGPT): `render.mjs deck.json --imagine`
- **Slide gaya Genspark & NotebookLM yang tetap editable**: `scene` (foto AI + angka di panel kaca mengambang) dan `infographic` (ilustrasi 3D AI + kartu penjelasan)
- **Review visual otomatis**: `--review` membuat lembar pratinjau semua slide + rubrik penilaian, AI memperbaiki slide yang lemah
- Angka penting otomatis tampil besar, slide pernyataan/kutipan/agenda otomatis diberi panel foto (tidak ada ruang kosong)
- Pola dari referensi: kesimpulan per slide, sumber data, panel insight berangka besar, pita sorotan `==frasa==`
- Layout dasar: KPI, value stream map, siklus PDCA, 8 waste (TIMWOODS), sebelum–sesudah, roadmap, arsitektur berlapis, grafik, tabel, dan lainnya
- Semua tema lolos uji kontras WCAG, sehingga tetap terbaca di proyektor ruangan besar
- Logo & warna aksen bisa diganti per acara (Astra, Kemenperin, pribadi)

## Contoh hasil desain

**Sampul — gambar hero AI + HUD tipis**
![Sampul lean](docs/showcase/01-sampul-lean.jpg)

**Sampul gaya poster Kemenperin — kolase foto, deret ikon, band navy, pita sorotan**
![Sampul gaya Kemenperin](docs/showcase/02-sampul-gaya-kemenperin.jpg)

**Visualisasi data — KPI berikon, waterfall/bridge, Pareto, angka raksasa, panel insight, sebelum–sesudah**
![Visualisasi data](docs/showcase/03-visualisasi-data.jpg)

**Gaya poster — pilar berikon, strip foto miring, panel daftar, waterfall**
![Gaya poster](docs/showcase/04-gaya-poster-kemenperin.jpg)

**Tanpa ruang kosong — panel foto otomatis, proses berikon, penutup**
![Tanpa ruang kosong](docs/showcase/05-tanpa-ruang-kosong.jpg)

**Gambar AI khusus per slide (GPT Image via Codex) — termasuk slide `infographic` dan `scene` gaya Genspark**
![Gambar AI per slide](docs/showcase/06-gambar-ai-per-slide.jpg)

**Design Picker — klik tema + gambar, salin ke chat**
![Design Picker](docs/showcase/07-design-picker.jpg)

<details><summary><b>Semua tema cerah</b></summary>

![Tema](docs/showcase/08-tema-cerah.jpg)
</details>

<details><summary><b>100 gambar hero</b></summary>

![Gambar hero](docs/showcase/09-100-gambar-hero.jpg)
</details>

---

## 1. Pasang (sekali saja, ±3 menit)

Butuh: Mac dengan **Google Chrome**, **Node.js 18+** (`brew install node`), **Python 3**, dan akses ke repo ini.

```bash
git clone --recurse-submodules https://github.com/ffaizdaffa/ias-deck-skill.git
cd ias-deck-skill
./install.sh
```

Installer akan:
1. memeriksa Node, Chrome, Python, lalu memasang `python-pptx`;
2. menyalin skill `ias-deck` ke `~/.claude/skills/` **dan** `~/.codex/skills/`;
3. memasang 3 skill bundel (lihat bagian 5);
4. memasang 31 keluarga font tema (Google Fonts) agar PPTX tampil persis.

Opsi: `./install.sh --lite` (IAS Deck saja) · `./install.sh --no-fonts`.
**Update:** `git pull --recurse-submodules && ./install.sh`

## 2. Pakai

**Alur yang disarankan:**
1. Buka `out/picker.html` (dibuat oleh installer), klik **1 tema** dan beberapa **gambar**, tekan **Salin pilihan**.
2. Buka sesi **baru** Claude Code atau Codex, tempel pilihan tadi, lalu tulis permintaan. Kalau tema belum dipilih, AI akan membuka Design Picker dulu.
3. Opsional: minta *"buatkan gambar AI khusus tiap slide"* — AI menjalankan `--imagine` (butuh `codex login` dengan akun ChatGPT, ±1 menit per gambar).

Contoh permintaan:

> Buatkan deck 15 slide untuk keynote 25 menit di Forum Industri 4.0 Kemenperin. Topik: lean manufacturing ketemu digital — OEE, SMED, value stream, roadmap 18 bulan. Pembicara Irfan A. Shidiq, GM IT. Tema bp-classic, logo di ./logo.png.

AI akan menampilkan alur cerita, menulis file `deck/*.json`, merender, mengecek teks yang meluber, lalu memberikan path filenya.

Revisi cukup lewat chat: *"slide 5 jadi value stream map"*, *"ganti ke tema clean-merahputih"*, *"tambah slide sebelum–sesudah changeover"*.

### Tombol saat presentasi (buka file `.html` di Chrome)
| Tombol | Fungsi |
|---|---|
| `F` | layar penuh |
| `→` `←` / klik kanan–kiri | pindah slide |
| `P` | **presenter mode** di jendela kedua: slide sekarang & berikutnya, catatan, timer |
| `G` / `Esc` | ikhtisar semua slide |
| `T` / `Shift+T` | ganti tema (coba 40 tema secara langsung) |
| `B` | layar gelap |
| `?` | bantuan |

## 3. Galeri tema

```bash
node skills/ias-deck/engine/render.mjs --gallery --out out && open out/gallery.html
```
Daftar lengkap & rekomendasi per jenis acara: [`skills/ias-deck/references/themes.md`](skills/ias-deck/references/themes.md).

Rekomendasi cepat: forum resmi Kemenperin → `clean-merahputih`, `clean-porcelain`, `hud-arctic` · keynote IT/AI → `hud-cobalt`, `hud-ion`, `twin-hologram` · lean/shop-floor → `bp-classic`, `fac-safety`.

Gambar hero: buka `skills/ias-deck/assets/heroes/index.html`, lalu sebut id-nya ke AI (mis. *"sampul pakai mfg-digital-twin"*).

## 4. Pakai manual (tanpa AI)

```bash
E=skills/ias-deck/engine
node $E/render.mjs skills/ias-deck/examples/lean-kemenperin.json --out out --all   # HTML + PDF + PPTX
node $E/render.mjs deck.json --theme hud-arctic                                     # coba tema lain
node $E/render.mjs deck.json --check                                                # cek teks meluber
node $E/render.mjs --list                                                           # daftar tema & layout
node $E/check-themes.mjs                                                            # uji kontras 40 tema
```
Format deck: [`skills/ias-deck/references/layouts.md`](skills/ias-deck/references/layouts.md).

## 5. Skill bundel (lisensi MIT, dari komunitas)

Terpasang otomatis sebagai alternatif kalau ingin gaya lain. Bisa dipanggil langsung di Claude/Codex.

| Skill | Sumber | Kelebihan |
|---|---|---|
| `html-ppt` | [lewislulu/html-ppt-skill](https://github.com/lewislulu/html-ppt-skill) | 36 tema HTML, 47 animasi, presenter mode |
| `frontend-slides` | [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) | Deck HTML gaya bebas dari kemampuan frontend AI |
| `ppt-master` | [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | PPTX native dari dokumen/PDF, animasi & grafik asli (butuh `pip3 install -r ~/.claude/skills/ppt-master/requirements.txt`) |

Disimpan sebagai git submodule di `vendor/` dengan lisensi aslinya masing-masing. Skill AGPL ([guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill), [dashi-ppt-skill](https://github.com/chuspeeism/dashi-ppt-skill)) dan yang tanpa lisensi tidak disertakan, hanya ditautkan di sini.

## 6. Struktur

```
skills/ias-deck/
  SKILL.md                 instruksi untuk Claude/Codex
  references/              tema, layout, panduan cerita
  examples/                contoh deck lean (18 slide)
  assets/heroes/           100 gambar hero + heroes.json (tag) + index.html (galeri)
  engine/
    themes.json            40 tema cerah (warna, font, efek, gaya kartu)
    layouts.mjs            21 layout
    deck.css / deck.js     tampilan & runtime (navigasi, presenter, animasi)
    fx.js                  12 efek latar canvas
    render.mjs             JSON → HTML/PDF/PPTX, galeri, cek overflow
    export_pptx.py         PPTX editable (python-pptx)
    check-themes.mjs       uji kontras & kelengkapan tema
    install-fonts.mjs      pemasang font
vendor/                    3 skill MIT (submodule)
tools/build_heroes.py      membangun ulang pustaka hero dari PNG hasil generate
install.sh
```

## Masalah umum
- **Font di PPTX berbeda** → jalankan ulang `node skills/ias-deck/engine/install-fonts.mjs`, lalu tutup dan buka lagi PowerPoint/Keynote.
- **"Chrome tidak ditemukan"** → pasang Google Chrome, atau set `CHROME=/path/ke/chrome`.
- **Font tidak muncul di HTML** → HTML memuat font dari Google Fonts, jadi butuh internet. Kalau tampil offline, font yang sudah terpasang lewat installer tetap dipakai.
- **Skill tidak terdeteksi** → pastikan memulai sesi Claude/Codex *baru* setelah install.
