import type { Locale } from './types';

type Names = { long: readonly string[]; short: readonly string[] };
type WeekdayNames = Names & { narrow: readonly string[] };

/**
 * Month names, Meskerem (1) … Pagume (13).
 * `om` and `ti` need review by native speakers before v1.0 — PRs welcome.
 */
const MONTHS: Record<Locale, Names> = {
  am: {
    long: ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'],
    short: ['መስከ', 'ጥቅም', 'ኅዳር', 'ታኅሣ', 'ጥር', 'የካቲ', 'መጋቢ', 'ሚያዝ', 'ግንቦ', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'],
  },
  en: {
    long: ['Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'],
    short: ['Mes', 'Tik', 'Hid', 'Tah', 'Tir', 'Yek', 'Meg', 'Mia', 'Gin', 'Sen', 'Ham', 'Neh', 'Pag'],
  },
  om: {
    long: ['Fulbaana', 'Onkoloolessa', 'Sadaasa', 'Muddee', 'Amajjii', 'Guraandhala', 'Bitootessa', 'Eebila', 'Caamsaa', 'Waxabajjii', 'Adoolessa', 'Hagayya', 'Qaammee'],
    short: ['Ful', 'Onk', 'Sad', 'Mud', 'Ama', 'Gur', 'Bit', 'Eeb', 'Caa', 'Wax', 'Ado', 'Hag', 'Qaa'],
  },
  ti: {
    long: ['መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ', 'ጥሪ', 'ለካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'ጳጉሜን'],
    short: ['መስከ', 'ጥቅም', 'ሕዳር', 'ታሕሳ', 'ጥሪ', 'ለካቲ', 'መጋቢ', 'ሚያዝ', 'ግንቦ', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'ጳጉሜ'],
  },
};

/** Weekday names, Sunday (0) … Saturday (6). */
const WEEKDAYS: Record<Locale, WeekdayNames> = {
  am: {
    long: ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
    short: ['እሑድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'],
    narrow: ['እ', 'ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ'],
  },
  en: {
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  },
  om: {
    long: ['Dilbata', 'Wiixata', 'Kibxata', 'Roobii', 'Kamiisa', 'Jimaata', 'Sanbata'],
    short: ['Dil', 'Wix', 'Kib', 'Rob', 'Kam', 'Jim', 'San'],
    narrow: ['D', 'W', 'K', 'R', 'K', 'J', 'S'],
  },
  ti: {
    long: ['ሰንበት', 'ሰኑይ', 'ሰሉስ', 'ረቡዕ', 'ሓሙስ', 'ዓርቢ', 'ቀዳም'],
    short: ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
    narrow: ['ሰ', 'ሰ', 'ሰ', 'ረ', 'ሓ', 'ዓ', 'ቀ'],
  },
};

/** Gregorian month names, used for secondary labels. `om` and `ti` need native-speaker review. */
const GREG_MONTHS: Record<Locale, readonly string[]> = {
  am: ['ጃንዋሪ', 'ፌብሩዋሪ', 'ማርች', 'ኤፕሪል', 'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስት', 'ሴፕቴምበር', 'ኦክቶበር', 'ኖቬምበር', 'ዲሴምበር'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  om: ['Amajjii', 'Guraandhala', 'Bitootessa', 'Eebila', 'Caamsaa', 'Waxabajjii', 'Adoolessa', 'Hagayya', 'Fulbaana', 'Onkoloolessa', 'Sadaasa', 'Muddee'],
  ti: ['ጥሪ', 'ለካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ'],
};

export const LOCALES: readonly Locale[] = ['am', 'en', 'om', 'ti'];

function resolve(locale: Locale | undefined): Locale {
  return locale && locale in MONTHS ? locale : 'am';
}

export function monthNames(locale?: Locale, form: 'long' | 'short' = 'long'): string[] {
  return [...MONTHS[resolve(locale)][form]];
}

export function weekdayNames(locale?: Locale, form: 'long' | 'short' | 'narrow' = 'long'): string[] {
  return [...WEEKDAYS[resolve(locale)][form]];
}

export function gregorianMonthNames(locale?: Locale): string[] {
  return [...GREG_MONTHS[resolve(locale)]];
}

/** Era suffix: ዓ.ም. (Amharic "Amete Mihret") / EC. `om` needs native-speaker review. */
export const ERA: Record<Locale, string> = { am: 'ዓ.ም.', en: 'EC', om: 'A.L.I.', ti: 'ዓ.ም.' };
