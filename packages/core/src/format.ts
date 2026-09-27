import { isValid, weekday } from './calendar';
import { fromGeez, toGeez } from './geez';
import { ERA, monthNames, weekdayNames } from './locale';
import type { EthDate, Locale, Numerals } from './types';

export type FormatStyle = 'short' | 'medium' | 'long' | 'full';

export interface FormatOptions {
  locale?: Locale;
  numerals?: Numerals;
  style?: FormatStyle;
  /**
   * Tokens: `YYYY` year · `MM` 2-digit month · `M` month · `MMMM` month name · `MMM` short name ·
   * `DD` 2-digit day · `D` day · `dddd` weekday · `ddd` short weekday · `E` era.
   * Text inside `[brackets]` is printed literally.
   */
  pattern?: string;
}

const STYLES: Record<Locale, Record<FormatStyle, string>> = {
  am: { short: 'DD/MM/YYYY', medium: 'MMM D, YYYY', long: 'MMMM D, YYYY', full: 'dddd፣ MMMM D [ቀን] YYYY E' },
  en: { short: 'DD/MM/YYYY', medium: 'MMM D, YYYY', long: 'MMMM D, YYYY', full: 'dddd, MMMM D, YYYY E' },
  om: { short: 'DD/MM/YYYY', medium: 'MMM D, YYYY', long: 'MMMM D, YYYY', full: 'dddd, MMMM D, YYYY E' },
  ti: { short: 'DD/MM/YYYY', medium: 'MMM D, YYYY', long: 'MMMM D, YYYY', full: 'dddd፣ MMMM D [ዕለት] YYYY E' },
};

const TOKEN_RE = /\[([^\]]*)]|YYYY|MMMM|MMM|MM|M|DD|D|dddd|ddd|E/g;

export function format(e: EthDate, opts: FormatOptions = {}): string {
  if (!isValid(e)) throw new RangeError(`Invalid Ethiopian date: ${JSON.stringify(e)}`);
  const locale = opts.locale ?? 'am';
  const geez = opts.numerals === 'geez';
  const pattern = opts.pattern ?? STYLES[locale][opts.style ?? 'long'];
  const num = (n: number, width = 1) => (geez ? toGeez(n) : String(n).padStart(width, '0'));
  return pattern.replace(TOKEN_RE, (tok, literal: string | undefined) => {
    if (literal !== undefined) return literal;
    switch (tok) {
      case 'YYYY': return num(e.year, 4);
      case 'MMMM': return monthNames(locale)[e.month - 1]!;
      case 'MMM': return monthNames(locale, 'short')[e.month - 1]!;
      case 'MM': return num(e.month, 2);
      case 'M': return num(e.month);
      case 'DD': return num(e.day, 2);
      case 'D': return num(e.day);
      case 'dddd': return weekdayNames(locale)[weekday(e)]!;
      case 'ddd': return weekdayNames(locale, 'short')[weekday(e)]!;
      case 'E': return ERA[locale];
      default: return tok;
    }
  });
}

const GEEZ_RUN = /[፩-፼]+/g;
const normalise = (s: string) => s.replace(GEEZ_RUN, (g) => String(fromGeez(g))).trim().toLowerCase();

/**
 * Parse user input into an Ethiopian date. Accepts:
 * `15/01/2019`, `15-1-2019`, `2019-01-15` (year first), `መስከረም 15 2019`, `Meskerem 15, 2019`,
 * `15 Meskerem 2019`, and Geez numerals in any of these. Returns `null` if not a valid date.
 *
 * Note: `2019-01-15` is read as an **Ethiopian** Y-M-D here. Use `fromISO` for Gregorian ISO strings.
 */
export function parse(input: string, opts: { locale?: Locale } = {}): EthDate | null {
  if (!input) return null;
  const s = normalise(input);

  let m = /^(\d{1,2})[/.\-\s](\d{1,2})[/.\-\s](\d{3,4})$/.exec(s);
  if (m) return valid(+m[3]!, +m[2]!, +m[1]!);
  m = /^(\d{3,4})[/.\-\s](\d{1,2})[/.\-\s](\d{1,2})$/.exec(s);
  if (m) return valid(+m[1]!, +m[2]!, +m[3]!);

  const month = findMonth(s, opts.locale);
  if (!month) return null;
  const nums = s.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length !== 2) return null;
  const [a, b] = nums as [number, number];
  return a > 31 ? valid(a, month, b) : valid(b, month, a);
}

function findMonth(s: string, locale?: Locale): number | null {
  const order: Locale[] = locale ? [locale, 'am', 'en', 'om', 'ti'] : ['am', 'en', 'om', 'ti'];
  for (const loc of order) {
    for (const form of ['long', 'short'] as const) {
      const names = monthNames(loc, form);
      const i = names.findIndex((n) => s.includes(n.toLowerCase()));
      if (i >= 0) return i + 1;
    }
  }
  return null;
}

function valid(year: number, month: number, day: number): EthDate | null {
  const e = { year, month, day };
  return isValid(e) ? e : null;
}
