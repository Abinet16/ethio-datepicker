import type { EthDate, GregDate } from './types';

/**
 * Julian Day Number arithmetic. Every conversion goes through an integer day
 * count, so no JavaScript `Date` or timezone is ever involved.
 */

/** JDN of the day before Meskerem 1, year 1 (Amete Mihret era), minus 365. */
const ETHIOPIC_EPOCH = 1723856;

const div = (a: number, b: number) => Math.floor(a / b);
const mod = (a: number, b: number) => ((a % b) + b) % b;

export function ethiopicToJdn({ year, month, day }: EthDate): number {
  return ETHIOPIC_EPOCH + 365 + 365 * (year - 1) + div(year, 4) + 30 * month + day - 31;
}

export function jdnToEthiopic(jdn: number): EthDate {
  const r = mod(jdn - ETHIOPIC_EPOCH, 1461);
  const n = mod(r, 365) + 365 * div(r, 1460);
  const year = 4 * div(jdn - ETHIOPIC_EPOCH, 1461) + div(r, 365) - div(r, 1460);
  const month = div(n, 30) + 1;
  const day = mod(n, 30) + 1;
  return { year, month, day };
}

/** Proleptic Gregorian → JDN (Fliegel & Van Flandern). */
export function gregorianToJdn({ year, month, day }: GregDate): number {
  const a = div(14 - month, 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + div(153 * m + 2, 5) + 365 * y + div(y, 4) - div(y, 100) + div(y, 400) - 32045;
}

export function jdnToGregorian(jdn: number): GregDate {
  const a = jdn + 32044;
  const b = div(4 * a + 3, 146097);
  const c = a - div(146097 * b, 4);
  const d = div(4 * c + 3, 1461);
  const e = c - div(1461 * d, 4);
  const m = div(5 * e + 2, 153);
  return {
    day: e - div(153 * m + 2, 5) + 1,
    month: m + 3 - 12 * div(m, 10),
    year: 100 * b + d - 4800 + div(m, 10),
  };
}
