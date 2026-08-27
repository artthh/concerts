import { sortByDate } from '../lib/events.js'
import BackupPanel from './BackupPanel.jsx'
import EventCard from './EventCard.jsx'

export default function HistoryView({
  events,
  allEvents,
  lang,
  t,
  onOpen,
  onImport,
  onToast,
  query,
  onQuery,
  searchable,
}) {
  const sorted = sortByDate(events, 'desc')

  // Group by year so a history that spans a decade stays scannable.
  const years = []
  for (const event of sorted) {
    const year = String(event.date || '').slice(0, 4) || '—'
    const last = years[years.length - 1]
    if (last && last.year === year) last.items.push(event)
    else years.push({ year, items: [event] })
  }

  // Alternate across the whole list, not per year group.
  let position = 0

  return (
    <>
      <h1 className="page-title">{t('navHistory')}</h1>

      {/* A restore belongs where the records are: this is the screen you open
          after reinstalling, when Events is empty and nothing looks familiar.
          Export covers every category, not just the past events. */}
      <BackupPanel events={allEvents} t={t} onImport={onImport} onToast={onToast} compact />
      <p className="backup__note">{t('backupNote')}</p>

      {searchable && (
        <input
          className="search"
          type="search"
          value={query}
          placeholder={t('search')}
          onChange={(event) => onQuery(event.target.value)}
        />
      )}

      {sorted.length === 0 ? (
        <p className="empty">{query ? t('noResults') : t('emptyHistory')}</p>
      ) : (
        years.map((group) => (
          <section className="section" key={group.year}>
            <h2 className="section__title">
              {group.year} · {group.items.length}
            </h2>
            <div className="show-list">
              {group.items.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  side={position++ % 2 === 0 ? 'left' : 'right'}
                  lang={lang}
                  t={t}
                  onOpen={onOpen}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}
