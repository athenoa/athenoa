// The places on the way home, drawn in src/assets/illustrations/journey-*.svg, for the Learn page's
// still layer behind the journey. They are served together as one file of symbols
// (src/pages/nostos/scenes.svg.ts, /nostos/scenes.svg) that the page draws with <use>, rather than
// inlined: about half of Learn's weight was these drawings (hand-drawn paths barely compress), and as a
// file they are fetched once, after the page, and kept by the browser for every language and visit.
const raw = import.meta.glob<string>('../assets/illustrations/journey-*.svg', { query: '?raw', import: 'default', eager: true });

export const scenesHref = '/nostos/scenes.svg';

export const scenes = Object.entries(raw)
  .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
  .map(([file, svg], k) => {
    const open = svg.match(/<svg\b([^>]*)>/)!;
    // (the line weight is left to the page, so phones can have it heavier)
    const attrs = open[1].replace(/\s(xmlns(:\w+)?|viewBox|width|height|stroke-width)="[^"]*"/g, '');
    const inner = svg.slice(open.index! + open[0].length, svg.lastIndexOf('</svg>'));
    return { id: k, viewBox: open[1].match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 1600 1000', attrs, inner, name: file };
  });

/** The file of symbols. Its lines keep one weight on screen whatever the drawing's size (non-scaling). */
export const scenesSprite = () =>
  `<svg xmlns="http://www.w3.org/2000/svg"><style>*{vector-effect:non-scaling-stroke}</style>${scenes
    .map((sc) => `<symbol id="njenv-${sc.id}" viewBox="${sc.viewBox}"><g${sc.attrs}>${sc.inner}</g></symbol>`)
    .join('')}</svg>`;
