// schema.org builders for JSON-LD. Pages pass the results to <Base schema={[...]}>.
//
// Each builder writes in the language it is asked for: organizationSchema(locale), websiteSchema(locale)
// and personSchema(locale) take the page's language; courseSchema(course) and courseListSchema(list)
// follow the course records they are handed (the ones from content(locale)). A Greek page therefore
// describes the same Academy, person and courses in Greek, under the same @id.
//
// Every value comes from the data files; nothing is filled in from outside knowledge.
// Facts that exist only as prose (a founding year, a degree, an award) go through said():
// they are published only while that language's copy still says them, so an edit to the text cannot
// leave a stale claim behind in the structured data.
import type { ImageMetadata } from 'astro';
import { content } from './index';
import type { Course } from './courses';
import { upfrontPrice } from '../components/courses/money';
import { plain } from '../lib/markdown';
// Inside this file Locale means English or Greek: Ancient Greek pages carry no structured data of
// their own, and a call made from one is answered in Greek.
import { locales, mainLocale, pathIn, type MainLocale as Locale, type Locale as AnyLocale } from '../lib/locale';

type Json = Record<string, unknown>;

// One Academy, one person and one site, whichever language describes them: the ids never change.
const origin = content('en').site.url;
const page = (path: string) => `${origin}${path}`;
const ABOUT = '/about-athena/';
const ORGANIZATION = page('/#organization');
const WEBSITE = page('/#website');
const ATHENA = page(`${ABOUT}#athena`);

// Photographs live in src/assets and are published under hashed names, so their addresses are looked up.
const media = import.meta.glob<ImageMetadata>('../assets/media/*', { eager: true, import: 'default' });
const photo = (name: string) => {
  const file = Object.entries(media).find(([path]) => path.startsWith(`../assets/media/${name}.`))?.[1];
  return file && new URL(file.src, origin).href;
};

// ---------- Facts that exist only as prose ----------

// A value, then the phrases of the copy it rests on. With no phrases, the value itself must appear in the copy.
// Greek inflects its nouns, so several Greek values are the dictionary form of a phrase the copy has in another case.
type Claim = readonly [value: string, ...phrases: string[]];
interface Facts {
  academyNames: Claim[];
  founded: Claim;
  academyTopics: Claim[];
  shortName: Claim;
  jobTitle: Claim;
  university: Claim;
  graduateSchool: Claim;
  school: Claim;
  award: Claim;
  memberOf: Claim;
  personTopics: Claim[];
}

