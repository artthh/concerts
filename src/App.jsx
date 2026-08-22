import { useEffect, useMemo, useState } from 'react'
import TopNav from './components/TopNav.jsx'
import HomeView from './components/HomeView.jsx'
import EventsView from './components/EventsView.jsx'
import HistoryView from './components/HistoryView.jsx'
import SettingsView from './components/SettingsView.jsx'
import ConcertForm from './components/ConcertForm.jsx'
import ConcertDetail from './components/ConcertDetail.jsx'
import Modal from './components/Modal.jsx'
import { KEYS, load, save } from './lib/storage.js'
import { getPhoto, removePhoto, storePhoto } from './lib/photos.js'
import { isUpcoming, matchesQuery, normalizeConcert } from './lib/concerts.js'
import { translator } from './lib/i18n.js'

// Photos are kept in their own storage keys, so the concerts blob written on
// every edit stays small. In memory each record carries its own photo.
const withPhotos = (list) => list.map((c) => ({ ...c, photo: c.photo || getPhoto(c.id) }))
const withoutPhotos = (list) =>
  list.map((c) => {
    const copy = { ...c }
    delete copy.photo
    return copy
  })

// A history longer than this gets a search field; a short one does not need one.
const SEARCHABLE_FROM = 8

export default function App() {
  const [concerts, setConcerts] = useState(() =>
    withPhotos(load(KEYS.concerts, []).map((c) => normalizeConcert(c))),
  )
  const [lang, setLang] = useState(() => load(KEYS.lang, 'es'))
  const [isDark, setIsDark] = useState(() => load(KEYS.theme, 'dark') !== 'light')
  const [section, setSection] = useState('events')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // concert draft in the form sheet
  const [detail, setDetail] = useState(null) // concert id open in the detail sheet
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState('')

  const t = useMemo(() => translator(lang), [lang])

  useEffect(() => {
    save(KEYS.concerts, withoutPhotos(concerts))
  }, [concerts])

  useEffect(() => {
    save(KEYS.lang, lang)
    document.documentElement.lang = lang
  }, [lang])

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

  // The date alone decides which section a show belongs to, so a concert moves
  // itself to the history section the day after it happens.
  const upcoming = useMemo(() => concerts.filter((c) => isUpcoming(c)), [concerts])
  const past = useMemo(() => concerts.filter((c) => !isUpcoming(c)), [concerts])
  const pastMatching = useMemo(() => past.filter((c) => matchesQuery(c, query)), [past, query])
  const openConcert = detail ? concerts.find((c) => c.id === detail) : null

  async function saveConcert(concert) {
    const storedPhoto = await storePhoto(concert.id, concert.photo)
    const saved = storedPhoto ? concert : { ...concert, photo: '' }
    setConcerts((list) => {
      const index = list.findIndex((c) => c.id === saved.id)
      if (index === -1) return [...list, saved]
      const next = [...list]
      next[index] = saved
      return next
    })
    setEditing(null)
    setDetail(saved.id)
    if (!storedPhoto) setToast(t('photoNotSaved'))
  }

  function deleteConcert(id) {
    removePhoto(id)
    setConcerts((list) => list.filter((c) => c.id !== id))
    setDetail(null)
  }

  // Merge keeps existing records and adds the ones this device does not have.
  async function importConcerts(imported, mode) {
    const incoming = imported.map((c) => normalizeConcert(c))
    const known = new Set(concerts.map((c) => c.id))
    const fresh = mode === 'replace' ? incoming : incoming.filter((c) => !known.has(c.id))

    for (const concert of fresh) {
      if (concert.photo) await storePhoto(concert.id, concert.photo)
    }
    if (mode === 'replace') {
      for (const concert of concerts) {
        if (!incoming.some((c) => c.id === concert.id)) removePhoto(concert.id)
      }
      setConcerts(fresh)
    } else {
      setConcerts((list) => [...list, ...fresh])
    }
    return fresh.length
  }

  return (
    <div className="app">
      <TopNav
        section={section}
        onSection={setSection}
        onAdd={() => setEditing({})}
        onSettings={() => setSettingsOpen(true)}
        t={t}
      />

      <main className="app__main">
        {section === 'home' && (
          <HomeView concerts={concerts} lang={lang} t={t} onOpen={(c) => setDetail(c.id)} />
        )}
        {section === 'events' && (
          <EventsView concerts={upcoming} lang={lang} t={t} onOpen={(c) => setDetail(c.id)} />
        )}
        {section === 'history' && (
          <HistoryView
            concerts={pastMatching}
            lang={lang}
            t={t}
            onOpen={(c) => setDetail(c.id)}
            query={query}
            onQuery={setQuery}
            searchable={past.length >= SEARCHABLE_FROM}
          />
        )}
      </main>

      {editing && (
        <ConcertForm
          concert={editing.id ? editing : null}
          t={t}
          onSave={saveConcert}
          onError={setToast}
          onClose={() => setEditing(null)}
        />
      )}

      {openConcert && !editing && (
        <ConcertDetail
          concert={openConcert}
          lang={lang}
          t={t}
          onEdit={(c) => {
            setDetail(null)
            setEditing(c)
          }}
          onDelete={deleteConcert}
          onClose={() => setDetail(null)}
        />
      )}

      {settingsOpen && (
        <Modal title={t('tabSettings')} onClose={() => setSettingsOpen(false)} closeLabel={t('close')}>
          <SettingsView
            concerts={concerts}
            t={t}
            lang={lang}
            onLang={() => setLang(lang === 'es' ? 'en' : 'es')}
            isDark={isDark}
            onTheme={() => setIsDark((v) => !v)}
            onImport={importConcerts}
            onToast={setToast}
          />
        </Modal>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
