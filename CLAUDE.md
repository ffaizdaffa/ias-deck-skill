# IAS Deck Skill — catatan pengembangan

Skill presentasi futuristik untuk Pak Irfan (ayah Faiz, GM IT). Dipakai di Claude Code & Codex lewat `./install.sh`.
PRD: `docs/PRD.md`. Repo privat `ffaizdaffa/ias-deck-skill`.

## Arsitektur
- Deck = JSON → `engine/render.mjs` → HTML mandiri (CSS/JS/tema di-inline, font dari Google Fonts).
- PPTX: Chrome headless `?measure=1` mengukur setiap elemen `[data-t]` (posisi, font, warna, run) → `?export=N&bg=1` screenshot latar tanpa teks → `export_pptx.py` menaruh text box & chart asli di atas gambar latar. **Teks baru di layout WAJIB diberi `data-t`** agar ikut ke PPTX.
- Tema = data di `engine/themes.json`. Efek latar = `engine/fx.js` (deterministik dengan seed, sehingga screenshot stabil).

## Aturan
- Tambah/ubah tema → `node skills/ias-deck/engine/check-themes.mjs` harus lolos (kontras WCAG).
- Ubah layout/CSS → render `examples/lean-kemenperin.json --all`, `--check` harus bersih, lihat screenshot minimal 3 tema (gelap, terang, blueprint).
- Jangan salin skill berlisensi AGPL atau tanpa lisensi ke `vendor/`.
- Satu atribut `style` per elemen di template (pernah ada bug: `rv()` + `style` ganda membuat posisi node cycle hilang).
- `install.sh` diuji dengan `HOME=<folder sementara> ./install.sh` agar tidak mengubah home asli.

## Arah visual (8 Nov 2026, keputusan Faiz)
- **Cerah, bukan gelap.** Semua 40 tema `mode: light`: gradien aurora pastel, panel kaca putih, HUD tipis, tipografi display besar. Referensi: board Pinterest "PPT Template Futuristic" (zaners5), versi cerah.
- **Pustaka 100 gambar hero** di `skills/ias-deck/assets/heroes/` (render AI via Codex image generation, prompt di `tools/hero-prompts.txt`). Bangun ulang: `python3 tools/build_heroes.py <folder-png> tools/hero-prompts.txt`. Gaya prompt: bright high-key, white/pale + electric blue, subject kanan 60%, kiri 40% kosong, tanpa teks/logo.
- Pemilihan hero otomatis: tag kata kunci judul (ID→EN di `KW` render.mjs) + bonus kategori per layout + bonus per keluarga tema.
- Lembar pratinjau tema: `tools/theme_sheets.py`.
- Higgsfield tidak bisa dipakai (paket gratis, kredit 0).
