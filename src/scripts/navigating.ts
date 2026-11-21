// While the next page is on its way. The site changes pages in place (Astro's ClientRouter), which keeps
// the old page standing, untouched, until the whole new one has arrived: on a slow connection a click
// seemed to do nothing for seconds (Maria, 21 November 2026). If the new page takes longer than a
// moment, the old one dims a little and the pointer shows it is working, so the click is seen to
// have been heard. (Entering Nostos has a screen of its own: src/scripts/nostos-entry.ts.)
type Preparation = Event & { loader: () => Promise<void>; to: URL; from: URL };

document.addEventListener('astro:before-preparation', (event) => {
  const prep = event as Preparation;
  const load = prep.loader;
  prep.loader = async () => {
    const root = document.documentElement;
    const soon = window.setTimeout(() => root.classList.add('is-navigating'), 160);
    try {
      await load();
    } finally {
      window.clearTimeout(soon);
      root.classList.remove('is-navigating');
    }
  };
});
