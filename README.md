# Countdown — Event Tracker

A phone-first web app for how long until the things ahead, and how long since
the ones behind — concerts, movies, shows, personal plans and the birthdays
that come round every year. Built to be added to the iOS/Android home screen
and run full-screen, like the `mi-gym` app.

- **Stack:** Vite + React 19, no backend, no CSS framework.
- **Storage:** `localStorage` on the device, with JSON backup export/import.
- **Photos:** picked from the phone, cropped and downscaled in the browser —
  event photos landscape, the profile photo square.
- **Language:** English only.
- **Theme:** dark by default (the design is dark-first); light is available in
  settings.

## Categories

Every event is a **concert**, a **movie**, a **show**, a **plan** or an
**anniversary**. A plan is anything personal with a date on it: a friend
visiting, a trip, a deadline. An anniversary is a birthday or a yearly
celebration, where the point is *which* one it is. The category is only a
filter and a set of form fields; one record shape covers all five, so sorting,
storage, backups and the countdown behave identically everywhere.

Concerts carry the long tail of optional fields (tour, city, price, seat,
openers, company, rating, setlist, notes, ticket link). The rest are just name,
emoji, photo, date and place, which is all they are worth typing.

## Things that repeat

`date` on a repeating event is the **original** date — the birth, the first
year, the first payday — and the date it counts to is derived from it. That is
what lets an anniversary know it is the 30th, and it means the record never has
to be edited as the years go by.

Anniversaries are always yearly; there is no picker for them. Plans get one:
once, every year, every month or every two weeks — so **payday is a repeating
plan**, not a category of its own. Anything that recurs on a schedule but is
not about a count of years belongs there.

A repeating event is always upcoming: the day after it happens it rolls to the
next occurrence rather than dropping into History. Feb 29 lands on Feb 28 in a
common year, and a monthly event on the 31st lands on the last day of a short
month.

For anniversaries the ordinal — 30th, 7th — rides the top corner of the Home
tile and the hero, and the corner opposite the photo on the list cards. It is
absent until the original date has passed: the birth itself is not a
birthday.

The venue field suggests places already used, as tappable chips and as a
`datalist` for typing. Venues used for the category being added rank first — a
cinema is a useful suggestion for a movie and noise for a concert — then by how
often, then by how recently.

## The three sections

Each screen's header is its title on the left with settings and the profile
photo on the right. Navigation is a floating translucent bar centred at the
bottom, with the content scrolling visibly underneath it. Adding belongs to
Events: `+` floats above the bar there and nowhere else.

The `localStorage` keys still use the original `concerts.` prefix. Renaming
them would orphan everyone's existing data for no benefit, so the prefix is
deliberately left alone.

### Wide screens and iPhone Duo

The web has no way to tell the Duo's outer display from its inner one —
466×678 and 669×951 are almost the same shape — so, as with Journey, the
layout switches on viewport width alone (`src/lib/useNavMode.js`), live via
`matchMedia` so unfolding or entering split view updates immediately rather
than on the next reload:

- **Below 440px** (a phone, or a split-view pane): the bottom bar, unchanged.
- **440px and up** (the outer display, in either orientation): the bar
  becomes a narrow icon-only rail down the left edge. Settings and the
  profile photo move to its foot, since `PageHeader` stops rendering them —
  the rail already carries both, and rendering them twice is what this bit
  the gym app's own version of this feature.
- **860px and up** (the inner display in landscape, and any wider window):
  the rail widens and its tabs gain labels.

Below 440 this is invisible. Above it, `.app`'s own `max-width` grows by more
than just the rail's width — a Duo panel is real extra space, worth spending
on more of Home's tile grid rather than a wider gutter either side of the
same phone-width column. The two targets land the outer display's landscape
pose and the widest plain "rail" width close to edge-to-edge, and the inner
display's landscape pose with only a sliver of margin, while still capping
gracefully for an arbitrary desktop window. A `max-height: 520px` query also
trims the Home hero and section spacing, since the outer display is only
~466pt tall in landscape and a hero sized for a 390-wide phone would eat a
third of it.

**Events** is the main list: upcoming events, soonest first. The page title
*is* the category switcher — tapping "Concerts" opens Concerts / Movies /
Shows / Plans with a count each. Each card carries the photo on one edge — clipped to a
diagonal and feathered so it bleeds into the card — with the name, venue, date
and days left on the other. The photo side alternates down the list, left /
right / left, and because the side comes from the card's position it
re-alternates when an event slots into the middle.

Tapping any card opens its detail sheet, which leads with a poster-style hero
of its own — the same square photo (or the category's emoji on a gradient, if
there is no photo), uncropped since it is already the shape the hero needs,
with a scrim and the title/venue/date/countdown overlaid on it, and the close
button floating over the corner instead of a header bar above it. It is built
to be the thing a screenshot of this screen actually looks like: not a flat,
wide-and-short rectangle followed by a plain list. The full detail list —
every field, the setlist, edit and delete — is still there, just below it.

**History** carries three things that used to all compete for the same
screen, so it splits into tabs: **Records**, **Numbers** and **Backup**.

**Records** is the same card as Events, but smaller — between the full size
there and the minimal Home tile, so more of the list fits without opening
anything — for events whose date has passed, grouped by year and counting the
days *since*. It filters by category on its own axis, independent of Events —
a row of chips with a count each, showing only the categories that actually
have past events, so anniversaries never appear there. The row is there from
the first past event, even when only one category has any: that is how you
find out it exists before it fills up. A search field appears once there are
eight or more.

