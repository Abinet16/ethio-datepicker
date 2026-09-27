# ethio-datepicker — API Sketch (v0.1 draft)

*Status: draft for review · Follows [IDEA.md](./IDEA.md) · 25 Sep 2026 (Meskerem 15, 2019 EC)*

This is the public contract we build against. Anything not written here is private and can change.

---

## 0. Proposed defaults for the open questions

These are the defaults for building v0.1. Change any of them and the API below mostly stays the same.

| Question | Proposed default | Why |
|---|---|---|
| Lit or vanilla custom element | **Vanilla** (no Lit) | Keeps the "zero runtime deps" promise; the element is small enough |
| Own core or depend on `kenat` | **Own core**, cross-checked against `Intl` in CI | Tiny, tree-shakeable, no dependency; offer a `kenat` adapter later |
| Licence | **MIT** | Standard for UI libraries; best for adoption |
| Default display | **Ethiopian, with small Gregorian day numbers** (`show-gregorian` on by default) | Most users know both; the second number stops booking mistakes |
| Holiday data governance | Data files in `core/src/holidays/*.ts`, every change needs a source link in the PR | Keeps it auditable |

---

## 1. Packages

| npm name | Contents | Depends on |
|---|---|---|
| `@ethio-datepicker/core` | Types, conversion, formatting, grid, holidays, fasts | nothing |
| `@ethio-datepicker/headless` | Framework-free picker state + ARIA/keyboard props | core |
| `@ethio-datepicker/element` | `<ethio-datepicker>` Web Component + default theme | headless |
| `@ethio-datepicker/react` | `<EthioDatePicker>` + `useEthioDatePicker()` | headless, react ≥18 (peer) |
| `ethio-datepicker` | Convenience package: re-exports core + registers the element | element |

`npm i ethio-datepicker` is the one-line install from the pitch. Power users install only the scoped pieces they need.

---

## 2. Core (`@ethio-datepicker/core`)

### 2.1 Types

```ts
/** A calendar date with no time and no timezone. month: 1–13 (13 = Pagume). */
export interface EthDate { year: number; month: number; day: number }
export interface GregDate { year: number; month: number; day: number } // month: 1–12

/** 'YYYY-MM-DD' Gregorian. This is the value we store and send to backends. */
export type ISODate = string;

export type Locale = 'am' | 'en' | 'om' | 'ti';
export type Numerals = 'arabic' | 'geez';
export type HolidayTag = 'public' | 'orthodox' | 'muslim' | 'cultural';

export interface Holiday {
  id: string;                       // 'enkutatash', 'meskel', 'eid-al-fitr', ...
  name: Record<Locale, string>;
  date: EthDate;
  iso: ISODate;
  tags: HolidayTag[];
  tentative?: boolean;              // true for moon-sighting holidays until overridden
  source: 'fixed' | 'bahire-hasab' | 'hijri-estimate' | 'override';
}

export interface FastingPeriod {
  id: string;                       // 'abiy-tsom', 'filseta', 'ramadan', ...
  name: Record<Locale, string>;
  start: EthDate; end: EthDate;     // inclusive
  tags: ('orthodox' | 'muslim')[];
  tentative?: boolean;
}
```

**Rule:** the core never uses JavaScript `Date` internally. Every calculation goes through Julian Day Numbers, so timezone shifts can't move a date.

### 2.2 Conversion & validation

```ts
toEthiopian(g: GregDate | ISODate): EthDate
toGregorian(e: EthDate): GregDate
toISO(e: EthDate): ISODate
fromISO(iso: ISODate): EthDate
today(timeZone = 'Africa/Addis_Ababa'): EthDate   // only place a clock is read

isLeapYear(year: number): boolean        // year % 4 === 3  → Pagume has 6 days
daysInMonth(year: number, month: number): number  // 30, or 5/6 for month 13
isValid(e: EthDate): boolean
weekday(e: EthDate): 0 | 1 | 2 | 3 | 4 | 5 | 6   // 0 = Sunday (እሑድ)
```

### 2.3 Arithmetic & comparison

```ts
addDays(e, n): EthDate
addMonths(e, n): EthDate   // clamps the day: Nehase 30 + 1 month → Pagume 5 (or 6 in a leap year)
addYears(e, n): EthDate    // Pagume 6 in a non-leap target year → Pagume 5
compare(a, b): -1 | 0 | 1
isSameDay(a, b) / isBefore(a, b) / isAfter(a, b)
clamp(e, min?, max?): EthDate
```

