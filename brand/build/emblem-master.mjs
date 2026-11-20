// ATHENOA emblem, vector master (Greek).
// Maria's choices, 20 November 2026: the black-figure Athena of generation 96 (traced, see
// trace-figure.py), the oval and dark band of 96 without an outer line, lettering wrapping the whole
// ring as in 1 and 113 in 1's hollow geometric capitals, and the monad (circle with a point, the One)
// at either side.
//
//   node brand/build/emblem-master.mjs <trace-dir>   (trace-dir holds figure.json and figure-trace.svg)
//   -> brand/emblem/*.svg and brand/sketches/emblem-03.html

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimize } from 'svgo';
import { create } from 'fontkitten';

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

/* ---------- Lettering: the hollow geometric capitals of generation 1 ----------
   Didact Gothic (SIL Open Font Licence, in brand/build/fonts), which has Greek, made bolder and drawn
   as an outline: a wide paper stroke under a narrower ink stroke of the same letter leaves only a
   paper contour round an ink-filled letter, so on the dark band each letter reads hollow, as in 1. */
const FONTS = {
  latin: create(readFileSync(resolve(here, 'fonts/didact-gothic-latin-400-normal.woff2'))),
  greek: create(readFileSync(resolve(here, 'fonts/didact-gothic-greek-400-normal.woff2'))),
};
const CAP = FONTS.latin.capHeight;
const BOLD = 0.05; // how far each side of a stroke grows, in cap heights
const LINE = 0.048; // the paper contour, in cap heights
const glyphs = new Map();
function glyph(ch) {
  if (glyphs.has(ch)) return glyphs.get(ch);
  const cp = ch.codePointAt(0);
  const g = (cp >= 0x370 ? FONTS.greek : FONTS.latin).glyphForCodePoint(cp);
  if (!g || !g.path.commands.length) throw new Error(`no glyph for ${ch}`);
  const bb = g.bbox;
  const bw = (bb.maxX - bb.minX) / CAP;
  // place: font units (y up, baseline 0) to cap units (y down, cap top 0, baseline 1)
  const out = { bw, w: bw + 2 * (BOLD + LINE), d: g.path.toSVG(), place: `scale(${1 / CAP} ${-1 / CAP}) translate(${-bb.minX} ${-CAP})` };
  glyphs.set(ch, out);
  return out;
}

// Lay a line of capitals along a walker, its first and last letters `span` apart (centre to centre),
// with even gaps between letters and a wider gap between words.
function letter(text, walk, h, spanFrac, wordExtra) {
  const words = text.split(' ').map((w) => [...w].map(glyph));
  const all = words.flat();
  const n = all.length;
  const span = walk.total * spanFrac;
  const sumW = all.reduce((s, g) => s + g.w, 0) * h;
  const inner = sumW - (all[0].w * h) / 2 - (all[n - 1].w * h) / 2;
  const gap = (span - inner - (words.length - 1) * wordExtra * h) / (n - 1);
  let s = walk.total / 2 - span / 2;
  const out = [];
  let k = 0;
  words.forEach((word, wi) => {
    word.forEach((g, gi) => {
      if (k > 0) s += gap + (gi === 0 && wi > 0 ? wordExtra * h : 0) + (g.w * h) / 2;
      const p = walk.at(s);
      out.push(`<path d="${g.d}" transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f((p.ang * 180) / Math.PI)}) scale(${h}) translate(${f(-g.bw / 2)} -0.5) ${g.place}"/>`);
      s += (g.w * h) / 2;
      k++;
    });
  });
  return { svg: out.join(''), gap: gap / h, h };
}
// The same, shrinking the letters until the gaps between them are at least `minGap` cap heights
function fitLetter(text, walk, h, spanFrac, wordExtra, minGap) {
  let r = letter(text, walk, h, spanFrac, wordExtra);
  while (r.gap < minGap && h > 20) r = letter(text, walk, (h -= 1), spanFrac, wordExtra);
  return r;
}

