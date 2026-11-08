# PRD — IAS Deck Skill (skill desain presentasi futuristik)

Versi 0.1 · 8 Nov 2026 · Pemilik: Faiz · Pengguna: Irfan (ayah Faiz, GM IT)

## 1. Masalah
Ayah Faiz sering menjadi pembicara (Kemenperin, topik lean manufacturing, industri 4.0, transformasi digital). Ia ingin deck yang terlihat canggih dan futuristik, tetapi tool AI yang ada menghasilkan desain generik, dan menyusunnya manual makan waktu. Ia memakai Claude Code dan Codex di Mac.

## 2. Pengguna & keputusan yang dibantu
- **Pengguna utama:** satu orang, paham teknologi, bukan desainer.
- **Kebutuhan:** dari topik atau outline sampai menjadi deck siap tampil dalam satu sesi chat, dengan tema yang bisa dipilih.

## 3. Hasil yang diharapkan (MVP)
1. **Satu skill utama `ias-deck`** (format SKILL.md, jalan di Claude Code dan Codex).
2. **Deck sebagai data:** satu file `deck.json` (atau Markdown terstruktur) menghasilkan dua keluaran:
   - **HTML live:** layar 16:9, navigasi keyboard, presenter mode (catatan pembicara dan timer), animasi masuk, efek latar canvas, ekspor PDF.
   - **PPTX yang bisa diedit:** teks, bentuk, dan grafik asli PowerPoint (python-pptx). Efek latar futuristik di-render sebagai gambar latar, teks tetap bisa diedit.
3. **40 tema futuristik** dalam 6 keluarga, semuanya terkurasi (palet, pasangan font, efek, gaya kartu):
   - HUD / Command Center · Blueprint / Engineering · Digital Twin / Wireframe 3D · Smart Factory / Industrial Neon · Data Terminal / Mono · Clean Future (terang, gaya Swiss-tech untuk forum formal).
4. **Layout yang relevan untuk materi industri (±20):** cover, agenda, section break, big number/KPI, before–after, value stream map, diagram siklus PDCA, 8 waste (TIMWOODS), roadmap/timeline, perbandingan, kutipan, grafik (bar/line/donut), arsitektur sistem, tim/pembicara, penutup/kontak.
5. **Galeri tema:** satu halaman HTML yang menampilkan pratinjau ke-40 tema, untuk memilih tema.
6. **Branding netral dengan slot logo:** logo dan warna aksen diganti per acara (Astra, Kemenperin, pribadi) lewat `brand` di deck.json. Tidak ada aset merek yang dikarang.
7. **Bundel 3 skill MIT** (html-ppt-skill, frontend-slides, ppt-master) sebagai git submodule dengan atribusi, sebagai alternatif.
8. **Installer satu perintah** (`./install.sh`): memasang skill ke `~/.claude/skills` dan `~/.codex/skills`, lalu memeriksa Python, python-pptx, dan Chrome.

## 4. Bukan cakupan (non-goals)
- Skill AGPL (guizang, dashi) dan skill tanpa lisensi (NanoBanana) tidak disalin, hanya ditautkan di README.
- Pembuatan gambar AI atau video.
- Template resmi Astra atau Kemenperin (menunggu aset asli dari pemiliknya).
- Hosting web; semuanya berjalan lokal.

## 5. Keputusan teknis
- **Stack:** HTML/CSS/JS tanpa dependensi (satu file per deck, offline). Renderer PPTX: Python 3 + python-pptx. Render latar dan PDF: Chrome headless.
- **Tema = data:** `themes/themes.json` (token warna, font, efek, radius, grid) → CSS. Menambah tema berarti menambah satu entri JSON.
- **Font:** Google Fonts dengan fallback lokal. Inter, Roboto, dan gradien ungu generik dilarang.
- **Repo:** `ffaizdaffa/ias-deck-skill`, **privat**. Ayah diundang sebagai collaborator setelah username GitHub-nya diketahui.
- **Auth/deploy:** tidak ada (tool lokal).

## 6. Kriteria penerimaan
- Diberi `examples/lean-kemenperin.json`, ketika `node render.mjs` dijalankan, maka `out/deck.html` terbuka tanpa error di konsol dan semua slide tampil 16:9 tanpa overflow.
- Ketika `python3 export_pptx.py` dijalankan, `out/deck.pptx` terbuka di Keynote/PowerPoint dan judul serta isi slide bisa diedit.
- Galeri menampilkan 40 tema; setiap tema lolos uji kontras teks (WCAG AA ≥ 4.5:1 untuk teks isi).
- `./install.sh` di Mac memasang skill ke dua lokasi. Di sesi Claude Code baru, perintah "buat deck lean manufacturing 10 slide tema blueprint" menghasilkan deck.
- Repo privat ter-push dan README menjelaskan cara pakai dalam bahasa Indonesia.

## 7. Risiko
- 40 tema bisa terasa mirip → setiap keluarga punya efek latar dan tipografi yang benar-benar berbeda, dan galeri dicek visual.
- Efek canvas tidak ikut ke PPTX → di-render jadi gambar latar statis (sudah diterima).
- Submodule ppt-master berukuran besar (±140 MB) → diklon `--depth 1` dan opsional saat install.

## 8. Daftar uji (urutan build)
1. Engine HTML + 3 tema + 6 layout + contoh deck → screenshot.
2. Lengkapi 20 layout + presenter mode + ekspor PDF.
3. Exporter PPTX + latar ter-render.
4. Perluas ke 40 tema + galeri + cek kontras.
5. SKILL.md (alur intake → outline → pilih tema → render) + AGENTS.md untuk Codex.
6. Submodule MIT + installer + README.
7. Uji end-to-end, lalu push repo privat.
