# ethio-datepicker — The Idea

> A framework-agnostic, accessible, headless-first date picker for the 13-month Ethiopian calendar.
> `npm i ethio-datepicker` → works in React, Vue, Svelte, Angular, or plain HTML, styled with Tailwind or your own CSS.

*Status: idea / pre-v0 · Author: Abenet · Last updated: 25 Sep 2026 (Meskerem 15, 2019 EC)*

---

## 1. The problem

Every Ethiopian product that touches dates — bookings, payroll, school portals, government forms, clinics, dashboards — hits the same wall:

- Users think in **Ethiopian dates** (Meskerem 15, 2019), but databases, APIs and payment systems speak **Gregorian / ISO 8601**.
- The Ethiopian calendar has **13 months** (12 × 30 days + Pagume with 5 or 6 days), a **~7–8 year offset** that changes on Sep 11/12, and a New Year that moves in leap years. Standard pickers (MUI, react-day-picker, Flatpickr) assume 12 months and can't be bent into shape.
- Holidays mix **fixed** feasts, **movable** Orthodox feasts (Bahire Hasab), and **lunar** Islamic holidays whose dates depend on moon sighting.
- So teams re-implement the date math every time, often with subtle bugs (Pagume 6, Genna on Tahsas 28 vs 29, off-by-one at the year boundary).

## 2. What already exists (checked 25 Sep 2026)

| Package | What it is | Gap |
|---|---|---|
| `kenat` (v4, active) | Excellent **logic** library: conversion, Bahire Hasab, holidays, fasting, Geez numerals | No UI component |
| `abushakir` | Logic + computus | No UI; less active |
| `ethiopian-date`, `ethiopic-calendar`, `ethiopian-calendar-date-converter` | Converters only | No UI, no holidays |
| `react-ethiopian-calendar` (v2.1, active) | Styled **React-only** picker, range, Ethiopian time, am/en/om | React-only; pulls dayjs + react-icons + popper; theming limited to one primary colour; not headless |
| `habesha-datepicker` | MUI-based React picker | Locked to MUI v5 + emotion + date-fns |
| Browser `Intl` | `calendar: 'ethiopic'` formatting built in | Formatting only — no picker, no holidays |

**`ethio-datepicker` is available on npm.**

**Takeaway:** the logic layer is solved well enough; the **UI layer is fragmented and framework-locked**. Nobody ships a headless, accessible, framework-agnostic component. That's the gap.

## 3. The pitch — what makes this one different

1. **Works everywhere.** One Web Component (`<ethio-datepicker>`) + thin adapters. React 19 consumes custom elements natively; Vue/Svelte/Angular/HTMX do too.
2. **Headless-first.** A core state engine (`useEthioCalendar` / `createCalendar`) that returns the grid, keyboard handlers and ARIA props — bring your own markup, Tailwind classes or shadcn/ui styling. The styled component is built *on top of* the headless core, not the other way round.
3. **Accessible by default.** Follows the WAI-ARIA APG date-picker dialog + grid pattern: full keyboard navigation, screen-reader labels in Amharic and English, focus management, RTL-safe, 44px touch targets.
4. **Backend-friendly value contract.** Every change emits both:
   ```json
   { "iso": "2026-09-25", "ethiopian": { "year": 2019, "month": 1, "day": 15 }, "label": "መስከረም 15, 2019" }
   ```
   Store ISO, show Ethiopian. No more converting on the server.
5. **Real form element.** Form-associated custom element (`ElementInternals`) → works with `<form>`, `required`, `min`/`max`, native validation, React Hook Form, Formik.
6. **Holidays & fasts as data, not hard-code.** Built-in markers for public holidays, Orthodox fasts and Islamic holidays, each tagged (`public`, `orthodox`, `muslim`, `tentative`) and overridable — because Eid dates are announced, not calculated.
7. **Tiny.** Zero runtime deps in core; target **< 6 kB gz core**, **< 15 kB gz** styled component.

## 4. Who it's for

- **Primary:** Ethiopian frontend developers building local apps (fintech, travel, e-gov, education, health, HR).
- **Secondary:** International teams / NGOs shipping to Ethiopia who don't know the calendar at all.
- **End users:** anyone filling a form in Amharic, Afaan Oromoo, Tigrinya or English.

## 5. Scope