**Numbers**, computed over every event, not just the past ones: an overall
total/attended/upcoming and the per-year timeline, then a glimpse card per
category in use. What shows up in each card depends on what that category's
own fields make meaningful, rather than averaging things that were never
comparable — a top city means nothing for a birthday, and "turning 30" means
nothing for a concert. A concert's card can carry its most-visited venue,
most-seen artist, average rating and ticket spend; a plan's carries its
repeating/one-off split and what's next; an anniversary's carries how many
are being tracked and which one has been going on the longest.

**Backup** is **Export** and **Import**: this is the screen you open after
reinstalling, so a restore belongs where the records are.

**Home** is the landing screen and stays deliberately bare: the very next event
as a hero, the ones after it as a grid of small tiles, and nothing else. Every
category mixes here, ordered purely by date — Home answers "what is next", not
"what kind". The tiles are tight on purpose: at that size they carry the
countdown and the title, plus the date itself as a small badge in the corner
opposite the birthday number, since the point is seeing a lot of the calendar
at once without having to open anything. Three across on a phone; the grid is
`auto-fill`, so a wider column (see Duo, below) fits more tiles at roughly the
same size instead of stretching three into oversized ones. The hero itself
stays capped at a sensible width rather than growing with it — more columns
of tiles is the point, not one very wide, flat banner.

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

`public/icon.svg` and the PNGs are the ⏳ emoji on a dark gradient. An emoji
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
  icon.svg                  source artwork: the hourglass emoji on a dark gradient
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
    useNavMode.js           bar / rail / rail-wide, by viewport width
  components/
    PageHeader.jsx          title, settings and profile photo on one line
    BottomNav.jsx           floating translucent section bar
    SideRail.jsx            the bar's replacement on wide screens / Duo
    Icons.jsx               inline line icons
    HomeView.jsx            hero for the next event, then the tile grid
    EventsView.jsx          upcoming events + the category switcher
    HistoryView.jsx         Records / Numbers / Backup tabs
    EventCard.jsx           one card: photo on one edge, countdown on the other
    StatsView.jsx           totals, per-year timeline, per-category glimpses
    SettingsView.jsx        profile photo, theme, backup
    BackupPanel.jsx         export/import, shared by History and Settings
    EventForm.jsx           add/edit sheet, fields depend on the category
    PhotoPicker.jsx         photo field, opens PhotoCropper on pick
    PhotoCropper.jsx        drag/pinch/zoom crop step before a photo saves
    EventDetail.jsx         read-only sheet, poster hero up top
    Modal.jsx               bottom-sheet shell
    Stars.jsx               rating display
```

## The event record

One flat, JSON-safe object per event, defined in `src/lib/events.js`:

| Field                      | Notes                                          |
| -------------------------- | ---------------------------------------------- |
| `id`                       | local UUID                                     |
| `kind`                     | `concert` \| `movie` \| `show` \| `plan` \| `anniversary` |
| `title`                    | artist, film, show, plan or person — the only one required |
| `repeat`                   | `none` \| `yearly` \| `monthly` \| `biweekly`   |
| `emoji`                    | shown after the title on the cards             |
| `photo`                    | cropped photo, stored as a data URL            |
| `venue`                    | where it happens, shown on every card          |
| `date`, `time`             | `YYYY-MM-DD`; the original date when it repeats. `time` is concerts only |
| `createdAt`, `updatedAt`   | ISO timestamps                                 |

Concerts additionally use `openers`, `tour`, `city`, `country`, `price`,
`currency`, `seat`, `company`, `rating`, `setlist`, `notes` and `ticketUrl`.

An event counts as **upcoming** through the end of its own day, then moves to
History on its own — there is no status field to maintain. A repeating one
never moves: it rolls to its next occurrence instead.

Records written before categories existed have `artist` and no `kind`;
`normalizeEvent` reads them as concerts, and records written before repeats
existed get `repeat: 'none'`, so old data and old backups keep loading
unchanged.

## Photos and the storage budget

Adding a show takes three things: artist, photo and date, plus an optional
emoji. Everything else is folded behind "more details". Picking a file opens
an interactive crop step (`PhotoCropper.jsx`) before anything is saved: drag
to recentre, pinch, scroll, or use the slider to zoom, with the frame itself
as the preview -- what it shows is exactly the square that gets encoded as a
640x640 JPEG and stored, which turns a multi-megabyte camera roll photo into
about 80 KB.

Square, not the shape of any one card: a photo shows up at several different
aspect ratios across the app -- the diagonal card strip, a square tile, the
Home hero, the event detail screen's own share card -- each cropping further
via `object-fit: cover`. A square start keeps every one of those a moderate
crop instead of the tile being exact and the others severe, and it is the
crop a person actually chose rather than an automatic centre-crop guessing
for them.

Photos are kept under one `concerts.photo.<id>` key each rather than inside the
concerts blob, so editing a date rewrites a few hundred bytes instead of every
photo. `localStorage` gives roughly 5 MB, which is about 60-65 photos; past that
the app keeps the concert, drops the photo, and says so. If the history ever
needs to grow beyond that, `src/lib/photos.js` is the only file to change —
IndexedDB drops in behind the same four functions.
