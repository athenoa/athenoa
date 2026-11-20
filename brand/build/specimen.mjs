// Type specimen for choosing the emblem's lettering: sets the ribbon words in each candidate face, in
// the band's ink and paper, as paths (so nothing depends on installed fonts).
//   node brand/build/specimen.mjs <font-dir> <out.svg>
// <font-dir> holds <name>-latin-<weight>-normal.woff2 and <name>-greek-<weight>-normal.woff2 files.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { create } from 'fontkitten';

const [, , dir, out] = process.argv;
const files = readdirSync(dir).filter((n) => n.endsWith('.woff2'));
const faces = [...new Set(files.map((n) => n.replace(/-(latin|greek)-(\d+)-normal\.woff2$/, '|$2')))].sort();
const H = 46; // cap height in px
const lines = ['ΑΘΕΝΟΑ', 'ΑΚΑΔΗΜΙΑ ΕΛΛΗΝΙΚΗΣ ΣΟΦΙΑΣ', 'ATHENOA'];
let y = 20;
let body = '';
for (const face of faces) {
  const [name, weight] = face.split('|');
  const load = (sub) => {
    const p = resolve(dir, `${name}-${sub}-${weight}-normal.woff2`);
    try { return create(readFileSync(p)); } catch { return null; }
  };
  const latin = load('latin');
  const greek = load('greek');
  if (!latin) continue;
  const cap = latin.capHeight || 0.7 * latin.unitsPerEm;
  body += `<text x="20" y="${y + 14}" font-family="Arial" font-size="14" fill="#071260">${name} ${weight}${greek ? '' : ' (no Greek)'}</text>`;
  y += 26;
  let x = 20;
  for (const line of lines) {
    for (const ch of [...line]) {
      if (ch === ' ') { x += H * 0.6; continue; }
      const cp = ch.codePointAt(0);
      const font = cp >= 0x370 ? greek : latin;
      const g = font && font.glyphForCodePoint(cp);
      if (!g || !g.path.commands.length) { x += H * 0.7; continue; }
      const s = H / cap;
      body += `<path fill="#f2e9d3" d="${g.path.toSVG()}" transform="translate(${x.toFixed(1)} ${y + H}) scale(${s} ${-s})"/>`;
      x += g.advanceWidth * s + H * 0.12;
    }
    x += H * 1.2;
  }
  y += H + 26;
}
writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" width="1900" height="${y + 10}" viewBox="0 0 1900 ${y + 10}"><rect width="100%" height="100%" fill="#071260"/><g>${body.replace(/<text([^>]*)fill="#071260"/g, '<text$1fill="#f2e9d3"')}</g></svg>`);
console.log('faces', faces.length, 'height', y);
