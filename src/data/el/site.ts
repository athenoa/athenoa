// DRAFT machine translation (English to Greek) of src/data/site.ts, for layout and typeface testing only.
// To be reviewed by Athena before any of it is published.

export const site = {
  name: 'ATHENOA',
  // The live footer signs off in Greek capitals.
  copyright: '© ΑΚΑΔΗΜΙΑ ΑΘΕΝΟΑ',
  url: 'https://www.athenoa.academy',
  locale: 'el',
  // "Who We Are" from the old footer. No longer shown there; kept for descriptions and machine-readable summaries.
  description:
    'Η ATHENOA είναι ένα Τέμενος Πολιτισμού που αναζωπυρώνει την Αρχαία Ελληνική Σοφία ως ζωντανό δρόμο αυτοπραγμάτωσης, ιερής παιδείας και πολιτικής αρετής.',
  mission:
    'Με οδηγό το Αρχέτυπο της Θεάς Αθηνάς, φωτίζουμε τον δρόμο από τη διανοητική μάθηση στην ενσώματη γνώση, από τη φιλοσοφία στην εσωτερική αφύπνιση — αποκαθιστώντας τη σχέση μας με τη Φύση, με την Ψυχή και με τον Κόσμο.',
  founder: 'Δρ. Αθηνά Δέσποινα Ποτάρη',
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
  home: { label: 'Αρχική', href: '/' },
  nav: [
    // menu: 'courses' opens a list of the course pages under it (Header.astro). Membership added to the
    // menu (Maria, 22 November 2026); its label is NEW WORDING, proposed.
    { label: 'Ζωντανά μαθήματα', href: '/courses/', menu: 'courses' },
    { label: 'Γίνε Μέλος της Ακαδημίας', href: '/membership/' },
    { label: 'Σχετικά με τη Δρ. Αθηνά', href: '/about-athena/' }, // last in the menu (Maria, 23 November 2026)
    // Nostos is hidden from the menu for the launch (Maria, 22 November 2026). To bring it back:
    // { label: nostosUi.el.entry.nav, href: '/nostos/play/', section: '/nostos/' }, with nostosUi imported from data/nostos/ui
  ],
  footer: {
    linksTitle: 'Εσωτερικοί Σύνδεσμοι',
    links: [
      { label: 'Αρχική', href: '/' },
      { label: 'Μάθετε περισσότερα', href: '/about-athena/#contact' },
    ],
    connectTitle: 'Επικοινωνήστε μαζί μας',
    contactFormLabel: 'Φόρμα επικοινωνίας',
    followTitle: 'Ακολουθήστε μας',
  },
  routes: {
    contact: '/about-athena/#contact',
    courses: '/courses/',
    membership: '/membership/',
  },
} as const;
