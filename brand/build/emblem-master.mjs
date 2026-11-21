// ATHENOA emblem (Greek and English).
// Maria's choices, 20 November 2026:
// - the shape of 5 and of 41-46: an oval with fuller shoulders and flatter top and bottom, and a
//   rounder inner panel, so the band is thicker at top and bottom (measured with measure-shape.py);
//   never a perfect oval, and organic: the edges waver very slightly and are a touch rough
// - the black-figure Athena of 96 (traced, trace-figure.py), rising from behind the dark band
// - no thin line between band and panel
// - the lettering the image model draws (round 3), harvested letter by letter from generations 121 and
//   123 (harvest-letters.py) and set on this ring, with clear blue above and below
// - a wider band; ΑΘΕΝΟΑ spread over about a third of the ring, the foot line round the rest, with a
//   monad (circle with a point, the One) in each of the two gaps
// The SVGs are the working source; the finished emblem is delivered as PNG (brand/emblem/png).
//
//   node brand/build/emblem-master.mjs
//   -> brand/emblem/*.svg, brand/emblem/png/*.png, brand/sketches/emblem-05.html

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, '../emblem/src');
const outDir = resolve(here, '../emblem');
const f = (n) => +n.toFixed(2);

const INK = '#071260'; // --blue-deep
const PAPER = '#f2e9d3'; // --creme

/* ---------- The figure, traced from generation 96 (pixel space of that image) ---------- */
const meta = JSON.parse(readFileSync(resolve(srcDir, 'figure.json'), 'utf8'));
const trace = readFileSync(resolve(srcDir, 'figure-trace.svg'), 'utf8');
const m = trace.match(/<g transform="([^"]+)"[^>]*>([\s\S]*?)<\/g>/);
const [ox, oy] = meta.bitmap_origin;
const figure = `<g transform="translate(${ox} ${oy}) scale(${1 / meta.bitmap_scale})"><g transform="${m[1].replace(/\s+/g, ' ')}">${m[2].replace(/\s+/g, ' ').trim()}</g></g>`;

/* ---------- The shape ----------
   Each half (top, bottom) is a superellipse |x/a|^mx + |y/b|^ny = 1, measured from 41, 43 and 45
   and scaled to this drawing. A slow waver of a few pixels (a different one for each edge) keeps it
   from looking machine-made. */
const C = { x: meta.centre[0], y: meta.centre[1] };
const half = (b, mx, ny) => ({ b, mx, ny });
const shape = (a, top, bottom, waver = null) => ({ a, top, bottom, waver });
const OUTER = shape(449, half(576, 2.15, 2.6), half(576, 2.1, 2.2), { seed: 3, amp: 0.0042 });
const PANEL = shape(334, half(445, 2.0, 2.7), half(445, 2.0, 2.37), { seed: 9, amp: 0.0048 });
const grow = (e, d) => ({ ...e, a: e.a + d, top: { ...e.top, b: e.top.b + d }, bottom: { ...e.bottom, b: e.bottom.b + d } });
const MID = shape(391.5, half(510.5, 2.08, 2.65), half(510.5, 2.05, 2.29)); // centre line of the lettering

function rand(seed) {
  let s = seed * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}
