// Words of the newsletter popup that are not part of Athena's copy: its headline and description
// come from home.announcement.newsletter, everything else (labels, the button, the note shown
// while sign-up is not connected to a mailing service) lives here, in each language.
// The field label and placeholder repeat those of the contact form (about.contact).
import type { Locale } from '../lib/locale';

export const newsletter = {
  en: {
    label: 'Email',
    placeholder: 'example@mail.com',
    submit: 'Subscribe',
    close: 'Close',
    // Shown instead of the form after a valid address is entered, and to visitors without JavaScript.
    // after a sign-up is stored (proposed wording, 23 November 2026)
    pending: 'Thank you! You are on our list and will hear from us with our news.',
    failed: 'Something went wrong and your address was not saved. Please try again, or write to us.',
    // the same question as the contact form (about.contact), optional
    source: 'How did you find us?',
    pendingLink: 'Write to us through the contact form',
  },
  el: {
    label: 'Email',
    placeholder: 'example@mail.com',
    submit: 'Εγγραφή',
    close: 'Κλείσιμο',
    pending: 'Σας ευχαριστούμε! Είστε στη λίστα μας και θα λαμβάνετε τα νέα μας.',
    failed: 'Κάτι πήγε στραβά και η διεύθυνσή σας δεν αποθηκεύτηκε. Δοκιμάστε ξανά ή γράψτε μας.',
    source: 'Πώς μας βρήκατε;',
    pendingLink: 'Γράψτε μας μέσω της φόρμας επικοινωνίας',
  },
  // Ancient Greek: ἀπογράφεσθαι, to have one's name put on a list, as for the waitlist (./grc/courses.ts)
  grc: {
    label: 'Ἐπιστολή (email)',
    placeholder: 'example@mail.com',
    submit: 'Ἀπογράψασθε',
    close: 'Κλείσατε',
    pending: 'Χάριν ἴσμεν. Ἐν τῷ καταλόγῳ ἡμῶν ἐστε, καὶ τὰ παρ’ ἡμῶν καινὰ ἀκούσεσθε.',
    failed: 'Οὐκ ἐξεγένετο φυλάξαι τὴν ὑμετέραν ἐπιστολήν. Πειράσασθε αὖθις ἢ γράψατε ἡμῖν.',
    source: 'Πῶς ἡμᾶς ηὕρετε;',
    pendingLink: 'Γράψατε ἡμῖν ἐνταῦθα',
  },
} satisfies Record<Locale, Record<string, string>>;
