// Amounts as the pages write them, and the price of paying a whole cycle upfront.
import type { Locale } from '../../lib/locale';

/** An amount in euros: "€550", "€68.75" in English; "550€", "68,75€" in Greek. */
export const money = (value: number, locale: Locale): string => {
  const figure = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return locale === 'en' ? `€${figure}` : `${figure.replace('.', ',')}€`;
};

/** The whole price less a course's upfront discount (Course.upfrontDiscount), in whole euros. */
export const upfrontPrice = (price: number, discount = 0): number => Math.round(price * (1 - discount));

/** 0.1 as "10%" */
export const percent = (discount: number): string => `${Math.round(discount * 100)}%`;

/** Fills the {name} slots of a sentence from the data. */
export const fill = (text: string, values: Record<string, string>): string =>
  text.replace(/\{(\w+)\}/g, (slot, key: string) => values[key] ?? slot);
