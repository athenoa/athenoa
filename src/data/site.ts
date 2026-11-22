// Site-wide facts. Copy here is taken from the live site (athenoa.academy, October 2026).

export const site = {
  name: 'ATHENOA',
  // The live footer signs off in Greek capitals.
  copyright: '© ATHENOA ACADEMY',
  url: 'https://www.athenoa.academy',
  locale: 'en',
  // "Who We Are" from the old footer. No longer shown there; kept for descriptions and machine-readable summaries.
  description:
    'ATHENOA is a Cultural Sanctuary which rekindles Ancient Hellenic Wisdom as a living path of self-realization, sacred education, and civic virtue.',
  mission:
    'Guided by the Archetype of Goddess Athena, we illuminate the way from intellectual learning to embodied knowing, from philosophy to inner awakening—restoring our relationship with Nature, with Soul, and with the World.',
  founder: 'Dr. Athena Despoina Potari',
  phone: { display: '(0030) 690-606-8444', href: 'tel:00306906068444' },
  emails: ['philathenea@athenoa.academy'],
  membershipForm: 'https://docs.google.com/forms/d/10wWFfEJswGyhoiPyGHOc5QjUimHitGUBsbFaHlYpnvY/viewform',
  social: [
    { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/athenapotari/' },
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/athena_potari/' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@athenoa' },
  ],
  // Home, by name. The logo links here, so the header menu does not repeat it.
  home: { label: 'Home', href: '/en/' },
  nav: [
    { label: 'About Dr. Athena', href: '/en/about-athena/' },
    // menu: 'courses' opens a list of the course pages under it (Header.astro). Membership added to the
    // menu (Maria, 22 November 2026); its label is NEW WORDING, proposed.
    { label: 'Live Courses', href: '/en/courses/', menu: 'courses' },
    { label: 'Membership', href: '/en/membership/' },
    // Nostos is hidden from the menu for the launch (Maria, 22 November 2026). To bring it back:
    // { label: nostosUi.en.entry.nav, href: '/en/nostos/play/', section: '/en/nostos/' }, with nostosUi imported from data/nostos/ui
  ],
  footer: {
    linksTitle: 'Internal Links',
    links: [
      { label: 'Home', href: '/en/' },
      { label: 'Learn more', href: '/en/about-athena/#contact' },
    ],
    connectTitle: 'Connect with us',
    contactFormLabel: 'Contact form',
    followTitle: 'Follow us',
  },
  routes: {
    contact: '/en/about-athena/#contact',
    courses: '/en/courses/',
    membership: '/en/membership/',
  },
} as const;
