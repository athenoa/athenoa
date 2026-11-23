// The membership page (/membership/, /en/membership/, /grc/membership/): the old athenoa.academy/melos,
// whose address leads here. The Greek (./el/membership.ts) is Athena's text from that page; this English
// is a DRAFT TRANSLATION for her review (logged in tasks/text-changes.md as proposed).
//
// The two ways to pay are those of the courses (TuitionTiers.astro), for a year: the amounts and
// Stripe Payment Links were checked by Maria on 22 November 2026. The old page's own figures (550€,
// 1140€, eight instalments) were left over from a course, so they are not used. Paying the whole year
// upfront takes 10% off (Maria, 22 November 2026): 891€ and 1026€; the monthly way is unchanged.
// The Stripe "full" links below still charge 990€ and 1140€ until the Academy updates them there; if it
// makes new links instead, these hrefs change.
import type { TuitionTier } from './courses';
import type { Locale } from '../lib/locale';
import { membership as greek } from './el/membership';
import { membership as ancient } from './grc/membership';

export interface Membership {
  title: string;
  description: string;
  /** The questions that open the old page, in Athena's voice */
  questions: string[];
  /** The button under them, down to the ways to pay */
  cta: string;
  lead: string;
  paragraphs: string[];
  /** what membership gives, each with one of the site's drawings */
  benefits: { icon: string; text: string }[];
  /** "If you are interested, read more at the link below:" and the link to the membership form */
  more: string;
  formLink: string;
  registration: {
    label: string;
    per: string;
    /** The share taken off when the whole year is paid upfront (0.1 is 10%) */
    upfrontDiscount?: number;
    payInFull: string;
    payMonthly: string;
    tiers: TuitionTier[];
    /** Under the two ways of paying: what paying by the month is, and what registration covers */
    notes: string[];
    notesTitle: string;
  };
}

const generosity =
  'The Tuition of Love and Generosity includes the standard tuition plus a sponsorship for our fellow students who need it. Your Generosity will help us offer reduced tuition to the students who need it, and will support the work of our School!';

export const membershipEn: Membership = {
  title: 'Become a Member of the Academy',
  description:
    'Become an annual Member of the ATHENOA Academy: all the Cycles of Studies and Seminars, the Library of Lessons and other privileges.',
  questions: [
    'Are you inspired to study methodically on the Path of Greek Philosophy & of Light?',
    'Would you like to walk in the footsteps of Socrates, Plato and our Ancient Sages, with the method and the living spirit of the Ancient Academy?',
    'Do you wish to contribute to the Renaissance of the Greek Spirit?',
  ],
  cta: 'Register',
  lead: 'For the third year, our School offers an annual subscription as a Member of the Academy of Hellenic Wisdom!',
  paragraphs: [
    'Beyond the individual Cycles of Studies, this year too, for the third year running, you can study as a Member of the Academy. As a Member you:',
  ],
  benefits: [
    { icon: 'mem-doors', text: 'Have access to all the Cycles of Studies & Seminars of our Academy' },
    { icon: 'mem-scroll', text: 'Receive a deeper, organised and complete Education in the Theory & Practice of Philosophy' },
    { icon: 'mem-path', text: 'Go deeper on the path of Awakening, through the steps of Knowledge, Practices and Initiations' },
    { icon: 'mem-books', text: 'Have access to the Library of Lessons' },
    { icon: 'mem-circle', text: 'Become part of our Community of students' },
    { icon: 'mem-star', text: 'And other privileges of Membership' },
  ],
  more: 'If you are interested, read more at the link below:',
  formLink: 'Become a member',
  registration: {
    label: 'Registration & Tuition Fees',
    per: 'for the whole year',
    // 10% off the whole year paid upfront; change it or switch it off (0) here
    upfrontDiscount: 0.1,
    payInFull: 'Proceed',
    payMonthly: 'Proceed',
    tiers: [
      {
        name: 'Standard Tuition',
        id: 'standard',
        price: 990,
        perMonth: 83,
        payments: 12,
        payInFull: 'https://book.stripe.com/28E9AU6Ig3kvgO54ti9sk0f',
        payMonthly: 'https://buy.stripe.com/4gM6oI0jS08jcxP7Fu9sk0i',
      },
      {
        name: 'Tuition of Love',
        id: 'love',
        price: 1140,
        perMonth: 95,
        payments: 12,
        notes: [generosity],
        payInFull: 'https://book.stripe.com/9B6aEYgiQg7hbtLaRG9sk0h',
        payMonthly: 'https://buy.stripe.com/cNifZi6Ig3kvdBT2la9sk0g',
      },
    ],
    notesTitle: 'Payment & terms',
    notes: [
      'Paying in 12 monthly instalments is offered solely to make things easier for you.',
      'Registration is for the whole educational Cycle and requires payment of the full amount, whichever way of paying you choose.',
    ],
  },
};

/** The membership page's words in the language of the page */
export const membershipFor = (locale: Locale): Membership =>
  locale === 'en' ? membershipEn : locale === 'grc' ? ancient : greek;
