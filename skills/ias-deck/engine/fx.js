/* IAS Deck — efek latar (canvas). Setiap efek: factory(w,h,c,rnd) -> { draw(ctx,t) }.
   c = { a: accent, b: accent2, f: fg, light: bool }. t dalam detik. Deterministik via rnd (seeded). */
(function () {
  const rgba = (hex, a) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  const K = (c, base) => (c.light ? base * 0.75 : base); // alpha sedikit lebih rendah di tema terang

  const FX = {
    none: () => ({ draw() {} }),

    grid(w, h, c) {
      return { draw(x, t) {
        const hy = h * 0.6, vx = w * 0.5;
        const g = x.createLinearGradient(0, hy, 0, h);
        g.addColorStop(0, rgba(c.a, 0)); g.addColorStop(1, rgba(c.a, K(c, 0.32)));
        x.strokeStyle = g; x.lineWidth = 1.2;
        for (let i = -24; i <= 24; i++) { x.beginPath(); x.moveTo(vx + i * 14, hy); x.lineTo(vx + i * 170, h); x.stroke(); }
        const sp = (t * 0.25) % 1;
        for (let i = 0; i < 18; i++) {
          const k = (i + sp) / 18, y = hy + (h - hy) * k * k;
          x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke();
        }
        const glow = x.createRadialGradient(vx, hy, 0, vx, hy, w * 0.45);
        glow.addColorStop(0, rgba(c.a, K(c, 0.16))); glow.addColorStop(1, rgba(c.a, 0));
        x.fillStyle = glow; x.fillRect(0, hy - h * 0.3, w, h * 0.6);
      } };
    },

    network(w, h, c, r) {
      const P = Array.from({ length: 78 }, () => ({ x: r() * w, y: r() * h, vx: (r() - 0.5) * 14, vy: (r() - 0.5) * 14 }));
      return { draw(x, t) {
        const pts = P.map(p => ({ x: (p.x + p.vx * t + w * 4) % w, y: (p.y + p.vy * t + h * 4) % h }));
        x.lineWidth = 1;
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
          if (d < 190) { x.strokeStyle = rgba(c.a, K(c, 0.22) * (1 - d / 190)); x.beginPath(); x.moveTo(pts[i].x, pts[i].y); x.lineTo(pts[j].x, pts[j].y); x.stroke(); }
        }
        pts.forEach((p, i) => { x.fillStyle = rgba(i % 7 ? c.a : c.b, K(c, 0.55)); x.beginPath(); x.arc(p.x, p.y, i % 7 ? 2 : 3, 0, 7); x.fill(); });
      } };
    },

    blueprint(w, h, c, r) {
      const marks = Array.from({ length: 5 }, () => ({ x: 200 + r() * (w - 400), y: 150 + r() * (h - 300), s: 40 + r() * 60 }));
      return { draw(x, t) {
        const line = c.light ? c.a : c.f;
        x.lineWidth = 1;
        for (let gx = 0; gx <= w; gx += 24) { x.strokeStyle = rgba(line, gx % 120 ? K(c, 0.06) : K(c, 0.14)); x.beginPath(); x.moveTo(gx + 0.5, 0); x.lineTo(gx + 0.5, h); x.stroke(); }
        for (let gy = 0; gy <= h; gy += 24) { x.strokeStyle = rgba(line, gy % 120 ? K(c, 0.06) : K(c, 0.14)); x.beginPath(); x.moveTo(0, gy + 0.5); x.lineTo(w, gy + 0.5); x.stroke(); }
        x.strokeStyle = rgba(line, K(c, 0.3)); x.fillStyle = rgba(line, K(c, 0.4)); x.font = '13px monospace';
        marks.forEach((m, i) => {
          x.beginPath(); x.arc(m.x, m.y, m.s, 0, 7); x.stroke();
          x.setLineDash([6, 6]); x.lineDashOffset = -t * 12 * (i % 2 ? 1 : -1);
          x.beginPath(); x.arc(m.x, m.y, m.s * 1.5, 0, 7); x.stroke(); x.setLineDash([]);
          x.beginPath(); x.moveTo(m.x - m.s * 1.9, m.y); x.lineTo(m.x + m.s * 1.9, m.y); x.moveTo(m.x, m.y - m.s * 1.9); x.lineTo(m.x, m.y + m.s * 1.9); x.stroke();
          x.fillText(`Ø${Math.round(m.s * 2)}`, m.x + m.s + 8, m.y - 8);
        });
        const y = h - 70; x.beginPath(); x.moveTo(120, y); x.lineTo(w - 120, y);
        for (let i = 0; i <= 10; i++) { const px = 120 + (w - 240) * i / 10; x.moveTo(px, y - (i % 5 ? 6 : 14)); x.lineTo(px, y + (i % 5 ? 6 : 14)); }
        x.stroke();
      } };
    },

    scan(w, h, c, r) {
      const blips = Array.from({ length: 9 }, () => ({ a: r() * 6.283, d: 0.25 + r() * 0.7 }));
      return { draw(x, t) {
        x.fillStyle = rgba(c.f, K(c, 0.035));
        for (let y = 0; y < h; y += 4) x.fillRect(0, y, w, 1);
        const cx = w * 0.79, cy = h * 0.54, R = 400, a = (t * 0.9) % 6.283;
        x.strokeStyle = rgba(c.a, K(c, 0.25)); x.lineWidth = 1;
        for (let i = 1; i <= 4; i++) { x.beginPath(); x.arc(cx, cy, R * i / 4, 0, 7); x.stroke(); }
        x.beginPath(); x.moveTo(cx - R, cy); x.lineTo(cx + R, cy); x.moveTo(cx, cy - R); x.lineTo(cx, cy + R); x.stroke();
        for (let i = 0; i < 40; i++) {
          x.fillStyle = rgba(c.a, K(c, 0.14) * (1 - i / 40));
          x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R, a - i * 0.02 - 0.02, a - i * 0.02); x.fill();
        }
        blips.forEach(b => {
          const age = ((a - b.a) % 6.283 + 6.283) % 6.283, alpha = Math.max(0, 1 - age / 3);
          x.fillStyle = rgba(c.b, K(c, 0.9) * alpha);
          x.beginPath(); x.arc(cx + Math.cos(b.a) * R * b.d, cy + Math.sin(b.a) * R * b.d, 5, 0, 7); x.fill();
        });
      } };
    },

    terrain(w, h, c) {
      const cols = 46, rows = 26;
      return { draw(x, t) {
        const P = [];
        for (let j = 0; j < rows; j++) { const row = []; for (let i = 0; i < cols; i++) {
          const u = i / (cols - 1) * 2 - 1, z = j / (rows - 1);
          const y = Math.sin(u * 3 + t * 0.6) * 0.18 + Math.sin(z * 6 - t * 0.8 + u * 2) * 0.14 + Math.cos(u * 7 + z * 4) * 0.05;
          const s = 1 / (0.35 + z * 1.6);
          row.push([w / 2 + u * w * 0.95 * s, h * 0.5 + (0.55 - y) * h * 0.55 * s]);
        } P.push(row); }
        x.lineWidth = 1;
        for (let j = 0; j < rows; j++) { x.strokeStyle = rgba(c.a, K(c, 0.32) * (1 - j / rows)); x.beginPath(); P[j].forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); }
        for (let i = 0; i < cols; i += 2) { x.strokeStyle = rgba(c.a, K(c, 0.16)); x.beginPath(); for (let j = 0; j < rows; j++) j ? x.lineTo(P[j][i][0], P[j][i][1]) : x.moveTo(P[j][i][0], P[j][i][1]); x.stroke(); }
      } };
    },

    circuit(w, h, c, r) {
      const T = Array.from({ length: 26 }, () => {
        let px = r() < 0.5 ? (r() < 0.5 ? 0 : w) : r() * w, py = px === 0 || px === w ? r() * h : (r() < 0.5 ? 0 : h);
        const pts = [[px, py]];
        for (let k = 0; k < 5; k++) {
          const dir = Math.floor(r() * 4), len = 80 + r() * 260;
          px = Math.min(w, Math.max(0, px + [len, -len, 0, 0][dir])); py = Math.min(h, Math.max(0, py + [0, 0, len, -len][dir]));
          pts.push([px, py]);
        }
        let L = 0; const seg = pts.slice(1).map((p, i) => { const d = Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]); L += d; return d; });
        return { pts, seg, L, sp: 120 + r() * 160, ph: r() * 1000 };
      });
      const at = (tr, s) => { for (let i = 0; i < tr.seg.length; i++) { if (s <= tr.seg[i]) { const k = s / (tr.seg[i] || 1), a = tr.pts[i], b = tr.pts[i + 1]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; } s -= tr.seg[i]; } return tr.pts[tr.pts.length - 1]; };
      return { draw(x, t) {
        x.lineWidth = 2; x.strokeStyle = rgba(c.a, K(c, 0.13));
        T.forEach(tr => { x.beginPath(); tr.pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke();
          const e = tr.pts[tr.pts.length - 1]; x.fillStyle = rgba(c.a, K(c, 0.3)); x.beginPath(); x.arc(e[0], e[1], 4, 0, 7); x.fill(); });
        T.forEach((tr, n) => { const s = (t * tr.sp + tr.ph) % (tr.L + 300); if (s > tr.L) return;
          for (let k = 0; k < 10; k++) { const p = at(tr, Math.max(0, s - k * 7)); x.fillStyle = rgba(n % 3 ? c.a : c.b, K(c, 0.8) * (1 - k / 10)); x.beginPath(); x.arc(p[0], p[1], 3, 0, 7); x.fill(); } });
      } };
    },

    rain(w, h, c, r) {
      const cw = 22, cols = Math.ceil(w / cw), chars = '01ABCDEF<>/=+#%$';
      const C = Array.from({ length: cols }, () => ({ on: r() < 0.38, y: r() * h, sp: 60 + r() * 140, seed: Math.floor(r() * 999) }));
      return { draw(x, t) {
        x.font = '18px "JetBrains Mono", monospace';
        C.forEach((col, i) => { if (!col.on) return;
          const head = (col.y + t * col.sp) % (h + 400);
          for (let k = 0; k < 16; k++) { const y = head - k * 24; if (y < 0 || y > h) continue;
            x.fillStyle = rgba(k ? c.a : c.f, K(c, k ? 0.2 * (1 - k / 16) : 0.4));
            x.fillText(chars[(col.seed + k * 7 + Math.floor(t * 3)) % chars.length], i * cw, y); }
        });
      } };
    },

    hex(w, h, c, r) {
      const R = 36, dx = R * 1.732, dy = R * 1.5, cells = [];
      for (let row = -1; row * dy < h + R; row++) for (let col = -1; col * dx < w + R; col++) cells.push({ x: col * dx + (row % 2 ? dx / 2 : 0), y: row * dy, p: r() * 6.283, hot: r() < 0.12 });
      const hexPath = (x, cx, cy) => { x.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; x.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); } x.closePath(); };
      return { draw(x, t) {
        x.lineWidth = 1;
        cells.forEach(cl => { hexPath(x, cl.x, cl.y); x.strokeStyle = rgba(c.light ? c.f : c.a, K(c, 0.09)); x.stroke();
          if (cl.hot) { x.fillStyle = rgba(c.a, K(c, 0.11) * (0.5 + 0.5 * Math.sin(t * 1.2 + cl.p))); x.fill(); } });
      } };
    },

    flow(w, h, c) {
      return { draw(x, t) {
        x.lineWidth = 1.3;
        for (let i = 0; i < 28; i++) {
          x.strokeStyle = rgba(i % 4 ? c.a : c.b, K(c, 0.05 + (i % 5) * 0.022)); x.beginPath();
          for (let px = -20; px <= w + 20; px += 16) {
            const y = h * 0.62 + i * 9 + Math.sin(px * 0.0022 + t * 0.35 + i * 0.18) * 120 + Math.sin(px * 0.0051 - t * 0.22 + i * 0.07) * 60;
            px < 0 ? x.moveTo(px, y) : x.lineTo(px, y);
          }
          x.stroke();
        }
      } };
    },

    iso(w, h, c, r) {
      const boxes = Array.from({ length: 7 }, (_, i) => ({ gx: 1 + (i % 4) * 2.2 + r(), gy: Math.floor(i / 4) * 2.2 + r(), hgt: 40 + r() * 140, p: r() * 6 }));
      return { draw(x, t) {
        const s = 46, line = c.light ? c.f : c.a;
        x.lineWidth = 1; x.strokeStyle = rgba(line, K(c, 0.07));
        for (let k = -h; k < w + h; k += s) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + h * 1.732, h); x.stroke(); x.beginPath(); x.moveTo(k, h); x.lineTo(k + h * 1.732, 0); x.stroke(); }
        const ox = w * 0.62, oy = h * 0.58, iso = (gx, gy, z) => [ox + (gx - gy) * s * 1.732 / 2 * 1.4, oy + (gx + gy) * s / 2 * 1.4 - z];
        boxes.forEach(b => {
          const z = b.hgt * (0.85 + 0.15 * Math.sin(t * 0.8 + b.p)), q = [[0, 0], [1.4, 0], [1.4, 1.4], [0, 1.4]];
          const bot = q.map(([u, v]) => iso(b.gx + u, b.gy + v, 0)), top = q.map(([u, v]) => iso(b.gx + u, b.gy + v, z));
          x.strokeStyle = rgba(c.a, K(c, 0.45)); x.beginPath(); top.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.closePath();
          x.fillStyle = rgba(c.a, K(c, 0.08)); x.fill(); x.stroke();
          x.strokeStyle = rgba(c.a, K(c, 0.25)); x.beginPath(); [0, 1, 2, 3].forEach(i => { x.moveTo(...bot[i]); x.lineTo(...top[i]); }); bot.forEach((p, i) => i ? x.lineTo(...p) : x.moveTo(...p)); x.stroke();
        });
      } };
    },

    orbit(w, h, c, r) {
      const nodes = Array.from({ length: 6 }, (_, i) => ({ R: 170 + i * 70, sp: (r() - 0.5) * 0.5, p: r() * 6.283 }));
      return { draw(x, t) {
        const cx = w * 0.8, cy = h * 0.52;
        x.lineWidth = 1;
        [140, 240, 330, 420, 520].forEach((R, i) => { x.strokeStyle = rgba(c.a, K(c, i % 2 ? 0.14 : 0.24)); if (i === 3) x.setLineDash([3, 9]); x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke(); x.setLineDash([]); });
        for (let k = 0; k < 120; k++) { const a = k / 120 * 6.283 + t * 0.08, l = k % 10 ? 8 : 20; x.strokeStyle = rgba(c.a, K(c, k % 10 ? 0.18 : 0.45)); x.beginPath(); x.moveTo(cx + Math.cos(a) * 240, cy + Math.sin(a) * 240); x.lineTo(cx + Math.cos(a) * (240 + l), cy + Math.sin(a) * (240 + l)); x.stroke(); }
        x.strokeStyle = rgba(c.b, K(c, 0.6)); x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, 330, t * 0.4, t * 0.4 + 1.1); x.stroke();
        x.lineWidth = 1; x.strokeStyle = rgba(c.a, K(c, 0.12)); x.beginPath(); x.moveTo(cx - 620, cy); x.lineTo(cx + 620, cy); x.moveTo(cx, cy - 560); x.lineTo(cx, cy + 560); x.stroke();
        nodes.forEach((n, i) => { const a = n.p + t * n.sp; x.fillStyle = rgba(i % 2 ? c.a : c.b, K(c, 0.8)); x.beginPath(); x.arc(cx + Math.cos(a) * n.R, cy + Math.sin(a) * n.R, 4, 0, 7); x.fill(); });
      } };
    },

    dots(w, h, c) {
      return { draw(x, t) {
        const g = 32, ink = c.light ? c.f : c.a;
        for (let y = g / 2; y < h; y += g) for (let px = g / 2; px < w; px += g) {
          const v = 0.5 + 0.5 * Math.sin(px * 0.004 + y * 0.003 - t * 0.7);
          x.fillStyle = rgba(ink, K(c, 0.05 + v * 0.13)); x.beginPath(); x.arc(px, y, 1.6, 0, 7); x.fill();
        }
      } };
    }
  };

  const seeded = (s) => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  window.IAS_FX = { FX, make(name, w, h, c, seed) { return (FX[name] || FX.none)(w, h, c, seeded(seed || 7)); } };
})();