### 2.4 Formatting & parsing

```ts
format(e: EthDate, opts?: {
  locale?: Locale;                         // default 'am'
  numerals?: Numerals;                     // default 'arabic'
  style?: 'short' | 'medium' | 'long' | 'full';  // or pattern:
  pattern?: string;                        // tokens: YYYY MM M MMMM DD D dddd
}): string
// format({year:2019,month:1,day:15}, {style:'full'}) → 'ዓርብ፣ መስከረም 15 ቀን 2019 ዓ.ም.'

parse(input: string, opts?: { locale?: Locale }): EthDate | null
// accepts '15/01/2019', '2019-01-15', 'መስከረም 15 2019', Geez numerals

monthNames(locale, form?: 'long' | 'short'): string[]   // 13 entries
weekdayNames(locale, form?: 'long' | 'short' | 'narrow'): string[]
toGeez(n: number): string / fromGeez(s: string): number
```

Month names (am): መስከረም ጥቅምት ኅዳር ታኅሣሥ ጥር የካቲት መጋቢት ሚያዝያ ግንቦት ሰኔ ሐምሌ ነሐሴ ጳጉሜን

### 2.5 Month grid

```ts
getMonthGrid(year: number, month: number, opts?: {
  weekStartsOn?: 0 | 1;          // default 1 (Monday / ሰኞ)
  outsideDays?: boolean;         // show neighbouring-month days, default true
  fixedWeeks?: boolean;          // always 6 rows, avoids layout jump; default false
  holidays?: HolidayTag[] | false;
  fasting?: boolean;
}): DayCell[][]                  // weeks × 7

interface DayCell {
  date: EthDate; iso: ISODate; gregorian: GregDate;
  inMonth: boolean; isToday: boolean;
  holidays: Holiday[]; fasts: FastingPeriod[];
}
```

Pagume produces a 1–2 row grid (5–6 days). With `fixedWeeks` it pads with next-month days.

### 2.6 Holidays & fasts

```ts
getHolidays(year: number, opts?: { tags?: HolidayTag[] }): Holiday[]
getHolidaysInRange(from: EthDate, to: EthDate, opts?): Holiday[]
getFastingPeriods(year: number): FastingPeriod[]
isFastingDay(e: EthDate, opts?: { weekly?: boolean }): FastingPeriod[]  // weekly = Wed/Fri
bahireHasab(year: number): { evangelist, newYearWeekday, metqi, abekte, nineveh, fasika, ... }

// Moon-sighting holidays are announced, not calculated. Let apps set the real date:
setHolidayOverrides(list: Array<{ id: string; year: number; date: EthDate | ISODate }>): void
```

Planned v0.1 holiday set (all **public** holidays in Ethiopia):

| id | Rule | 2019 EC date |
|---|---|---|
| `enkutatash` | Meskerem 1 | 11 Sep 2026 |
| `meskel` | Meskerem 17 | 27 Sep 2026 |
| `genna` | Gregorian 7 Jan → Tahsas 29, or Tahsas 28 in years after a Pagume 6 (see note) | 7 Jan 2027 |
| `timket` | Gregorian 19 Jan → Tir 11 / Tir 10 (same rule) | 19 Jan 2027 |
| `adwa` | Yekatit 23 | 2 Mar 2027 |
| `labour-day` | Gregorian 1 May (Miazia 23) | 1 May 2027 |
| `patriots-day` | Miazia 27 | 5 May 2027 |
| `derg-downfall` | Ginbot 20 | 28 May 2027 |
| `siklet` | Fasika − 2 days (Bahire Hasab) | 30 Apr 2027 |
| `fasika` | Bahire Hasab | 2 May 2027 (Miazia 24) |
| `eid-al-fitr`, `eid-al-adha`, `mawlid` | Hijri estimate, `tentative: true` | — |

> **Needs checking before v0.1:** whether Genna, Timket and Meskel follow the Gregorian date (7 Jan / 19 Jan / 27 Sep) or the Ethiopian date (Tahsas 29 / Tir 11 / Meskerem 17) in years right after a Pagume 6. The two rules disagree by one day (e.g. 2016 EC). We confirm against official government announcements for past years and write tests from those.

---

## 3. Headless (`@ethio-datepicker/headless`)

