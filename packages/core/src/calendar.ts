import { ethiopicToJdn, gregorianToJdn, jdnToEthiopic, jdnToGregorian } from './jdn';
import type { EthDate, GregDate, ISODate, Weekday } from './types';

/** Pagume has 6 days when `year % 4 === 3` (e.g. 2019 EC → Pagume 6 = 11 Sep 2027). */
export function isLeapYear(year: number): boolean {
  return ((year % 4) + 4) % 4 === 3;
}

export function daysInMonth(year: number, month: number): number {
  if (month >= 1 && month <= 12) return 30;
  if (month === 13) return isLeapYear(year) ? 6 : 5;
  return 0;
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function isValid(e: EthDate | null | undefined): e is EthDate {
  return (
    !!e &&
    Number.isInteger(e.year) &&
    Number.isInteger(e.month) &&
    Number.isInteger(e.day) &&
    e.month >= 1 &&
    e.month <= 13 &&
    e.day >= 1 &&
    e.day <= daysInMonth(e.year, e.month)
  );
}

function isGregLeap(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function isValidGregorian(g: GregDate | null | undefined): g is GregDate {
  if (!g || !Number.isInteger(g.year) || !Number.isInteger(g.month) || !Number.isInteger(g.day)) return false;
  if (g.month < 1 || g.month > 12 || g.day < 1) return false;
  const dim = [31, isGregLeap(g.year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][g.month - 1]!;
  return g.day <= dim;
}

function assertEth(e: EthDate): void {
  if (!isValid(e)) throw new RangeError(`Invalid Ethiopian date: ${JSON.stringify(e)}`);
}

const ISO_RE = /^(-?\d{4,})-(\d{2})-(\d{2})$/;

/** Parse a strict `YYYY-MM-DD` Gregorian string. Returns `null` if malformed or not a real date. */
export function parseISO(iso: ISODate): GregDate | null {
  const m = ISO_RE.exec(iso?.trim?.() ?? '');
  if (!m) return null;
  const g = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  return isValidGregorian(g) ? g : null;
}

const pad = (n: number, w = 2) => String(Math.abs(n)).padStart(w, '0');

export function gregorianToISO(g: GregDate): ISODate {
  return `${g.year < 0 ? '-' : ''}${pad(g.year, 4)}-${pad(g.month)}-${pad(g.day)}`;
}

function toGreg(g: GregDate | ISODate): GregDate {
  if (typeof g === 'string') {
    const p = parseISO(g);
    if (!p) throw new RangeError(`Invalid ISO date: "${g}"`);
    return p;
  }
  if (!isValidGregorian(g)) throw new RangeError(`Invalid Gregorian date: ${JSON.stringify(g)}`);
  return g;
}

export function toEthiopian(g: GregDate | ISODate): EthDate {
  return jdnToEthiopic(gregorianToJdn(toGreg(g)));
}

export function toGregorian(e: EthDate): GregDate {
  assertEth(e);
  return jdnToGregorian(ethiopicToJdn(e));
}

export function toISO(e: EthDate): ISODate {
  return gregorianToISO(toGregorian(e));
}

export function fromISO(iso: ISODate): EthDate {
  return toEthiopian(iso);
}

/** Integer day number, useful as a sortable key. */
export function toDayNumber(e: EthDate): number {
  assertEth(e);
  return ethiopicToJdn(e);
}

export function fromDayNumber(jdn: number): EthDate {
  return jdnToEthiopic(jdn);
}

/** 0 = Sunday (እሑድ) … 6 = Saturday (ቅዳሜ). */
export function weekday(e: EthDate): Weekday {
  return (((toDayNumber(e) + 1) % 7) + 7) % 7 as Weekday;
}

/**
 * Today's Ethiopian date in the given IANA timezone (default Addis Ababa).
 * This is the only function in the core that reads the clock.
 */
export function today(timeZone = 'Africa/Addis_Ababa', now: Date = new Date()): EthDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return toEthiopian({ year: get('year'), month: get('month'), day: get('day') });
}
