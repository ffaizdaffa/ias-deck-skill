# 40 Tema IAS Deck (semua cerah)

Pilih dengan `"theme": "<id>"` di deck JSON, atau coba langsung dengan tombol `T` saat deck tampil. Galeri visual: `node engine/render.mjs --gallery`.

Semua tema lolos uji kontras WCAG (teks ≥ 7:1, teks sekunder ≥ 4,5:1, aksen ≥ 3:1) — `node engine/check-themes.mjs`.

## HUD / Command Center
antarmuka kokpit versi terang: garis bidik, cincin orbit, panel kaca putih; cocok untuk keynote transformasi digital. **Cocok untuk:** Keynote teknologi, peluncuran sistem, transformasi digital.

| id | nama | efek | font judul | aksen |
|---|---|---|---|---|
| `hud-cobalt` | Cobalt Command | orbit | Chakra Petch | #1F5BFF / #00B8D9 |
| `hud-amber` | Amber Ops | scan | Rajdhani | #C2410C / #1F6FEB |
| `hud-cyan` | Cyan Bridge | network | Oxanium | #007C91 / #7CC000 |
| `hud-crimson` | Red Alert | hex | Saira Condensed | #D7193E / #1E3A8A |
| `hud-emerald` | Emerald Ops | grid | Exo 2 | #0A8F5B / #0E7AE6 |
| `hud-ion` | Ion Drive | orbit | Chakra Petch | #6D3BF5 / #E8318C |
| `hud-arctic` | Arctic HUD | orbit | Chakra Petch | #0061F2 / #E8501A |

## Blueprint / Engineering
gambar teknik di kertas terang, garis ukur, presisi; cocok untuk materi proses & lean. **Cocok untuk:** Materi proses, lean, standar kerja, engineering.

| id | nama | efek | font judul | aksen |
|---|---|---|---|---|
| `bp-classic` | Classic Blueprint | blueprint | Archivo Narrow | #0B5CD6 / #E8501A |
| `bp-midnight` | Ink Draft | blueprint | Archivo Narrow | #2346A8 / #D97706 |
| `bp-paper` | Drafting Paper | blueprint | Archivo Narrow | #1F4FD8 / #D9481F |
| `bp-cad` | CAD White | blueprint | IBM Plex Sans Condensed | #0077B6 / #C77D00 |
| `bp-patent` | Patent Office | blueprint | Barlow Condensed | #8B2E16 / #2E5E8B |
| `bp-graphite` | Graphite Spec | blueprint | IBM Plex Sans Condensed | #D9480F / #2F6FD8 |

## Digital Twin
wireframe 3D, mesh, isometrik di ruang putih; cocok untuk IoT, simulasi, smart factory. **Cocok untuk:** IoT, simulasi, smart factory, AI.

| id | nama | efek | font judul | aksen |
|---|---|---|---|---|
| `twin-wireframe` | Wireframe Twin | terrain | Space Grotesk | #3F8F00 / #0091B8 |
| `twin-iso` | Isometric Plant | iso | Sora | #C25E00 / #1F6FEB |
| `twin-mesh` | Neural Mesh | network | Red Hat Display | #00875A / #E2553A |
| `twin-hologram` | Hologram | terrain | Space Grotesk | #0086C9 / #D9268C |
| `twin-titanium` | Titanium Twin | iso | Space Grotesk | #5B5BD6 / #00A3A3 |
| `twin-ice` | Ice Twin | terrain | Sora | #0077D9 / #00936F |
| `twin-ember` | Ember Twin | terrain | Sora | #D2570A / #B8860B |

## Smart Factory
warna industri (safety, andon, baja) di pabrik terang; cocok untuk shop-floor, kaizen, OEE. **Cocok untuk:** Shop-floor, kaizen, OEE, safety.

| id | nama | efek | font judul | aksen |
|---|---|---|---|---|
| `fac-safety` | Safety Yellow | hex | Barlow Condensed | #A16207 / #FFC400 |
| `fac-neon` | Industrial Lime | circuit | Tomorrow | #15803D / #0284C7 |
| `fac-steel` | Steel Works | iso | Bai Jamjuree | #E0601A / #2F6FD8 |
| `fac-andon` | Andon Board | grid | Unbounded | #DC2626 / #16A34A |
| `fac-copper` | Copper Line | circuit | Saira Condensed | #B45309 / #0F766E |
| `fac-cleanroom` | Cleanroom | hex | Bai Jamjuree | #008C8C / #E85D00 |
| `fac-kanban` | Kanban Blue | grid | Tomorrow | #2563EB / #F59E0B |

## Data Terminal
layar monospace bergaya cetakan & dashboard terang; cocok untuk data, AI, sistem IT. **Cocok untuk:** Data, AI, cybersecurity, sistem IT.

| id | nama | efek | font judul | aksen |
|---|---|---|---|---|
| `term-phosphor` | Green Ink | rain | Share Tech Mono | #15803D / #7C3AED |
| `term-amber` | Amber Print | scan | IBM Plex Mono | #B45309 / #2563EB |
| `term-mainframe` | Mainframe | dots | IBM Plex Mono | #3056D3 / #0E9F6E |
| `term-solar` | Solar Ops | rain | JetBrains Mono | #9A7400 / #268BD2 |
| `term-printout` | Printout | dots | Space Mono | #0042EB / #E03800 |
| `term-void` | Signal Lab | rain | Azeret Mono | #0F9D6E / #E11D74 |

## Clean Future
elegan, lega, gradien aurora pastel; cocok untuk forum resmi kementerian & board. **Cocok untuk:** Forum resmi, kementerian, board, audiens umum.

| id | nama | efek | font judul | aksen |
|---|---|---|---|---|
| `clean-swiss` | Swiss Tech | dots | Archivo | #E63500 / #1D4ED8 |
| `clean-graphite` | Graphite Lime | flow | Syne | #4D7C0F / #4F46E5 |
| `clean-ocean` | Ocean Light | flow | Sora | #0E8C80 / #E0623A |
| `clean-aurora` | Aurora | flow | Geist | #4F46E5 / #0EA5A4 |
| `clean-porcelain` | Porcelain | flow | Michroma | #1D4ED8 / #D35A3C |
| `clean-desert` | Desert Lab | dots | Space Grotesk | #B93C0A / #0F766E |
| `clean-merahputih` | Merah Putih Tech | flow | Sora | #D7141A / #1F2937 |

## Rekomendasi cepat
- **Kemenperin / forum resmi:** `clean-merahputih`, `clean-porcelain`, `clean-swiss`, `hud-arctic`
- **Keynote IT/AI paling futuristik:** `hud-cobalt`, `hud-ion`, `twin-hologram`, `hud-cyan`
- **Lean / shop-floor:** `bp-classic`, `fac-safety`, `fac-andon`, `bp-graphite`
- **Data & AI:** `term-mainframe`, `twin-mesh`, `term-void`
- **Warna merek perusahaan:** pilih tema yang aksennya mendekati, lalu set `brand.accent`.
