import { daysInMonth, fromDayNumber, isValid, toDayNumber, toGregorian, toISO, weekday } from './calendar';
import type { EthDate, GregDate, ISODate } from './types';

export interface DayCell {
  date: EthDate;
  iso: ISODate;
  gregorian: GregDate;
  weekday: number;
  inMonth: boolean;
  isToday: boolean;
}

export interface MonthGridOptions {
  /** 0 = Sunday, 1 = Monday (default). */
  weekStartsOn?: 0 | 1;
  /** Include neighbouring-month days to fill the first/last week. Default true. */
  outsideDays?: boolean;
  /** Always return 6 weeks so the layout never jumps. Default false. */
  fixedWeeks?: boolean;
  /** Date to mark as `isToday`. Pass `today()` — the grid itself never reads the clock. */
  today?: EthDate | null;
}

/**
 * Month grid as weeks × 7 cells. With `outsideDays: false`, positions outside the
 * month are `null` so the grid still lines up by weekday.
 * Pagume (5–6 days) usually produces 1–2 weeks.
 */
export function getMonthGrid(year: number, month: number, opts: MonthGridOptions = {}): (DayCell | null)[][] {
  const first: EthDate = { year, month, day: 1 };
  if (!isValid(first)) throw new RangeError(`Invalid month: ${year}-${month}`);
  const weekStartsOn = opts.weekStartsOn ?? 1;
  const outside = opts.outsideDays ?? true;
  const todayNum = opts.today && isValid(opts.today) ? toDayNumber(opts.today) : null;

  const firstNum = toDayNumber(first);
  const lastNum = firstNum + daysInMonth(year, month) - 1;
  const lead = (weekday(first) - weekStartsOn + 7) % 7;
  const start = firstNum - lead;
  let weeks = Math.ceil((lastNum - start + 1) / 7);
  if (opts.fixedWeeks) weeks = 6;

  const grid: (DayCell | null)[][] = [];
  for (let w = 0; w < weeks; w++) {
    const row: (DayCell | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const n = start + w * 7 + d;
      const inMonth = n >= firstNum && n <= lastNum;
      if (!inMonth && !outside) {
        row.push(null);
        continue;
      }
      const date = fromDayNumber(n);
      row.push({
        date,
        iso: toISO(date),
        gregorian: toGregorian(date),
        weekday: (weekStartsOn + d) % 7,
        inMonth,
        isToday: n === todayNum,
      });
    }
    grid.push(row);
  }
  return grid;
}