For people who want their own markup (Tailwind, shadcn/ui, design systems).

```ts
const picker = createDatePicker({
  value?: ISODate | null,              // controlled
  defaultValue?: ISODate | null,       // uncontrolled
  onChange?: (v: PickerValue | null) => void,
  min?: ISODate, max?: ISODate,
  isDateDisabled?: (d: DayCell) => boolean,
  locale?: Locale, numerals?: Numerals,
  weekStartsOn?: 0 | 1,
  holidays?: HolidayTag[] | false, fasting?: boolean,
  mode?: 'single' | 'range',           // 'range' ships in v0.2
  closeOnSelect?: boolean,             // default true
});

picker.getState()        // { value, focusedDate, visibleMonth, open, grid }
picker.subscribe(fn)     // returns unsubscribe
picker.actions           // select, focus, open, close, toggle, next/prevMonth, next/prevYear, goTo
picker.props.trigger()   // → { 'aria-haspopup': 'dialog', 'aria-expanded', onClick, ... }
picker.props.dialog()    // → { role: 'dialog', 'aria-modal': true, 'aria-label', ... }
picker.props.grid()      // → { role: 'grid', 'aria-labelledby', onKeyDown }
picker.props.day(cell)   // → { role: 'gridcell', tabIndex, 'aria-selected', 'aria-disabled',
                         //     'aria-label': 'ዓርብ መስከረም 15 2019, Friday 25 September 2026, …holiday names',
                         //     'data-today', 'data-holiday', 'data-fast', 'data-outside', onClick }

interface PickerValue {
  iso: ISODate;           // '2026-09-25'  ← store this
  ethiopian: EthDate;     // { year: 2019, month: 1, day: 15 }
  label: string;          // 'መስከረም 15, 2019' in the current locale
}
```

`props.*` return plain objects with DOM-standard names. The React adapter maps them to React props; Vue/Svelte users spread them directly.

---

## 4. Web Component (`<ethio-datepicker>`)

### 4.1 Usage

```html
<script type="module">import 'ethio-datepicker';</script>

<form>
  <label for="checkin">የመግቢያ ቀን</label>
  <ethio-datepicker id="checkin" name="checkin" required
                    min="2026-09-25" locale="am" holidays="public"></ethio-datepicker>
  <button>Book</button>
</form>
<!-- submits checkin=2026-10-02 -->
```

### 4.2 Attributes / properties

| Attribute | Property | Type | Default | Notes |
|---|---|---|---|---|
| `value` | `value` | ISODate | `''` | Always Gregorian ISO |
| — | `valueAsEthiopian` | EthDate \| null | | Read/write |
| `name` | `name` | string | | Form field name |
| `min` / `max` | same | ISODate | | |
| `locale` | `locale` | `am`\|`en`\|`om`\|`ti` | `am` | |
| `numerals` | `numerals` | `arabic`\|`geez` | `arabic` | |
| `mode` | `mode` | `popover`\|`inline` | `popover` | `inline` = always-visible calendar |
| `show-gregorian` | `showGregorian` | boolean | `true` | Small Gregorian number in each cell |
| `holidays` | `holidays` | comma list of tags \| `none` | `public` | |
| `fasting` | `fasting` | boolean | `false` | |
| `week-start` | `weekStart` | `sunday`\|`monday` | `monday` | |
| `submit-format` | `submitFormat` | `iso`\|`ethiopian` | `iso` | What the form receives |
| `placeholder` | `placeholder` | string | locale default | |
| `required`, `disabled`, `readonly` | same | boolean | | Native validation works |
| `unstyled` | `unstyled` | boolean | `false` | Drops default CSS; keeps behaviour + ARIA |
| — | `isDateDisabled` | `(d: DayCell) => boolean` | | JS only |
| — | `holidayOverrides` | array | | JS only; see §2.6 |

### 4.3 Events

| Event | `detail` | When |
|---|---|---|
| `change` (native) | — | Committed selection; `event.target.value` is ISO |
| `input` (native) | — | Every value change incl. typing |
| `ethio-change` | `PickerValue \| null` | Same time as `change`, with both calendars |
| `ethio-month-change` | `{ year, month }` | User moves to another month |
| `ethio-open` / `ethio-close` | — | Popover shown / hidden |

### 4.4 Methods

`show()`, `hide()`, `toggle()`, `focus()`, `goTo(date: ISODate | EthDate)`, `checkValidity()`, `reportValidity()`.

