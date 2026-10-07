import { daysInMonth, fromDayNumber, toDayNumber } from './calendar';
import type { EthDate } from './types';

export function addDays(e: EthDate, n: number): EthDate {
  return fromDayNumber(toDayNumber(e) + Math.trunc(n));
}

/** Adds months, treating Pagume as month 13. The day is clamped: Nehase 30 + 1 month → Pagume 5 (or 6). */
export function addMonths(e: EthDate, n: number): EthDate {
  toDayNumber(e); // validates
  const idx = e.year * 13 + (e.month - 1) + Math.trunc(n);
  const year = Math.floor(idx / 13);
  const month = idx - year * 13 + 1;
  return { year, month, day: Math.min(e.day, daysInMonth(year, month)) };
}

/** Adds years. Pagume 6 in a non-leap target year becomes Pagume 5. */
export function addYears(e: EthDate, n: number): EthDate {
  toDayNumber(e);
  const year = e.year + Math.trunc(n);
  return { year, month: e.month, day: Math.min(e.day, daysInMonth(year, e.month)) };
}

export function compare(a: EthDate, b: EthDate): -1 | 0 | 1 {
  const d = toDayNumber(a) - toDayNumber(b);
  return d < 0 ? -1 : d > 0 ? 1 : 0;
}

export const isSameDay = (a: EthDate, b: EthDate) => compare(a, b) === 0;
export const isBefore = (a: EthDate, b: EthDate) => compare(a, b) < 0;
export const isAfter = (a: EthDate, b: EthDate) => compare(a, b) > 0;
export const isSameMonth = (a: EthDate, b: EthDate) => a.year === b.year && a.month === b.month;

/** Number of days from `a` to `b` (positive if `b` is later). */
export function differenceInDays(a: EthDate, b: EthDate): number {
  return toDayNumber(b) - toDayNumber(a);
}

export function clamp(e: EthDate, min?: EthDate | null, max?: EthDate | null): EthDate {
  if (min && isBefore(e, min)) return { ...min };
  if (max && isAfter(e, max)) return { ...max };
  return e;
}

export function startOfMonth(e: EthDate): EthDate {
  return { year: e.year, month: e.month, day: 1 };
}

export function endOfMonth(e: EthDate): EthDate {
  return { year: e.year, month: e.month, day: daysInMonth(e.year, e.month) };
}
