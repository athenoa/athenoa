// ATHENOA emblem, sketch round 1.
// A flattened oval with one line around it, a ribbon of lettering, and an inner field holding a
// statue of Athena with rays of light coming from her head (structure after the Bureau Veritas seal,
// Maria's pick). The lettering is drawn here as monoline capitals, so it needs no font licence and
// has Greek. Variant C sets the ribbon in EB Garamond (open licence) for comparison.
//
//   node brand/build/emblem.mjs   ->  brand/sketches/emblem-01.html

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../sketches');
const f = (n) => +n.toFixed(2);
const rad = (d) => (d * Math.PI) / 180;

/* ---------- Shapes ----------
   Superellipse |x/a|^m + |y/b|^n = 1. m sets how flat the top and bottom are, n the sides
   (2 and 2 is a plain oval). */
const CX = 160;
const CY = 200;
const OUTER = { cx: CX, cy: CY, a: 150, b: 190, m: 2.5, n: 2.15 };
const BAND = { cx: CX, cy: CY, a: 124, b: 166, m: 2.7, n: 2.4 }; // centre line of the lettering
const INNER = { cx: CX, cy: CY, a: 98, b: 142, m: 3.0, n: 2.7 };

const sePoint = (o, t) => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [o.cx + o.a * Math.sign(c) * Math.abs(c) ** (2 / o.m), o.cy + o.b * Math.sign(s) * Math.abs(s) ** (2 / o.n)];
};
const grow = (o, d) => ({ ...o, a: o.a + d, b: o.b + d });
const sePath = (o, N = 360) => {
  const pts = [];
  for (let i = 0; i < N; i++) pts.push(sePoint(o, (i / N) * 2 * Math.PI));
  return 'M' + pts.map(([x, y]) => `${f(x)},${f(y)}`).join('L') + 'Z';
};
const inside = (o, x, y) => Math.abs((x - o.cx) / o.a) ** o.m + Math.abs((y - o.cy) / o.b) ** o.n < 1;
// distance from a point inside the shape to its edge, along a direction
const toEdge = (o, x, y, th) => {
  let lo = 0;
  let hi = 600;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (inside(o, x + mid * Math.cos(th), y + mid * Math.sin(th))) lo = mid;
    else hi = mid;
  }
  return lo;
};

// Walk along part of a superellipse by arc length (t0 -> t1)
function walker(o, t0, t1, N = 1600) {
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push(sePoint(o, t0 + ((t1 - t0) * i) / N));
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
    const a = pts[Math.max(0, lo - 4)];
    const b = pts[Math.min(pts.length - 1, hi + 4)];
    return {
      x: pts[lo][0] + (pts[hi][0] - pts[lo][0]) * k,
      y: pts[lo][1] + (pts[hi][1] - pts[lo][1]) * k,
      ang: Math.atan2(b[1] - a[1], b[0] - a[0]),
    };
  };
  const d = 'M' + pts.filter((_, i) => i % 8 === 0 || i === N).map(([x, y]) => `${f(x)},${f(y)}`).join('L');
  return { total, at, d };
}
// left -> over the top -> right, and left -> under the bottom -> right (letters stand upright in both)
const topWalk = (o) => walker(o, -Math.PI, 0);
const bottomWalk = (o) => walker(o, Math.PI, 0);

