// Course catalogue: the two courses open on the live site on 22 November 2026, ΟΔΥΣΣΕΙΑ
// (athenoa.academy/odusseia) and Εὖ Ζῆν (athenoa.academy/eu-zen). Their pages exist only in Greek:
// ./el/courses.ts carries Athena's own words. This English text is a DRAFT TRANSLATION of them, made
// for the English site, to be reviewed by Athena (logged in tasks/text-changes.md as proposed).
//
// Payment: each tuition tier links to the Stripe Payment Links of the live site, one to pay in full and
// one to pay in eight monthly instalments. The amounts below are the ones Stripe charges (checked
// 22 November 2026). Nothing else connects to Stripe: no key, no server.
//
// The start dates are not on the live pages: `schedule` says so. Replace it with the date when it is known.

export interface CourseSection {
  id: string;
  label: string;
  sublabel: string;
  /** Rich text exactly as written on the live site (typos fixed). */
  html: string;
}

/** One way to pay for a course, as the live page offers it: in full, or in eight monthly instalments. */
export interface TuitionTier {
  /** "Κανονικά Δίδακτρα", "Δίδακτρα Αγάπης" */
  name: string;
  /** The whole cycle, as shown: "€550" */
  amount: string;
  /** The sentence on paying in eight monthly instalments, with the monthly amount */
  instalments: string;
  /** What this tuition is, where the live page explains it */
  note?: string;
  /** Stripe Payment Link: the whole amount at once */
  payInFull: string;
  /** Stripe Payment Link: the monthly instalments */
  payMonthly: string;
}

export interface Course {
  slug: string;
  title: string;
  status: 'open' | 'placeholder';
  /** File name (without extension) in src/assets/media */
  image: string;
  imageAlt: string;
  /** A second line under the title */
  subtitle?: string;
  /** One or two sentences for the course card */
  summary?: string;
  /** When it runs. "TBC" when the dates are not set. */
  schedule?: string;
  /** How long it runs */
  duration?: string;
  /** How it is taught */
  format?: string;
  /** True when visitors can enrol now: the card's button reads "Enroll" */
  available: boolean;
  instructor: string;
  /** The standard tuition, for the course card and search engines */
  price?: {
    amount: number;
    currency: 'EUR';
    /** "€550 or 8 × €68.75": the amount first, then a space */
    display: string;
    label: string;
  };
  /** The ways to pay, each with its Stripe Payment Links */
  tuition?: TuitionTier[];
  registrationNote?: string;
  sections: CourseSection[];
  /** A last line in Athena's voice, after the registration */
  closing?: string;
}

export const courseHref = (slug: string) => `/courses/#${slug}`;
export const coursePageHref = (slug: string) => `/courses/${slug}/`;

// Shared by both courses: the live pages carry the same sentence under each tuition.
const registrationNote =
  'Registration is for the whole Cycle of Studies and requires payment of the full amount, whichever way of paying you choose.';
const generosity =
  'The Tuition of Love and Generosity includes the standard tuition plus a sponsorship for our fellow students who need it. Your Generosity will help us offer reduced tuition to the students who need it, and will support the work of our School!';

