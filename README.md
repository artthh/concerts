# Encore — Concert Tracker

A phone-first web app to track the concerts you are going to and the ones you
already lived. Built to be added to the iOS/Android home screen and run
full-screen, like the `mi-gym` app.

- **Stack:** Vite + React 19, no backend, no CSS framework.
- **Storage:** `localStorage` on the device, with JSON backup export/import.
- **Photos:** picked from the phone, cropped and downscaled in the browser.
- **Languages:** Spanish (default) and English, toggled in the header.
- **Theme:** dark/light, following the system preference until you pick one.

## How the two sections work

**Home** stacks the upcoming shows in a pile, soonest at the front. Each card
shows the artist photo on one edge and the days left on the other, and the photo
side alternates down the pile — left, right, left — so consecutive cards mirror
each other. The side comes from the card's position, so it stays alternating
when a new show slots into the middle.

**History** shows the same cards for shows whose date has passed, grouped by
year, counting the days *since* instead of the days left.

Nothing has to be moved by hand: the date is the only thing that decides which
section a concert is in, so a show leaves Home on its own the day after it
happens. There is no status field to keep in sync.

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
    photos.js               crop/downscale + per-concert photo storage
    i18n.js                 ES/EN strings, date and money formatting
  components/
    Header.jsx              title, theme/language toggles, search
    TabBar.jsx              bottom navigation
    UpcomingView.jsx        the Home pile
    HistoryView.jsx         past shows grouped by year
    ShowCard.jsx            one card: photo on one edge, countdown on the other
    StatsView.jsx           totals, spend, per-year and top-N bars
    SettingsView.jsx        theme, language, backup export/import
    ConcertForm.jsx         add/edit sheet
    PhotoPicker.jsx         photo field with crop preview
    ConcertDetail.jsx       read-only sheet with setlist
    Modal.jsx               bottom-sheet shell
    Stars.jsx               rating display
```

## The concert record

One flat, JSON-safe object per concert, defined in `src/lib/concerts.js`:

| Field                      | Notes                                        |
| -------------------------- | -------------------------------------------- |
| `id`                       | local UUID                                   |
| `artist`                   | headliner, the only required field           |
| `photo`                    | cropped artist photo, stored as a data URL   |
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

## Photos and the storage budget

Adding a show takes three things: artist, photo and date. The picked file is
center-cropped to the card's aspect ratio and re-encoded as a 640x420 JPEG
before it is stored, which turns a multi-megabyte camera roll photo into about
65 KB.

Photos are kept under one `concerts.photo.<id>` key each rather than inside the
concerts blob, so editing a date rewrites a few hundred bytes instead of every
photo. `localStorage` gives roughly 5 MB, which is about 70-75 photos; past that
the app keeps the concert, drops the photo, and says so. If the history ever
needs to grow beyond that, `src/lib/photos.js` is the only file to change —
IndexedDB drops in behind the same four functions.
