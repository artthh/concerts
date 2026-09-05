import { KINDS, sortByDate } from '../lib/events.js'
import { t } from '../lib/i18n.js'
import BackupPanel from './BackupPanel.jsx'
import PageHeader from './PageHeader.jsx'
import StatsView from './StatsView.jsx'
import EventCard from './EventCard.jsx'

export default function HistoryView({
  events,
  allEvents,
  profilePhoto,
  onSettings,
  onOpen,
  onImport,
  onToast,
  query,
  onQuery,
  searchable,
  kind,
  onKind,
  counts,
}) {
  const sorted = sortByDate(events, 'desc')
  // Only categories with something in them get a chip: filtering to an empty
  // list is never what you wanted, and the row stays short.
  const filters = ['all', ...KINDS.filter((option) => counts[option] > 0)]

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
      <PageHeader profilePhoto={profilePhoto} onSettings={onSettings}>
        <h1 className="page-title">{t('navHistory')}</h1>
      </PageHeader>

      {/* A restore belongs where the records are: this is the screen you open
          after reinstalling, when Events is empty and nothing looks familiar.
          Export covers every category, not just the past events. */}
      <BackupPanel events={allEvents} onImport={onImport} onToast={onToast} compact />
      <p className="backup__note">{t('backupNote')}</p>

      {filters.length > 2 && (
        <div className="filter-chips">
          {filters.map((option) => (
            <button
              key={option}
              type="button"
              className="chip-button"
              aria-pressed={kind === option}
              onClick={() => onKind(option)}
            >
              {option === 'all' ? (
                t('filterAll')
              ) : (
                <>
                  <span aria-hidden="true">{t(`kindIcon_${option}`)}</span> {t(`kindPlural_${option}`)}
                </>
              )}
              <span className="chip-button__count">
                {option === 'all'
                  ? KINDS.reduce((sum, k) => sum + (counts[k] || 0), 0)
                  : counts[option]}
              </span>
            </button>
          ))}
        </div>
      )}

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
        <p className="empty">{query || kind !== 'all' ? t('noResults') : t('emptyHistory')}</p>
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
                  onOpen={onOpen}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {/* The numbers sit below the records they count, rather than in front of
          them: you come here to look something up first. */}
      {allEvents.length > 0 && (
        <section className="section">
          <h2 className="section__title">{t('numbers')}</h2>
          <StatsView events={allEvents} />
        </section>
      )}
    </>
  )
}
