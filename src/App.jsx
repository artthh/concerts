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
import { isUpcoming, matchesQuery, normalizeConcert } from './lib/concerts.js'
import { translator } from './lib/i18n.js'

export default function App() {
  const [concerts, setConcerts] = useState(() =>
    load(KEYS.concerts, []).map((c) => normalizeConcert(c)),
  )
  const [lang, setLang] = useState(() => load(KEYS.lang, 'es'))
  const [isDark, setIsDark] = useState(() => {
    const stored = load(KEYS.theme, null)
    if (stored) return stored === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })
  const [tab, setTab] = useState('upcoming')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // concert draft in the form sheet
  const [detail, setDetail] = useState(null) // concert id open in the detail sheet
  const [toast, setToast] = useState('')

  const t = useMemo(() => translator(lang), [lang])

  useEffect(() => {
    save(KEYS.concerts, concerts)
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
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  const visible = useMemo(
    () => concerts.filter((c) => matchesQuery(c, query)),
    [concerts, query],
  )
  const upcoming = visible.filter((c) => isUpcoming(c))
  const past = visible.filter((c) => !isUpcoming(c))
  const openConcert = detail ? concerts.find((c) => c.id === detail) : null

  function saveConcert(concert) {
    setConcerts((list) => {
      const index = list.findIndex((c) => c.id === concert.id)
      if (index === -1) return [...list, concert]
      const next = [...list]
      next[index] = concert
      return next
    })
    setEditing(null)
    setDetail(concert.id)
  }

  function deleteConcert(id) {
    setConcerts((list) => list.filter((c) => c.id !== id))
    setDetail(null)
  }

  // Merge keeps existing records and adds the ones this device does not have.
  function importConcerts(imported, mode) {
    const incoming = imported.map((c) => normalizeConcert(c))
    if (mode === 'replace') {
      setConcerts(incoming)
      return incoming.length
    }
    let added = 0
    setConcerts((list) => {
      const seen = new Set(list.map((c) => c.id))
      const fresh = incoming.filter((c) => !seen.has(c.id))
      added = fresh.length
      return [...list, ...fresh]
    })
    return added
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
        showSearch={tab === 'upcoming' || tab === 'history'}
      />

      <main className="app__main">
        {query && visible.length === 0 && <p className="empty">{t('noResults')}</p>}

        {tab === 'upcoming' && (
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

      {(tab === 'upcoming' || tab === 'history') && (
        <button type="button" className="fab" onClick={() => setEditing({})}>
          + {t('add')}
        </button>
      )}

      <TabBar tab={tab} onTab={setTab} t={t} />

      {editing && (
        <ConcertForm
          concert={editing.id ? editing : null}
          t={t}
          onSave={saveConcert}
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
