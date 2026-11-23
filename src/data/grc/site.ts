// A playful DRAFT translation into Ancient Greek (Attic prose) of src/data/site.ts, made by machine.
// To be reviewed by Athena before anything is published.

export const site = {
  name: 'ATHENOA',
  wordmark: 'ΑΘΗΝΟΑ',
  // The live footer signs off in Greek capitals. Left as it is.
  copyright: '© ΑΚΑΔΗΜΙΑ ΑΘΕΝΟΑ',
  url: 'https://www.athenoa.academy',
  locale: 'grc',
  // "Who We Are" from the old footer. No longer shown there; kept for descriptions and machine-readable summaries.
  description:
    'Ἡ ATHENOA Μουσῶν τέμενός ἐστιν, ὃ τὴν παλαιὰν τῶν Ἑλλήνων σοφίαν ἀναζωπυρεῖ ὡς ὁδὸν ζῶσαν ἐπὶ τὸ γενέσθαι ἕκαστον οἷός ἐστι καὶ ἐπὶ παιδείαν ἱερὰν καὶ πολιτικὴν ἀρετήν.',
  mission:
    'Ἡγεμόνι χρώμενοι τῷ τῆς θεοῦ Ἀθηνᾶς ἀρχετύπῳ, φῶς παρέχομεν τῇ ὁδῷ τῇ φερούσῃ ἀπὸ μὲν τῆς λόγῳ μαθήσεως ἐπὶ τὴν ἔργῳ γνῶσιν, ἀπὸ δὲ φιλοσοφίας ἐπὶ τὴν ἔνδον ἐγρήγορσιν — τὴν ἡμετέραν πρὸς τὴν Φύσιν καὶ τὴν Ψυχὴν καὶ τὸν Κόσμον οἰκειότητα ἀνανεούμενοι.',
  // No "Dr." here: the title is rendered in running text as ἡ διδάσκαλος (see nav and ./about.ts).
  // The first word must stay a substring of about.title, which AboutHero splits at it.
  founder: 'Ἀθηνᾶ Δέσποινα Ποτάρη',
  phone: { display: '(0030) 690-606-8444', href: 'tel:00306906068444' },
  emails: ['philathenea@athenoa.academy'],
  membershipForm: 'https://docs.google.com/forms/d/10wWFfEJswGyhoiPyGHOc5QjUimHitGUBsbFaHlYpnvY/viewform',
  social: [
    { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/athenapotari/' },
    { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/athena_potari/' },
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/@athenoa' },
    { id: 'whatsapp', name: 'WhatsApp', url: 'https://wa.me/306906068444' },
  ],
  // Home, by name. The logo links here, so the header menu does not repeat it.
  home: { label: 'Οἴκαδε', href: '/grc/' },
  nav: [
    // menu: 'courses' opens a list of the course pages under it (Header.astro). Membership added to the
    // menu (Maria, 22 November 2026); its label is NEW WORDING, proposed.
    { label: 'Ζῶντα μαθήματα', href: '/grc/courses/', menu: 'courses' },
    { label: 'Οἱ ἑταῖροι', href: '/grc/membership/' },
    { label: 'Περὶ τῆς διδασκάλου Ἀθηνᾶς', href: '/grc/about-athena/' }, // last in the menu (Maria, 23 November 2026)
    // Nostos is hidden from the menu for the launch (Maria, 22 November 2026). To bring it back:
    // { label: nostosUi.el.entry.nav, href: '/grc/nostos/play/', section: '/grc/nostos/' }, with nostosUi imported from data/nostos/ui
  ],
  footer: {
    linksTitle: 'Οἱ ἔνδον σύνδεσμοι',
    links: [
      { label: 'Οἴκαδε', href: '/grc/' },
      { label: 'Μάθετε πλείω', href: '/grc/about-athena/#contact' },
    ],
    connectTitle: 'Διαλέγεσθε ἡμῖν',
    contactFormLabel: 'Γράψατε ἡμῖν ἐνταῦθα',
    followTitle: 'Ἕπεσθε ἡμῖν',
  },
  routes: {
    contact: '/grc/about-athena/#contact',
    courses: '/grc/courses/',
    membership: '/grc/membership/',
  },
} as const;
