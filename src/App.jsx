import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import TabBar from './components/TabBar.jsx'
import UpcomingView from './components/UpcomingView.jsx'
import HistoryView from './components/HistoryView.jsx'
import StatsView from './components/StatsView.jsx'
import SettingsView from './components/SettingsView.jsx'
import ConcertForm from './components/ConcertForm.jsx'
import ConcertDetail from './components/ConcertDetail.jsx'
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

export default function App() {
  const [concerts, setConcerts] = useState(() =>
    withPhotos(load(KEYS.concerts, []).map((c) => normalizeConcert(c))),
  )
  const [lang, setLang] = useState(() => load(KEYS.lang, 'es'))
  const [isDark, setIsDark] = useState(() => {
    const stored = load(KEYS.theme, null)
    if (stored) return stored === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })
  const [tab, setTab] = useState('home')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // concert draft in the form sheet
  const [detail, setDetail] = useState(null) // concert id open in the detail sheet
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
    document.documentElement.style.backgroundColor = isDark ? '#0a0712' : '#f4f2f8'
  }, [isDark])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  const visible = useMemo(
    () => concerts.filter((c) => matchesQuery(c, query)),
    [concerts, query],
  )
  // The date alone decides which section a show belongs to, so a concert moves
  // itself to the history tab the day after it happens.
  const upcoming = visible.filter((c) => isUpcoming(c))
  const past = visible.filter((c) => !isUpcoming(c))
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
      <Header
        t={t}
        lang={lang}
        onToggleLang={() => setLang(lang === 'es' ? 'en' : 'es')}
        isDark={isDark}
        onToggleTheme={() => setIsDark((v) => !v)}
        query={query}
        onQuery={setQuery}
        showSearch={tab === 'home' || tab === 'history'}
      />

      <main className="app__main">
        {query && visible.length === 0 && <p className="empty">{t('noResults')}</p>}

        {tab === 'home' && (
          <UpcomingView concerts={upcoming} lang={lang} t={t} onOpen={(c) => setDetail(c.id)} />
        )}
        {tab === 'history' && (
          <HistoryView concerts={past} lang={lang} t={t} onOpen={(c) => setDetail(c.id)} />
        )}
        {tab === 'stats' && <StatsView concerts={concerts} lang={lang} t={t} />}
        {tab === 'settings' && (
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
        )}
      </main>

      {(tab === 'home' || tab === 'history') && (
        <button type="button" className="fab" onClick={() => setEditing({})} aria-label={t('add')}>
          +
        </button>
      )}

      <TabBar tab={tab} onTab={setTab} t={t} />

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

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
