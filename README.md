# ethio-datepicker

An accessible, framework-agnostic date picker for the 13-month Ethiopian calendar.

> 🚧 Early development. The core date library (`@ethio-datepicker/core`) is being built first; the `<ethio-datepicker>` component comes next.

- **Idea & scope:** [docs/IDEA.md](docs/IDEA.md)
- **API design:** [docs/API.md](docs/API.md)

## Packages

| Package | Status |
|---|---|
| [`@ethio-datepicker/core`](packages/core) | In progress: conversion, leap years, arithmetic, formatting, month grid |
| `@ethio-datepicker/headless` | Planned |
| `@ethio-datepicker/element` | Planned |
| `@ethio-datepicker/react` | Planned |

## Development

```bash
npm install
npm test        # runs the full 1900–2100 cross-check against the browser/Node Intl ethiopic calendar
npm run build
```

## Licence

MIT
