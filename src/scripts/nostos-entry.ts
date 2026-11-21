// The screen on entering Nostos (src/components/nostos/NostosEntry.astro: in every page's layout, kept
// across page changes). Its fade is in its CSS. Arriving fresh at the map or Learn it is up from the
// first paint. A click into them from outside Nostos brings it up at once, before the new page has
// arrived (on a slow connection that took up to ten seconds, and the click seemed dead: Maria,
// 21 November 2026); it waits for the page, is carried into it, and fades once it has been up four
// seconds and the page is there (the emblem slowly fading in, then out, in that time). Moving between Nostos pages it never shows (it stays as it
// was: hidden). This also holds the star map's arrival until it fades, and takes it out once faded.

const w = window as unknown as { __nostosEntry?: boolean };
if (!w.__nostosEntry) {
  w.__nostosEntry = true;
  // (paths may carry the preview's prefix, /athenoa)
  const inNostos = (path: string) => /\/nostos\//.test(path);
  const isEntry = (path: string) => /\/nostos\/(?:play\/)?$/.test(path);
  const screen = () => document.querySelector<HTMLElement>('[data-nentry]');
  const fadeOf = (el: HTMLElement) => el.getAnimations().find((a) => (a as CSSAnimation).animationName === 'nentry-out');
  const markFadeOf = (el: HTMLElement) =>
    el.getAnimations({ subtree: true }).find((a) => (a as CSSAnimation).animationName === 'nentry-mark-out');
  let shownAt = 0;

  // the emblem is fetched as soon as a link in looks likely to be followed
  const likely = (event: Event) => {
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
    if (link && isEntry(new URL(link.href).pathname) && !inNostos(location.pathname))
      screen()?.querySelector('img')?.setAttribute('loading', 'eager');
  };
  for (const type of ['pointerover', 'focusin', 'touchstart']) document.addEventListener(type, likely, { passive: true });

  document.addEventListener('astro:before-preparation', (event) => {
    const { from, to } = event as Event & { from: URL; to: URL };
    const el = screen();
    if (!el) return;
    if (isEntry(to.pathname) && !inNostos(from.pathname)) {
      el.querySelector('img')?.setAttribute('loading', 'eager');
      el.classList.add('is-waiting');
      el.hidden = false;
      const at = (shownAt = performance.now());
      // (should the page never come, it fades all the same)
      window.setTimeout(() => {
        if (shownAt === at && el.classList.contains('is-waiting')) {
          const fade = fadeOf(el);
          if (fade) fade.currentTime = Number(fade.effect?.getTiming().delay ?? 0);
          el.classList.remove('is-waiting');
          fade?.finished.then(() => (el.hidden = true)).catch(() => {});
        }
      }, 20000);
    } else if (!el.hidden) {
      // leaving while it is up, or another way taken before the page came
      el.classList.remove('is-waiting');
      el.hidden = true;
    }
  });

  // Carried into the new page, the screen starts its animations over: the fades already under way are
  // put back where they were (before the new page is drawn), so the emblem does not blink out and
  // come up again. (Its fading out, and the screen's, wait paused until the page is working.)
  document.addEventListener('astro:after-swap', () => {
    const el = screen();
    if (!el || el.hidden || !el.classList.contains('is-waiting')) return;
    const since = performance.now() - shownAt;
    for (const a of el.getAnimations({ subtree: true }))
      if ((a as CSSAnimation).animationName === 'nentry-in') a.currentTime = since;
  });

  document.addEventListener('astro:page-load', () => {
    const el = screen();
    // (the emblem is also fetched once any page has settled, so it is there the moment it is needed)
    if (el?.hidden && !document.documentElement.classList.contains('nmap-embed')) window.setTimeout(() => el.querySelector('img')?.setAttribute('loading', 'eager'), 3000);
    if (!el || el.hidden) return;
    const fade = fadeOf(el);
    // (not drawn: inside a lesson's embedded map)
    if (!fade) {
      el.hidden = true;
      return;
    }
    const hold = Number(fade.effect?.getTiming().delay ?? 0);
    if (el.classList.contains('is-waiting')) {
      // up since the click: on towards its fade, as far as the time it has been up, but never past the
      // start of the emblem's fading out, so a page that came late still sees the emblem go slowly
      const markFade = markFadeOf(el);
      const start = markFade ? Number(markFade.effect?.getTiming().delay ?? hold) : hold;
      const at = Math.min(start, performance.now() - shownAt);
      fade.currentTime = at;
      if (markFade) markFade.currentTime = at;
      el.classList.remove('is-waiting');
    }
    const wait = hold - Number(fade.currentTime ?? 0);
    if (wait > 0) {
      el.classList.add('is-holding');
      window.setTimeout(() => el.classList.remove('is-holding'), wait);
    }
    fade.finished.then(() => (el.hidden = true)).catch(() => {});
  });
}