const wavers = new Map();
function waverAt(w, t) {
  if (!w) return 0;
  if (!wavers.has(w)) {
    const r = rand(w.seed);
    wavers.set(w, [2, 3, 4, 5, 7].map((k) => ({ k, p: r() * 2 * Math.PI, a: w.amp * (0.5 + r()) / Math.sqrt(k - 1) })));
  }
  return wavers.get(w).reduce((s, h) => s + h.a * Math.sin(h.k * t + h.p), 0);
}
const point = (e, t) => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const h = s < 0 ? e.top : e.bottom;
  const x = e.a * Math.sign(c) * Math.abs(c) ** (2 / h.mx);
  const y = h.b * Math.sign(s) * Math.abs(s) ** (2 / h.ny);
  const k = 1 + waverAt(e.waver, t);
  return [C.x + x * k, C.y + y * k];
};
// Smooth closed path (Catmull-Rom through evenly spaced points, as cubic Béziers)
function shapePath(e, N = 180, reverse = false) {
  let P = [];
  for (let i = 0; i < N; i++) P.push(point(e, (i / N) * 2 * Math.PI));
  if (reverse) P = P.reverse();
  let d = `M${f(P[0][0])},${f(P[0][1])}`;
  for (let i = 0; i < N; i++) {
    const [p0, p1, p2, p3] = [P[(i - 1 + N) % N], P[i], P[(i + 1) % N], P[(i + 2) % N]];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + 'Z';
}

// The lettering's centre line, walked clockwise by arc length from the top centre (s = 0)
const RING = (() => {
  const N = 6000;
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push(point(MID, -Math.PI / 2 + (2 * Math.PI * i) / N));
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = len[N];
  const at = (s) => {
    s = ((s % L) + L) % L;
    let lo = 0;
    let hi = N;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (len[mid] < s) lo = mid;
      else hi = mid;
    }
    const k = (s - len[lo]) / (len[hi] - len[lo] || 1);
    const a = pts[Math.max(0, lo - 8)];
    const b = pts[Math.min(N, hi + 8)];
    return { x: pts[lo][0] + (pts[hi][0] - pts[lo][0]) * k, y: pts[lo][1] + (pts[hi][1] - pts[lo][1]) * k, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  };
  return { L, at };
})();

/* ---------- Lettering: the image model's own capitals ----------
   Maria wants the lettering the image generator draws (round 3). harvest-letters.py took one clean copy
   of each letter from generations 121 (Greek) and 123 (Latin), turned it upright and traced it; here
   the letters are set on this emblem's ring, so spelling, shape and spacing stay exact. */
const LETTERS = Object.fromEntries(['el', 'en'].map((l) => [l, JSON.parse(readFileSync(resolve(srcDir, `letters-${l}.json`), 'utf8')).glyphs]));
const glyphOf = (lang) => (ch) => {
  const g = LETTERS[lang][ch];
  if (!g) throw new Error(`no harvested letter for ${ch} (${lang})`);
  return { bw: g.w, svg: g.svg };
};
// A run of words along the ring, centred at arc position `centre`, reading clockwise (dir 1, the top)
// or anticlockwise (dir -1, the foot, so its letters stand upright).
function run(text, lang, centre, dir, h, track, word) {
  const words = text.split(' ').map((w) => [...w].map(glyphOf(lang)));
  const n = words.flat().length;
  const length = h * (words.flat().reduce((s, g) => s + g.bw, 0) + (n - 1) * track + (words.length - 1) * word);
  let s = centre - (dir * length) / 2;
  const out = [];
  words.forEach((wd, wi) => {
    if (wi > 0) s += dir * h * (track + word);
    wd.forEach((g, gi) => {
      if (gi > 0) s += dir * h * track;
      const p = RING.at(s + (dir * h * g.bw) / 2);
      const ang = (p.ang * 180) / Math.PI + (dir < 0 ? 180 : 0);
      out.push(`<g transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f(ang)}) scale(${h}) translate(${f(-g.bw / 2)} -0.5)">${g.svg}</g>`);
      s += dir * h * g.bw;
    });
  });
  return { svg: out.join(''), length };
}

// Ribbon wording (Maria, 20 November 2026; logged as proposed in tasks/text-changes.md)
const TEXT = {
  el: { top: 'ΑΘΕΝΟΑ', bottom: 'ΑΚΑΔΗΜΙΑ ΕΛΛΗΝΙΚΗΣ ΣΟΦΙΑΣ' },
  en: { top: 'ATHENOA', bottom: 'ACADEMY OF HELLENIC WISDOM' },
};
// ΑΘΕΝΟΑ spread over `topShare` of the ring; the foot line spaced to fill the rest but for two gaps of
// `gap`, one monad in each. Cap heights about half the band's depth, so the letters have room.
const TYPE = { topH: 80, topShare: 0.28, footH: 60, word: 0.55, gap: 140 };

// A rough edge, as if cut and printed: the same technique as the site's #rough, much finer. The band,
// the panel's edge and the letters get `rough`; Athena gets `rough-fine`, so her rays stay whole.
const ROUGH = [
  ['rough', '0.04 0.05', 2.6, 7],
  ['rough-fine', '0.09 0.1', 1.1, 13],
].map(([id, freq, scale, seed]) => `<filter id="${id}" filterUnits="userSpaceOnUse" x="-60" y="-80" width="1100" height="1280" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`).join('');

function emblem({ id = 'e', lang = 'el', letters = true, rough = true } = {}) {
  const pad = 18;
  const vb = [C.x - OUTER.a - pad, C.y - OUTER.top.b - pad, 2 * (OUTER.a + pad), OUTER.top.b + OUTER.bottom.b + 2 * pad].map(f);
  const parts = [];
  parts.push(`<path fill="${INK}" fill-rule="evenodd" d="${shapePath(OUTER)}${shapePath(PANEL, 180, true)}"/>`);
  parts.push(`<path fill="${PAPER}" d="${shapePath(PANEL)}"/>`);
  // Athena is clipped a little outside the panel, so her hem always tucks under the rough band edge
  parts.push(`<clipPath id="${id}-panel"><path d="${shapePath(grow(PANEL, 3))}"/></clipPath>`);
  parts.push(`<g clip-path="url(#${id}-panel)" fill="${INK}"><g${rough ? ' filter="url(#rough-fine)"' : ''}>${figure}</g></g>`);
  if (letters) {
    const t = TEXT[lang];
    // spacing that makes a line `length` long
    const spaced = (text, length, h) => {
      const n = text.replace(/ /g, '').length;
      const base = run(text, lang, 0, 1, h, 0, TYPE.word).length;
      return (length - base) / ((n - 1) * h);
    };
    const topTrack = spaced(t.top, TYPE.topShare * RING.L, TYPE.topH);
    const top = run(t.top, lang, 0, 1, TYPE.topH, topTrack, TYPE.word);
    const footTrack = spaced(t.bottom, RING.L - top.length - 2 * TYPE.gap, TYPE.footH);
    const foot = run(t.bottom, lang, RING.L / 2, -1, TYPE.footH, footTrack, TYPE.word);
    const gap = (RING.L - top.length - foot.length) / 2;
    console.log(`${id}: letter spacing, top ${f(topTrack)}, foot ${f(footTrack)} cap heights`);
    parts.push(`<g fill="${PAPER}">${top.svg}${foot.svg}</g>`);
    // a monad in the middle of each gap
    for (const s of [top.length / 2 + gap / 2, -(top.length / 2 + gap / 2)]) {
      const p = RING.at(s);
      parts.push(`<circle cx="${f(p.x)}" cy="${f(p.y)}" r="16.5" fill="none" stroke="${PAPER}" stroke-width="4.2"/><circle cx="${f(p.x)}" cy="${f(p.y)}" r="5.2" fill="${PAPER}"/>`);
    }
    console.log(`${id}: ring ${f(RING.L)}, top ${f(top.length)}, foot ${f(foot.length)}, each gap ${f(gap)}`);
  }
  // band, panel and letters through `rough`; the figure (already through `rough-fine`) drawn on top
  const fig = parts.splice(3, 1)[0];
  const body = rough ? `<defs>${ROUGH}</defs><g filter="url(#rough)">${parts.slice(0, 3).join('')}</g>${fig}<g filter="url(#rough)">${parts.slice(3).join('')}</g>` : parts.join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" role="img" aria-label="ATHENOA">${body}</svg>`;
}

// The header mark: the crème panel and Athena with only a thin outline round them, no band (Maria,
// 21 November 2026). Her hem runs to the outline, as it runs under the band in the full emblem.
function mark({ id = 'mk', line = 30, rough = true } = {}) {
  const O = grow(PANEL, line);
  const pad = 14;
  const vb = [C.x - O.a - pad, C.y - O.top.b - pad, 2 * (O.a + pad), O.top.b + O.bottom.b + 2 * pad].map(f);
  const filt = (name) => (rough ? ` filter="url(#${name})"` : '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" role="img" aria-label="ATHENOA">${rough ? `<defs>${ROUGH}</defs>` : ''}` +
    `<g${filt('rough')}><path fill="${PAPER}" d="${shapePath(PANEL)}"/></g>` +
    `<clipPath id="${id}-panel"><path d="${shapePath(grow(PANEL, 3))}"/></clipPath>` +
    `<g clip-path="url(#${id}-panel)" fill="${INK}"><g${filt('rough-fine')}>${figure}</g></g>` +
    `<g${filt('rough')}><path fill="${INK}" fill-rule="evenodd" d="${shapePath(O)}${shapePath(PANEL, 180, true)}"/></g></svg>`;
}

// The favicon: her helmeted head inside a ring (the whole figure is a smudge below about 40 px)
const HEAD = { x: 458, y: 286, r: 132, band: 22 };
function favicon({ id = 'fav' } = {}) {
  const { x, y, r, band } = HEAD;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x - r} ${y - r} ${2 * r} ${2 * r}" role="img" aria-label="ATHENOA">` +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x}" cy="${y}" r="${r - band}" fill="${PAPER}"/>` +
    `<clipPath id="${id}-c"><circle cx="${x}" cy="${y}" r="${r - band}"/></clipPath>` +
    `<g clip-path="url(#${id}-c)" fill="${INK}">${figure}</g></svg>`;
}

/* ---------- Files ---------- */
const header = '<!-- ATHENOA emblem, working source. Athena traced from a Higgsfield generation chosen by Maria; lettering harvested from the image generator capitals. The finished emblem is the PNGs in brand/emblem/png. Built by brand/build/emblem-master.mjs -->\n';
const svgs = {
  'athenoa-emblem-el.svg': emblem({ id: 'el', lang: 'el' }),
  'athenoa-emblem-en.svg': emblem({ id: 'en', lang: 'en' }),
  'athenoa-mark.svg': mark(),
  'athenoa-favicon.svg': favicon(),
};
mkdirSync(resolve(outDir, 'png'), { recursive: true });
for (const [name, svg] of Object.entries(svgs)) writeFileSync(resolve(outDir, name), header + svg + '\n');

// PNG exports: the master at 1080 px high, the footer and header at twice their size, the favicon set
const EXPORTS = [
  ['athenoa-emblem-el.svg', 'emblem-el-1080.png', 1080],
  ['athenoa-emblem-en.svg', 'emblem-en-1080.png', 1080],
  ['athenoa-emblem-el.svg', 'emblem-el-192.png', 192],
  ['athenoa-emblem-en.svg', 'emblem-en-192.png', 192],
  ['athenoa-mark.svg', 'mark-112.png', 112],
  ['athenoa-mark.svg', 'mark-360.png', 360],
  ['athenoa-favicon.svg', 'favicon-32.png', 32],
  ['athenoa-favicon.svg', 'favicon-96.png', 96],
  ['athenoa-favicon.svg', 'favicon-180.png', 180],
  ['athenoa-favicon.svg', 'favicon-512.png', 512],
];
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [svg, png, h] of EXPORTS) {
  const vb = svgs[svg].match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const w = Math.round((h * vb[2]) / vb[3]);
  await page.setViewportSize({ width: w, height: h });
  // a fresh address each time: loading the same file twice in a row can keep the old layout
  await page.goto(`${pathToFileURL(resolve(outDir, svg)).href}?h=${h}`);
  await page.screenshot({ path: resolve(outDir, 'png', png), omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
}
await browser.close();

/* ---------- Preview page ---------- */
const img = (file, h) => `<img src="../emblem/png/${file}" alt="" style="height:${h}px;width:auto;display:block">`;
const html = `<!doctype html><html lang="el"><head><meta charset="utf-8"><title>ATHENOA emblem, 05</title>
<style>
@font-face { font-family: 'EBG'; src: url('../../node_modules/@fontsource-variable/eb-garamond/files/eb-garamond-latin-wght-normal.woff2') format('woff2'); font-weight: 400 800; }
@font-face { font-family: 'Disp'; src: url('../../node_modules/@fontsource-variable/noto-serif-display/files/noto-serif-display-latin-standard-normal.woff2') format('woff2-variations'); font-weight: 100 900; font-stretch: 62.5% 100%; }
body { margin: 0; background: #f2e9d3; color: #071260; font: 17px/1.45 'EBG', Georgia, serif; }
main { max-width: 1400px; margin: 0 auto; padding: 36px 32px 72px; }
h1 { font: 300 40px/1 'Disp'; font-stretch: 75%; margin: 0 0 6px; }
h2 { font: 400 14px/1 'EBG'; letter-spacing: .14em; text-transform: uppercase; margin: 40px 0 14px; }
.row { display: flex; gap: 36px; align-items: flex-end; flex-wrap: wrap; }
.cell { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 14px; }
.bar { display: flex; align-items: center; gap: 12px; padding: 8px 22px; border-radius: 999px; background: #f2e9d3; box-shadow: inset 0 0 0 1px rgba(7,18,96,.18); }
.bar.sky { background: #b3c0f3; box-shadow: none; }
.bar.night { background: #080d42; box-shadow: none; }
.bar span { font: 400 30px/1 'Disp'; font-stretch: 75%; letter-spacing: .06em; color: #0b1c8c; }
.bar.night span { color: #f2e9d3; }
</style></head><body><main>
<h1>ATHENOA emblem, 05</h1>
<p>The shape of 5 and 41 to 46, slightly uneven and rough at the edge; a wider band; the image model's own capitals (as in round 3), set exactly with room above and below; ΑΘΕΝΟΑ over about a third of the ring and the foot line round the rest, a monad in each gap.</p>
<h2>Greek and English, beside round 3 (70), whose lettering Maria chose</h2>
<div class="row"><div class="cell">${img('emblem-el-1080.png', 560)}Greek</div><div class="cell">${img('emblem-en-1080.png', 560)}English</div>
<div class="cell"><img src="ref-round3-lettering.png" alt="" style="height:560px;width:auto;display:block">round 3 (70)</div></div>
<h2>Sizes</h2>
<div class="row"><div class="cell">${img('emblem-el-1080.png', 240)}240 px</div><div class="cell">${img('emblem-el-192.png', 96)}footer, 96 px</div><div class="cell">${img('mark-112.png', 56)}header mark, 56 px</div></div>
<h2>Header, 56 px</h2>
<div class="row" style="flex-direction:column;align-items:flex-start;gap:14px">
<div class="bar">${img('mark-112.png', 56)}<span>ATHENOA</span></div>
<div class="bar sky">${img('mark-112.png', 56)}<span>ATHENOA</span></div>
<div class="bar night">${img('mark-112.png', 56)}<span>ATHENOA</span></div>
</div>
<h2>Favicon</h2>
<div class="row">${[['favicon-180.png', 180], ['favicon-96.png', 96], ['favicon-96.png', 48], ['favicon-32.png', 32], ['favicon-32.png', 16]].map(([p, h]) => `<div class="cell">${img(p, h)}${h} px</div>`).join('')}</div>
</main></body></html>`;
mkdirSync(resolve(here, '../sketches'), { recursive: true });
writeFileSync(resolve(here, '../sketches/emblem-05.html'), html);
console.log('wrote brand/emblem/*.svg, brand/emblem/png/*.png, brand/sketches/emblem-05.html');