/* ---------- Lettering: monoline capitals, cap height 1, y down ---------- */
const ring = (cx, cy, r) => `M${cx - r},${cy}A${r},${r} 0 1 1 ${cx + r},${cy}A${r},${r} 0 1 1 ${cx - r},${cy}`;
const A = { w: 0.8, d: 'M0,1L0.4,0L0.8,1M0.17,0.6H0.63' };
const E = { w: 0.56, d: 'M0.56,0H0V1H0.56M0,0.5H0.46' };
const H = { w: 0.72, d: 'M0,0V1M0.72,0V1M0,0.5H0.72' };
const I = { w: 0, d: 'M0,0V1' };
const M = { w: 0.92, d: 'M0,1L0.1,0L0.46,0.72L0.82,0L0.92,1' };
const N = { w: 0.74, d: 'M0,1V0L0.74,1V0' };
const O = { w: 1.04, d: ring(0.52, 0.5, 0.52) };
const T = { w: 0.76, d: 'M0,0H0.76M0.38,0V1' };
const GLYPHS = {
  A, E, H, I, M, N, O, T,
  C: { w: 0.9, d: 'M0.888,0.132A0.52,0.52 0 1 0 0.888,0.868' },
  D: { w: 0.82, d: 'M0,0V1H0.32A0.5,0.5 0 0 0 0.32,0Z' },
  L: { w: 0.54, d: 'M0,0V1H0.54' },
  P: { w: 0.6, d: 'M0,1V0H0.34A0.25,0.25 0 0 1 0.34,0.5H0' },
  Y: { w: 0.76, d: 'M0,0L0.38,0.5L0.76,0M0.38,0.5V1' },
  Α: A, Ε: E, Η: H, Ι: I, Μ: M, Ν: N, Ο: O, Τ: T,
  Θ: { w: 1.04, d: ring(0.52, 0.5, 0.52) + 'M0.3,0.5H0.74' },
  Δ: { w: 0.84, d: 'M0,1L0.42,0L0.84,1Z' },
  Κ: { w: 0.66, d: 'M0,0V1M0.64,0L0.02,0.55L0.66,1' },
  Λ: { w: 0.8, d: 'M0,1L0.4,0L0.8,1' },
  Π: { w: 0.72, d: 'M0,1V0H0.72V1' },
  Ω: { w: 1.04, d: 'M0.02,1H0.3A0.52,0.52 0 1 1 0.74,1H1.02' },
};

// Lay a line of capitals along a walker, centred on the walk's midpoint
function letter(text, walk, h, track, space, sw) {
  let run = 0;
  const items = [];
  const chars = [...text];
  chars.forEach((ch, i) => {
    if (ch === ' ') return void (run += space * h);
    const g = GLYPHS[ch];
    if (!g) throw new Error(`no glyph for ${ch}`);
    if (items.length && chars[i - 1] !== ' ') run += track * h;
    items.push({ g, s: run + (g.w * h) / 2 });
    run += g.w * h;
  });
  const s0 = walk.total / 2 - run / 2;
  return items
    .map(({ g, s }) => {
      const p = walk.at(s0 + s);
      return `<path d="${g.d}" stroke-width="${f(sw / h)}" transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f((p.ang * 180) / Math.PI)}) scale(${h}) translate(${-g.w / 2} -0.5)"/>`;
    })
    .join('');
}

const star = (x, y, r) => {
  const k = r * 0.17;
  return `M${x},${y - r}Q${x + k},${y - k} ${x + r},${y}Q${x + k},${y + k} ${x},${y + r}Q${x - k},${y + k} ${x - r},${y}Q${x - k},${y - k} ${x},${y - r}Z`;
};

/* ---------- Athena ----------
   One drawing for every variant: the statue is paper with ink edges and cut lines. On the blue
   field (A) the ink edges vanish into the field and she reads as a cut-out; on the paper field (B)
   she reads as a line drawing. */
const HEAD = [160, 113];

