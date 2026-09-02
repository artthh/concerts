// The event record and every derived value the views need.
//
// One flat, JSON-safe shape covers all four kinds. A movie simply leaves the
// concert-only fields empty rather than having a record type of its own, which
// keeps sorting, storage, backups and the countdown logic identical everywhere:
//
//   {
//     id:         string        stable local id
//     kind:       'concert' | 'movie' | 'show' | 'plan'
//     title:      string        artist, film, show or plan name (required)
//     emoji:      string        shown after the title on the cards
//     photo:      string        cropped photo as a data URL
//     venue:      string        where it happens -- shown on every card
//     date:       'YYYY-MM-DD'  local calendar date (required)
//     time:       'HH:MM'       concerts only, optional
//
//     ...and, for concerts only: openers, tour, city, country, price,
//     currency, seat, company, rating, setlist, notes, ticketUrl
//
//     createdAt:  ISO string
//     updatedAt:  ISO string
//   }

export const KINDS = ['concert', 'movie', 'show', 'plan']
export const DEFAULT_KIND = 'concert'

// Only concerts carry the long tail of extras. Movies, shows and plans are
// name, photo, date and place, which is all they are worth typing.
export const KINDS_WITH_EXTRAS = new Set(['concert'])

export const CURRENCIES = ['MXN', 'USD', 'EUR', 'GBP', 'CAD', 'BRL', 'ARS', 'COP', 'CLP', 'JPY']

export function emptyEvent(kind = DEFAULT_KIND) {
  return {
    id: '',
    kind,
    title: '',
    emoji: '',
    photo: '',
    venue: '',
    date: todayISO(),
    time: '',
    openers: [],
    tour: '',
    city: '',
    country: '',
    price: null,
    currency: 'MXN',
    seat: '',
    company: [],
    rating: 0,
    notes: '',
    setlist: [],
    ticketUrl: '',
    createdAt: '',
    updatedAt: '',
  }
}

// Fills in anything a hand-edited or older backup is missing. Records written
// before categories existed have `artist` and no `kind`: they are concerts.
export function normalizeEvent(input) {
  const source = input || {}
  const base = emptyEvent(KINDS.includes(source.kind) ? source.kind : DEFAULT_KIND)
  const c = { ...base, ...source }
  return {
    ...c,
    id: c.id || newId(),
    kind: KINDS.includes(c.kind) ? c.kind : DEFAULT_KIND,
    title: String(c.title || c.artist || '').trim(),
    emoji: String(c.emoji || '').trim(),
    photo: String(c.photo || ''),
    venue: String(c.venue || '').trim(),
    openers: toList(c.openers),
    company: toList(c.company),
    setlist: toList(c.setlist),
    price: c.price === '' || c.price === null || c.price === undefined ? null : Number(c.price),
    rating: clamp(Number(c.rating) || 0, 0, 5),
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

function toList(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((v) => v.trim())
      .filter(Boolean)
  }
  return []
}

export function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

// An event counts as upcoming through the end of its own day.
export function isUpcoming(event, today = todayISO()) {
  return String(event.date || '') >= today
}

export function daysUntil(event, today = todayISO()) {
  const a = Date.parse(today + 'T00:00:00')
  const b = Date.parse(String(event.date || '') + 'T00:00:00')
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.round((b - a) / 86400000)
}

export function sortByDate(events, direction = 'asc') {
  const sign = direction === 'asc' ? 1 : -1
  return [...events].sort((a, b) => {
    const byDate = String(a.date).localeCompare(String(b.date))
    if (byDate !== 0) return byDate * sign
    return String(a.time || '').localeCompare(String(b.time || '')) * sign
  })
}

export function place(event) {
  return [event.venue, event.city, event.country].filter(Boolean).join(' · ')
}

export function matchesQuery(event, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    event.title,
    event.tour,
    event.venue,
    event.city,
    event.country,
    event.seat,
    event.notes,
    ...event.openers,
    ...event.company,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

// Venues you have already typed, so they can be picked instead of retyped.
// Ones used for this category come first -- a cinema is a useful suggestion for
// a movie and noise for a concert -- then by how often, then by how recently.
export function venueSuggestions(events, kind, limit = 6) {
  const seen = new Map()
  for (const event of events) {
    const venue = String(event.venue || '').trim()
    if (!venue) continue
    const entry = seen.get(venue) || { venue, count: 0, latest: '', sameKind: false }
    entry.count += 1
    if (String(event.date || '') > entry.latest) entry.latest = String(event.date || '')
    if (event.kind === kind) entry.sameKind = true
    seen.set(venue, entry)
  }
  return [...seen.values()]
    .sort(
      (a, b) =>
        Number(b.sameKind) - Number(a.sameKind) ||
        b.count - a.count ||
        b.latest.localeCompare(a.latest) ||
        a.venue.localeCompare(b.venue),
    )
    .slice(0, limit)
    .map((entry) => entry.venue)
}

export function buildStats(events, today = todayISO()) {
  const past = events.filter((e) => !isUpcoming(e, today))
  const upcoming = events.filter((e) => isUpcoming(e, today))

  const count = (list, pick) => {
    const map = new Map()
    for (const e of list) {
      for (const value of [].concat(pick(e)).filter(Boolean)) {
        map.set(value, (map.get(value) || 0) + 1)
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }

  const spendByCurrency = new Map()
  for (const e of events) {
    if (typeof e.price !== 'number' || Number.isNaN(e.price)) continue
    spendByCurrency.set(e.currency || '—', (spendByCurrency.get(e.currency || '—') || 0) + e.price)
  }

  const byYear = new Map()
  for (const e of past) {
    const year = String(e.date || '').slice(0, 4)
    if (year) byYear.set(year, (byYear.get(year) || 0) + 1)
  }

  const byKind = new Map(KINDS.map((kind) => [kind, 0]))
  for (const e of events) byKind.set(e.kind, (byKind.get(e.kind) || 0) + 1)

  const rated = past.filter((e) => e.rating > 0)

  return {
    total: events.length,
    pastCount: past.length,
    upcomingCount: upcoming.length,
    byKind: [...byKind.entries()],
    titles: count(events, (e) => e.title),
    cities: count(events, (e) => e.city),
    venues: count(events, (e) => e.venue),
    company: count(events, (e) => e.company),
    spendByCurrency: [...spendByCurrency.entries()].sort((a, b) => b[1] - a[1]),
    byYear: [...byYear.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    averageRating: rated.length ? rated.reduce((sum, e) => sum + e.rating, 0) / rated.length : null,
    topRated: [...rated].sort((a, b) => b.rating - a.rating).slice(0, 5),
    next: sortByDate(upcoming, 'asc')[0] || null,
  }
}
