#!/usr/bin/env bash
# IAS Deck Skill — installer satu perintah (macOS / Linux).
# Memasang skill ke Claude Code (~/.claude/skills) dan Codex (~/.codex/skills), font tema, dan memeriksa dependensi.
#   ./install.sh           IAS Deck + 3 skill bundel (html-ppt, frontend-slides, ppt-master)
#   ./install.sh --lite    IAS Deck saja
#   ./install.sh --no-fonts
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
LITE=0; FONTS=1
for a in "$@"; do case "$a" in --lite) LITE=1;; --no-fonts) FONTS=0;; *) echo "Opsi tidak dikenal: $a"; exit 1;; esac; done

ok()   { printf "  \033[32m✔\033[0m %s\n" "$1"; }
warn() { printf "  \033[33m⚠\033[0m %s\n" "$1"; }
step() { printf "\n\033[1m%s\033[0m\n" "$1"; }

step "1. Memeriksa dependensi"
command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 18 ] && ok "Node $(node -v)" || { warn "Node 18+ belum ada → pasang dari https://nodejs.org (atau: brew install node)"; exit 1; }
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || command -v google-chrome >/dev/null || command -v chromium >/dev/null && ok "Chrome ditemukan" || warn "Google Chrome belum ada → dibutuhkan untuk PDF/PPTX (https://google.com/chrome)"
if command -v python3 >/dev/null; then
  ok "$(python3 --version)"
  python3 -c "import pptx" 2>/dev/null && ok "python-pptx" || { python3 -m pip install --user --quiet python-pptx && ok "python-pptx dipasang" || warn "Gagal memasang python-pptx → jalankan: pip3 install --user python-pptx"; }
else warn "Python 3 belum ada → dibutuhkan untuk ekspor PPTX"; fi

install_skill() { # $1 = folder sumber, $2 = nama skill
  for base in "$HOME/.claude/skills" "$HOME/.codex/skills"; do
    mkdir -p "$base"; rm -rf "${base:?}/$2"; cp -R "$1" "$base/$2"
    find "$base/$2" -name ".git" -prune -exec rm -rf {} + 2>/dev/null || true
  done
  ok "$2 → ~/.claude/skills & ~/.codex/skills"
}

step "2. Memasang skill IAS Deck"
install_skill "$ROOT/skills/ias-deck" "ias-deck"

if [ "$LITE" -eq 0 ]; then
  step "3. Memasang skill bundel (MIT)"
  if [ -d "$ROOT/.git" ]; then git -C "$ROOT" submodule update --init --depth 1 --quiet 2>/dev/null || warn "Gagal mengambil submodule (cek internet)"; fi
  [ -f "$ROOT/vendor/html-ppt-skill/SKILL.md" ] && install_skill "$ROOT/vendor/html-ppt-skill" "html-ppt" || warn "vendor/html-ppt-skill kosong"
  [ -f "$ROOT/vendor/frontend-slides/SKILL.md" ] && install_skill "$ROOT/vendor/frontend-slides" "frontend-slides" || warn "vendor/frontend-slides kosong"
  if [ -f "$ROOT/vendor/ppt-master/skills/ppt-master/SKILL.md" ]; then
    install_skill "$ROOT/vendor/ppt-master/skills/ppt-master" "ppt-master"
    warn "ppt-master butuh paket Python tambahan saat pertama dipakai: pip3 install --user -r ~/.claude/skills/ppt-master/requirements.txt"
  else warn "vendor/ppt-master kosong"; fi
fi

if [ "$FONTS" -eq 1 ]; then
  step "4. Memasang font tema (Google Fonts, OFL)"
  node "$ROOT/skills/ias-deck/engine/install-fonts.mjs" || warn "Font gagal dipasang — PPTX tetap jalan dengan font pengganti"
fi

step "5. Menyiapkan Design Picker"
node "$ROOT/skills/ias-deck/engine/render.mjs" --picker --out "$ROOT/out" >/dev/null && ok "Design Picker → $ROOT/out/picker.html" || warn "Gagal membuat Design Picker"
command -v codex >/dev/null && ok "Codex terdeteksi — gambar per slide bisa dibuat (render.mjs --imagine)" || warn "Codex belum ada — fitur gambar per slide (--imagine) butuh: npm i -g @openai/codex && codex login"

step "Selesai."
cat <<EOF
  Buka sesi BARU Claude Code atau Codex, lalu ketik misalnya:
    "Buatkan deck 12 slide untuk Forum Kemenperin tentang lean digital factory, tema bp-classic"
  Pilih desain:    open "$ROOT/out/picker.html"
  Galeri tema:     node "$ROOT/skills/ias-deck/engine/render.mjs" --gallery --out "$ROOT/out" && open "$ROOT/out/gallery.html"
  Contoh deck:     node "$ROOT/skills/ias-deck/engine/render.mjs" "$ROOT/skills/ias-deck/examples/lean-kemenperin.json" --out "$ROOT/out" --all
EOF