function athena(level) {
  const small = level === 'small';
  const W = small ? { edge: 3.6, cut: 3.2, ray: 3.4 } : { edge: 2.4, cut: 1.9, ray: 2.1 };
  const out = [];

  // Rays from her head, alternately long and short, stopping short of the field's edge
  const count = small ? 17 : 33;
  const rays = [];
  for (let i = 0; i < count; i++) {
    const th = rad(-205 + (230 * i) / (count - 1));
    const r0 = 35;
    const full = toEdge(INNER, HEAD[0], HEAD[1], th) - 10;
    const r1 = i % 2 ? r0 + (full - r0) * 0.66 : full;
    const [c, s] = [Math.cos(th), Math.sin(th)];
    rays.push(`M${f(HEAD[0] + r0 * c)},${f(HEAD[1] + r0 * s)}L${f(HEAD[0] + r1 * c)},${f(HEAD[1] + r1 * s)}`);
  }
  out.push(`<g class="e-ray" stroke-width="${W.ray}"><path d="${rays.join('')}"/>`);
  out.push(`<path d="${ring(HEAD[0], HEAD[1], 22)}"/>${small ? '' : `<path d="${ring(HEAD[0], HEAD[1], 28)}"/>`}</g>`);

  out.push(`<g class="e-fig" stroke-width="${W.edge}">`);
  // plinth
  out.push('<rect x="106" y="300" width="108" height="11" rx="2"/><rect x="100" y="311" width="120" height="11" rx="2"/>');
  // shield
  out.push('<circle cx="212" cy="238" r="32"/>');
  // spear
  out.push('<rect x="109.5" y="97" width="5" height="203" rx="2"/>');
  out.push('<path d="M112,74C117.5,82 117.5,90 112,98C106.5,90 106.5,82 112,74Z"/>');
  // body: crest, helmet, hair, shoulders, peplos
  out.push(
    '<path d="M155,96L153.5,81Q160,76.5 166.5,81L165,96C170,97 174,103 174,110C175,118 176,126 179,134Q184,136 187,141' +
      'C189,160 190,185 193,205C194,240 195,270 197,298Q160,302 123,298C125,270 126,240 127,205C130,185 131,160 133,141' +
      'Q136,136 141,134C144,126 145,118 146,110C146,103 150,97 155,96Z"/>',
  );
  out.push('</g>');

  // cut lines on the statue (under the arms)
  const cuts = [];
  cuts.push('M146.5,108Q160,100 173.5,108'); // helmet brim
  cuts.push('M160,80V95'); // crest
  cuts.push(`M150.4,115a9.6,12.2 0 1 0 19.2,0a9.6,12.2 0 1 0 -19.2,0`); // face
  cuts.push('M149,111C148.6,119 147.6,127 145,134.5M171,111C171.4,119 172.4,127 175,134.5'); // hair
  cuts.push('M155.5,126.5V136M164.5,126.5V136'); // neck
  cuts.push('M150,136Q160,143 170,136'); // neckline
  cuts.push('M130.5,178Q160,184 189.5,178'); // belt
  cuts.push('M127,205Q143,213 160,207.5Q177,213 193,205'); // hem of the overfold
  // the long folds of the skirt; the right ones bow round her bent knee
  const folds = small ? [0, 2, 4, 6, 8] : [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (const i of folds) {
    const u = i / 8;
    const xt = 131 + 58 * u;
    const yt = 214 + (i % 2) * 10;
    const xb = 127 + 66 * u;
    const bow = i >= 5 ? 3.5 : i <= 1 ? -1 : 0;
    cuts.push(`M${f(xt)},${yt}Q${f((xt + xb) / 2 + bow)},${f((yt + 295) / 2)} ${f(xb)},295`);
  }
  out.push(`<path class="e-cut" stroke-width="${W.cut}" d="${cuts.join('')}"/>`);
  out.push(`<circle class="e-cut" stroke-width="${W.cut}" cx="212" cy="238" r="25"/><circle class="e-cut" stroke-width="${W.cut}" cx="212" cy="238" r="8"/>`);

  if (!small) {
    const fine = [];
    fine.push('M155.6,114.6Q157.4,113 159,114.6M161,114.6Q162.6,113 164.4,114.6'); // eyes
    fine.push('M160,116L159.3,121.2L160.8,121.6'); // nose
    fine.push('M158.2,124.4Q160,125.3 161.8,124.4'); // mouth
    // the aegis: a scalloped collar of scales
    const P0 = [137, 142];
    const P1 = [160, 180];
    const P2 = [183, 142];
    const q = (t) => [0, 1].map((k) => (1 - t) ** 2 * P0[k] + 2 * (1 - t) * t * P1[k] + t * t * P2[k]);
    const n = 7;
    let d = `M${f(q(0)[0])},${f(q(0)[1])}`;
    for (let i = 1; i <= n; i++) {
      const [x, y] = q(i / n);
      const [px, py] = q((i - 1) / n);
      d += `A${f(Math.hypot(x - px, y - py) / 2)},${f(Math.hypot(x - px, y - py) / 2)} 0 0 0 ${f(x)},${f(y)}`;
    }
    fine.push(d);
    fine.push('M146,162L144,176M174,162L176,176'); // folds over the breast
    fine.push('M140,185L138.5,207M150,187L149.5,209.5M170,187L170.5,209.5M180,185L181.5,207'); // folds of the overfold
    fine.push('M108,304.5H212'); // moulding of the plinth
    fine.push('M112,78V94'); // rib of the spear
    out.push(`<path class="e-cut" stroke-width="${W.cut * 0.8}" d="${fine.join('')}"/>`);
    out.push(`<circle class="e-cut" stroke-width="${W.cut * 0.8}" cx="160" cy="153" r="3.2"/>`); // gorgoneion
  }
  out.push(`<circle class="e-dot" cx="212" cy="238" r="${small ? 3.2 : 2.4}"/>`);

  // arms, then hands (over the spear and the shield's rim)
  out.push(`<g class="e-fig" stroke-width="${W.edge}">`);
  out.push('<path d="M134,140C127,148 121,162 118.5,176C116.5,185 113.5,191 110.5,194L117.5,202C121,196.5 125,189 127.5,182.5C130,174 133.5,162 138,152Z"/>');
  out.push('<path d="M186,140C193,148 199,162 201.5,176C203,185 205,192 207,199L200,205C198,198 195,191 192.5,182.5C190,174 186.5,162 182,152Z"/>');
  // the right hand closes round the spear; the left lies over the shield's rim
  out.push('<ellipse cx="113.5" cy="198.5" rx="6.5" ry="6"/><ellipse cx="0" cy="0" rx="5.2" ry="7.6" transform="translate(205 209) rotate(-18)"/>');
  out.push('</g>');
  if (!small) out.push(`<path class="e-cut" stroke-width="${W.cut * 0.8}" d="M109,197.5H118M109.5,201H117.5M201.6,210.6Q205,212.2 208.6,209.4M202.8,213.8Q205.6,215 208,212.8"/>`);

  return out.join('');
}

/* ---------- The emblem ---------- */
const TEXTS = {
  en: { top: 'ATHENOA', bottom: 'PLATONIC ACADEMY' },
  el: { top: 'ΑΘΕΝΟΑ', bottom: 'ΠΛΑΤΩΝΙΚΗ ΑΚΑΔΗΜΙΑ' },
};

function emblem({ lang = 'en', letters = 'drawn', level = 'full' } = {}) {
  const t = TEXTS[lang];
  const parts = [];
  parts.push(`<path class="e-outer" d="${sePath(OUTER)}"/>`);
  if (letters === 'drawn') {
    const topH = 24;
    const botH = lang === 'el' ? 13.5 : 15;
    parts.push('<g class="e-letters">');
    parts.push(letter(t.top, topWalk(BAND), topH, lang === 'el' ? 1.05 : 0.9, 0, 2.7));
    parts.push(letter(t.bottom, bottomWalk(BAND), botH, lang === 'el' ? 0.36 : 0.42, 0.95, 2.0));
    parts.push('</g>');
  } else {
    // EB Garamond capitals on a path (cap height about 0.65 em)
    const topPath = topWalk(grow(BAND, -12));
    const botPath = bottomWalk(grow(BAND, 7.5));
    parts.push(`<path id="tp-${lang}" d="${topPath.d}" fill="none"/><path id="bp-${lang}" d="${botPath.d}" fill="none"/>`);
    parts.push(
      `<text class="e-serif" font-size="37" letter-spacing="9"><textPath href="#tp-${lang}" startOffset="50%" text-anchor="middle">${t.top}</textPath></text>`,
    );
    parts.push(
      `<text class="e-serif" font-size="23" letter-spacing="3.2"><textPath href="#bp-${lang}" startOffset="50%" text-anchor="middle">${t.bottom}</textPath></text>`,
    );
  }
  // little four-point stars where the two lines of lettering meet
  const L = sePoint(BAND, Math.PI);
  const R = sePoint(BAND, 0);
  parts.push(`<path class="e-star" d="${star(L[0], L[1], 6.5)}${star(R[0], R[1], 6.5)}"/>`);
  parts.push(`<path class="e-field" d="${sePath(INNER)}"/>`);
  parts.push(athena(level));
  return `<svg class="em" viewBox="0 0 320 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ATHENOA">${parts.join('')}</svg>`;
}

// The inner medallion on its own, for small sizes (header, favicon)
function medallion() {
  return `<svg class="em" viewBox="58 54 204 292" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ATHENOA"><path class="e-field" d="${sePath(INNER)}"/>${athena('small')}</svg>`;
}

/* ---------- Sketch page ---------- */
const V = [
  { id: 'A', cls: 'v-a', note: 'Veritas: Greek-blue field, Athena cut out in paper', svg: emblem() },
  { id: 'B', cls: 'v-b', note: 'All line: paper field, Athena drawn in blue', svg: emblem() },
  { id: 'C', cls: 'v-a', note: 'As A, ribbon in EB Garamond capitals', svg: emblem({ letters: 'serif' }) },
  { id: 'A·ΕΛ', cls: 'v-a', note: 'Greek ribbon: ΑΘΕΝΟΑ as on Athena’s hero, ΠΛΑΤΩΝΙΚΗ ΑΚΑΔΗΜΙΑ', svg: emblem({ lang: 'el' }) },
  { id: 'A rev', cls: 'v-a rev', note: 'A printed crème on Greek blue', svg: emblem() },
];
const small = emblem({ level: 'small' });
const med = medallion();

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>ATHENOA emblem, sketch 01</title>
<style>
@font-face { font-family: 'EBG'; src: url('../../node_modules/@fontsource-variable/eb-garamond/files/eb-garamond-latin-wght-normal.woff2') format('woff2'); font-weight: 400 800; }
@font-face { font-family: 'EBG'; src: url('../../node_modules/@fontsource-variable/eb-garamond/files/eb-garamond-greek-wght-normal.woff2') format('woff2'); font-weight: 400 800; unicode-range: U+0370-03FF; }
@font-face { font-family: 'Disp'; src: url('../../node_modules/@fontsource-variable/noto-serif-display/files/noto-serif-display-latin-standard-normal.woff2') format('woff2-variations'); font-weight: 100 900; font-stretch: 62.5% 100%; }
:root { --ink: #0b1c8c; --paper: #f2e9d3; --deep: #071260; --light: #b3c0f3; }
body { margin: 0; background: #f2e9d3; color: #071260; font: 17px/1.45 'EBG', Georgia, serif; }
main { max-width: 1400px; margin: 0 auto; padding: 40px 32px 80px; }
h1 { font: 300 44px/1 'Disp'; font-stretch: 75%; letter-spacing: .02em; margin: 0 0 6px; color: var(--ink); }
h2 { font: 400 15px/1 'EBG'; letter-spacing: .14em; text-transform: uppercase; margin: 48px 0 16px; color: var(--ink); }
p.lede { max-width: 60ch; margin: 0 0 8px; }
.row { display: flex; gap: 28px; align-items: flex-end; flex-wrap: wrap; }
.cell { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.cell small { font-size: 14px; max-width: 220px; text-align: center; color: #3b4683; }
.cell b { font-weight: 600; color: var(--ink); }
.pad { padding: 18px; border-radius: 26px; }
.rev { --ink: #f2e9d3; --paper: #0b1c8c; }
.pad.rev { background: #0b1c8c; }
.v-a { --field: var(--ink); --ray: var(--paper); --fig: var(--paper); --edge: var(--ink); }
.v-b { --field: var(--paper); --ray: var(--ink); --fig: var(--paper); --edge: var(--ink); }
.em { display: block; height: var(--h, 340px); width: auto; overflow: visible; }
.e-outer { fill: var(--paper); stroke: var(--ink); stroke-width: 3.2; }
.e-letters path { fill: none; stroke: var(--ink); stroke-linecap: round; stroke-linejoin: round; }
.e-serif { fill: var(--ink); font-family: 'EBG'; font-weight: 500; }
.e-star { fill: var(--ink); }
.e-field { fill: var(--field); stroke: var(--ink); stroke-width: 3; }
.e-ray { fill: none; stroke: var(--ray); stroke-linecap: round; }
.e-fig { fill: var(--fig); stroke: var(--edge); stroke-linejoin: round; }
.e-cut { fill: none; stroke: var(--edge); stroke-linecap: round; stroke-linejoin: round; }
.e-dot { fill: var(--edge); }
.bar { display: flex; align-items: center; gap: 12px; padding: 10px 22px; border-radius: 999px; background: #f2e9d3; box-shadow: inset 0 0 0 1px rgba(11,28,140,.18); }
.bar.sky { background: #b3c0f3; box-shadow: none; }
.bar span { font: 400 30px/1 'Disp'; font-stretch: 75%; letter-spacing: .06em; color: var(--ink); }
.bar .menu { margin-left: 40px; font: 400 14px/1 'EBG'; letter-spacing: .08em; color: var(--deep); }
</style></head>
<body><main>
<h1>ATHENOA emblem, sketch 01</h1>
<p class="lede">An oval flattened at top and bottom, one line around, a ribbon of lettering, and an inner field with a statue of Athena, rays of light coming from her head. The capitals are drawn by hand in one even stroke, like a cut inscription, so they match the line drawings and work in Greek.</p>

<h2>Large</h2>
<div class="row">${V.map((v) => `<div class="cell"><div class="pad ${v.cls}">${v.svg}</div><small><b>${v.id}</b> ${v.note}</small></div>`).join('')}</div>

<h2>Footer, 96 px</h2>
<div class="row">${V.map((v) => `<div class="cell"><div class="pad ${v.cls}" style="--h:96px">${v.svg}</div><small><b>${v.id}</b></small></div>`).join('')}
<div class="cell"><div class="pad v-a" style="--h:96px">${small}</div><small><b>A</b> simplified drawing</small></div></div>

<h2>Header, 56 px</h2>
<div class="row" style="flex-direction:column;align-items:flex-start;gap:18px">
<div class="bar v-a" style="--h:56px">${small}<span>ATHENOA</span><em class="menu">COURSES&nbsp;&nbsp;&nbsp;ABOUT&nbsp;&nbsp;&nbsp;NOSTOS</em></div>
<div class="bar v-a" style="--h:56px">${med}<span>ATHENOA</span><em class="menu">COURSES&nbsp;&nbsp;&nbsp;ABOUT&nbsp;&nbsp;&nbsp;NOSTOS</em></div>
<div class="bar sky v-a" style="--h:56px">${med}<span>ATHENOA</span><em class="menu">COURSES&nbsp;&nbsp;&nbsp;ABOUT&nbsp;&nbsp;&nbsp;NOSTOS</em></div>
</div>

<h2>Small mark: the inner medallion alone</h2>
<div class="row">${[160, 96, 56, 32, 16].map((h) => `<div class="cell"><div class="v-a" style="--h:${h}px">${med}</div><small>${h} px</small></div>`).join('')}
<div class="cell"><div class="pad v-a rev" style="--h:56px">${med}</div><small>on blue</small></div></div>
</main></body></html>`;

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'emblem-01.html'), page);
console.log('wrote brand/sketches/emblem-01.html');