const facts: Record<Locale, Facts> = {
  en: {
    academyNames: [['Academy of Hellenic Wisdom ATHENOA'], ['Philosophical Academy ATHENOA']],
    founded: [
      '2019',
      'In 2019, these two streams of my life',
      'united in the founding of the Academy of Hellenic Wisdom ATHENOA',
    ],
    academyTopics: [
      ['Ancient Hellenic Wisdom'],
      ['Greek Philosophy'],
      ['Platonic Academy'],
      ['Dialectics'],
      ['Etymology'],
      ['Ancient Greek Language'],
      ['Meditations'],
      ['Methods of Self-Knowledge'],
      ['Ancient Hieratic Art'],
      ['Orphic Hymns'],
    ],
    shortName: ['Athena Potari'],
    jobTitle: ['Founder', 'founder of the Philosophical Academy'],
    university: ['University of Oxford', 'doctoral studies at the University of Oxford'],
    graduateSchool: ['LSE', 'Master’s Degree with Distinction from the LSE'],
    school: ['Athens College', 'I graduated from the Athens College'],
    award: [
      'Philosophy Award of the Academy of Athens, 2020',
      'In 2020, I was honored with the Philosophy Award of the Academy of Athens',
    ],
    memberOf: ['Galileo Commission', 'I am a member of the Central Committee', 'the Galileo Commission'],
    personTopics: [
      ['Greek Philosophy'],
      ['Platonic Philosophy'],
      ['Greek Political Philosophy'],
      ['Political Cosmology'],
      ['Orphic–Pythagorean Tradition'],
      ['Ancient Greek women philosophers'],
    ],
  },
  el: {
    academyNames: [
      ['Ακαδημία Ελληνικής Σοφίας ATHENOA', 'ίδρυση της Ακαδημίας Ελληνικής Σοφίας ATHENOA'],
      ['Φιλοσοφική Ακαδημία ATHENOA', 'ίδρυση της Φιλοσοφικής Ακαδημίας ATHENOA'],
    ],
    founded: [
      '2019',
      'Το 2019, τα δύο αυτά ρεύματα της ζωής μου',
      'ενώθηκαν στην ίδρυση της Ακαδημίας Ελληνικής Σοφίας ATHENOA',
    ],
    academyTopics: [
      ['Αρχαία Ελληνική Σοφία'],
      ['Ελληνική Φιλοσοφία'],
      ['Πλατωνική Ακαδημία', 'συνέχιση της Πλατωνικής Ακαδημίας'],
      ['Διαλεκτική'],
      ['Ετυμολογία'],
      ['Αρχαία Ελληνική Γλώσσα'],
      ['Διαλογισμοί'],
      ['Μέθοδοι Αυτογνωσίας'],
      ['Αρχαία Ιερατική Τέχνη'],
      ['Ορφικοί Ύμνοι'],
    ],
    shortName: ['Αθηνά Ποτάρη'],
    jobTitle: ['Ιδρύτρια', 'ιδρύτρια της Φιλοσοφικής Ακαδημίας'],
    university: ['Πανεπιστήμιο της Οξφόρδης', 'διδακτορικές σπουδές στο Πανεπιστήμιο της Οξφόρδης'],
    graduateSchool: ['LSE', 'Μεταπτυχιακό μου Δίπλωμα με Διάκριση από το LSE'],
    school: ['Κολλέγιο Αθηνών', 'Αποφοίτησα από το Κολλέγιο Αθηνών'],
    award: [
      'Βραβείο Φιλοσοφίας της Ακαδημίας Αθηνών, 2020',
      'Το 2020 τιμήθηκα με το Βραβείο Φιλοσοφίας της Ακαδημίας Αθηνών',
    ],
    memberOf: ['Galileo Commission', 'Είμαι μέλος της Κεντρικής Επιτροπής', 'της Galileo Commission'],
    personTopics: [
      ['Ελληνική Φιλοσοφία'],
      ['Πλατωνική Φιλοσοφία'],
      ['Ελληνική Πολιτική Φιλοσοφία'],
      ['Πολιτική Κοσμολογία'],
      ['Ορφική–Πυθαγόρεια Παράδοση', 'της Ορφικής–Πυθαγόρειας Παράδοσης'],
      ['Αρχαίες Ελληνίδες φιλόσοφοι', 'των Αρχαίων Ελληνίδων φιλοσόφων'],
    ],
  },
};

const copyIn = (locale: Locale) => {
  const { site, about } = content(locale);
  const parts = [site.description, site.mission, about.title, ...about.intro, ...about.story.flatMap((part) => part.paragraphs)];
  return plain(parts.join(' '));
};
const copy: Record<Locale, string> = { en: copyIn('en'), el: copyIn('el') };
const warned = new Set<string>();

/** The claim's value, only while the copy in that language contains every phrase the claim rests on. */
function said(locale: Locale, [value, ...phrases]: Claim): string | undefined {
  const missing = (phrases.length ? phrases : [value]).find((phrase) => !copy[locale].includes(phrase));
  if (missing === undefined) return value;
  if (!warned.has(missing)) console.warn(`[schema] left out a fact: the copy (${locale}) no longer says "${missing}"`);
  warned.add(missing);
  return undefined;
}
/** Drops what said() left out. An empty list becomes undefined, so the property is omitted. */
const some = <T>(items: (T | undefined)[]) => {
  const kept = items.filter((item) => item !== undefined);
  return kept.length ? kept : undefined;
};
const named = (type: string, name: string | undefined): Json | undefined => (name ? { '@type': type, name } : undefined);

// ---------- The Academy, its site and its founder ----------

