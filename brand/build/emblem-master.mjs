// ATHENOA emblem, vector master (Greek).
// Maria's choices, 20 November 2026: the black-figure Athena of generation 96 (traced, see
// trace-figure.py), the oval and dark band of 96, lettering spread round the ring as in 113, set in
// the thin monoline capitals of generation 1 (drawn here, so no font licence is needed), and the
// monad (circle with a point, the One) at either side.
//
//   node brand/build/emblem-master.mjs <trace-dir>   (trace-dir holds figure.json and figure-trace.svg)
//   -> brand/emblem/*.svg and brand/sketches/emblem-02.html

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimize } from 'svgo';

const here = dirname(fileURLToPath(import.meta.url));
const traceDir = resolve(process.argv[2] ?? resolve(here, '../emblem/src'));
const f = (n) => +n.toFixed(2);

const INK = '#071260'; // --blue-deep
const PAPER = '#f2e9d3'; // --creme

/* ---------- The figure, traced from generation 96 (pixel space of that image) ---------- */
const meta = JSON.parse(readFileSync(resolve(traceDir, 'figure.json'), 'utf8'));
const trace = readFileSync(resolve(traceDir, 'figure-trace.svg'), 'utf8');
const m = trace.match(/<g transform="([^"]+)"[^>]*>([\s\S]*?)<\/g>/);
const traceTransform = m[1].replace(/\s+/g, ' ');
const tracePaths = m[2].replace(/\s+/g, ' ').trim();
const [ox, oy] = meta.bitmap_origin;
const figure = `<g transform="translate(${ox} ${oy}) scale(${1 / meta.bitmap_scale})"><g transform="${traceTransform}">${tracePaths}</g></g>`;

/* ---------- The oval: fitted to 96, a touch fuller at the top than at the bottom ---------- */
const C = { x: meta.centre[0], y: meta.centre[1] };
const egg = (a, bt, nt, bb, nb) => ({ a, bt, nt, bb, nb });
const OUTER = egg(431, 546, 2.2, 546, 2.0);
const BAND_IN = egg(343, 447, 2.15, 441, 1.95);
const HAIR_OUT = egg(338, 442, 2.15, 436, 1.95);
const HAIR_IN = egg(334, 438, 2.15, 432, 1.95);
const MID = egg(387, 496.5, 2.17, 493.5, 1.97); // centre line of the lettering
const grow = (e, d) => ({ ...e, a: e.a + d, bt: e.bt + d, bb: e.bb + d });

const point = (e, t) => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const top = s < 0;
  const n = top ? e.nt : e.nb;
  const b = top ? e.bt : e.bb;
  return [C.x + e.a * Math.sign(c) * Math.abs(c) ** (2 / n), C.y + b * Math.sign(s) * Math.abs(s) ** (2 / n)];
};
// Smooth closed path through evenly spaced points (Catmull-Rom as cubic Béziers)
function eggPath(e, N = 144, reverse = false) {
  let P = [];
  for (let i = 0; i < N; i++) P.push(point(e, (i / N) * 2 * Math.PI));
  if (reverse) P = P.reverse();
  let d = `M${f(P[0][0])},${f(P[0][1])}`;
  for (let i = 0; i < N; i++) {
    const p0 = P[(i - 1 + N) % N];
    const p1 = P[i];
    const p2 = P[(i + 1) % N];
    const p3 = P[(i + 2) % N];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + 'Z';
}
const ring = (outer, inner) => eggPath(outer) + eggPath(inner, 144, true);

// Walk along part of an oval by arc length (t0 -> t1)
function walker(e, t0, t1, N = 2400) {
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push(point(e, t0 + ((t1 - t0) * i) / N));
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = len[len.length - 1];
  const at = (s) => {
    let lo = 0;
    let hi = len.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (len[mid] < s) lo = mid;
      else hi = mid;
    }
    const k = (s - len[lo]) / (len[hi] - len[lo] || 1);
    const a = pts[Math.max(0, lo - 6)];
    const b = pts[Math.min(pts.length - 1, hi + 6)];
    return {
      x: pts[lo][0] + (pts[hi][0] - pts[lo][0]) * k,
      y: pts[lo][1] + (pts[hi][1] - pts[lo][1]) * k,
      ang: Math.atan2(b[1] - a[1], b[0] - a[0]),
    };
  };
  return { total, at };
}