### v0.1 — MVP (the "it's useful" line)
- `@core`: EC ⇄ GC conversion (JDN-based), month-grid generation, leap-year/Pagume rules, min/max/disabled dates.
- `<ethio-datepicker>` single-date picker: popover + inline modes, keyboard nav, am/en labels, Geez or Arabic numerals toggle.
- Dual display: show Gregorian date as secondary text under each Ethiopian day (toggleable).
- Fixed public holidays marked on the grid.
- React wrapper with typed props/events.
- Docs site with live playground.

### v0.2 – v0.5
- Range picker (reservations, leave requests).
- Movable Orthodox feasts & fasts via Bahire Hasab (Fasika, Siklet, Abiy Tsom, Hudadi, Tsome Nebiyat, Filseta…).
- Islamic holidays with `tentative` flag + an override API (`holidays.override({ id: 'eid-al-fitr', date: … })`).
- Afaan Oromoo + Tigrinya locales.
- Tailwind preset + CSS custom properties + `::part()` theming; shadcn/ui recipe.
- Ethiopian time (ሰዓት) optional time picker.

### Later / stretch
- Vue + Svelte wrappers, Angular docs.
- Month/year picker, week view.
- Flutter / React Native port (reusing the core logic).
- Temporal API interop once widely available.

### Explicit non-goals (for now)
- Full scheduling/calendar app (events, drag-and-drop) — stay a *picker*.
- Server-side holiday feeds.

## 6. Proposed architecture

```
packages/
  core/        pure TS · conversion, grid, holidays data, Bahire Hasab   (0 deps)
  headless/    state machine + a11y props · framework-agnostic
  element/     <ethio-datepicker> Web Component (Lit or vanilla), form-associated
  react/       thin wrapper + useEthioCalendar() hook
  themes/      default CSS, Tailwind preset
apps/
  docs/        playground + API docs (Astro/Vite)
```

- **Monorepo:** pnpm workspaces + Changesets for versioning. Published as `ethio-datepicker` (styled, batteries included) with scoped sub-packages `@ethio-datepicker/core`, `/react`, etc.
- **Build own conversion core** (it's ~100 lines of JDN math) and **cross-validate every day from 1900–2100 against the browser's `Intl` ethiopic calendar** in CI. Consider interop with `kenat` rather than competing on logic.
- **Testing:** Vitest (logic, property-based round-trip tests), Playwright (keyboard + visual), axe-core (a11y) in CI.

## 7. The tricky bits to get right (our credibility)

- **Leap year:** EC year where `year % 4 === 3` has Pagume 6 (e.g. **2019 EC** → Pagume 6 = 11 Sep 2027, so Enkutatash 2020 falls on **12 Sep 2027**).
- **Genna** is Tahsas 29 most years but Tahsas 28 in others — must derive from the Gregorian 7 January, not hard-code.
- **Movable feasts:** Fasika 2019 EC = Miazia 24 (2 May 2027) — needs Bahire Hasab, not a lookup table.
- **Islamic holidays:** estimates only; must be labelled and overridable.
- **Timezones:** a date picker returns a *calendar date*, not a timestamp — never let `new Date()` UTC shifts move the day.
- **Ethiopian time** starts at 6:00 — keep it opt-in to avoid confusing form data.

## 8. Why it's worth doing

- Saves every Ethiopian frontend team days of fragile date math.
- A visible, well-documented, a11y-first component is a strong portfolio + community signal for Hatch Africa.
- Clear contribution surface for the community: locales, holiday data, framework adapters, docs translations.

## 9. How we'll know it's working

- 3 months after v0.1: 500+ weekly npm downloads, 200+ GitHub stars, ≥5 external contributors.
- 2+ production apps using it (showcase page).
- Lighthouse / axe: 0 a11y violations; bundle-size budget enforced in CI.

## 10. Open questions

1. **Lit vs vanilla custom element?** Lit adds ~5 kB but speeds development.
2. **Own core vs depend on `kenat`?** Own core = zero deps + control; `kenat` = less duplication + goodwill.
3. **Licence:** MIT (max adoption) vs Apache-2.0 (patent clause).
4. **Default display:** Ethiopian-only, or Ethiopian with Gregorian sub-labels?
5. **Holiday data governance:** who approves changes to official holiday lists?

## 11. Next steps

1. Lock the name, licence, and answers to the open questions.
2. Write the API sketch (props, events, value contract) — `docs/API.md`.
3. Scaffold the monorepo and the `core` package with conversion + Intl cross-validation tests.
4. Build a rough `<ethio-datepicker>` prototype and test it with 3–5 local developers.
