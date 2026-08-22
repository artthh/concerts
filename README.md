# Encore — Concert Tracker

A phone-first web app to track the concerts you are going to and the ones you
already lived. Built to be added to the iOS/Android home screen and run
full-screen, like the `mi-gym` app.

- **Stack:** Vite + React 19, no backend, no CSS framework.
- **Storage:** `localStorage` on the device, with JSON backup export/import.
- **Languages:** Spanish (default) and English, toggled in the header.
- **Theme:** dark/light, following the system preference until you pick one.

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run lint
npm run icons    # regenerate the PNG app icons from scripts/make-icons.mjs
```

## Deploying

The build output is a static `dist/` folder, so any static host works. For v0 /
Vercel, import this repo and keep the defaults:

| Setting          | Value           |
| ---------------- | --------------- |
| Framework preset | Vite            |
| Build command    | `npm run build` |
| Output directory | `dist`          |

## Add it to your phone's home screen

1. Open the deployed URL in Safari (iOS) or Chrome (Android).
2. iOS: **Share → Add to Home Screen**. Android: **menu → Add to Home screen**.
3. It launches full-screen with its own icon — `public/manifest.webmanifest` and
   the `apple-mobile-web-app-*` tags in `index.html` handle that.

Because the data lives in `localStorage`, it belongs to that one browser on that
one device. Use **Settings → Export backup** before switching phones or
browsers, and **Import** to bring it back.

## Project layout

```
index.html                  PWA meta tags + the pre-paint theme script
public/
  icon.svg                  source artwork for the icons
  manifest.webmanifest      home-screen install manifest
  apple-touch-icon.png      generated (npm run icons)
  icon-*.png                generated (npm run icons)
scripts/make-icons.mjs      dependency-free PNG icon generator
src/
  main.jsx                  React entry point
  App.jsx                   state, persistence, tab routing
  index.css                 design tokens + all component styles
  lib/
    storage.js              localStorage keys, backup envelope
    concerts.js             the concert record, date helpers, stats
    i18n.js                 ES/EN strings, date and money formatting
  components/
    Header.jsx              title, theme/language toggles, search
    TabBar.jsx              bottom navigation
    UpcomingView.jsx        next-up hero + upcoming list
    HistoryView.jsx         past concerts grouped by year
    StatsView.jsx           totals, spend, per-year and top-N bars
    SettingsView.jsx        theme, language, backup export/import
    ConcertForm.jsx         add/edit sheet
    ConcertDetail.jsx       read-only sheet with setlist
    ConcertList.jsx         shared list renderer
    ConcertCard.jsx         one row
    Modal.jsx               bottom-sheet shell
    Stars.jsx               rating display
```

## The concert record

One flat, JSON-safe object per concert, defined in `src/lib/concerts.js`:

| Field                      | Notes                                        |
| -------------------------- | -------------------------------------------- |
| `id`                       | local UUID                                   |
| `artist`                   | headliner, the only required field           |
| `openers`, `company`       | string arrays, edited as one-per-line text   |
| `tour`                     | tour or festival name                        |
| `venue`, `city`, `country` | where it happened                            |
| `date`, `time`             | `YYYY-MM-DD` and `HH:MM`                     |
| `price`, `currency`        | what the ticket cost                         |
| `seat`                     | section / row / seat, or "GA"                |
| `rating`                   | 0–5, meaningful once the show has happened   |
| `setlist`                  | string array, one song per entry             |
| `notes`, `ticketUrl`       | free text                                    |
| `createdAt`, `updatedAt`   | ISO timestamps                               |

A concert counts as **upcoming** through the end of its own day, then moves to
the history tab on its own — there is no status field to maintain.
