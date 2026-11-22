// Amounts as the pages write them, and the price of paying a whole cycle upfront.
import type { Locale } from '../../lib/locale';

/** An amount in euros, the sign first in every language (Maria): "€550", "€68.75"; Greek "€550", "€68,75". */
export const money = (value: number, locale: Locale): string => {
  const figure = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return locale === 'en' ? `€${figure}` : `€${figure.replace('.', ',')}`;
};

/** The whole price less a course's upfront discount (Course.upfrontDiscount), in whole euros. */
export const upfrontPrice = (price: number, discount = 0): number => Math.round(price * (1 - discount));

/** 0.1 as "10%" */
export const percent = (discount: number): string => `${Math.round(discount * 100)}%`;

/** Fills the {name} slots of a sentence from the data. */
export const fill = (text: string, values: Record<string, string>): string =>
  text.replace(/\{(\w+)\}/g, (slot, key: string) => values[key] ?? slot);

/**
 * A course's fee as the cards and course pages show it: the standard tier paid upfront (less any upfront
 * discount, with the whole price to strike through), then the monthly way.
 */
export const feeOf = (tier: { price: number; perMonth: number; payments: number }, discount: number, locale: Locale) => ({
  now: money(upfrontPrice(tier.price, discount), locale),
  was: discount > 0 ? money(tier.price, locale) : '',
  pct: discount > 0 ? percent(discount) : '',
  month: money(tier.perMonth, locale),
  payments: String(tier.payments),
});
