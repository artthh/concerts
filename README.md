# Encore — Event Tracker

A phone-first web app to track the events you are going to and the ones you
already lived — concerts, movies and shows. Built to be added to the
iOS/Android home screen and run full-screen, like the `mi-gym` app.

- **Stack:** Vite + React 19, no backend, no CSS framework.
- **Storage:** `localStorage` on the device, with JSON backup export/import.
- **Photos:** picked from the phone, cropped and downscaled in the browser.
- **Language:** English only.
- **Theme:** dark by default (the design is dark-first); light is available in
  settings.

## Categories

Every event is a **concert**, a **movie** or a **show**. The category is only a
filter and a set of form fields — one record shape covers all three, so
sorting, storage, backups and the countdown behave identically everywhere.

Concerts carry the long tail of optional fields (tour, city, price, seat,
openers, company, rating, setlist, notes, ticket link). Movies and shows are
just name, emoji, photo, date and venue, which is all they are worth typing.

The venue field suggests places already used, as tappable chips and as a
`datalist` for typing. Venues used for the category being added rank first — a
cinema is a useful suggestion for a movie and noise for a concert — then by how
often, then by how recently.

## The three sections

Navigation is the pill row at the top; `+` adds an event and the 🎤 opens
settings.

**Events** is the main list: upcoming events, soonest first. The page title
*is* the category switcher — tapping "Concerts" opens Concerts / Movies /
Shows with a count each. Each card carries the photo on one edge — clipped to a
diagonal and feathered so it bleeds into the card — with the name, venue, date
and days left on the other. The photo side alternates down the list, left /
right / left, and because the side comes from the card's position it
re-alternates when an event slots into the middle.

**History** is the same card for events whose date has passed, grouped by year
and counting the days *since*, across every category. It also carries
**Export** and **Import** at the top: this is the screen you open after
reinstalling, so a restore belongs where the records are. A search field
appears once there are eight or more.

**Home** is the overview: the very next event as a full-width hero, the ones
after it as a grid of small tiles three across, then the running numbers. All
three categories mix here, ordered purely by date — Home answers "what is
next", not "what kind". The tiles are deliberately tight: at that size they
carry the countdown and the title only, since the point is seeing a lot of the
calendar at once rather than every detail.

Nothing is moved by hand — the date is the only thing that decides which
section an event is in, so it leaves Events on its own the day after it
happens. There is no status field to keep in sync.

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run lint
npm run icons    # regenerate the PNG app icons (needs a local Chrome/Chromium)
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
one device — clearing site data or moving phones loses it. Use **Export** at the
top of History (or Settings → Export backup) to save a JSON file with every
event, photos included, and **Import** to bring one back. Import merges by
record id, so re-importing the same file adds nothing and importing a second
device's file combines the two. Settings also has a **Replace everything** for
when you want the file to win outright.

## Regenerating the icons

`public/icon.svg` and the PNGs are the 🎤 emoji on a dark gradient. An emoji
needs a real font renderer, so `npm run icons` has a headless Chrome draw the
glyph; the cropping and downscaling that follow are done with node's `zlib`, so
the script still takes no npm dependency. It does need a Chrome or Chromium on
the machine — set `CHROME_PATH` if yours is somewhere unusual.

Three Chrome behaviours make that less direct than it sounds, and the script
documents and asserts each one, because getting them wrong is what shipped a
broken icon once: only the *viewport* area of a screenshot is painted and the
viewport is shorter than the window, `--window-size` is silently clamped to a
500px minimum width, and `--force-device-scale-factor` will not go below 0.5.
So every icon is rendered at 512, cropped square, then box-filtered down.

## Project layout

```
index.html                  PWA meta tags + the pre-paint theme script
public/
  icon.svg                  source artwork: the mic emoji on a dark gradient
  manifest.webmanifest      home-screen install manifest
  apple-touch-icon.png      generated (npm run icons)
  icon-*.png                generated (npm run icons)
scripts/make-icons.mjs      PNG icon generator (headless Chrome, no npm deps)
src/
  main.jsx                  React entry point
  App.jsx                   state, persistence, section routing
  index.css                 design tokens + all component styles
  lib/
    storage.js              localStorage keys, backup envelope
    events.js               the event record, categories, date helpers, stats
    photos.js               crop/downscale + per-event photo storage
    i18n.js                 every UI string, date and money formatting
  components/
    TopNav.jsx              mic, section pills, add button
    HomeView.jsx            hero for the next event, grid, then the numbers
    EventsView.jsx          upcoming events + the category switcher
    HistoryView.jsx         past events grouped by year
    EventCard.jsx           one card: photo on one edge, countdown on the other
    StatsView.jsx           totals, spend, per-year and top-N bars
    SettingsView.jsx        theme, language, backup
    BackupPanel.jsx         export/import, shared by History and Settings
    EventForm.jsx           add/edit sheet, fields depend on the category
    PhotoPicker.jsx         photo field with crop preview
    EventDetail.jsx         read-only sheet
    Modal.jsx               bottom-sheet shell
    Stars.jsx               rating display
```

## The event record

One flat, JSON-safe object per event, defined in `src/lib/events.js`:

| Field                      | Notes                                          |
| -------------------------- | ---------------------------------------------- |
| `id`                       | local UUID                                     |
| `kind`                     | `concert` \| `movie` \| `show`                  |
| `title`                    | artist, film or show name — the only required   |
| `emoji`                    | shown after the title on the cards             |
| `photo`                    | cropped photo, stored as a data URL            |
| `venue`                    | where it happens, shown on every card          |
| `date`, `time`             | `YYYY-MM-DD`; `time` is concerts only          |
| `createdAt`, `updatedAt`   | ISO timestamps                                 |

Concerts additionally use `openers`, `tour`, `city`, `country`, `price`,
`currency`, `seat`, `company`, `rating`, `setlist`, `notes` and `ticketUrl`.

An event counts as **upcoming** through the end of its own day, then moves to
History on its own — there is no status field to maintain.

Records written before categories existed have `artist` and no `kind`;
`normalizeEvent` reads them as concerts, so old data and old backups keep
loading unchanged.

## Photos and the storage budget

Adding a show takes three things: artist, photo and date, plus an optional
emoji. Everything else is folded behind "more details". The picked file is
center-cropped to the card's aspect ratio and re-encoded as a 640x420 JPEG
before it is stored, which turns a multi-megabyte camera roll photo into about
65 KB.

Photos are kept under one `concerts.photo.<id>` key each rather than inside the
concerts blob, so editing a date rewrites a few hundred bytes instead of every
photo. `localStorage` gives roughly 5 MB, which is about 70-75 photos; past that
the app keeps the concert, drops the photo, and says so. If the history ever
needs to grow beyond that, `src/lib/photos.js` is the only file to change —
IndexedDB drops in behind the same four functions.
