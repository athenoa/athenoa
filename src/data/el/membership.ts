// The membership page in Greek: Athena's text from the old athenoa.academy/melos (see ../membership.ts).
// The ways to pay are for a year (12 instalments, the Stripe amounts); their wording follows the old
// page, which still spoke of 8 instalments and a course. Labels around the text are interface wording.
import type { Membership } from '../membership';

const generosity =
  'Τα Δίδακτρα Αγάπης και Γενναιοδωρίας συμπεριλαμβάνουν τα βασικά δίδακτρα + χορηγία για τους συμμαθητές μας που το έχουν ανάγκη. Η Γενναιοδωρία σας θα μας βοηθήσει να παρέχουμε τα μειωμένα δίδακτρα στους σπουδαστές που το χρειάζονται και θα στηρίξει το έργο της Σχολής μας!';

export const membership: Membership = {
  title: 'Γίνε Μέλος της Ακαδημίας',
  description:
    'Γίνετε ετήσιο Μέλος της Ακαδημίας ΑΘΕΝΟΑ: όλοι οι Κύκλοι Σπουδών και τα Σεμινάρια, η Βιβλιοθήκη Μαθημάτων και άλλα προνόμια.',
  questions: [
    'Εμπνέεσαι να φοιτήσεις με μεθοδικό τρόπο στην Ατραπό της Ελληνικής Φιλοσοφίας & του Φωτός;',
    'Θα ήθελες να βαδίσεις στα χνάρια που βάδισε ο Σωκράτης, ο Πλάτων και οι Αρχαίοι μας Σοφοί, με την μεθοδικότητα και το ζωντανό πνεύμα της Αρχαίας Ακαδημίας;',
    'Επιθυμείς να συμβάλεις στην Αναγέννηση του Ελληνικού Πνεύματος;',
  ],
  cta: 'Εγγραφή',
  lead: 'Η Σχολή μας για τρίτο έτος λειτουργεί την δυνατότητα ετήσιας συνδρομής ως Μέλος στην Ακαδημία Ελληνικής Σοφίας!',
  // Athena's paragraphs regrouped as an intro and a list of what membership gives (Maria, 23 November 2026)
  paragraphs: [
    'Πέραν των Αυτοτελών Κύκλων Μαθημάτων, και φέτος για τρίτη χρονιά υπάρχει η δυνατότητα φοίτησης ως Μέλος της Ακαδημίας. Ως Μέλος:',
  ],
  benefits: [
    { icon: 'mem-doors', text: 'Έχεις πρόσβαση σε <strong>όλους τους ζωντανούς Κύκλους Σπουδών &amp; Σεμινάρια</strong> της Ακαδημίας μας' },
    { icon: 'mem-scroll', text: 'Λαμβάνεις μια <strong>βαθύτερη, οργανωμένη και ολοκληρωμένη Παιδεία</strong> στη Θεωρία &amp; Πρακτική της Φιλοσοφίας' },
    { icon: 'mem-path', text: 'Εμβαθύνεις μυητικά στο <strong>μονοπάτι της Αφύπνισης</strong>, με αναβαθμούς Γνώσης, Πρακτικών και Μυήσεων' },
    { icon: 'mem-books', text: 'Έχεις πρόσβαση στη <strong>Βιβλιοθήκη Μαθημάτων</strong>' },
    { icon: 'mem-circle', text: 'Γίνεσαι μέρος της <strong>Κοινότητας</strong> των σπουδαστών μας' },
    { icon: 'mem-star', text: 'Και <strong>άλλα προνόμια</strong> Μέλους' },
  ],
  more: 'Εάν ενδιαφέρεσαι, διάβασε περισσότερα στον παρακάτω σύνδεσμο:',
  formLink: 'Γίνε Μέλος',
  registration: {
    label: 'Εγγραφή & Δίδακτρα',
    per: 'για ολόκληρο το έτος',
    // 10% έκπτωση με την προπληρωμή του έτους (see the English file); the Stripe "full" links charge 891€ / 1026€ (new links, 23 November 2026)
    upfrontDiscount: 0.1,
    payInFull: 'Συνέχεια',
    payMonthly: 'Συνέχεια',
    tiers: [
      {
        name: 'Κανονικά Δίδακτρα',
        id: 'standard',
        price: 990,
        perMonth: 83,
        payments: 12,
        payInFull: 'https://book.stripe.com/aFafZiaYwaMXdBT8Jy9sk0j',
        payMonthly: 'https://buy.stripe.com/4gM6oI0jS08jcxP7Fu9sk0i',
      },
      {
        name: 'Δίδακτρα Αγάπης',
        id: 'love',
        price: 1140,
        perMonth: 95,
        payments: 12,
        notes: [generosity],
        payInFull: 'https://book.stripe.com/fZueVe9UscV5fK16Bq9sk0k',
        payMonthly: 'https://buy.stripe.com/cNifZi6Ig3kvdBT2la9sk0g',
      },
    ],
    // the notes go in a closed item under the prices (Maria, 23 November 2026)
    notesTitle: 'Πληρωμή & όροι',
    notes: [
      'Η εξόφληση σε 12 μηνιαίες δόσεις παρέχεται αποκλειστικά για τη διευκόλυνσή σας.',
      'Η εγγραφή αφορά το σύνολο του εκπαιδευτικού Κύκλου και προϋποθέτει την καταβολή ολόκληρου του ποσού, ανεξάρτητα από την επιλογή του τρόπου πληρωμής.',
    ],
  },
};
