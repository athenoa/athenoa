// DRAFT machine translation (English to Greek) of src/data/home.ts, for layout and typeface testing only.
// To be reviewed by Athena before any of it is published.
import { site } from './site';
import { courseHref } from './courses';

export const home = {
  meta: {
    title: 'ΑΘΕΝΟΑ | Σπουδάστε στη Σύγχρονη Πλατωνική Ακαδημία',
    description: site.description,
  },

  hero: {
    // The live page sets this as two headings; here it is the page's single h1.
    // New wording from Maria, 22 November 2026, in the case she wrote it
    titleLines: ['Μια Σύγχρονη Ακαδημία Αρχαίας Ελληνικής Σοφίας', 'Θυμήσου Ποιος Αληθινά Είσαι'],
    // The first line is the title; the second is its subtitle and is set smaller.
    // These words of the title sit on an organic highlight, which animates in last.
    // Must stay an exact substring of one title line: the page looks it up with indexOf.
    highlight: 'Ελληνικής Σοφίας',
    // The subtitle as it is shown: the same words as the second title line (not in capitals, which the
    // handwritten face cannot carry).
    subtitle: 'Θυμήσου Ποιος Αληθινά Είσαι',
  },

  membership: {
    title: 'Τώρα μπορείτε να γίνετε ετήσιο Μέλος της Ακαδημίας!',
    question: 'Θα θέλατε να σπουδάσετε μεθοδικά στον Δρόμο της Ελληνικής Φιλοσοφίας και του Φωτός;',
    points: [
      {
        title: 'Το Ζωντανό Πνεύμα',
        text: 'Θα βαδίσετε στα χνάρια του Σωκράτη, του Πλάτωνα και των Αρχαίων Σοφών μας, με τη μεθοδικότητα και την ακρίβεια του Προγράμματος Σπουδών και το ζωντανό πνεύμα της Αρχαίας Ακαδημίας.',
      },
      {
        title: 'Η Κοινότητά μας',
        text: 'Θα μετέχετε ολόψυχα στις δραστηριότητες, στα σεμινάρια και στην υπέροχη Κοινότητα της Σχολής μας',
      },
      {
        title: 'Η Συμβολή σας',
        text: 'Θα συμβάλετε στην Αναγέννηση του Ελληνικού Πνεύματος',
      },
    ],
    cta: { label: 'Ανακαλύψτε όλες τις παροχές', href: site.routes.membership },
  },

  announcement: {
    greeting: 'Αγαπητοί Φίλοι και Φωτεινοί Συνοδοιπόροι στον Δρόμο του Ελληνικού Φωτός,',
    text: 'Με μεγάλη χαρά ανακοινώνω την επανέναρξη των μαθημάτων!',
    signature: {
      role: 'Ιδρύτρια της Φιλοσοφικής Ακαδημίας ΑΘΕΝΟΑ',
      alt: 'Η Δρ. Αθηνά Πόταρη χαμογελά ανάμεσα στα ράφια μιας βιβλιοθήκης, κρατώντας ένα βιβλίο',
    },
    newsletter: {
      title: 'Ενημερωτικό Δελτίο',
      text: 'Ενημερωθείτε πρώτοι για τα νέα, τα άρθρα και τις προσεχείς δραστηριότητές μας',
      cta: { label: 'Εγγραφή', href: '#newsletter' },
    },
    // The courses announced here: the two open on the live site (22 November 2026) and the one from
    // January 2027. Each is drawn as a course card, the same as on the courses page.
    courses: [{ slug: 'odusseia' }, { slug: 'eu-zen' }], // the non-duality course returns later (Athena, 23 November 2026)
  },

  seminar: {
    kicker: 'ΜΗΝΙΑΙΟ ΣΕΜΙΝΑΡΙΟ',
    title: 'Ορφικοί Ύμνοι - Η ουσία της Πνευματικής Τεχνολογίας των Ελλήνων',
    open: 'Ανοιχτό σε όλους + νέους σπουδαστές',
    note: '*Η ημερομηνία έναρξης του σεμιναρίου θα ανακοινωθεί σύντομα',
  },

  series: {
    title: 'Εξερευνήστε τη νέα μας σειρά μαθημάτων',
    // Same sentence as the summary of the course in ./courses.ts (the course shown in full below).
    text: 'Σε αυτόν τον Κύκλο Σπουδών Ελληνικής Φιλοσοφίας θα διδαχθούμε την Οδύσσεια ως διαχρονικό θησαυρό Σοφίας, συμβολικό Χάρτη της ανθρώπινης Ψυχής και του Ταξειδιού της προς την Αυτογνωσία και την Αφύπνιση.',
    cta: { label: 'Ξεκινήστε', href: courseHref('odusseia') },
    more: 'Μάθετε περισσότερα παρακάτω',
    // The course shown in full on the home page (CourseTabs.astro)
    courseSlug: 'odusseia',
  },

  transmission: {
    title: 'Αρχαία Σκέψη για ένα Βιώσιμο Μέλλον',
    text: 'Ελάτε μαζί μας να αποδώσουμε ξανά στη Φιλοσοφία τη θέση που δικαιωματικά της ανήκει στην προαγωγή μιας νέας εξέλιξης της συνείδησης και ενός μέλλοντος αρμονικής συνύπαρξης!',
    cta: { label: 'Δείτε όλα τα μαθήματα', href: site.routes.courses },
  },

  start: {
    title: 'Ας Ξεκινήσουμε',
    lines: [
      'Σας περιμένω με χαρά και ενθουσιασμό σε ένα Νέο Μυητικό Ταξίδι',
      'με Αφύπνιση, φώτιση, έμπνευση, Ανάταση!',
    ],
  },

  benefits: {
    title: 'Τα Οφέλη της Συμμετοχής στην ΑΘΕΝΟΑ',
    question:
      'Θα θέλατε να εξερευνήσετε τη βαθιά πνευματική σοφία και τις μη-δυαδικές διδασκαλίες κορυφαίων αρχαίων φιλοσόφων;',
    items: [
      {
        title: 'Θα έχετε την ευκαιρία να γνωρίσετε την ελληνική πνευματική παράδοση της Αφύπνισης,',
        text: 'Θα πορευθείτε στον φιλοσοφικό δρόμο βιωματικά, με ασφάλεια και υποστήριξη σε κάθε βήμα. Θα έρθετε σε επαφή με τις πνευματικές σας ρίζες και θα λάβετε τη σωστή, ολιστική Ελληνική Παιδεία και την ψυχοπνευματική καλλιέργεια που δεν μας έδωσαν στα σχολεία - και που σήμερα σπάνια παρέχεται από το υπάρχον κοινωνικό - εκπαιδευτικό σύστημα.',
        italic: true,
      },
      {
        title: 'Θα εκπαιδευτείτε μεθοδικά και σωστά στην Ελληνική Φιλοσοφία και στα Αρχαία Ελληνικά Ιερά Κείμενα',
        text: 'Σε μια εποχή υπερπληροφόρησης και παραπληροφόρησης, τα σωστά θεμέλια, η μεθοδική, ακριβής και στέρεη Παιδεία, χωρίς «παρακάμψεις» και ρητορική κενή πρακτικής ουσίας, είναι τα στοιχεία που χαρακτηρίζουν τον αυθεντικό στοχαστή και ασκητή της Φιλοσοφίας.',
        italic: false,
      },
      {
        title: 'Θα βαδίσετε στα χνάρια της Παιδείας που ακολούθησαν οι Αρχαίοι Σοφοί',
        text: 'Έπειτα από πολλά χρόνια έρευνας και εργασίας, για πρώτη φορά στη σύγχρονη εποχή, η Σχολή μας εισάγει μια πρωτοποριακή δομή Σπουδών, βασισμένη στο Αρχαίο Πρόγραμμα Σπουδών της Πλατωνικής Ακαδημίας - η οποία λειτούργησε επί περίπου 1000 συναπτά έτη, από το 387 π.Χ. - 529 μ.Χ.!',
        italic: false,
      },
    ],
  },
} as const;
