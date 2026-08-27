import { useEffect, useMemo, useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import HomeView from './components/HomeView.jsx'
import EventsView from './components/EventsView.jsx'
import HistoryView from './components/HistoryView.jsx'
import SettingsView from './components/SettingsView.jsx'
import EventForm from './components/EventForm.jsx'
import EventDetail from './components/EventDetail.jsx'
import Modal from './components/Modal.jsx'
import { KEYS, load, save } from './lib/storage.js'
import { PROFILE_ID, PROFILE_SIZE, getPhoto, removePhoto, storePhoto } from './lib/photos.js'
import { DEFAULT_KIND, KINDS, isUpcoming, matchesQuery, normalizeEvent } from './lib/events.js'
import { t } from './lib/i18n.js'

// Photos are kept in their own storage keys, so the events blob written on
// every edit stays small. In memory each record carries its own photo.
const withPhotos = (list) => list.map((e) => ({ ...e, photo: e.photo || getPhoto(e.id) }))
const withoutPhotos = (list) =>
  list.map((e) => {
    const copy = { ...e }
    delete copy.photo
    return copy
  })

// A history longer than this gets a search field; a short one does not need one.
const SEARCHABLE_FROM = 8

export default function App() {
  const [events, setEvents] = useState(() =>
    withPhotos(load(KEYS.concerts, []).map((e) => normalizeEvent(e))),
  )
  const [isDark, setIsDark] = useState(() => load(KEYS.theme, 'dark') !== 'light')
  const [section, setSection] = useState('events')
  const [kind, setKind] = useState(() => {
    const stored = load(KEYS.kind, DEFAULT_KIND)
    return KINDS.includes(stored) ? stored : DEFAULT_KIND
  })
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // event draft in the form sheet
  const [detail, setDetail] = useState(null) // event id open in the detail sheet
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(() => getPhoto(PROFILE_ID))
  const [toast, setToast] = useState('')

  useEffect(() => {
    save(KEYS.concerts, withoutPhotos(events))
  }, [events])

  useEffect(() => {
    save(KEYS.kind, kind)
  }, [kind])

  useEffect(() => {
    save(KEYS.theme, isDark ? 'dark' : 'light')
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    document.documentElement.style.backgroundColor = isDark ? '#000000' : '#f4f2f8'
  }, [isDark])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  // The date alone decides whether an event is upcoming or history, so it moves
  // itself the day after it happens. The category is an independent filter.
  const upcoming = useMemo(() => events.filter((e) => isUpcoming(e)), [events])
  const past = useMemo(() => events.filter((e) => !isUpcoming(e)), [events])
  const pastMatching = useMemo(() => past.filter((e) => matchesQuery(e, query)), [past, query])
  const upcomingOfKind = useMemo(() => upcoming.filter((e) => e.kind === kind), [upcoming, kind])
  const upcomingCounts = useMemo(() => {
    const counts = Object.fromEntries(KINDS.map((k) => [k, 0]))
    for (const event of upcoming) counts[event.kind] = (counts[event.kind] || 0) + 1
    return counts
  }, [upcoming])
  const openEvent = detail ? events.find((e) => e.id === detail) : null

  async function saveEvent(event) {
    const storedPhoto = await storePhoto(event.id, event.photo)
    const saved = storedPhoto ? event : { ...event, photo: '' }
    setEvents((list) => {
      const index = list.findIndex((e) => e.id === saved.id)
      if (index === -1) return [...list, saved]
      const next = [...list]
      next[index] = saved
      return next
    })
    setEditing(null)
    setDetail(saved.id)
    // Follow the user to wherever the event they just saved actually lives.
    if (section === 'events') setKind(saved.kind)
    if (!storedPhoto) setToast(t('photoNotSaved'))
  }

  async function saveProfilePhoto(photo) {
    const stored = await storePhoto(PROFILE_ID, photo, {
      width: PROFILE_SIZE,
      height: PROFILE_SIZE,
    })
    setProfilePhoto(stored ? photo : '')
    if (!stored) setToast(t('photoNotSaved'))
  }

  function deleteEvent(id) {
    removePhoto(id)
    setEvents((list) => list.filter((e) => e.id !== id))
    setDetail(null)
  }

  // Merge keeps existing records and adds the ones this device does not have.
  async function importEvents(imported, mode) {
    const incoming = imported.map((e) => normalizeEvent(e))
    const known = new Set(events.map((e) => e.id))
    const fresh = mode === 'replace' ? incoming : incoming.filter((e) => !known.has(e.id))

    for (const event of fresh) {
      if (event.photo) await storePhoto(event.id, event.photo)
    }
    if (mode === 'replace') {
      for (const event of events) {
        if (!incoming.some((e) => e.id === event.id)) removePhoto(event.id)
      }
      setEvents(fresh)
    } else {
      setEvents((list) => [...list, ...fresh])
    }
    return fresh.length
  }

  return (
    <div className="app">
      <main className="app__main">
        {section === 'home' && (
          <HomeView
            events={events}
            profilePhoto={profilePhoto}
            onSettings={() => setSettingsOpen(true)}
            onOpen={(e) => setDetail(e.id)}
          />
        )}
        {section === 'events' && (
          <EventsView
            events={upcomingOfKind}
            kind={kind}
            onKind={setKind}
            counts={upcomingCounts}
            profilePhoto={profilePhoto}
            onSettings={() => setSettingsOpen(true)}
            onOpen={(e) => setDetail(e.id)}
          />
        )}
        {section === 'history' && (
          <HistoryView
            events={pastMatching}
            allEvents={events}
            profilePhoto={profilePhoto}
            onSettings={() => setSettingsOpen(true)}
            onOpen={(e) => setDetail(e.id)}
            onImport={importEvents}
            onToast={setToast}
            query={query}
            onQuery={setQuery}
            searchable={past.length >= SEARCHABLE_FROM}
          />
        )}
      </main>

      {/* The mockup's bottom bar has no add button, so adding floats above it. */}
      <button type="button" className="fab" onClick={() => setEditing({})} aria-label={t('add')}>
        +
      </button>

      <BottomNav section={section} onSection={setSection} />

      {editing && (
        <EventForm
          event={editing.id ? editing : null}
          // Adding from the Events screen defaults to the category on show.
          defaultKind={section === 'events' ? kind : DEFAULT_KIND}
          events={events}
          onSave={saveEvent}
          onError={setToast}
          onClose={() => setEditing(null)}
        />
      )}

      {openEvent && !editing && (
        <EventDetail
          event={openEvent}
          onEdit={(e) => {
            setDetail(null)
            setEditing(e)
          }}
          onDelete={deleteEvent}
          onClose={() => setDetail(null)}
        />
      )}

      {settingsOpen && (
        <Modal title={t('tabSettings')} onClose={() => setSettingsOpen(false)} closeLabel={t('close')}>
          <SettingsView
            events={events}
            isDark={isDark}
            onTheme={() => setIsDark((v) => !v)}
            profilePhoto={profilePhoto}
            onProfilePhoto={saveProfilePhoto}
            onImport={importEvents}
            onToast={setToast}
          />
        </Modal>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
