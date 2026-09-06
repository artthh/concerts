// Every user-facing string, in one place. The app is English-only, but the
// strings stay behind t() rather than inline in the JSX so adding a language
// later is a table and a switch, not a hunt through every component.
const STRINGS = {
  appName: 'Countdown',
  navHome: 'Home',
  navEvents: 'Events',
  navHistory: 'History',
  tabStats: 'Stats',
  tabSettings: 'Settings',

  add: 'Add event',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  confirmDelete: 'Delete this event?',
  close: 'Close',
  search: 'Search title, city, venue…',
  noResults: 'Nothing matches your search.',

  emptyUpcoming: 'Nothing on the calendar. Add the next one.',
  emptyHome: 'Nothing on the calendar. Add one from Events.',
  numbers: 'Numbers',
  emptyHistory: 'No events in your history yet.',
  emptyStats: 'Add events to see your numbers.',

  today: 'Today',
  tomorrow: 'Tomorrow',
  yesterday: 'Yesterday',
  inDays: 'In {n} days',
  daysAgo: '{n} days ago',
  daysLeft: 'days left',
  daysSince: 'days since',
  nextUp: 'Next up',
  thenComes: 'Then comes',
  countdown: 'Countdown',

  profile: 'Profile',
  category: 'Category',
  byCategory: 'By category',
  kind_concert: 'Concert',
  kind_movie: 'Movie',
  kind_show: 'Show',
  kind_plan: 'Plan',
  kind_anniversary: 'Anniversary',
  kindPlural_concert: 'Concerts',
  kindPlural_movie: 'Movies',
  kindPlural_show: 'Shows',
  kindPlural_plan: 'Plans',
  kindPlural_anniversary: 'Anniversaries',
  kindIcon_concert: '🎤',
  kindIcon_movie: '🎬',
  kindIcon_show: '🎭',
  kindIcon_plan: '🗓️',
  kindIcon_anniversary: '🎂',
  titleLabel_concert: 'Artist',
  titleLabel_movie: 'Movie',
  titleLabel_show: 'Show',
  titleLabel_plan: 'Plan',
  titleLabel_anniversary: 'Who or what',
  titleRequired_concert: 'Artist is required',
  titleRequired_movie: 'The movie name is required',
  titleRequired_show: 'The show name is required',
  titleRequired_plan: 'The plan needs a name',
  titleRequired_anniversary: 'This needs a name',
  venueLabel_concert: 'Venue',
  venueLabel_movie: 'Cinema',
  venueLabel_show: 'Place',
  venueLabel_plan: 'Where',
  venueLabel_anniversary: 'Where',
  photoLabel_concert: 'Artist photo',
  photoLabel_movie: 'Poster',
  photoLabel_show: 'Photo',
  photoLabel_plan: 'Photo',
  photoLabel_anniversary: 'Photo',
  emptyKind_concert: 'No concerts on the calendar. Add the next one.',
  emptyKind_movie: 'No movies on the calendar. Add the next one.',
  emptyKind_show: 'No shows on the calendar. Add the next one.',
  emptyKind_plan: 'Nothing planned. Add the next one.',
  emptyKind_anniversary: 'No birthdays or anniversaries yet. Add the first one.',

  repeat: 'Repeats',
  repeat_none: 'Once',
  repeat_yearly: 'Every year',
  repeat_monthly: 'Every month',
  repeat_biweekly: 'Every 2 weeks',
  repeatHint: 'A repeating event never leaves the countdown — it just rolls to the next one.',
  originDateLabel: 'First date',
  originDateHint_anniversary: 'The birth or the first year. The number is counted from here.',
  originDateHint: 'The first time it happens. The countdown rolls forward from here.',
  occurrenceLabel: 'This one is the',
  nthYear: 'Number {n}',
  filterAll: 'All',

  emoji: 'Emoji',
  emojiHint: 'Shown next to the name on the cards.',
  venueReuseHint: 'Tap one you have used before.',
  photo: 'Photo',
  photoHint: 'Cropped automatically for the cards.',
  addPhoto: 'Choose photo',
  changePhoto: 'Change photo',
  removePhoto: 'Remove',
  photoFailed: 'We could not read that image',
  photoNotSaved: 'Event saved, but there was no room for the photo',
  moreDetails: 'More details',
  hideDetails: 'Hide details',

  openers: 'Opening acts',
  tour: 'Tour or festival',
  city: 'City',
  country: 'Country',
  date: 'Date',
  time: 'Time',
  price: 'Price',
  currency: 'Currency',
  seat: 'Seat / section',
  company: 'Went with',
  rating: 'Rating',
  notes: 'Notes',
  setlist: 'Setlist',
  ticketUrl: 'Ticket link',
  listHint: 'One per line or comma separated',
  setlistHint: 'One song per line',

  total: 'Events',
  pastCount: 'Attended',
  upcomingCount: 'Upcoming',
  perYear: 'Per year',
  averageRating: 'Average rating',

  glimpseAttended: '{n} attended',
  glimpseUpcoming: '{n} upcoming',
  glimpseTracked: '{n} tracked',
  topVenue: 'Most visited',
  mostSeen: 'Most seen',
  spend: 'Ticket spend',
  repeatingBreakdown: '{repeating} repeating · {oneOff} one-off',
  longestRunning: 'Longest running',
  longestRunningValue: '{title} — {nth}',

  theme: 'Theme',
  dark: 'Dark',
  light: 'Light',
  data: 'Data',
  exportFile: 'Export',
  importFile: 'Import',
  backupNote: 'Save a file with every event, or bring one in to add to what you already have.',
  exportBackup: 'Export backup',
  importBackup: 'Import backup',
  importReplace: 'Replace everything',
  importMerge: 'Merge',
  importDone: 'Imported {n} events',
  importFailed: 'We could not read that file',
  storageNote: 'Everything is stored on this device. Export a backup before switching phones.',
  installTitle: 'Add to home screen',
  installBody: 'Safari: Share → Add to Home Screen. Chrome: menu → Add to Home screen.',
}

export function t(key, vars) {
  let value = STRINGS[key] ?? key
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll('{' + name + '}', String(replacement))
    }
  }
  return value
}

export function formatDate(dateISO) {
  const parsed = Date.parse(String(dateISO) + 'T00:00:00')
  if (Number.isNaN(parsed)) return String(dateISO || '')
  return new Date(parsed).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// 1st, 2nd, 3rd, 4th... 11th, 12th, 13th, 21st. Used for card dates and for
// which birthday or anniversary this one is. The suffix is separate because
// the badges set it smaller than the number it hangs off.
export function ordinalSuffix(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th'
  return ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10]
}

export function ordinal(n) {
  return String(n) + ordinalSuffix(n)
}

// The card format: "September 9th | 2026".
export function formatEventDate(dateISO) {
  const parsed = Date.parse(String(dateISO) + 'T00:00:00')
  if (Number.isNaN(parsed)) return String(dateISO || '')
  const date = new Date(parsed)
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  return `${month} ${ordinal(date.getDate())} | ${date.getFullYear()}`
}

export function formatMoney(amount, currency) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return ''
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${amount} ${currency || ''}`.trim()
  }
}

// "In 3 days" / "3 days ago" / "Today", from a day delta.
export function relativeDays(delta) {
  if (delta === null) return ''
  if (delta === 0) return t('today')
  if (delta === 1) return t('tomorrow')
  if (delta > 1) return t('inDays', { n: delta })
  return t('daysAgo', { n: Math.abs(delta) })
}
