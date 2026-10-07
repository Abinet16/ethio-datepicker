# @ethio-datepicker/core

Zero-dependency Ethiopian calendar core for [ethio-datepicker](../../README.md). ~4 kB gzipped.

```bash
npm i @ethio-datepicker/core
```

```ts
import { fromISO, toISO, format, addMonths, getMonthGrid, today } from '@ethio-datepicker/core';

fromISO('2026-09-25');                          // { year: 2019, month: 1, day: 15 }
toISO({ year: 2019, month: 13, day: 6 });       // '2027-09-11'  (Pagume 6, leap year)
format(fromISO('2026-09-25'), { style: 'full' }); // 'ዓርብ፣ መስከረም 15 ቀን 2019 ዓ.ም.'
format(today(), { locale: 'en', numerals: 'geez' });
addMonths({ year: 2019, month: 12, day: 30 }, 1); // { year: 2019, month: 13, day: 6 } (clamped)
getMonthGrid(2019, 1, { today: today() });      // weeks × 7 DayCells
```

## What's included

| Area | Functions |
|---|---|
| Conversion | `toEthiopian`, `toGregorian`, `toISO`, `fromISO`, `parseISO`, `today` |
| Calendar rules | `isLeapYear`, `daysInMonth`, `daysInYear`, `isValid`, `weekday` |
| Arithmetic | `addDays`, `addMonths`, `addYears`, `compare`, `isBefore`, `isAfter`, `isSameDay`, `differenceInDays`, `clamp`, `startOfMonth`, `endOfMonth` |
| Text | `format`, `parse`, `monthNames`, `weekdayNames`, `toGeez`, `fromGeez` |
| UI | `getMonthGrid` |

Locales: `am` (default), `en`, `om`, `ti`. Afaan Oromoo and Tigrinya names need native-speaker review.

## Guarantees

- No JavaScript `Date` in any calculation — only integer day numbers, so timezones can't shift a date. `today()` is the only function that reads the clock (Addis Ababa time by default).
- Every day from 1900 to 2100 is checked in CI against the `Intl` ethiopic calendar built into Node and browsers.

Holidays and fasting periods are coming next.
