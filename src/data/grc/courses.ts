// Ancient Greek (/grc/, not launched). The two courses are shown in Athena's Modern Greek (./el/courses.ts):
// no Ancient Greek version of them is written. The interface wording around them stays the playful
// DRAFT in Attic prose made earlier, to be reviewed by Athena before anything is published; the
// tuition, membership and registration lines are the Modern Greek ones, like the courses they belong to.
//
// Same exports and keys as the English file, so a component can use any language.
import { courses as greekCourses, coursesPage as greekPage } from '../el/courses';
import type { Course } from '../courses';

export type { Course, CourseSection } from '../courses';

export const courseHref = (slug: string) => `/grc/courses/#${slug}`;
export const coursePageHref = (slug: string) => `/grc/courses/${slug}/`;

export const courses: Course[] = greekCourses;

export const registrationTab = {
  id: 'registration',
  label: 'Ἐγγραφὴ καὶ δίδακτρα',
  sublabel: 'Ἐγγράψασθε εἰς τὸ μάθημα',
} as const;

// New interface wording for the courses page. None of this exists on the live site,
// so it is kept in one place for Athena to review.
export const coursesPage = {
  title: 'Ζῶντα μαθήματα',
  // The live Courses page uses this line as its description. Same wording as the home hero title.
  description: 'Φοιτᾶτε εἰς τὴν νῦν Πλατωνικὴν Ἀκαδήμειαν καὶ ἀναμνήσθητε οἵτινες ὄντως ἐστέ',
  ui: {
    viewCourse: 'Ἴδετε τὸ μάθημα',
    enrollNow: 'Ἐγγράψασθε',
    // The four facts as four questions: when, for how long, how, and (Apology 20b) for how much.
    facts: { dates: 'Πότε', duration: 'Πόσον χρόνον', format: 'Πῶς', language: 'Τίνι γλώττῃ', fee: 'Πόσου' },
    languages: { el: 'Ἑλληνιστί', en: 'Ἀγγλιστί' },
    close: 'Κλείσατε',
    enroll: 'Ἐγγράψασθε',
    placeholderNote:
      'Τὰ καθ’ ἕκαστα τοῦ μαθήματος ὅσον οὔπω ἥξει. Καταλίπετε τὸ ὄνομα, καὶ ἐπιστελοῦμεν ὑμῖν ἐπειδὰν ἡ ἐγγραφὴ ἀνοιχθῇ.',
    placeholderBadge: 'Τὰ καθ’ ἕκαστα ἐν τάχει',
    // ἐπιστολή is the word for email throughout; the Latin word is added here so that nobody types a name.
    email: 'Ἐπιστολή (email)',
    back: 'Πάλιν',
    contactInstead: 'Ἐπιστείλατε ἡμῖν',
    // A verb, read together with the instructor's name: "Διδάσκει Δρ. Αθηνά Δέσποινα Ποτάρη".
    taughtBy: 'Διδάσκει',
    tuition: greekPage.ui.tuition,
    registration: greekPage.ui.registration,
    membership: greekPage.ui.membership,
    // The waitlist (see the English file). ἀπογράφεσθαι, to have one's name put down on a list, keeps
    // it apart from ἐγγράφεσθαι, which is enrolment; the list is "the list of those who wait".
    joinWaitlist: 'Ἀπογράψασθε',
    waitlist: {
      title: 'Ὁ τῶν περιμενόντων κατάλογος',
      // Followed by the title of the course
      forCourse: 'Εἰς τὸ μάθημα',
      submit: 'Ἀπογράψατέ με',
      notify: 'Ἀγγελοῦμεν ὑμῖν ὅταν αἱ ἐγγραφαὶ ἀνοιχθῶσιν.',
      // The quiet line under the button, followed by a link that opens an email to the Academy
      question: 'Ἀπορεῖτέ τι;',
      pending: 'Ὁ κατάλογος οὔπω συνῆπται. Οὐδὲν τῶν ὑμετέρων οὐδαμοῖ πέπεμπται.',
      thanks: greekPage.ui.waitlist.thanks,
      failed: greekPage.ui.waitlist.failed,
    },
  },
} as const;
