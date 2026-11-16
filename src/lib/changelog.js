// A short, human-curated record of what shipped and when -- not a dump of
// every commit, just what someone using the app would actually notice.
// Newest first. Add a new entry at the top the next time something ships.
export const CHANGELOG = [
  {
    version: 11,
    date: '2026-11-16',
    title: 'Release history, and photos in shared links',
    items: [
      "Added a release history to Settings -- a running summary of what's shipped",
      'Shared event links now carry the photo too, shrunk down to keep the link a reasonable size',
    ],
  },
  {
    version: 10,
    date: '2026-11-16',
    title: 'Smoother event form',
    items: [
      "Venue suggestions now match the event's own category instead of mixing in venues from the others",
      'Picking a venue is a dropdown now instead of a row of chips that kept growing',
      'Save and Cancel (and Share/Delete/Edit) stay visible at the bottom of the screen while scrolling',
    ],
  },
  {
    version: 9,
    date: '2026-11-16',
    title: 'More room for photos',
    items: ['Photos moved from localStorage to IndexedDB, lifting the old ~60-65 photo ceiling'],
  },
  {
    version: 8,
    date: '2026-11-16',
    title: 'Share an event',
    items: [
      'Share any event as a link -- opening it offers to add an independent copy to your own list',
    ],
  },
  {
    version: 7,
    date: '2026-11-16',
    title: 'A "payday" repeat',
    items: [
      'Events can repeat on the 15th and the last day of the month, pulled back to the Friday before whenever one lands on a weekend',
    ],
  },
  {
    version: 6,
    date: '2026-10-25',
    title: 'iPhone Duo and better photos',
    items: [
      'Layout adapts to the iPhone Duo and other wide screens, with a side rail instead of the bottom bar',
      'Added an interactive crop step when choosing a photo',
      'Event detail redesigned as a shareable, poster-style card',
    ],
  },
  {
    version: 5,
    date: '2026-09-24',
    title: "History gets its own tabs",
    items: ['Home tiles now show their date', 'History split into Records, Numbers and Backup tabs'],
  },
  {
    version: 4,
    date: '2026-09-05',
    title: 'Anniversaries and repeating events',
    items: [
      'Added an Anniversary category, with a badge for which birthday or anniversary this one is',
      'Events can repeat: yearly, monthly, or every 2 weeks',
      'History gets a category filter, and Numbers was redesigned around per-category highlights',
    ],
  },
  {
    version: 3,
    date: '2026-09-02',
    title: 'Plans, and a new name',
    items: [
      'Added a Plans category for anything else worth counting down to',
      'Renamed the app from Encore to Countdown',
    ],
  },
  {
    version: 2,
    date: '2026-08-27',
    title: 'Movies, shows, and a cleaner Home',
    items: [
      'Added Movie and Show categories alongside Concerts',
      'Home now leads with what is coming up next, across every category',
      'Moved navigation to a floating bottom bar',
      'Venues can be reused instead of retyped',
    ],
  },
  {
    version: 1,
    date: '2026-08-22',
    title: 'First version',
    items: [
      'Home as a pile of upcoming shows, with photos and countdowns',
      'Diagonal photo cards, pill-shaped navigation',
      'Export a backup from History',
    ],
  },
]
