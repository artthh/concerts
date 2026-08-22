// The concert record and every derived value the views need.
//
// A concert is a plain object so it survives JSON round-trips untouched:
//
//   {
//     id:         string        stable local id
//     artist:     string        headliner (required)
//     photo:      string        cropped artist photo as a data URL
//     openers:    string[]      support acts
//     tour:       string        tour or festival name
//     venue:      string
//     city:       string
//     country:    string
//     date:       'YYYY-MM-DD'  local calendar date (required)
//     time:       'HH:MM'       doors/start, optional
//     price:      number|null   what the ticket cost
//     currency:   string        ISO-ish currency code
//     seat:       string        section / row / seat or "GA"
//     company:    string[]      who you went with
//     rating:     number        0-5, only meaningful once it has happened
//     notes:      string
//     setlist:    string[]      one song per line
//     ticketUrl:  string
//     createdAt:  ISO string
//     updatedAt:  ISO string
//   }

export const CURRENCIES = ['MXN', 'USD', 'EUR', 'GBP', 'CAD', 'BRL', 'ARS', 'COP', 'CLP', 'JPY']

export function emptyConcert() {
  return {
    id: '',
    artist: '',
    photo: '',
    openers: [],
    tour: '',
    venue: '',
    city: '',
    country: '',
    date: todayISO(),
    time: '',
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

// Fills in anything a hand-edited or older backup is missing.
export function normalizeConcert(input) {
  const base = emptyConcert()
  const c = { ...base, ...(input || {}) }
  return {
    ...c,
    id: c.id || newId(),
    artist: String(c.artist || '').trim(),
    photo: String(c.photo || ''),
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

// A concert counts as upcoming through the end of its own day.
export function isUpcoming(concert, today = todayISO()) {
  return String(concert.date || '') >= today
}

export function daysUntil(concert, today = todayISO()) {
  const a = Date.parse(today + 'T00:00:00')
  const b = Date.parse(String(concert.date || '') + 'T00:00:00')
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.round((b - a) / 86400000)
}

export function sortByDate(concerts, direction = 'asc') {
  const sign = direction === 'asc' ? 1 : -1
  return [...concerts].sort((a, b) => {
    const byDate = String(a.date).localeCompare(String(b.date))
    if (byDate !== 0) return byDate * sign
    return String(a.time || '').localeCompare(String(b.time || '')) * sign
  })
}

export function place(concert) {
  return [concert.venue, concert.city, concert.country].filter(Boolean).join(' · ')
}

export function matchesQuery(concert, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    concert.artist,
    concert.tour,
    concert.venue,
    concert.city,
    concert.country,
    concert.seat,
    concert.notes,
    ...concert.openers,
    ...concert.company,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function buildStats(concerts, today = todayISO()) {
  const past = concerts.filter((c) => !isUpcoming(c, today))
  const upcoming = concerts.filter((c) => isUpcoming(c, today))

  const count = (list, pick) => {
    const map = new Map()
    for (const c of list) {
      for (const value of [].concat(pick(c)).filter(Boolean)) {
        map.set(value, (map.get(value) || 0) + 1)
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }

  const spendByCurrency = new Map()
  for (const c of concerts) {
    if (typeof c.price !== 'number' || Number.isNaN(c.price)) continue
    spendByCurrency.set(c.currency || '—', (spendByCurrency.get(c.currency || '—') || 0) + c.price)
  }

  const byYear = new Map()
  for (const c of past) {
    const year = String(c.date || '').slice(0, 4)
    if (year) byYear.set(year, (byYear.get(year) || 0) + 1)
  }

  const rated = past.filter((c) => c.rating > 0)

  return {
    total: concerts.length,
    pastCount: past.length,
    upcomingCount: upcoming.length,
    artists: count(concerts, (c) => c.artist),
    cities: count(concerts, (c) => c.city),
    venues: count(concerts, (c) => c.venue),
    company: count(concerts, (c) => c.company),
    spendByCurrency: [...spendByCurrency.entries()].sort((a, b) => b[1] - a[1]),
    byYear: [...byYear.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    averageRating: rated.length
      ? rated.reduce((sum, c) => sum + c.rating, 0) / rated.length
      : null,
    topRated: [...rated].sort((a, b) => b.rating - a.rating).slice(0, 5),
    next: sortByDate(upcoming, 'asc')[0] || null,
  }
}