### 4.5 Styling

CSS custom properties (set on the element or any ancestor):

```css
ethio-datepicker {
  --edp-accent: #0f766e;        --edp-accent-contrast: #fff;
  --edp-surface: #fff;          --edp-text: #111827;       --edp-muted: #6b7280;
  --edp-holiday: #dc2626;       --edp-fast: #7c3aed;
  --edp-radius: 0.5rem;         --edp-cell-size: 2.75rem;  /* ≥ 44px touch target */
  --edp-font: inherit;
}
```

Shadow parts for full control: `trigger`, `input`, `popover`, `header`, `title`, `nav-prev`, `nav-next`, `weekday`, `grid`, `day`, `gregorian`, `marker`, `footer`. Day state is exposed as extra parts: `day selected`, `day today`, `day holiday`, `day fast`, `day outside`, `day disabled`, so

```css
ethio-datepicker::part(day holiday) { color: var(--edp-holiday); font-weight: 600; }
```

Dark mode: default theme follows `prefers-color-scheme`; `theme="light|dark"` forces one.

A Tailwind preset (`@ethio-datepicker/element/tailwind`) maps the variables to your theme colours. For full Tailwind control use the headless package.

### 4.6 SSR

Importing the package in Node must not crash: registration is guarded with `typeof customElements !== 'undefined'`. The element renders on the client; it reserves its trigger size to avoid layout shift.

---

## 5. React (`@ethio-datepicker/react`)

```tsx
import { EthioDatePicker, useEthioDatePicker } from '@ethio-datepicker/react';

// Styled
<EthioDatePicker
  value={iso} onChange={(v) => setIso(v?.iso ?? null)}
  locale="am" holidays={['public']} min="2026-09-25"
/>

// Headless
function MyPicker() {
  const { state, props, actions } = useEthioDatePicker({ locale: 'en' });
  return (
    <div {...props.grid()} className="grid grid-cols-7 gap-1">
      {state.grid.flat().map((cell) => (
        <button key={cell.iso} {...props.day(cell)}
                className="rounded-md data-[holiday]:text-red-600 aria-selected:bg-teal-700">
          {cell.date.day}
        </button>
      ))}
    </div>
  );
}
```

Works with React Hook Form via `Controller`, and with Formik via `value`/`onChange`.

---

## 6. Keyboard (WAI-ARIA APG date-picker dialog)

| Key | Action |
|---|---|
| `Enter` / `Space` / `Alt+↓` on trigger | Open, focus selected date (or today) |
| `←` `→` | Previous / next day |
| `↑` `↓` | Same weekday, previous / next week |
| `Home` / `End` | First / last day of the week |
| `PageUp` / `PageDown` | Previous / next month (day clamped, e.g. Nehase 30 → Pagume 5) |
| `Shift+PageUp` / `Shift+PageDown` | Previous / next year |
| `Enter` / `Space` on a day | Select (and close if `closeOnSelect`) |
| `Esc` | Close, return focus to trigger |
| `Tab` | Moves between header buttons, grid and footer (focus stays in the dialog) |

Screen-reader label for each day includes both calendars and any holiday: "ዓርብ፣ መስከረም 15 2019 · Friday 25 September 2026". A polite live region announces the month when it changes.

---

## 7. Edge cases the test suite must cover

- Round-trip `toISO(fromISO(x)) === x` for every day 1900-01-01 → 2100-12-31, and every result equals `Intl.DateTimeFormat('en-u-ca-ethiopic')`.
- Pagume 6 exists only when `year % 4 === 3` (e.g. 2019 EC → 11 Sep 2027; Enkutatash 2020 = 12 Sep 2027).
- `addMonths` / `addYears` clamping around Pagume.
- `min`/`max` that fall inside Pagume.
- `value` set to an invalid string → empty value + `validity.badInput`, no crash.
- Late-evening in Addis vs UTC: `today()` returns the Addis date.
- Genna / Timket / Meskel rule in years after a Pagume 6 (see §2.6 note).
- Fasika from Bahire Hasab for 2000–2050 EC matched against a published table.

---

## 8. Not in v0.1

Range selection (v0.2), time picker with Ethiopian hours (v0.3), Vue/Svelte wrappers, `om`/`ti` translations beyond month and weekday names, and Islamic holiday estimates (v0.2 with `tentative`).
