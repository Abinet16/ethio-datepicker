/** A calendar date in the Ethiopian calendar. `month` is 1–13 (13 = Pagume). No time, no timezone. */
export interface EthDate {
  year: number;
  month: number;
  day: number;
}

/** A calendar date in the Gregorian calendar. `month` is 1–12. */
export interface GregDate {
  year: number;
  month: number;
  day: number;
}

/** Gregorian calendar date as `YYYY-MM-DD`. This is the value to store and send to backends. */
export type ISODate = string;

export type Locale = 'am' | 'en' | 'om' | 'ti';
export type Numerals = 'arabic' | 'geez';
/** 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
