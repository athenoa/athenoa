// Screenshot a local brand page with the installed Chrome.
// node brand/build/shot.mjs brand/sketches/emblem-01.html out.png [--width 1440] [--scale 1]
import { chromium } from 'playwright-core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , file, out, ...rest] = process.argv;
const opt = (name, fallback) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : fallback;
};
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({
  viewport: { width: Number(opt('width', 1440)), height: 900 },
  deviceScaleFactor: Number(opt('scale', 1)),
});
await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const clip = opt('clip', null);
await page.screenshot(clip ? { path: out, clip: JSON.parse(clip) } : { path: out, fullPage: true });
await browser.close();
