// The words of the pages after Stripe (PaymentStatus.astro), in each language. Also published at /screens.json
// as the originals the dashboard's Screens tab shows; the team's edits there replace them on the page
// (src/scripts/screen-texts.ts). Wording PROPOSED, for Athena to approve (logged in tasks/text-changes.md).
import type { Locale } from '../lib/locale';

export const paymentWords = {
  el: {
    success: {
      kicker: 'Σας ευχαριστούμε',
      title: 'Η θέση σας εξασφαλίστηκε',
      text: ['Η πληρωμή σας ολοκληρώθηκε και η εγγραφή σας καταχωρήθηκε.', 'Θα σας στείλουμε σύντομα email με όλες τις λεπτομέρειες για την έναρξη.'],
    },
    membership: {
      kicker: 'Σας ευχαριστούμε',
      title: 'Καλώς ήρθατε στην Ακαδημία',
      text: ['Η πληρωμή σας ολοκληρώθηκε και είστε πλέον Μέλος της Ακαδημίας ΑΘΕΝΟΑ.', 'Θα σας στείλουμε σύντομα email με όλα όσα περιλαμβάνει η συνδρομή σας.'],
    },
    failed: {
      kicker: 'Κάτι δεν πήγε καλά',
      title: 'Η πληρωμή δεν ολοκληρώθηκε',
      text: ['Η πληρωμή σας δεν ολοκληρώθηκε, οπότε δεν έγινε καμία χρέωση.', 'Μπορείτε να δοκιμάσετε ξανά, να επιλέξετε κατάθεση σε τραπεζικό λογαριασμό, ή να μας γράψετε και θα σας βοηθήσουμε.'],
    },
    ask: 'Για οτιδήποτε, γράψτε μας στο',
    home: 'Αρχική σελίδα',
    retry: 'Δοκιμάστε ξανά',
    courses: 'Δείτε τα μαθήματα',
  },
  en: {
    success: {
      kicker: 'Thank you',
      title: 'Your place is secured',
      text: ['Your payment went through and your registration is recorded.', 'We will email you soon with all the details for the start.'],
    },
    membership: {
      kicker: 'Thank you',
      title: 'Welcome to the Academy',
      text: ['Your payment went through and you are now a Member of the ATHENOA Academy.', 'We will email you soon with everything your membership includes.'],
    },
    failed: {
      kicker: 'Something went wrong',
      title: 'The payment did not go through',
      text: ['Your payment was not completed, so nothing was charged.', 'You can try again, choose a bank transfer, or write to us and we will help.'],
    },
    ask: 'For anything at all, write to us at',
    home: 'Home page',
    retry: 'Try again',
    courses: 'See the courses',
  },
  grc: {
    success: {
      kicker: 'Χάριν ἴσμεν',
      title: 'Ἡ χώρα ὑμῖν φυλάττεται',
      text: ['Ἡ καταβολὴ ἐτελέσθη καὶ ἡ ἐγγραφὴ ὑμῶν ἀναγέγραπται.', 'Ἐν τάχει ἐπιστελοῦμεν ὑμῖν πάντα τὰ περὶ τῆς ἀρχῆς.'],
    },
    membership: {
      kicker: 'Χάριν ἴσμεν',
      title: 'Καλῶς ἤλθετε εἰς τὴν Ἀκαδημίαν',
      text: ['Ἡ καταβολὴ ἐτελέσθη καὶ νῦν ἑταῖροι τῆς Ἀκαδημίας ἐστέ.', 'Ἐν τάχει ἐπιστελοῦμεν ὑμῖν πάντα ὅσα ἡ ἑταιρεία περιέχει.'],
    },
    failed: {
      kicker: 'Οὐ κατὰ γνώμην ἐχώρησεν',
      title: 'Ἡ καταβολὴ οὐκ ἐτελέσθη',
      text: ['Ἡ καταβολὴ ὑμῶν οὐκ ἐτελέσθη, ὥστε οὐδὲν ἀργύριον ἐλήφθη.', 'Ἔξεστιν ὑμῖν αὖθις πειρᾶσθαι, ἢ διὰ τραπέζης καταβαλεῖν, ἢ ἐπιστεῖλαι ἡμῖν, καὶ βοηθήσομεν.'],
    },
    ask: 'Περὶ παντὸς ἐπιστείλατε ἡμῖν πρὸς',
    home: 'Οἴκαδε',
    retry: 'Πειράσασθε αὖθις',
    courses: 'Ἴδετε τὰ μαθήματα',
  },
} satisfies Record<Locale, unknown>;