// site.founder carries the title: "Dr. Athena Despoina Potari", "Δρ. Αθηνά Δέσποινα Ποτάρη".
const founder = (locale: Locale) => {
  const { site } = content(locale);
  const [, honorific, name] = site.founder.match(/^(Dr\.|Δρ\.)\s+(.+)$/) ?? [undefined, undefined, site.founder];
  return { honorific, name };
};

// The footer presents every profile as the Academy's. Athena's own are the ones whose address carries her surname.
const profiles = content('en').site.social.map((item) => item.url);
const surname = founder('en').name.split(' ').at(-1)!.toLowerCase();
const ownProfiles = profiles.filter((url) => url.toLowerCase().includes(surname));

// Short forms for pointing at the main entities from any page. Each page's JSON-LD stands alone,
// so a reference carries the name and address as well as the @id.
const homeUrl = (locale: Locale) => page(pathIn(locale, '/'));
const organizationRef = (locale: Locale): Json => ({
  '@type': 'EducationalOrganization',
  '@id': ORGANIZATION,
  name: content(locale).site.name,
  url: homeUrl(locale),
});
const websiteRef = (locale: Locale): Json => ({
  '@type': 'WebSite',
  '@id': WEBSITE,
  name: content(locale).site.name,
  url: homeUrl(locale),
});
const athenaRef = (locale: Locale): Json => ({
  '@type': 'Person',
  '@id': ATHENA,
  name: founder(locale).name,
  url: page(pathIn(locale, ABOUT)),
});
/** The page a thing is described on. This is where a page states its language. */
const webPage = (locale: Locale, type: string, url: string, name: string): Json => ({
  '@type': type,
  '@id': url,
  url,
  name,
  inLanguage: content(locale).site.locale,
  isPartOf: websiteRef(locale),
});

export const organizationSchema = (asked: AnyLocale = 'en'): Json => {
  const locale = mainLocale(asked);
  const { site } = content(locale);
  const known = facts[locale];
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': ORGANIZATION,
    name: site.name,
    alternateName: some(known.academyNames.map((claim) => said(locale, claim))),
    url: homeUrl(locale),
    logo: photo('logo'),
    // The two sentences the live site gives under "Who We Are".
    description: `${site.description} ${site.mission}`,
    founder: athenaRef(locale),
    foundingDate: said(locale, known.founded),
    email: site.emails,
    telephone: site.phone.href.replace(/^tel:00/, '+'),
    sameAs: profiles,
    knowsAbout: some(known.academyTopics.map((claim) => said(locale, claim))),
  };
};

export const websiteSchema = (asked: AnyLocale = 'en'): Json => {
  const locale = mainLocale(asked);
  const { site } = content(locale);
  return {
    '@context': 'https://schema.org',
    ...websiteRef(locale),
    description: site.description,
    inLanguage: site.locale,
    publisher: organizationRef(locale),
  };
};

/** The About page as Google's profile page: the page, and Athena as the person it is about. */
export const personSchema = (asked: AnyLocale = 'en'): Json => {
  const locale = mainLocale(asked);
  const { about } = content(locale);
  const known = facts[locale];
  const { honorific, name } = founder(locale);
  const url = page(pathIn(locale, ABOUT));
  const inOtherLanguages = locales.filter((other) => other !== locale).map((other) => founder(other).name);
  return {
    '@context': 'https://schema.org',
    ...webPage(locale, 'ProfilePage', url, about.title),
    mainEntity: {
      '@type': 'Person',
      '@id': ATHENA,
      name,
      alternateName: some([said(locale, known.shortName), ...inOtherLanguages]),
      honorificPrefix: honorific,
      jobTitle: said(locale, known.jobTitle),
      description: plain(about.intro[0]),
      url,
      image: photo(about.story[0].image),
      worksFor: organizationRef(locale),
      alumniOf: some([
        named('CollegeOrUniversity', said(locale, known.university)),
        named('CollegeOrUniversity', said(locale, known.graduateSchool)),
        named('EducationalOrganization', said(locale, known.school)),
      ]),
      award: said(locale, known.award),
      memberOf: named('Organization', said(locale, known.memberOf)),
      knowsAbout: some(known.personTopics.map((claim) => said(locale, claim))),
      sameAs: ownProfiles,
    },
  };
};