export const courses: Course[] = [
  {
    slug: 'odusseia',
    title: 'Odyssey',
    status: 'open',
    // stand-in until the course banner is added (the live page's artwork is not in the project yet)
    image: 'reading-by-the-sea',
    imageAlt: 'Dr. Athena Potari smiling over an open book on a terrace above the sea, a white island village behind',
    subtitle: 'The Journey of the Soul to Awakening through the archetypal map of Homer',
    summary:
      'In this Cycle of Studies in Greek Philosophy we will study the Odyssey as a timeless treasure of Wisdom, a symbolic Map of the human Soul and of its Journey to Self-knowledge and Awakening.',
    schedule: 'Start date to be announced',
    duration: '24 weekly lessons',
    // "in Greek": the course is taught in Greek. What follows the first comma is shown as a quieter line.
    format: 'Live on Zoom in Greek, Thursdays at 19:30 Greek time',
    available: true,
    instructor: 'Dr. Athena Despoina Potari',
    price: { amount: 550, currency: 'EUR', display: '€550 or 8 × €68.75', label: 'Tuition:' },
    // The live page rounds the instalments to €69 and €83; Stripe charges €68.75 and €82.50.
    tuition: [
      {
        name: 'Standard Tuition',
        amount: '€550',
        instalments: 'Tuition can be paid in 8 monthly instalments (€68.75 a month).',
        payInFull: 'https://book.stripe.com/4gM28s5Ecf3dgO5cZO9sk06',
        payMonthly: 'https://buy.stripe.com/3cI7sM5EcbR141jbVK9sk08',
      },
      {
        name: 'Tuition of Love',
        amount: '€660',
        instalments: 'Tuition can be paid in 8 monthly instalments (€82.50 a month).',
        note: generosity,
        payInFull: 'https://book.stripe.com/3cI5kEfeM2greFX3pe9sk07',
        payMonthly: 'https://buy.stripe.com/9B6dRaeaI8EPfK1f7W9sk09',
      },
    ],
    registrationNote,
    sections: [
      {
        id: 'description',
        label: 'Course Description',
        sublabel: 'Introduction',
        html: `<p><em>“Always keep Ithaca in your Mind.<br>To arrive there is your destination.”</em></p>
<p>Awe touches the Soul as it approaches the ever-flowing spring of Homer, the Source of the Tradition, over which our most ancient forefathers have leaned, generation after generation, for centuries: all those who drew close around the fire of Homer and the Primordial Wisdom recorded, historically, mythologically and mystically, in the great masterworks of the Epics. The eternal Archetypes that tell a primordial story, an age-old journey, familiar and mysterious: the journey of our very own Soul.</p>
<p><strong>In this Cycle of Studies in Greek Philosophy we will study the Odyssey as a timeless treasure of Wisdom, a symbolic Map of the human Soul and of its Journey to Self-knowledge and Awakening.</strong> We will decode, Philosophically, Psychologically, Experientially and Initiatically, the deeper symbolism and the hidden Wisdom of the Homeric Epic. We will come into contact again with the Ancient Greek Language, with its vibration and its etymology, which has the power to illuminate the Mind and awaken the Soul.</p>
<p><strong>Odysseus is Us.</strong></p>
<p>We, the Soul. We, Consciousness.</p>
<p>We, the Human being with the divine spark (or the divine spark in human form!), who journeys through the visible and invisible universes of Matter, of Spirit, of Mind, of relationships, crossing seas between mortal and immortal, oblivion and truth, sleep and Awakening.</p>
<p>It is no accident that as he finally reaches Ithaca, Odysseus is asleep.<br>So he does not, strictly speaking, arrive in Ithaca.<br>Rather, he Wakes Up in Ithaca.</p>
<p><strong>For Ithaca <em>Is</em> Awakening.</strong><br>The Awakened state of Consciousness that Remembers its true Self.<br>This is its <span lang="el">Νόστος</span>, its return home: Remembrance.<br>The State of Presence, of Truth (<span lang="el">Α-λήθεια</span>, un-forgetting), the Recognition of Who I Am beyond the dreams of a consciousness asleep.</p>
<p>Homer’s Odyssey, as a primordial Code of the Greek Spirit, carries a unique quality, a hue of its divine nature and origin: it describes at once all the journeys of all our hypostases. It speaks to us of the relation of the One to the Many. The Passage from Unity to Multiplicity. The Journey of the Soul into existence. And the path of our Soul’s Awakening.</p>
<p>For the Odyssey is Life itself, the course of incarnation, and indeed of all incarnations, within the cyclical orbits of the god-made Aeons.</p>
<p>It tells of our very own journey on Earth, through the much-suffering, many-turning human experience.</p>
<p><em>~ “The Laestrygonians and the Cyclopes, wild Poseidon”, whom “you will not meet, unless you carry them within your soul.”</em></p>
<p>Yet this journey is neither arbitrary nor uncharted. It bears Archetypal Elements, Structure and Stations. The trials we face, the challenges, the passions, the oblivion, are not unique to each of us. They are, archetypally and eternally, the same. The Universe has ways, constants and laws. Even the scenarios of oblivion and the simplicity of un-forgetting are constant.</p>
<p>All of this is mapped in the living guide of the Odyssey, a timeless handbook… for navigating life. Here we meet the distillation of Wisdom. For this handbook, this sacred epic, describes at once, on parallel levels, all the philosophical, theological, physical, historical, ontological and psychological dimensions of life and of our Soul’s journey to the <span lang="el">Νόστος</span> of Remembrance, which for Socrates is the very definition of Knowledge.</p>
<p>That is why the Goddess Athena, the Goddess of Knowledge and Wisdom, keeps ever-watchful guard at the side of Odysseus as his guide.</p>
<p>As if it is She who ripens Wisdom into a handbook and a map, who makes it an Odyssey and hands it down from generation to generation,<br>into the hands of every Odysseus,<br>who are You and I,<br>All of us.</p>
<p><strong>What do the Cyclopes, Circe, the Sirens and Calypso symbolize? What is the deeper meaning of the trials of Odysseus? What is the role of the Goddess Athena? What does Penelope symbolize? What is Ithaca?</strong></p>
<p>Through Greek Philosophy, Mythology and experiential exercises of Self-knowledge, we will follow the archetypal journey of the Soul to Awakening, with Homer’s handbook as our guide.</p>`,
      },
      {
        id: 'includes',
        label: 'The Cycle of Studies Includes',
        sublabel: '24 lessons, one year of access',
        html: `<ul>
<li>24 live, interactive online Lessons on Zoom</li>
<li>Links to watch each lesson at your own time, in audio-visual form (video and audio/mp3), once its live broadcast is over</li>
<li>Access to All the lesson videos and the Study Material for one year</li>
<li>Study of the 24 Rhapsodies of the Odyssey, in contact with the original text and the Etymology of the Ancient Greek Language, delving into the Philosophical, Psychological, Spiritual and Symbolic meanings of the Homeric Epic</li>
<li>A combination of the Dialectical Tradition, the Study of Ancient Texts &amp; Scientific Knowledge with Experiential Exercises of Self-knowledge &amp; Meditations</li>
<li>Connecting Homeric Wisdom with the riches of Ancient Greek Philosophy, through original interpretive approaches and selected ancient texts</li>
<li>Certificate of Attendance for the Cycle of Studies</li>
<li>Question-and-Answer sessions and scholarly dialogue that encourage direct participation and interaction</li>
<li>Additional Bibliography and Notes</li>
<li>Participation in an active, inspired Online Community of Students &amp; Friends of Philosophy that fosters learning among students (optional)</li>
</ul>`,
      },
    ],
    closing: '“As you set out on the way to Ithaca, wish that the road be long, full of adventures, full of knowledge”…',
  },
  {
    slug: 'eu-zen',
    title: 'Εὖ Ζῆν',
    status: 'open',
    // stand-in until the course banner is added (the live page's artwork is not in the project yet)
    image: 'gathering-pines-acropolis',
    imageAlt:
      'A group sitting in a circle under pine trees on a hillside at dusk, the Acropolis and the Parthenon beyond',
    subtitle: 'The Ancient Art of Eudaimonia',
    summary: '16 experiential lessons of Greek Philosophy in Practice. From Self-knowledge to Eudaimonia.',
    schedule: 'Start date to be announced',
    duration: '16 lessons, about two a month',
    format: 'Live on Zoom in Greek, Tuesdays at 19:30 Greek time',
    available: true,
    instructor: 'Dr. Athena Despoina Potari',
    // TO CONFIRM with Athena: their page says 660€ (8 × 80€) and, for the Tuition of Love, 550€ (8 × 90€).
    // Stripe charges 640€ (8 × 80€) and 720€ (8 × 90€), which agree with the instalments, so these are shown.
    price: { amount: 640, currency: 'EUR', display: '€640 or 8 × €80', label: 'Tuition:' },
    tuition: [
      {
        name: 'Standard Tuition',
        amount: '€640',
        instalments: 'Tuition can be paid in 8 monthly instalments (€80 a month).',
        payInFull: 'https://book.stripe.com/28EbJ2c2A2gr9lDe3S9sk0b',
        payMonthly: 'https://buy.stripe.com/6oUdRaeaI6wHdBT8Jy9sk0d',
      },
      {
        name: 'Tuition of Love',
        amount: '€720',
        instalments: 'Tuition can be paid in 8 monthly instalments (€90 a month).',
        note: generosity,
        payInFull: 'https://book.stripe.com/6oU14o2s0aMXfK10d29sk0c',
        payMonthly: 'https://buy.stripe.com/5kQ28sd6EcV5apH5xm9sk0e',
      },
    ],
    registrationNote,
    sections: [
      {
        id: 'description',
        label: 'Course Description',
        sublabel: 'Introduction',
        html: `<p><em>“A path of Self-knowledge, Truth, Virtue, Eros and Freedom, whose aim is to return Philosophy to its primordial mission: Awakening, Freedom &amp; the Art of <span lang="grc">Εὖ Ζῆν</span>.”</em></p>
<p>A new, experiential Cycle of Studies, dedicated to the practical application of Ancient Greek Philosophy in our everyday life: as a living path of Self-knowledge, of the cultivation of Virtue, of reconnection with our Authenticity and of the Awakening of the Soul.</p>
<p>At its core lies the ancient Greek ideal of <span lang="grc">Εὖ Ζῆν</span>, living well. The Cycle of Studies «<span lang="grc">Εὖ Ζῆν</span>: Philosophy as the Art of Living» is an experiential path of 16 lessons, dedicated to the practical application of Ancient Greek Wisdom in our everyday life. We will explore how the timeless Wisdom of the Greeks can illuminate the deepest questions of human existence, guide us through the challenges of everyday life, and transform Philosophy from an object of knowledge into lived experience and a way of life.</p>
<p>Unlike the Cycles that focus on the systematic study of one particular ancient work, here we will travel through selected passages of the Greek Philosophical Tradition and the study of the ancient Greek Language and its etymology, approaching by theme some of the most fundamental and timeless questions of human life:</p>
<p><em>Who Am I? • Eros, Love and Human Relationships • How do I discover the <span lang="grc">Οἰκεῖον Ἔργον</span>, the proper work, of my Soul? • Family, Bonds and Karma • <span lang="grc">Εἱμαρμένη</span> (Destiny), Freedom and Justice • The Soul and its Centres • and more</em></p>
<p>Through the meeting of philosophical study with personal reflection, dialectic and experiential practice, we will seek to rediscover Philosophy in its original mission:</p>
<p><strong>Not simply how to learn more, but how to become, every day, That which we truly Are.</strong></p>`,
      },
      {
        id: 'themes',
        label: 'Indicative Themes',
        sublabel: 'Four units',
        html: `<p><strong>Unit I: Know Thyself (<span lang="grc">ΓΝΩΘΙ ΣΑΥΤΟΝ</span>)</strong><br><em>The Mystery of the Self and the Awakening of Consciousness</em></p>
<ul>
<li>What does it mean to Live Truly? What is Eudaimonia?</li>
<li>What is true <span lang="el">Παιδεία</span>, education of the whole person, and what follows from its absence?</li>
<li><strong>Who Am I? What are Mind and Consciousness?</strong> Through Plato’s Cave we explore the nature of Mind and Consciousness, the habits and unconscious programs that shape us, in search of Self-knowledge and Awakening.</li>
</ul>
<p><strong>Unit II: The Return to Inner Truth</strong><br><em>From Self-knowledge to Inner Connection</em></p>
<ul>
<li><strong>What is the Soul and what forces govern it? How do I hear my inner voice? How will I find my <span lang="el">Οικειοπραγία</span>, the doing of my own work? Why do I feel sorrow?</strong> We delve into the threefold nature of the Soul, into Truth and inner connection, into trauma and Freedom. We seek our <span lang="grc">Οἰκεῖον Ἔργον</span>, our proper work, and the possibility of our work becoming an ally of our true Nature.</li>
<li><strong>What is Virtue? How are the Four Cardinal Virtues cultivated? What does it mean to live <span lang="grc">Κατὰ Φύσιν</span>, according to Nature? How does Philosophy become everyday practice?</strong> We explore Virtue, the Four Cardinal Virtues, the Aristotelian Mean and living <span lang="grc">Κατὰ Φύσιν</span>, as the foundations of a life of Truth, Freedom and Eudaimonia.</li>
</ul>
<p><strong>Unit III: Eros, Love and Human Relationships</strong><br><em>The Other as a Mirror of the Soul</em></p>
<ul>
<li>What is Eros? Why do we fall in love?</li>
<li>Conscious partnership: how do we create conscious relationships? Freedom and Love</li>
<li>How do my family roots and the wounds of the past affect me?</li>
</ul>
<p><strong>Unit IV: The Soul in the World</strong><br><em>From Knowledge to Virtue, Psychopolitics and Lived Wisdom</em></p>
<ul>
<li><strong>Why Is This Happening to Me Now? Justice &amp; <span lang="el">Ειμαρμένη</span>: the Greek Counterpart of Karma?</strong> Ancient views of responsibility, retribution and catharsis, in dialogue with the idea of karma. The relation between Fate and Freedom. Is there a deeper order in the events of our lives?</li>
<li><strong>Psychopolitics.</strong> How is individual Consciousness connected with collective Consciousness and with Politics? How can we realize our Nature as “political beings”?</li>
</ul>`,
      },
      {
        id: 'includes',
        label: 'The Cycle of Studies Includes',
        sublabel: '16 lessons, one year of access',
        html: `<ul>
<li>16 interactive online Lessons on Zoom (about 2 lessons a month)</li>
<li>The option to watch at your own time: links to each lesson in audio-visual form (video and audio/mp3) are sent once its live broadcast is over</li>
<li>Access to All the lesson videos and the Study Material for one year</li>
<li>A combination of the Dialectical Tradition, the Study of Ancient Texts &amp; Scientific Knowledge with Experiential Exercises of Self-knowledge &amp; Meditations</li>
<li>Certificate of Attendance for the Cycle of Studies</li>
<li>Question-and-Answer and Dialogue sessions, for interaction and for putting the teaching into practice</li>
<li>Additional Bibliography and Notes</li>
<li>Participation in an active, inspired Online Community of Students &amp; Friends of Philosophy that fosters learning among students (optional)</li>
</ul>`,
      },
    ],
  },
];

