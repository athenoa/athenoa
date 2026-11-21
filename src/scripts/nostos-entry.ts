// The screen on entering Nostos (src/components/nostos/NostosEntry.astro, on the map and on Learn).
// Its timing is in its CSS; this keeps it away on moves between Nostos pages (decided as the new page is
// swapped in, before it is drawn), holds the star map's arrival until it starts to fade, and takes it
// out of the page once faded. Loaded once, it stays for the rest of the visit, so it knows where each
// move comes from; a page reached before it was loaded counts as outside Nostos.

const w = window as unknown as { __nostosEntry?: boolean };
if (!w.__nostosEntry) {
  w.__nostosEntry = true;
  const inNostos = (url: URL) => /^\/(?:(?:el|grc)\/)?nostos\//.test(url.pathname);
  let from: URL | undefined;

  document.addEventListener('astro:before-preparation', (event) => {
    from = (event as Event & { from: URL }).from;
  });
  document.addEventListener('astro:after-swap', () => {
    if (from && inNostos(from)) document.querySelector('[data-nentry]')?.setAttribute('hidden', '');
  });
  document.addEventListener('astro:page-load', () => {
    const screen = document.querySelector<HTMLElement>('[data-nentry]:not([hidden])');
    if (!screen) return;
    const out = screen.getAnimations().find((a) => (a as CSSAnimation).animationName === 'nentry-out');
    // (no fade running: inside a lesson's embedded map, where it is never shown)
    if (!out) {
      screen.hidden = true;
      return;
    }
    const wait = Number(out.effect?.getTiming().delay ?? 0) - Number(out.currentTime ?? 0);
    if (wait > 0) {
      screen.classList.add('is-holding');
      window.setTimeout(() => screen.classList.remove('is-holding'), wait);
    }
    out.finished.then(() => (screen.hidden = true)).catch(() => {});
  });
}