/* ---------- Monoline capitals (cap height 1, y down), after the lettering of generation 1 ---------- */
const circle = (cx, cy, r) => `M${cx - r},${cy}A${r},${r} 0 1 1 ${cx + r},${cy}A${r},${r} 0 1 1 ${cx - r},${cy}`;
const ellipse = (cx, cy, rx, ry) => `M${cx - rx},${cy}A${rx},${ry} 0 1 1 ${cx + rx},${cy}A${rx},${ry} 0 1 1 ${cx - rx},${cy}`;
const A = { w: 0.8, d: 'M0,1L0.4,0L0.8,1M0.17,0.6H0.63' };
const E = { w: 0.56, d: 'M0.56,0H0V1H0.56M0,0.5H0.46' };
const H = { w: 0.72, d: 'M0,0V1M0.72,0V1M0,0.5H0.72' };
const I = { w: 0, d: 'M0,0V1' };
const M = { w: 0.92, d: 'M0,1L0.1,0L0.46,0.72L0.82,0L0.92,1' };
const N = { w: 0.74, d: 'M0,1V0L0.74,1V0' };
const O = { w: 1.04, d: circle(0.52, 0.5, 0.52) };
const T = { w: 0.76, d: 'M0,0H0.76M0.38,0V1' };
const GLYPHS = {
  Α: A, Ε: E, Η: H, Ι: I, Μ: M, Ν: N, Ο: O, Τ: T,
  Θ: { w: 1.04, d: circle(0.52, 0.5, 0.52) + 'M0.3,0.5H0.74' },
  Δ: { w: 0.84, d: 'M0,1L0.42,0L0.84,1Z' },
  Κ: { w: 0.66, d: 'M0,0V1M0.64,0L0.02,0.55L0.66,1' },
  Λ: { w: 0.8, d: 'M0,1L0.4,0L0.8,1' },
  Π: { w: 0.72, d: 'M0,1V0H0.72V1' },
  Σ: { w: 0.66, d: 'M0.66,0H0L0.38,0.5L0,1H0.66' },
  Φ: { w: 0.88, d: 'M0.44,0V1' + ellipse(0.44, 0.5, 0.44, 0.31) },
  Ω: { w: 1.04, d: 'M0.02,1H0.3A0.52,0.52 0 1 1 0.74,1H1.02' },
};

// Lay a line of capitals along a walker, its first and last letters `span` apart (centre to centre),
// with even gaps between letters and a wider gap between words.
function letter(text, walk, h, spanFrac, wordExtra, sw) {
  const words = text.split(' ').map((w) => [...w].map((ch) => {
    const g = GLYPHS[ch];
    if (!g) throw new Error(`no glyph for ${ch}`);
    return g;
  }));
  const glyphs = words.flat();
  const n = glyphs.length;
  const span = walk.total * spanFrac;
  const sumW = glyphs.reduce((s, g) => s + g.w, 0) * h;
  const inner = sumW - (glyphs[0].w * h) / 2 - (glyphs[n - 1].w * h) / 2;
  const spaces = words.length - 1;
  const gap = (span - inner - spaces * wordExtra * h) / (n - 1);
  let s = walk.total / 2 - span / 2;
  const out = [];
  let k = 0;
  words.forEach((word, wi) => {
    word.forEach((g, gi) => {
      if (k > 0) s += gap + (gi === 0 && wi > 0 ? wordExtra * h : 0) + (g.w * h) / 2;
      const p = walk.at(s);
      out.push(`<path d="${g.d}" stroke-width="${f(sw / h)}" transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f((p.ang * 180) / Math.PI)}) scale(${h}) translate(${-g.w / 2} -0.5)"/>`);
      s += (g.w * h) / 2;
      k++;
    });
  });
  return { svg: out.join(''), gap: gap / h };
}

const TEXT = { top: 'ΑΘΕΝΟΑ', bottom: 'ΑΚΑΔΗΜΙΑ ΕΛΛΗΝΙΚΗΣ ΣΟΦΙΑΣ' };

