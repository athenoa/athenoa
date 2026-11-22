// Course catalogue: the two courses open on the live site on 22 November 2026, ΟΔΥΣΣΕΙΑ
// (athenoa.academy/odusseia) and Εὖ Ζῆν (athenoa.academy/eu-zen), then "The Hidden Non-Duality of
// Ancient Greek Philosophy", which starts in January 2027 and takes names for its waitlist until then.
// The first two pages exist only in Greek: ./el/courses.ts carries Athena's own words. This English text
// is a DRAFT TRANSLATION of them, made for the English site, to be reviewed by Athena (logged in
// tasks/text-changes.md as proposed). The dates, the payment notes, the bank account, the cancellation
// terms and the scholarships come from the Academy's registration form (Google Forms), November 2026.
//
// Payment: each tuition tier links to the Stripe Payment Links of the live site, one to pay in full and
// one to pay in eight monthly instalments. The amounts below are the ones Stripe charges (checked
// 22 November 2026, and confirmed by Maria). Nothing else connects to Stripe: no key, no server.

export interface CourseSection {
  id: string;
  label: string;
  sublabel: string;
  /** Rich text exactly as written on the live site (typos fixed). */
  html: string;
}

/** One way to pay for a course, as the live page offers it: in full, or in eight monthly instalments. */
export interface TuitionTier {
  /** A short key, kept with each registration: 'standard', 'love' */
  id: string;
  /** "Κανονικά Δίδακτρα", "Δίδακτρα Αγάπης" */
  name: string;
  /** The whole cycle (or year) in euros, the sum of the instalments; less upfrontDiscount when paid upfront */
  price: number;
  /** One monthly instalment, in euros */
  perMonth: number;
  /** How many monthly instalments: 8 for a course, 12 for the year's membership */
  payments: number;
  /** What this tuition is and what it includes, where the live page and the form explain it */
  notes?: string[];
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
  /** When it starts, short: on the course card and on the label stuck to the picture */
  schedule?: string;
  /** A quieter line under it on the card (the introduction) */
  scheduleNote?: string;
  /** The dates in full, on the course page and in the popup */
  dates?: { label: string; when: string }[];
  /** The last lesson: in full at the end of the dates ("Thursday 10 June 2027, 19:30"), and short on the
      card ("From 26 November 2026 until 10 June 2027") */
  lastLesson?: { when: string; short: string };
  /** How many months the course runs: added to its length ("· 8 months") */
  months?: number;
  /** How long it runs */
  duration?: string;
  /** How it is taught. What follows the first comma is shown as a quieter line. */
  format?: string;
  /** The language it is taught in (its name is coursesPage.ui.languages[teaching]) */
  teaching?: 'el' | 'en';
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
  /** The share taken off when the whole cycle is paid upfront (card in full, or bank transfer): 0.1 is 10% */
  upfrontDiscount?: number;
  registrationNote?: string;
  /** Until when one can register, and what to do after */
  registrationOpen?: string;
  /** The notes on paying, under the tuition */
  paymentNotes?: string[];
  /** The cancellation terms (HTML), a closed item under the tuition */
  cancellations?: string;
  sections: CourseSection[];
  /** A last line in Athena's voice, after the registration */
  closing?: string;
}

import { site } from './site';

// English lives under /en/ (Greek is the site's first language, at the root)
export const courseHref = (slug: string) => `/en/courses/#${slug}`;
export const coursePageHref = (slug: string) => `/en/courses/${slug}/`;

// The Academy's secretariat, wherever the copy names it: a link that writes to it
const secretariat = (words: string) => `<a href="mailto:${site.emails[0]}">${words}</a>`;

// Shared by both courses: the live pages carry the same sentence under each tuition.
const registrationNote =
  'Registration is for the whole Cycle of Studies and requires payment of the full amount, whichever way of paying you choose.';
const generosity =
  'The Tuition of Love and Generosity includes the standard tuition plus a sponsorship for our fellow students who need it. Your Generosity will help us offer reduced tuition to the students who need it, and will support the work of our School!';