// ---------- Courses ----------

// The Greek course records are their own objects, so a record tells which language it is written in.
// `asked` is checked because courses.map(courseSchema) hands over an index in that place.
const localeOf = (course: Course | undefined, asked?: unknown): Locale =>
  asked === 'en' || asked === 'el' ? asked : course && content('el').courses.includes(course) ? 'el' : 'en';

// How a course runs: online when it is taught on Zoom (its format says so), from its first lesson.
const courseInstance = (course: Course, locale: Locale): Json => ({
  '@type': 'CourseInstance',
  name: course.schedule,
  courseMode: course.format?.includes('Zoom') ? 'Online' : undefined,
  startDate: course.starts?.firstLesson,
  instructor:
    course.instructor === content(locale).site.founder
      ? athenaRef(locale)
      : { '@type': 'Person', name: course.instructor },
});

// Paying in full: the whole price, less the course's upfront discount where it has one.
const courseOffer = (price: NonNullable<Course['price']>, url: string, discount = 0): Json => ({
  '@type': 'Offer',
  category: 'Paid',
  price: upfrontPrice(price.amount, discount),
  priceCurrency: price.currency,
  url,
  // The standard tuition for the whole cycle, then the same in eight monthly instalments: "€550 or 8 × €68.75".
  description: `${price.label} ${price.display}`,
});

/**
 * A course that is open, with its description, run and price: everything Google asks of a Course.
 * A placeholder has none of those yet, so it is described as the page it is and not as a Course.
 * The page's language is the record's; inLanguage is the one the course is taught in.
 */
export const courseSchema = (course: Course, asked?: unknown): Json => {
  const locale = localeOf(course, asked);
  const url = page(content(locale).coursePageHref(course.slug));
  const onPage = webPage(locale, 'WebPage', url, course.title);
  if (course.status !== 'open' || !course.summary || !course.price) return { '@context': 'https://schema.org', ...onPage };
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${page(content('en').coursePageHref(course.slug))}#course`,
    name: course.title,
    description: course.summary,
    url,
    image: photo(course.image),
    provider: organizationRef(locale),
    inLanguage: course.teaching ?? 'el',
    hasCourseInstance: courseInstance(course, locale),
    offers: courseOffer(course.price, url, course.upfrontDiscount),
    mainEntityOfPage: onPage,
  };
};

/**
 * The course's introduction, an online event of its own, so a search can show its date (Maria, 23 November
 * 2026). Only while it is still to come: once it has passed, nothing is published.
 */
export const introductionSchema = (course: Course, asked?: unknown): Json | null => {
  const at = course.starts?.introduction;
  if (!at || new Date(at).getTime() < Date.now()) return null;
  const locale = localeOf(course, asked);
  const url = page(content(locale).coursePageHref(course.slug));
  const label = course.dates?.[0]?.label ?? course.title;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${course.title}: ${label}`,
    description: course.summary,
    startDate: at,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: { '@type': 'VirtualLocation', url },
    image: photo(course.image),
    organizer: organizationRef(locale),
    performer: athenaRef(locale),
    inLanguage: course.teaching ?? 'el',
    url,
  };
};

/** For the Courses page: the list of courses, each pointing at its own page. */
export const courseListSchema = (list: Course[], asked?: unknown): Json => {
  const locale = localeOf(list[0], asked);
  const { site, coursesPage, coursePageHref } = content(locale);
  const url = page(site.routes.courses);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${url}#list`,
    name: coursesPage.title,
    itemListElement: list.map((course, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: course.title,
      url: page(coursePageHref(course.slug)),
    })),
    mainEntityOfPage: webPage(locale, 'CollectionPage', url, coursesPage.title),
  };
};

/** `path` is the page's own address, so a Greek trail carries /el/ (the data's links already do). */
export const breadcrumbSchema = (trail: { name: string; path: string }[]): Json => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: page(item.path),
  })),
});