function emblem({ id = 'e', outerLine = false, letters = true, colours = { ink: INK, paper: PAPER } } = {}) {
  const { ink, paper } = colours;
  const pad = outerLine ? 16 : 3;
  const vb = [C.x - OUTER.a - pad, C.y - OUTER.bt - pad, 2 * (OUTER.a + pad), OUTER.bt + OUTER.bb + 2 * pad].map(f);
  const parts = [];
  if (outerLine) {
    parts.push(`<path fill="${ink}" fill-rule="evenodd" d="${ring(grow(OUTER, 13), grow(OUTER, 8.5))}"/>`);
    parts.push(`<path fill="${paper}" fill-rule="evenodd" d="${ring(grow(OUTER, 8.5), OUTER)}"/>`);
  }
  parts.push(`<path fill="${ink}" fill-rule="evenodd" d="${ring(OUTER, BAND_IN)}"/>`);
  parts.push(`<path fill="${paper}" fill-rule="evenodd" d="${ring(BAND_IN, HAIR_OUT)}"/>`);
  parts.push(`<path fill="${ink}" fill-rule="evenodd" d="${ring(HAIR_OUT, HAIR_IN)}"/>`);
  parts.push(`<path fill="${paper}" d="${eggPath(HAIR_IN)}"/>`);
  parts.push(`<clipPath id="${id}-panel"><path d="${eggPath(HAIR_IN)}"/></clipPath>`);
  parts.push(`<g clip-path="url(#${id}-panel)" fill="${ink}">${figure}</g>`);
  if (letters) {
    const top = letter(TEXT.top, walker(MID, -Math.PI, 0), 56, 0.55, 0, 5.2);
    const bottom = letter(TEXT.bottom, walker(MID, Math.PI, 0), 39, 0.74, 0.55, 3.9);
    parts.push(`<g fill="none" stroke="${paper}" stroke-linecap="round" stroke-linejoin="round">${top.svg}${bottom.svg}</g>`);
  }
  const L = point(MID, Math.PI);
  const R = point(MID, 0);
  for (const [x, y] of [L, R]) {
    parts.push(`<circle cx="${f(x)}" cy="${f(y)}" r="16.5" fill="none" stroke="${paper}" stroke-width="3.9"/><circle cx="${f(x)}" cy="${f(y)}" r="5" fill="${paper}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" role="img" aria-label="ATHENOA">${parts.join('')}</svg>`;
}

/* ---------- Files ---------- */
const outDir = resolve(here, '../emblem');
mkdirSync(outDir, { recursive: true });
const header = '<!-- ATHENOA emblem. Athena traced from a Higgsfield generation chosen by Maria; lettering drawn as monoline strokes (no font). Built by brand/build/emblem-master.mjs -->\n';
const svgoConfig = { multipass: true, floatPrecision: 2, plugins: [{ name: 'preset-default', params: { overrides: { cleanupIds: false } } }] };
const write = (name, svg) => writeFileSync(resolve(outDir, name), header + optimize(svg, svgoConfig).data + '\n');
write('athenoa-emblem-el.svg', emblem({ id: 'el' }));
write('athenoa-emblem-el-outline.svg', emblem({ id: 'elo', outerLine: true }));
write('athenoa-mark.svg', emblem({ id: 'mk', letters: false }));

/* ---------- Preview page ---------- */
// The page shows the written files (no copies inlined), so it stays small
const img = (file, h) => `<img src="../emblem/${file}" alt="" style="height:${h}px;width:auto;display:block">`;
const A1 = 'athenoa-emblem-el.svg';
const B1 = 'athenoa-emblem-el-outline.svg';
const at = (file, h) => img(file, h);
const mark = (h) => img('athenoa-mark.svg', h);
const page = `<!doctype html><html lang="el"><head><meta charset="utf-8"><title>ATHENOA emblem, master 02</title>
<style>
@font-face { font-family: 'EBG'; src: url('../../node_modules/@fontsource-variable/eb-garamond/files/eb-garamond-latin-wght-normal.woff2') format('woff2'); font-weight: 400 800; }
@font-face { font-family: 'Disp'; src: url('../../node_modules/@fontsource-variable/noto-serif-display/files/noto-serif-display-latin-standard-normal.woff2') format('woff2-variations'); font-weight: 100 900; font-stretch: 62.5% 100%; }
body { margin: 0; background: #f2e9d3; color: #071260; font: 17px/1.45 'EBG', Georgia, serif; }
main { max-width: 1400px; margin: 0 auto; padding: 36px 32px 72px; }
h1 { font: 300 40px/1 'Disp'; font-stretch: 75%; margin: 0 0 6px; }
h2 { font: 400 14px/1 'EBG'; letter-spacing: .14em; text-transform: uppercase; margin: 40px 0 14px; }
.row { display: flex; gap: 40px; align-items: flex-end; flex-wrap: wrap; }
.cell { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 14px; }
.bar { display: flex; align-items: center; gap: 12px; padding: 8px 22px; border-radius: 999px; background: #f2e9d3; box-shadow: inset 0 0 0 1px rgba(7,18,96,.18); }
.bar.sky { background: #b3c0f3; box-shadow: none; }
.bar.night { background: #080d42; box-shadow: none; }
.bar span { font: 400 30px/1 'Disp'; font-stretch: 75%; letter-spacing: .06em; color: #0b1c8c; }
.bar.night span { color: #f2e9d3; }
</style></head><body><main>
<h1>ATHENOA emblem, vector master 02</h1>
<p>Athena traced from 96; the oval and band rebuilt to 96's measures; lettering spread round the ring as in 113, in the thin monoline capitals of 1; a monad at either side.</p>
<h2>Large: without and with the outer line of 113</h2>
<div class="row"><div class="cell">${at(A1, 560)}without</div><div class="cell">${at(B1, 560)}with the outer line</div></div>
<h2>Sizes</h2>
<div class="row">${[240, 160, 96].map((h) => `<div class="cell">${at(A1, h)}${h} px</div>`).join('')}
${[96, 56, 32, 16].map((h) => `<div class="cell">${mark(h)}mark, ${h} px</div>`).join('')}</div>
<h2>Header, 56 px</h2>
<div class="row" style="flex-direction:column;align-items:flex-start;gap:14px">
<div class="bar">${at(A1, 56)}<span>ATHENOA</span></div>
<div class="bar">${mark(56)}<span>ATHENOA</span></div>
<div class="bar sky">${mark(56)}<span>ATHENOA</span></div>
<div class="bar night">${mark(56)}<span>ATHENOA</span></div>
</div>
</main></body></html>`;
mkdirSync(resolve(here, '../sketches'), { recursive: true });
writeFileSync(resolve(here, '../sketches/emblem-02.html'), page);
console.log('wrote brand/emblem/*.svg and brand/sketches/emblem-02.html');