// From the registration form
const oneToOne =
  'The Tuition of Love includes an optional one-to-one session with Athena, for queries, questions and answers, and any other clarifications about the Teaching.';
const paymentNotes = [
  'Paying in 8 monthly instalments is offered solely to make things easier for students. It does not mean that the lessons are attended month by month: the Cycle is one whole, whichever way you pay.',
  'To register for the course, the first instalment must be paid as a deposit before the lessons begin.',
];
// The cancellation terms. The first four months of ΟΔΥΣΣΕΙΑ are named on its form; Εὖ Ζῆν's form does not
// name them (it starts in December), so they are left out there.
const cancellations = (term?: string) => `<p><strong>Important note</strong></p>
<p>The monthly instalments are offered to make paying the tuition easier; they are not a separate monthly subscription. By registering for a Cycle of Studies, the student accepts the obligation to pay the full amount of the agreed tuition, by the chosen way of paying (all at once or monthly).</p>
<p>For any cancellation of participation, the following terms apply:</p>
<ul>
<li><strong>After the lessons have begun:</strong> no deposit or other amount already paid is refunded. A student who leaves within the first four months undertakes to pay for the first four months of study only${term ? ` (${term})` : ''}.</li>
<li><strong>After the first four months:</strong> the student is to pay the full amount of the chosen tuition.</li>
</ul>
<p>In exceptional cases, the student is to write to the ${secretariat('Secretariat')} with any request to change or cancel their participation.</p>`;