export const registrationTab = {
  id: 'registration',
  label: 'Registration & Tuition Fees',
  sublabel: 'Register for the course',
} as const;

// New interface wording for the courses page. None of this exists on the live site,
// so it is kept in one place for Athena to review.
export const coursesPage = {
  title: 'Live Courses',
  // The live Courses page uses this line as its description.
  description: 'Study at the Modern Platonic Academy & Remember Who You Really Are',
  ui: {
    viewCourse: 'View course',
    enrollNow: 'Enroll',
    facts: { dates: 'Dates', duration: 'Length', format: 'Format', fee: 'Fee' },
    close: 'Close',
    enroll: 'Enroll',
    placeholderNote: 'Course details are on their way. Leave your name and we will write to you when enrolment opens.',
    placeholderBadge: 'Details to follow',
    email: 'Email',
    back: 'Back',
    contactInstead: 'Contact us',
    taughtBy: 'With',
    // The tuition (RegistrationInfo.astro): the live page's own words, translated. Each tier's two
    // buttons lead to its Stripe Payment Links.
    tuition: {
      wholeCycle: 'for the whole Cycle',
      register: 'Register for the Cycle of Studies:',
      payInFull: 'Pay in full',
      payMonthly: 'Pay monthly',
    },
    // The live page's line under the tuition. There is no membership page on this site yet, so "Learn more"
    // leads to the membership form the home page uses (site.membershipForm).
    membership: {
      text: 'Alternatively, you can become a Member of our Academy and have access to all the Cycles of Studies, with the privileges of Membership!',
      cta: 'Learn more',
    },
    // The waitlist, for a course that cannot be enrolled in yet (available: false). The button stands
    // where "Enroll" would; the rest are the words of the small popup it opens (WaitlistDialog.astro).
    // The popup also uses email, close and contactInstead from above.
    joinWaitlist: 'Join waitlist',
    waitlist: {
      title: 'Join the waitlist',
      // Followed by the title of the course
      forCourse: 'For the course',
      submit: 'Add me to the list',
      // A small line under the button (client request, 15 October 2026)
      notify: 'We will notify you once the enrolments are open.',
      // The quiet line under the button, followed by a link that opens an email to the Academy
      question: 'Got a question?',
      // Shown in place of the form after a valid address is entered: the waitlist is not connected yet.
      pending: 'The waitlist is not connected yet. Your address has not been sent anywhere.',
    },
  },
} as const;