// Ribbon wording (Maria, 20 November 2026; logged as proposed in tasks/text-changes.md)
const TEXT = {
  el: { top: 'ΑΘΕΝΟΑ', bottom: 'ΑΚΑΔΗΜΙΑ ΕΛΛΗΝΙΚΗΣ ΣΟΦΙΑΣ' },
  en: { top: 'ATHENOA', bottom: 'ACADEMY OF HELLENIC WISDOM' },
};

function emblem({ id = 'e', lang = 'el', letters = true, colours = { ink: INK, paper: PAPER } } = {}) {
  const { ink, paper } = colours;
  const pad = 3;
  const vb = [C.x - OUTER.a - pad, C.y - OUTER.bt - pad, 2 * (OUTER.a + pad), OUTER.bt + OUTER.bb + 2 * pad].map(f);
  const parts = [];
  parts.push(`<path fill="${ink}" fill-rule="evenodd" d="${ring(OUTER, BAND_IN)}"/>`);
  parts.push(`<path fill="${paper}" fill-rule="evenodd" d="${ring(BAND_IN, HAIR_OUT)}"/>`);
  parts.push(`<path fill="${ink}" fill-rule="evenodd" d="${ring(HAIR_OUT, HAIR_IN)}"/>`);
  parts.push(`<path fill="${paper}" d="${eggPath(HAIR_IN)}"/>`);
  parts.push(`<clipPath id="${id}-panel"><path d="${eggPath(HAIR_IN)}"/></clipPath>`);
  parts.push(`<g clip-path="url(#${id}-panel)" fill="${ink}">${figure}</g>`);
  if (letters) {
    // Full wrap, as in 1: each line runs round a whole half of the ring, from monad to monad
    const top = fitLetter(TEXT[lang].top, walker(MID, -Math.PI, 0), 66, 0.86, 0, 0.3);
    const bottom = fitLetter(TEXT[lang].bottom, walker(MID, Math.PI, 0), 46, 0.86, 0.5, 0.24);
    const stroke = (w) => `stroke-width="${f(w * CAP)}" stroke-linejoin="miter" stroke-miterlimit="3"`;
    parts.push(`<defs><g id="${id}-letters">${top.svg}${bottom.svg}</g></defs>`);
    parts.push(`<use href="#${id}-letters" fill="${paper}" stroke="${paper}" ${stroke(2 * (BOLD + LINE))}/>`);
    parts.push(`<use href="#${id}-letters" fill="${ink}" stroke="${ink}" ${stroke(2 * BOLD)}/>`);
    console.log(`${lang}: top ${top.h} (gap ${f(top.gap)}), bottom ${bottom.h} (gap ${f(bottom.gap)})`);
  }
  const L = point(MID, Math.PI);
  const R = point(MID, 0);
  for (const [x, y] of [L, R]) {
    parts.push(`<circle cx="${f(x)}" cy="${f(y)}" r="16.5" fill="none" stroke="${paper}" stroke-width="3.9"/><circle cx="${f(x)}" cy="${f(y)}" r="5" fill="${paper}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" role="img" aria-label="ATHENOA">${parts.join('')}</svg>`;
}

// The favicon: her helmeted head inside a ring, cut from the same drawing (the whole figure is a
// smudge below about 40 px)
const HEAD = { x: 458, y: 286, r: 132, band: 22 };
function favicon({ id = 'fav', colours = { ink: INK, paper: PAPER } } = {}) {
  const { ink, paper } = colours;
  const { x, y, r, band } = HEAD;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x - r} ${y - r} ${2 * r} ${2 * r}" role="img" aria-label="ATHENOA">` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${ink}"/><circle cx="${x}" cy="${y}" r="${r - band}" fill="${paper}"/>` +
    `<clipPath id="${id}-c"><circle cx="${x}" cy="${y}" r="${r - band}"/></clipPath>` +
    `<g clip-path="url(#${id}-c)" fill="${ink}">${figure}</g></svg>`;
}

/* ---------- Files ---------- */
const outDir = resolve(here, '../emblem');
mkdirSync(outDir, { recursive: true });
const header = '<!-- ATHENOA emblem. Athena traced from a Higgsfield generation chosen by Maria; lettering in Didact Gothic (SIL Open Font Licence) as hollow outlines. Built by brand/build/emblem-master.mjs -->\n';
// applyTransforms off: the letters take their stroke from <use>, which svgo cannot see, so baking
// their transforms into the paths would leave the strokes at the wrong scale
const svgoConfig = { multipass: true, floatPrecision: 2, plugins: [{ name: 'preset-default', params: { overrides: { cleanupIds: false, convertPathData: { applyTransforms: false } } } }] };
const write = (name, svg) => writeFileSync(resolve(outDir, name), header + optimize(svg, svgoConfig).data + '\n');
write('athenoa-emblem-el.svg', emblem({ id: 'el', lang: 'el' }));
write('athenoa-emblem-en.svg', emblem({ id: 'en', lang: 'en' }));
write('athenoa-mark.svg', emblem({ id: 'mk', letters: false }));
write('athenoa-favicon.svg', favicon({ id: 'fav' }));

/* ---------- Preview page ---------- */
// The page shows the written files (no copies inlined), so it stays small
const img = (file, h) => `<img src="../emblem/${file}" alt="" style="height:${h}px;width:auto;display:block">`;
const page = `<!doctype html><html lang="el"><head><meta charset="utf-8"><title>ATHENOA emblem, master 03</title>
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
.tab { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 10px 10px 0 0; background: #fff; font: 13px/1 -apple-system, sans-serif; color: #333; width: 220px; }
</style></head><body><main>
<h1>ATHENOA emblem, vector master 03</h1>
<p>Athena traced from 96 and the oval rebuilt to its measures; the lettering wraps the whole ring as in 1 and 113, in 1's hollow geometric capitals (Didact Gothic, open licence, outlined); a monad at either side.</p>
<h2>Greek and English</h2>
<div class="row"><div class="cell">${img('athenoa-emblem-el.svg', 560)}Greek</div><div class="cell">${img('athenoa-emblem-en.svg', 560)}English</div></div>
<h2>Sizes</h2>
<div class="row">${[240, 160, 96].map((h) => `<div class="cell">${img('athenoa-emblem-el.svg', h)}${h} px</div>`).join('')}
${[96, 56].map((h) => `<div class="cell">${img('athenoa-mark.svg', h)}mark, ${h} px</div>`).join('')}</div>
<h2>Header, 56 px</h2>
<div class="row" style="flex-direction:column;align-items:flex-start;gap:14px">
<div class="bar">${img('athenoa-emblem-el.svg', 56)}<span>ATHENOA</span></div>
<div class="bar">${img('athenoa-mark.svg', 56)}<span>ATHENOA</span></div>
<div class="bar sky">${img('athenoa-mark.svg', 56)}<span>ATHENOA</span></div>
<div class="bar night">${img('athenoa-mark.svg', 56)}<span>ATHENOA</span></div>
</div>
<h2>Favicon</h2>
<div class="row">${[180, 96, 48, 32, 16].map((h) => `<div class="cell">${img('athenoa-favicon.svg', h)}${h} px</div>`).join('')}
<div class="cell"><div class="tab">${img('athenoa-favicon.svg', 16)}ATHENOA | Study at the…</div>in a browser tab</div></div>
</main></body></html>`;
mkdirSync(resolve(here, '../sketches'), { recursive: true });
writeFileSync(resolve(here, '../sketches/emblem-03.html'), page);
console.log('wrote brand/emblem/*.svg and brand/sketches/emblem-03.html');