export const courses: Course[] = [
  {
    slug: 'odusseia',
    title: 'Odyssey',
    status: 'open',
    // The course banner, from the Academy (Maria, 22 November 2026)
    image: 'course-odusseia',
    imageAlt:
      'Course banner: ΟΔΥΣΣΕΙΑ, The Journey of the Soul to Awakening. Odysseus at the prow of his ship looks across a deep blue sea to a sunlit island with a temple, Athena watching from the starry sky',
    subtitle: 'The Journey of the Soul to Awakening through the archetypal map of Homer',
    summary:
      'In this Cycle of Studies in Greek Philosophy we will study the Odyssey as a timeless treasure of Wisdom, a symbolic Map of the human Soul and of its Journey to Self-knowledge and Awakening.',
    schedule: 'From 26 November 2026',
    scheduleNote: 'Introduction on Monday 23 November at 19:30',
    dates: [
      { label: 'Introduction & presentation of the course', when: 'Monday 23 November 2026, 19:30 Greek time' },
      { label: 'First lesson', when: 'Thursday 26 November 2026, 19:30' },
      { label: 'Then', when: 'every Thursday at 19:30' },
    ],
    // calculated (Maria, 22 November 2026): to confirm with the Academy. 24 Thursdays from 26 November,
    // without 24 and 31 December, 25 March, Holy Thursday (29 April) and Bright Thursday (6 May 2027).
    months: 8,
    lastLesson: { when: 'Thursday 10 June 2027, 19:30', short: '10 June 2027' },
    duration: '24 weekly lessons',
    format: 'Live on Zoom, Thursdays at 19:30 Greek time',
    teaching: 'el',
    available: true,
    instructor: 'Dr. Athena Despoina Potari',
    price: { amount: 550, currency: 'EUR', display: '€550 or 8 × €68.75', label: 'Tuition:' },
    // No discount for paying upfront (Maria, 22 November 2026: Εὖ Ζῆν only)
    // The live page rounds the instalments to €69 and €83; Stripe charges €68.75 and €82.50.
    tuition: [
      {
        name: 'Standard Tuition',
        id: 'standard',
        price: 550,
        perMonth: 68.75,
        payments: 8,
        payInFull: 'https://book.stripe.com/4gM28s5Ecf3dgO5cZO9sk06',
        payMonthly: 'https://buy.stripe.com/3cI7sM5EcbR141jbVK9sk08',
      },
      {
        name: 'Tuition of Love',
        id: 'love',
        price: 660,
        perMonth: 82.5,
        payments: 8,
        notes: [generosity, oneToOne],
        payInFull: 'https://book.stripe.com/3cI5kEfeM2greFX3pe9sk07',
        payMonthly: 'https://buy.stripe.com/9B6dRaeaI8EPfK1f7W9sk09',
      },
    ],
    registrationNote,
    // HTML: the secretariat is a link
    registrationOpen: `Registrations are open until 30 December 2026. After that, please contact the ${secretariat('Academy’s Secretariat')} about registering.`,
    paymentNotes,
    cancellations: cancellations('November 2026 to February 2027'),
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
    schedule: 'From 1 December 2026',
    scheduleNote: 'Introduction on Monday 23 November at 19:30',
    dates: [
      { label: 'Introduction & presentation of the course', when: 'Monday 23 November 2026, 19:30 Greek time' },
      { label: 'First lesson', when: 'Tuesday 1 December 2026, 19:30' },
      { label: 'Then', when: 'Tuesdays at 19:30, about two lessons a month' },
    ],
    // calculated (Maria, 22 November 2026): to confirm with the Academy. The first and third Tuesday of
    // each month from 1 December 2026: 16 lessons.
    months: 8,
    lastLesson: { when: 'Tuesday 20 July 2027, 19:30', short: '20 July 2027' },
    duration: '16 lessons, about two a month',
    format: 'Live on Zoom, Tuesdays at 19:30 Greek time',
    teaching: 'el',
    available: true,
    instructor: 'Dr. Athena Despoina Potari',
    // Their page says 660€ and 550€; Stripe charges 640€ and 720€, confirmed by Maria on 22 November 2026.
    price: { amount: 640, currency: 'EUR', display: '€640 or 8 × €80', label: 'Tuition:' },
    // Εὖ Ζῆν only: 10% off when the whole Cycle is paid upfront (card in full, or bank transfer); Maria,
    // 22 November 2026.
    // Change it or switch it off (0) here. The Stripe "full" links below charge the old full amounts until
    // the Academy updates its prices there; if it makes new links instead, these hrefs change.
    upfrontDiscount: 0.1,
    tuition: [
      {
        name: 'Standard Tuition',
        id: 'standard',
        price: 640,
        perMonth: 80,
        payments: 8,
        payInFull: 'https://book.stripe.com/28EbJ2c2A2gr9lDe3S9sk0b',
        payMonthly: 'https://buy.stripe.com/6oUdRaeaI6wHdBT8Jy9sk0d',
      },
      {
        name: 'Tuition of Love',
        id: 'love',
        price: 720,
        perMonth: 90,
        payments: 8,
        notes: [generosity, oneToOne],
        payInFull: 'https://book.stripe.com/6oU14o2s0aMXfK10d29sk0c',
        payMonthly: 'https://buy.stripe.com/5kQ28sd6EcV5apH5xm9sk0e',
      },
    ],
    registrationNote,
    paymentNotes,
    // TO CONFIRM: the four months that bind a student who leaves early (the form names none for Εὖ Ζῆν)
    cancellations: cancellations(),
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
  {
    slug: 'the-hidden-non-duality-of-ancient-greek-philosophy',
    // Title and subtitle as lettered on the course banner. Copy as on the live home page (October 2026),
    // without its old registration text.
    title: 'The Hidden Non-Duality of Ancient Greek Philosophy',
    status: 'open',
    image: 'course-non-duality',
    imageAlt:
      'Course banner: The Hidden Non-Duality of Ancient Greek Philosophy, with marble figures of Pythagoras, Plato and Aristotle against a night sky of constellations',
    // As lettered on the course banner
    subtitle: 'Hellenic Wisdom as a Path of Self-Realization',
    summary:
      'Each week we will delve into the non-dual teaching expressed by the following great Philosophers ~ Ancient Sages: Plotinus, Plato, Pythagoras, The Pre-Socratics',
    schedule: 'From January 2027',
    // From the course description: "this four-week course", live on Zoom, recordings kept 120 days
    duration: 'Four weekly meetings',
    format: 'Live on Zoom, with recordings',
    // Its texts are read in English translation (see "meetings")
    teaching: 'en',
    // Not open yet: its button is "Join waitlist" (WaitlistDialog.astro). No tuition, so no registration shows.
    available: false,
    instructor: 'Dr. Athena Despoina Potari',
    price: {
      amount: 200,
      currency: 'EUR',
      display: '€200 & VAT (24%)',
      label: 'Participation cost:',
    },
    sections: [
      {
        id: 'description',
        label: 'Course Description',
        sublabel: 'Introduction',
        html: `<p>This four-week course undertakes <strong>a lived, philosophical and spiritual inquiry into a dimension of Ancient Greek Philosophy</strong> that has been systematically obscured within modern Western intellectual history.</p>
<p>The Greek philosophical tradition did not originate from division; it did not begin with an ontological rupture between being and mind, spirit and matter, knower and known, inner and outer. These dualisms are later developments — products of historical bifurcations, theological polemics, and the gradual exteriorization of metaphysics into abstraction.</p>
<p><strong>At its source, the Hellenic View recognizes the Unity of Being.</strong> Being is not split; the human is not external to the cosmos; Nous (awareness) and Reality are inherently interweaved.</p>
<p>This holistic View finds a graceful, aesthetically and poetically inspired way of expression through all aspects of Hellenic Civilization: through Mathematics – seen as the living Theology of Nature, Philosophy ~ the language of human Awareness, as well as Poetry, Drama, Ethics, Ontology, Metaphysics; indeed all notions, and terms, which are invented during the same historical time, in the cradle of western civilization, a land blessed by nature, Apollonian luminosity and filled with an abundance of energetic portals.</p>
<p><strong>In this short intensive course, we return to the foundations of the West to discover an ancient, yet perennial, spiritual Treasure: the original meaning of Philosophy as Love (“philo”) for Wisdom (“sophia”), as a spiritual path to Awakening</strong>; and particularly its <strong>non-dual view</strong> that formed both its founding view and its luminous culmination.</p>`,
      },
      {
        id: 'meetings',
        label: 'In our meetings, we will explore',
        sublabel: 'Re-member',
        html: `<p><strong>In our meetings, we will explore</strong> an aspect of Hellenism often obscured by its colonized appropriation by later western approaches and materialist-reductionist metaphysics: we will re-member <strong>the hidden non-dual teachings at the heart of Greek Philosophy</strong></p>
<blockquote><i>(Re-member ~ for “all knowledge is Remembrance”, says Socrates)</i></blockquote>
<p>To approach the unity at the foundations of Hellenism is to reconsider the foundation upon which Western thought was built.</p>
<p><strong><u>In our four meetings</u></strong> we will learn about the Greek spiritual tradition not through abstraction but through a <strong>close, intimate and contemplative encounter with the tradition.</strong></p>
<ul>
<li>We will <strong>study</strong> <strong>excerpts from key ancient texts</strong> (presented by Athena in a way that makes them relatable – of course, in English translation) in a dialectical way, contemplating their meaning and essence together</li>
<li><strong>Decode</strong> their initiatory <strong>spiritual etymology</strong> (in the universe of the Greek language, the etymology is a code of meaning and essence); and of course,</li>
<li>Weave our investigation with <strong>meditations, contemplation, embodied practices and dialogue</strong></li>
<li><strong>QnA</strong> ~ live dialogue with Athena and our course community</li>
</ul>`,
      },
      {
        id: 'structure',
        label: 'Course Structure & Content',
        sublabel: 'Each week we will explore',
        html: `<p><u>Each week</u> we will explore the non-dual teachings in the work of the following great Philosophers ~ Ancient Sages:</p>
<ul>
<li><strong><u>Plotinus</u>: Nous and Logos; the One and/ (as) the Self * <em>“It is not a View, it is a Union”</em></strong></li>
<li><strong><u>Plato:</u> The Hidden non-duality behind the - apparent - Platonic duality * <em>One, Eros &amp; Beauty, and Socrates’ secret Female Master</em></strong></li>
<li><strong><u>Pythagoras</u>: The Initiate of the Egyptian Pyramids who invented the term “<em>Philosopher</em>” * “<em>You will realize you were never a mortal</em>”</strong></li>
<li><strong><u>The Presocratics: Heraclitus – Parmenides</u>: At the start of the Journey: <em>En</em> and <em>Polla</em> ~ <em>The One and the Many</em></strong></li>
</ul>
<p>The discussion will also involve <strong>allusions to mythology</strong>, theology and even poetry and the Arts, as expressions of meaning and teachings pertaining to the holistic non-dual View of Hellenism.</p>`,
      },
      {
        id: 'access',
        label: 'Access',
        sublabel: 'Live sessions & recorded lessons',
        html: `<p>Participants can attend the live sessions of the classes and/or watch the recorded lessons at their own time. <strong>All participants will receive audio and video links to stream the recordings of each class, and these will remain active for 120 days.</strong></p>
<p>All you need to participate is a computer or a mobile device, such as a tablet or smartphone, with a built-in speaker and access to the internet. The platform we use for the sessions is Zoom. The sign-in process is very simple, and you will receive emails with the invitation to join ahead of the weekend.</p>
<p>To optimise your course experience, we recommend a wired connection if possible. If you do use a Wi-Fi connection, close all or most other devices using the signal. For mobile devices, a 3G or higher connection is needed.</p>`,
      },
      {
        id: 'orientation',
        label: 'Orientation of the Course',
        sublabel: 'Our journey together',
        html: `<p>Our journey together at the roots of the West, is a calling of the Heart. It is not an attempt to superimpose foreign metaphysical categories upon Greece, but to re-member the Wisdom that shaped our history, our consciousness, our education ~ and which still remains active, alive, shining the way Home – to our true being.</p>
<p>Greek Philosophy will be approached according to its original meaning; not merely an intellectual endeavor, but a path of Love and Wisdom with the ultimate goal of realizing one’s true nature and living a life of wholeness, inspiration, creativity aligned with this realization. What the Ancients called, “EF ZEN”~ the Good life. (<span lang="grc">Εὖ Ζῆν</span>)</p>`,
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
    facts: { dates: 'Dates', duration: 'Length', format: 'Format', language: 'Language', fee: 'Fee' },
    // With Course.lastLesson and Course.months, once they are known
    when: { last: 'Last lesson', until: 'until {date}', months: '{n} months' },
    // The languages a course is taught in (Course.teaching)
    languages: { el: 'Greek', en: 'English' },
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
      payInFull: 'Pay in full',
      payMonthly: 'Pay monthly',
      // The two ways in each tier: "/ month", "× 8 instalments", and what the instalments add up to
      month: '/ month',
      payments: '× {n} instalments',
      total: '{price} in all',
      // The fee on the cards and course pages: the upfront price, then the monthly way
      feeUpfront: 'paid upfront for the year',
      feeMonthly: 'or {month} a month × {n}',
      // The upfront discount, for a course that has one ({pct} is "10%"): the words after the upfront price
      // (in the Markdown twins), and its mark beside the struck-through full price
      upfront: 'paid upfront, for the whole Cycle',
      off: '−{pct}',
      // In the bank-transfer item: opens the registration form with that way of paying
      bankRegister: 'Register to pay by bank transfer',
    },
    // The registration form (RegisterDialog.astro), rebuilt from the Academy's Google Form. Before paying
    // by card the details are kept (src/lib/forms.ts), then Stripe opens; by bank transfer, the account
    // is shown. Its field labels are the form's own words, translated.
    register: {
      kicker: 'Register for the Cycle of Studies',
      tierLegend: 'Tuition',
      payLegend: 'Way of paying',
      payFull: 'By card, in full',
      payMonthly: 'By card, in 8 monthly instalments',
      payBank: 'By bank transfer, in full',
      instead: 'instead of {price}',
      detailsLegend: 'Your details',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address, City',
      optional: 'optional',
      certificate: 'Full name as it should appear on your Certificate of Attendance',
      termsBefore: 'I have read and accept the ',
      termsLink: 'Terms of participation and the Conditions',
      termsTitle: 'Terms of participation',
      total: 'To pay',
      submitCard: 'Continue to payment',
      submitBank: 'Complete registration',
      sending: 'One moment…',
      privacy: 'Your details are used only for your registration and your certificate, and are never shared.',
      errors: {
        firstName: 'Please enter your first name.',
        lastName: 'Please enter your last name.',
        email: 'Please enter your email address.',
        emailInvalid: 'Please enter a valid email address.',
        phone: 'Please enter a phone number we can reach you on.',
        phoneInvalid: 'Please check the phone number.',
        certificate: 'Please enter the name for your certificate.',
        terms: 'Please read and accept the terms to continue.',
      },
      failed:
        'Your registration could not be saved just now. You can still continue to payment, and write to us at philathenea@athenoa.academy with your details.',
      failedBank:
        'Your registration could not be saved just now. Please write to us at philathenea@athenoa.academy with your details; the account for the transfer is below.',
      continue: 'Continue to payment',
      doneTitle: 'Thank you: your registration is in',
      doneBank:
        'To complete it, transfer the amount to the account below and send the proof of payment to philathenea@athenoa.academy.',
    },
    // The registration form's further ways and terms, each a closed item under the tuition. The bank
    // account is copied from the form exactly. No donation link yet (Maria will add the Scholarship Fund
    // to Stripe): the fund's appeal ends with the address to write to.
    registration: {
      bank: {
        title: 'Pay by bank transfer',
        bankLabel: 'Bank',
        bank: 'Alpha Bank',
        holderLabel: 'Account holder',
        holder: 'ΑΘΕΝΟΑ ΑΣΤΙΚΗ ΜΗ ΚΕΡΔΟΣΚΟΠΙΚΗ ΕΤΑΙΡΕΙΑ / ATHENOA NON-PROFIT LAW COMPANY',
        iban: 'GR43 0140 2690 2690 0200 2011 840',
        notes: [
          'When transferring the tuition, please do not let the bank’s service charges come out of the tuition for the Cycle of Studies. If you bank with another bank, choose for the transfer charges to be paid by <strong>the sender</strong> and not the recipient.',
          'So that your payment can be matched to you, after each payment please send the proof of deposit to <a href="mailto:philathenea@athenoa.academy">philathenea@athenoa.academy</a>.',
          'Every file we receive from you is for our own use only and is not shared in any way, out of respect for personal data and under Greek Law 4624/2019 on the protection of personal data.',
        ],
      },
      cancellations: 'Cancellations',
      scholarships: {
        title: 'Scholarships',
        html: `<p><strong>The possibility of a scholarship</strong></p>
<p>It is a Principle of our Lessons that no student who wishes to take part in them should be excluded for financial reasons. That is why every year we offer a number of study scholarships. If you would like to apply for a scholarship, you can contact us at <a href="mailto:philathenea@athenoa.academy">philathenea@athenoa.academy</a> or by phone on <a href="tel:+306906068444">+30 690 606 8444</a>. We will be glad to help!</p>
<p><strong>A Beautiful Undertaking</strong></p>
<p>Our Academy has created a Scholarship Fund, giving dozens of students every year, who could not otherwise attend our programmes, the chance to take part. Would you, too, like to contribute to the Scholarship Fund with a donation, in support of the students of the ATHENOA Academy? Every gift of yours will allow a student who needs it to take part!</p>
<p>To make a donation, write to us at <a href="mailto:philathenea@athenoa.academy">philathenea@athenoa.academy</a>.</p>`,
      },
    },
    // The live page's line under the tuition, leading to the membership page (site.routes.membership).
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
      // After the address is kept (src/lib/forms.ts), or when it could not be
      thanks: 'Thank you. We will write to you as soon as enrolment opens.',
      failed: 'Your address could not be sent. Please try again, or write to us.',
    },
  },
} as const;
